import { logger } from "../lib/logger";
import type { ContractCallOptionsEthers, ContractCallParameters } from "../types";

interface EthersTransactionExecutionParams {
  functionName: string;
  contract: any;
  callArgs: any;
}

export const getEthersTxOptions = (
  contractCallParams: ContractCallParameters,
  contractCallOptions: ContractCallOptionsEthers,
) => {
  const { functionName, args } = contractCallParams;
  const { nonce, gasPrice, maxFeePerGas, maxPriorityFeePerGas, value } = contractCallOptions ?? {};

  if (gasPrice) {
    logger.info(
      `functionName: ${functionName}, args: ${JSON.stringify(args, (_, value) =>
        typeof value === "bigint" ? value.toString() : value,
      )} nonce: ${nonce}, gasPrice: ${gasPrice?.toString()} type: 0`,
    );

    return {
      nonce,
      gasPrice,
      type: 0,
    };
  }

  logger.info(
    `functionName: ${functionName}, nonce: ${nonce}, maxFeePerGas: ${maxFeePerGas?.toString()} maxPriorityFeePerGas: ${maxPriorityFeePerGas?.toString()}`,
  );

  return {
    nonce,
    maxFeePerGas,
    maxPriorityFeePerGas,
    ...(value ? { value } : {}),
  };
};

export const executeEthersTransaction = async ({
  functionName,
  contract,
  callArgs,
}: EthersTransactionExecutionParams) => {
  try {
    if (typeof contract[functionName] !== "function") {
      throw new Error(`Method ${functionName} does not exist on contract`);
    }

    const tx = await contract[functionName](...callArgs);

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
  functionName,
  contract,
  callArgs,
}: EthersTransactionExecutionParams) => {
  logger.warn(`Transaction was replaced. Sending new transaction...`);

  try {
    const transactionResult = await executeEthersTransaction({
      functionName,
      contract,
      callArgs,
    });

    return transactionResult;
  } catch (error) {
    logger.warn(
      `Failed to send replaced transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
    );

    throw error;
  }
};
