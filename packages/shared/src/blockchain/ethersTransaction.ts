import { ethers } from "ethers";
import { type PublicClient, toHex } from "viem";
import { logger } from "../lib";
import { Withdrawal__factory } from "../typechainTypes";
import type { ContractCallOptions, ContractCallParameters } from "../types";
import { getWalletClient } from "./wallet";

interface TransactionExecutionParams {
  ethereumClient: PublicClient;
  walletClientData: ReturnType<typeof getWalletClient>;
  contractCallParams: ContractCallParameters;
  contractCallOptions?: ContractCallOptions;
}

export const executeEthersTransaction = async ({
  ethereumClient,
  walletClientData,
  contractCallParams,
  contractCallOptions,
}: TransactionExecutionParams) => {
  const { functionName, contractAddress, args } = contractCallParams;
  const { nonce } = contractCallOptions ?? {};

  try {
    logger.info(`functionName: ${functionName}, args: ${args}, nonce: ${nonce}`);

    const provider = new ethers.JsonRpcProvider(ethereumClient.transport.url);
    const signer = new ethers.Wallet(
      toHex(walletClientData.account.getHdKey().privateKey!),
      provider,
    );

    const contract = Withdrawal__factory.connect(contractAddress, signer);
    const tx = await contract.submitWithdrawalProof(args[0], args[1], args[2], {
      nonce,
    });

    const transactionHash = tx.hash as `0x${string}`;
    logger.info(`${functionName} transaction initiated with hash: ${transactionHash}`);

    return {
      transactionHash,
      nonce: tx.nonce,
    };
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Transaction failed: ${error.message}`);
      throw error;
    } else {
      console.error("An unknown error occurred");
      throw new Error("Unknown transaction error");
    }
  }
};

export const replacedEthersTransaction = async ({
  ethereumClient,
  walletClientData,
  contractCallParams,
  contractCallOptions,
}: TransactionExecutionParams) => {
  logger.warn(`Transaction was replaced. Sending new transaction...`);

  try {
    const transactionResult = await executeEthersTransaction({
      ethereumClient,
      walletClientData,
      contractCallParams,
      contractCallOptions,
    });

    return transactionResult;
  } catch (error) {
    logger.warn(
      `Failed to send replaced transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
    );

    throw error;
  }
};