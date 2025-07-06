import { config, logger, type RequestingWithdrawal } from "@intmax2-withdrawal-aggregator/shared";
import { differenceInMinutes } from "date-fns";
import { chunkArray } from "../lib/utils";
import { createWithdrawalGroup, fetchRequestingWithdrawals } from "./withdrawal.service";

export const performJob = async (): Promise<void> => {
  const requestingWithdrawals = await fetchRequestingWithdrawals();

  if (requestingWithdrawals.length === 0) {
    logger.info("No requesting withdrawals found");
    return;
  }

  const shouldProcess = shouldProcessWithdrawals(requestingWithdrawals);
  if (!shouldProcess) {
    logger.info("Conditions not met for processing withdrawals");
    return;
  }

  const withdrawalGroups = chunkArray<RequestingWithdrawal>(
    requestingWithdrawals,
    config.WITHDRAWAL_GROUP_SIZE,
  );

  const groupIds = await Promise.all(withdrawalGroups.map(createWithdrawalGroup));

  logger.info(
    `Successfully processed requesting withdrawals ${requestingWithdrawals.length} withdrawals and created ${groupIds.length} groups`,
  );
};

const shouldProcessWithdrawals = (
  requestingWithdrawals: Array<RequestingWithdrawal & { createdAt: Date }>,
) => {
  const oldestWithdrawal = requestingWithdrawals[0];
  const minutesSinceOldestWithdrawal = differenceInMinutes(
    new Date(),
    new Date(oldestWithdrawal.createdAt),
  );
  const hasEnoughWithdrawals = requestingWithdrawals.length >= config.WITHDRAWAL_MIN_BATCH_SIZE;
  const isOldEnough = minutesSinceOldestWithdrawal >= config.WITHDRAWAL_MIN_WAIT_MINUTES;

  logger.info(
    `requestingWithdrawals: ${requestingWithdrawals.length} hasEnoughWithdrawals: ${hasEnoughWithdrawals} isOldEnough: ${isOldEnough}`,
  );

  return hasEnoughWithdrawals || isOldEnough;
};
