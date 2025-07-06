import {
  type ContractCallOptionsEthers,
  type ContractCallParameters,
  calculateEthersIncreasedGasPrice,
  calculateGasMultiplier,
  config,
  createNetworkClient,
  ethersWaitForTransactionConfirmation,
  executeEthersTransaction,
  getEthersMaxGasMultiplier,
  getEthersTxOptions,
  getNonce,
  getWalletClient,
  logger,
  type RetryOptionsEthers,
  replacedEthersTransaction,
  Withdrawal__factory,
  WithdrawalAbi,
} from "@intmax2-withdrawal-aggregator/shared";
import { ethers } from "ethers";
import { type Abi, type PublicClient, toHex } from "viem";
import {
  ETHERS_CONFIRMATIONS,
  ETHERS_WAIT_TRANSACTION_TIMEOUT_MESSAGE,
  TRANSACTION_MAX_RETRIES,
  TRANSACTION_MISSING_REVERT_DATA,
  TRANSACTION_REPLACEMENT_FEE_TOO_LOW,
  WAIT_TRANSACTION_TIMEOUT,
} from "../constants";
import type { SubmitWithdrawalParams } from "../types";

export const submitWithdrawalProof = async (
  params: SubmitWithdrawalParams,
  walletClientData: ReturnType<typeof getWalletClient>,
) => {
  const ethereumClient = createNetworkClient("scroll");

  const retryOptions: RetryOptionsEthers = {
    gasPrice: null,
  };

  for (let attempt = 0; attempt < TRANSACTION_MAX_RETRIES; attempt++) {
    try {
      const multiplier = calculateGasMultiplier(attempt);

      const { transactionHash } = await submitWithdrawalProofWithRetry(
        ethereumClient,
        walletClientData,
        params,
        multiplier,
        retryOptions,
      );

      const receipt = await ethersWaitForTransactionConfirmation(
        ethereumClient,
        transactionHash,
        "submitWithdrawalProof",
        {
          confirms: ETHERS_CONFIRMATIONS,
          timeout: WAIT_TRANSACTION_TIMEOUT,
        },
      );

      return receipt;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      logger.warn(`Error sending transaction: ${message}`);

      if (attempt === TRANSACTION_MAX_RETRIES - 1) {
        throw new Error("Transaction Max retries reached");
      }

      if (
        message.includes(ETHERS_WAIT_TRANSACTION_TIMEOUT_MESSAGE) ||
        message.includes(TRANSACTION_REPLACEMENT_FEE_TOO_LOW) ||
        message.includes(TRANSACTION_MISSING_REVERT_DATA)
      ) {
        logger.warn(`Attempt ${attempt + 1} failed. Retrying with higher gas...`);
        continue;
      }

      throw error;
    }
  }

  throw new Error("Unexpected end of transaction");
};

export const submitWithdrawalProofWithRetry = async (
  ethereumClient: PublicClient,
  walletClientData: ReturnType<typeof getWalletClient>,
  params: SubmitWithdrawalParams,
  multiplier: number,
  retryOptions: RetryOptionsEthers,
) => {
  const contractCallParams: ContractCallParameters = {
    contractAddress: config.WITHDRAWAL_CONTRACT_ADDRESS as `0x${string}`,
    abi: WithdrawalAbi as Abi,
    functionName: "submitWithdrawalProof",
    account: walletClientData.account,
    args: [params.contractWithdrawals, params.publicInputs, params.proof],
  };

  const [{ pendingNonce, currentNonce }, gasPriceData] = await Promise.all([
    getNonce(ethereumClient, walletClientData.account.address),
    getEthersMaxGasMultiplier(ethereumClient, multiplier),
  ]);
  let { gasPrice } = gasPriceData;

  if (retryOptions.gasPrice) {
    const { newGasPrice } = calculateEthersIncreasedGasPrice(retryOptions.gasPrice, gasPrice);

    gasPrice = newGasPrice;

    logger.info(`Increased gas fees multiplier: ${multiplier} - gasPrice: ${gasPrice}`);
  }

  retryOptions.gasPrice = gasPrice;

  const contractCallOptions: ContractCallOptionsEthers = {
    nonce: currentNonce,
    gasPrice,
  };

  const provider = new ethers.JsonRpcProvider(ethereumClient.transport.url);
  const signer = new ethers.Wallet(
    toHex(walletClientData.account.getHdKey().privateKey!),
    provider,
  );
  const contract = Withdrawal__factory.connect(contractCallParams.contractAddress, signer);

  const ethersTxOptions = getEthersTxOptions(contractCallParams, contractCallOptions ?? {});
  const callArgs = [
    contractCallParams.args[0],
    contractCallParams.args[1],
    contractCallParams.args[2],
    ethersTxOptions,
  ];

  if (pendingNonce > currentNonce) {
    return await replacedEthersTransaction({
      functionName: contractCallParams.functionName,
      contract,
      callArgs,
    });
  }

  const transactionResult = await executeEthersTransaction({
    functionName: contractCallParams.functionName,
    contract,
    callArgs,
  });

  return transactionResult;
};
