import {
  type ContractCallOptions,
  type ContractCallParameters,
  type RetryOptions,
  WithdrawalAbi,
  calculateGasMultiplier,
  calculateIncreasedGasFees,
  config,
  executeTransaction,
  getMaxGasMultiplier,
  getNonce,
  getWalletClient,
  logger,
  replacedTransaction,
  waitForTransactionConfirmation,
} from "@intmax2-withdrawal-aggregator/shared";
import type { Abi, PublicClient } from "viem";
import {
  TRANSACTION_MAX_RETRIES,
  TRANSACTION_WAIT_TIMEOUT_ERROR_MESSAGE,
  WAIT_TRANSACTION_TIMEOUT,
} from "../constants";
import type { GnarkProof, SubmitWithdrwalParams } from "../types";

interface WithdrawalParams {
  contractWithdrawals: SubmitWithdrwalParams[];
  publicInputs: {
    lastWithdrawalHash: string;
    withdrawalAggregator: string;
  };
  proof: GnarkProof["proof"];
}

export const submitWithdrawalProof = async (
  ethereumClient: PublicClient,
  walletClientData: ReturnType<typeof getWalletClient>,
  parmas: WithdrawalParams,
) => {
  const retryOptions: RetryOptions = {
    maxFeePerGas: null,
    maxPriorityFeePerGas: null,
  };

  for (let attempt = 0; attempt < TRANSACTION_MAX_RETRIES; attempt++) {
    try {
      const multiplier = calculateGasMultiplier(attempt);

      const { transactionHash } = await submitWithdrawalProofWithRetry(
        ethereumClient,
        walletClientData,
        parmas,
        multiplier,
        retryOptions,
      );

      const transaction = await waitForTransactionConfirmation(
        ethereumClient,
        transactionHash,
        "submitWithdrawalProof",
        {
          timeout: WAIT_TRANSACTION_TIMEOUT,
        },
      );

      return transaction;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      logger.warn(`Error sending transaction: ${message}`);

      if (attempt === TRANSACTION_MAX_RETRIES - 1) {
        throw new Error("Transaction Max retries reached");
      }

      if (message.includes(TRANSACTION_WAIT_TIMEOUT_ERROR_MESSAGE)) {
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
  params: WithdrawalParams,
  multiplier: number,
  retryOptions: RetryOptions,
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
    getMaxGasMultiplier(ethereumClient, multiplier),
  ]);
  let { maxFeePerGas, maxPriorityFeePerGas } = gasPriceData;

  if (retryOptions.maxFeePerGas && retryOptions.maxPriorityFeePerGas) {
    const { newMaxFeePerGas, newMaxPriorityFeePerGas } = calculateIncreasedGasFees(
      retryOptions.maxFeePerGas,
      retryOptions.maxPriorityFeePerGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
    );

    maxFeePerGas = newMaxFeePerGas;
    maxPriorityFeePerGas = newMaxPriorityFeePerGas;

    logger.info(
      `Increased gas fees multiplier: ${multiplier} - MaxFee: ${maxFeePerGas}, MaxPriorityFee: ${maxPriorityFeePerGas}`,
    );
  }

  retryOptions.maxFeePerGas = maxFeePerGas;
  retryOptions.maxPriorityFeePerGas = maxPriorityFeePerGas;

  const contractCallOptions: ContractCallOptions = {
    nonce: currentNonce,
    // maxFeePerGas,
    // maxPriorityFeePerGas,
  };

  if (pendingNonce > currentNonce) {
    return await replacedTransaction({
      ethereumClient,
      walletClientData,
      contractCallParams,
      contractCallOptions,
    });
  }

  const transactionResult = await executeTransaction({
    ethereumClient,
    walletClientData,
    contractCallParams,
    contractCallOptions,
  });

  return transactionResult;
};
