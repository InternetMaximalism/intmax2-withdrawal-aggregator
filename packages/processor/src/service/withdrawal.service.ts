import {
  getWalletClient,
  logger,
  type RequestingWithdrawal,
  withdrawalDB,
  withdrawalSchema,
} from "@intmax2-withdrawal-aggregator/shared";
import { and, eq, inArray } from "drizzle-orm";
import { formatContractWithdrawal, getLastWithdrawalHashFromWithdrawalProofs } from "../lib/utils";
import type { GnarkProof, WithdrawalProof, WithdrawalWithProof } from "../types";
import {
  generateGnarkProof,
  generateWithdrawalProofs,
  generateWrappedProof,
} from "./proof.service";
import { submitWithdrawalProof } from "./submit.service";

export const processWithdrawalGroup = async (requestingWithdrawals: RequestingWithdrawal[]) => {
  const walletClientData = getWalletClient("withdrawal", "l2");

  const withdrawals = await fetchWithdrawalsWithProofs(requestingWithdrawals);
  const withdrawalProofs = await generateWithdrawalProofs(withdrawals);
  const wrappedProof = await generateWrappedProof(withdrawalProofs, walletClientData);
  const gnarkProof = await generateGnarkProof(wrappedProof);

  await submitWithdrawalProofToScroll(withdrawalProofs, gnarkProof, walletClientData);
};

const fetchWithdrawalsWithProofs = async (requestingWithdrawals: RequestingWithdrawal[]) => {
  const requestingWithdrawalKeys = requestingWithdrawals.map(
    (withdrawal) => withdrawal.withdrawalHash,
  );

  if (requestingWithdrawalKeys.length === 0) {
    throw new Error("No requesting withdrawals provided");
  }

  const withdrawals = await withdrawalDB
    .select({
      singleWithdrawalProof: withdrawalSchema.singleWithdrawalProof,
      withdrawalHash: withdrawalSchema.withdrawalHash,
    })
    .from(withdrawalSchema)
    .where(
      and(
        inArray(withdrawalSchema.withdrawalHash, requestingWithdrawalKeys),
        eq(withdrawalSchema.status, "requested"),
      ),
    );

  if (withdrawals.length !== requestingWithdrawalKeys.length) {
    logger.warn(
      `Some requested withdrawals were not found or not in REQUESTED status requested: ${requestingWithdrawalKeys.length} found: ${withdrawals.length}`,
    );
  }

  return withdrawals as unknown as WithdrawalWithProof[];
};

const submitWithdrawalProofToScroll = async (
  withdrawalProofs: WithdrawalProof[],
  gnarkProof: GnarkProof,
  walletClientData: ReturnType<typeof getWalletClient>,
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

  await submitWithdrawalProof(params, walletClientData);
};
