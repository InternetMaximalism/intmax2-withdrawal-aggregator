import {
  logger,
  type WithdrawalEventLog,
  WithdrawalStatus,
  withdrawalDB,
  withdrawalSchema,
} from "@intmax2-withdrawal-aggregator/shared";
import { and, eq, inArray } from "drizzle-orm";
import type { Transaction, TransactionType, WithdrawalEventType } from "../types";

export const batchUpdateWithdrawalStatusTransactions = async (
  directWithdrawals: WithdrawalEventLog[],
  claimableWithdrawals: WithdrawalEventLog[],
  claimedWithdrawals: WithdrawalEventLog[],
) => {
  const transactions: Transaction[] = [];

  if (directWithdrawals.length > 0) {
    transactions.push(
      batchUpdateWithdrawalStatus(
        directWithdrawals,
        "relayed",
        "success",
        "DirectWithdrawalSuccessed",
      ),
    );
  }

  if (claimableWithdrawals.length > 0) {
    transactions.push(
      batchUpdateWithdrawalStatus(
        claimableWithdrawals,
        "relayed",
        "need_claim",
        "WithdrawalClaimable",
      ),
    );
  }

  if (claimedWithdrawals.length > 0) {
    transactions.push(
      batchUpdateWithdrawalStatus(claimedWithdrawals, "need_claim", "success", "ClaimedWithdrawal"),
    );
  }

  if (transactions.length === 0) {
    logger.info("No withdrawal status to update");
  }

  if (transactions.length > 0) {
    await withdrawalDB.transaction(async (tx) => {
      for (const transaction of transactions) {
        await transaction(tx);
      }
    });
  }
};

const batchUpdateWithdrawalStatus = (
  withdrawalEventLogs: WithdrawalEventLog[],
  previousStatus: WithdrawalStatus,
  nextStatus: WithdrawalStatus,
  type: WithdrawalEventType,
) => {
  return async (tx: TransactionType) => {
    logger.info(
      `Batch update withdrawal status: ${nextStatus} for ${withdrawalEventLogs.length} ${type} withdrawals`,
    );

    const withdrawalsByTxHash = withdrawalEventLogs.reduce(
      (acc, log) => {
        const { transactionHash } = log;
        if (!acc[transactionHash]) {
          acc[transactionHash] = [];
        }
        acc[transactionHash].push(log.withdrawalHash);
        return acc;
      },
      {} as Record<string, string[]>,
    );

    for (const [transactionHash, withdrawalHashes] of Object.entries(withdrawalsByTxHash)) {
      const data = {
        status: nextStatus,
        l1TxHash: transactionHash,
        ...((type === "DirectWithdrawalSuccessed" || type === "WithdrawalClaimable") && {
          singleWithdrawalProof: null,
        }),
      };

      await tx
        .update(withdrawalSchema)
        .set(data)
        .where(
          and(
            inArray(withdrawalSchema.withdrawalHash, withdrawalHashes),
            eq(withdrawalSchema.status, previousStatus),
          ),
        );
    }
  };
};
