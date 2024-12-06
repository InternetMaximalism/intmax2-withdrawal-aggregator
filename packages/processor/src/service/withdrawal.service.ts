import {
  type RequestingWithdrawal,
  WithdrawalStatus,
  createNetworkClient,
  getWalletClient,
  logger,
  withdrawalPrisma,
} from "@intmax2-withdrawal-aggregator/shared";
import type { GnarkProof, WithdrawalWithProof } from "../types";
import {
  generateGnarkProof,
  generateWithdrawalProofs,
  generateWrappedProof,
} from "./proof.service";
import { submitWithdrawalProof } from "./submit.service";

export const processWithdrawalGroup = async (requestingWithdrawals: RequestingWithdrawal[]) => {
  const withdrawals = await fetchWithdrawalsWithProofs(requestingWithdrawals);
  const walletClientData = getWalletClient("withdrawal", "scroll");

  const withdrawalProofs = await generateWithdrawalProofs(withdrawals);
  const wrappedProof = await generateWrappedProof(walletClientData, withdrawalProofs);
  const gnarkProof = await generateGnarkProof(wrappedProof);

  await submitWithdrawalProofToScroll(walletClientData, withdrawals, gnarkProof);
};

const fetchWithdrawalsWithProofs = async (requestingWithdrawals: RequestingWithdrawal[]) => {
  const requestingWithdrawalUUIDs = requestingWithdrawals.map((withdrawal) => withdrawal.uuid);

  const withdrawals = await withdrawalPrisma.withdrawal.findMany({
    select: {
      uuid: true,
      singleWithdrawalProof: true,
      contractWithdrawal: true,
      withdrawalHash: true,
    },
    where: {
      uuid: {
        in: requestingWithdrawalUUIDs,
      },
      status: WithdrawalStatus.requested,
    },
  });

  if (withdrawals.length !== requestingWithdrawalUUIDs.length) {
    logger.warn(
      `Some requested withdrawals were not found or not in REQUESTED status requested: ${requestingWithdrawalUUIDs.length} found: ${withdrawals.length}`,
    );
  }

  return withdrawals as unknown as WithdrawalWithProof[];
};

export const submitWithdrawalProofToScroll = async (
  walletClientData: ReturnType<typeof getWalletClient>,
  withdrawals: WithdrawalWithProof[],
  gnarkProof: GnarkProof,
) => {
  try {
    const lastWithdrawalHash = withdrawals[withdrawals.length - 1].withdrawalHash;
    const withdrawalAggregator = walletClientData.account.address;

    const params = {
      contractWithdrawals: withdrawals.map(formatContractWithdrawal),
      publicInputs: {
        lastWithdrawalHash,
        withdrawalAggregator,
      },
      proof: gnarkProof.proof,
    };

    const ethereumClient = createNetworkClient("scroll");
    await submitWithdrawalProof(ethereumClient, walletClientData, params);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to submit proof to Scroll - ${message}`);
    throw error;
  }
};

const formatContractWithdrawal = (withdrawal: WithdrawalWithProof) => {
  return {
    recipient: withdrawal.contractWithdrawal.recipient,
    tokenIndex: BigInt(withdrawal.contractWithdrawal.token_index),
    amount: BigInt(withdrawal.contractWithdrawal.amount),
    nullifier: withdrawal.contractWithdrawal.nullifier,
    blockHash: withdrawal.contractWithdrawal.block_hash,
    blockNumber: BigInt(withdrawal.contractWithdrawal.block_number),
  };
};
