import {
  type RequestingWithdrawal,
  WithdrawalStatus,
  createNetworkClient,
  getWalletClient,
  logger,
  withdrawalPrisma,
} from "@intmax2-aggregator/shared";
import { formatContractWithdrawal, getLastWithdrawalHashFromWithdrawalProofs } from "../lib/utils";
import type { GnarkProof, WithdrawalProof, WithdrawalWithProof } from "../types";
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

  await submitWithdrawalProofToScroll(walletClientData, withdrawalProofs, gnarkProof);
};

const fetchWithdrawalsWithProofs = async (requestingWithdrawals: RequestingWithdrawal[]) => {
  const requestingWithdrawalUUIDs = requestingWithdrawals.map((withdrawal) => withdrawal.uuid);

  const withdrawals = await withdrawalPrisma.withdrawal.findMany({
    select: {
      uuid: true,
      singleWithdrawalProof: true,
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
  withdrawalProofs: WithdrawalProof[],
  gnarkProof: GnarkProof,
) => {
  const lastWithdrawalHash = getLastWithdrawalHashFromWithdrawalProofs(withdrawalProofs);
  const withdrawalAggregator = walletClientData.account.address;

  const params = {
    contractWithdrawals: withdrawalProofs.map(formatContractWithdrawal),
    publicInputs: {
      lastWithdrawalHash,
      withdrawalAggregator,
    },
    proof: `0x${gnarkProof.proof}`,
  };

  const ethereumClient = createNetworkClient("scroll");
  await submitWithdrawalProof(ethereumClient, walletClientData, params);
};
