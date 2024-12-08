import {
  type ContractCallOptions,
  type ContractCallParameters,
  WithdrawalAbi,
  config,
  executeTransaction,
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
import type { GnarkProof, SubmitContractWithdrawal } from "../types";

interface WithdrawalParams {
  contractWithdrawals: SubmitContractWithdrawal[];
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
  for (let attempt = 0; attempt < TRANSACTION_MAX_RETRIES; attempt++) {
    try {
      const { transactionHash } = await submitWithdrawalProofWithRetry(
        ethereumClient,
        walletClientData,
        parmas,
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
) => {
  const contractCallParams: ContractCallParameters = {
    contractAddress: config.WITHDRAWAL_CONTRACT_ADDRESS as `0x${string}`,
    abi: WithdrawalAbi as Abi,
    functionName: "submitWithdrawalProof",
    account: walletClientData.account,
    args: [params.contractWithdrawals, params.publicInputs, params.proof],
  };

  const { pendingNonce, currentNonce } = await getNonce(
    ethereumClient,
    walletClientData.account.address,
  );

  const contractCallOptions: ContractCallOptions = {
    nonce: currentNonce,
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
