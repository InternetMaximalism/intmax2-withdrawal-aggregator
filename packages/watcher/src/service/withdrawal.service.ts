import {
  type WithdrawalEventLog,
  WithdrawalStatus,
  logger,
  withdrawalPrisma,
} from "@intmax2-withdrawal-aggregator/shared";
import { type WithdrawalEventType, WithdrawalEvents } from "../types";

export const batchUpdateWithdrawalStatusTransactions = async (
  directWithdrawals: WithdrawalEventLog[],
  claimableWithdrawals: WithdrawalEventLog[],
  claimedWithdrawals: WithdrawalEventLog[],
) => {
  const transactions = [];

  if (directWithdrawals.length > 0) {
    transactions.push(
      batchUpdateWithdrawalStatus(
        directWithdrawals,
        WithdrawalStatus.relayed,
        WithdrawalStatus.success,
        WithdrawalEvents.DIRECT_WITHDRAWAL_SUCCEEDED,
      ),
    );
  }

  if (claimableWithdrawals.length > 0) {
    transactions.push(
      batchUpdateWithdrawalStatus(
        claimableWithdrawals,
        WithdrawalStatus.relayed,
        WithdrawalStatus.need_claim,
        WithdrawalEvents.WITHDRAWAL_CLAIMABLE,
      ),
    );
  }

  if (claimedWithdrawals.length > 0) {
    transactions.push(
      batchUpdateWithdrawalStatus(
        claimedWithdrawals,
        WithdrawalStatus.need_claim,
        WithdrawalStatus.success,
        WithdrawalEvents.CLAIMED_WITHDRAWAL,
      ),
    );
  }

  if (transactions.length === 0) {
    logger.info("No withdrawal status to update");
  }

  if (transactions.length > 0) {
    await withdrawalPrisma.$transaction(transactions);
  }
};

const batchUpdateWithdrawalStatus = (
  withdrawalEventLogs: WithdrawalEventLog[],
  previousStatus: WithdrawalStatus,
  nextStatus: WithdrawalStatus,
  type: WithdrawalEventType,
) => {
  logger.info(
    `Batch update withdrawal status: ${nextStatus} for ${withdrawalEventLogs.length} ${type} withdrawals`,
  );

  return withdrawalPrisma.withdrawal.updateMany({
    where: {
      withdrawalHash: {
        in: withdrawalEventLogs.map(({ withdrawalHash }) => withdrawalHash),
      },
      status: previousStatus,
    },
    data: {
      status: nextStatus,
    },
  });
};
