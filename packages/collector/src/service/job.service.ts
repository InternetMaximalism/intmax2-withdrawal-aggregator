import { type RequestingWithdrawal, config, logger } from "@intmax2-withdrawal-aggregator/shared";
import { chunkArray } from "../lib/utils";
import { createWithdrawalGroup, fetchRequestingWithdrawals } from "./withdrawal.service";

export const performJob = async (): Promise<void> => {
  const requestingWithdrawals = await fetchRequestingWithdrawals();

  if (requestingWithdrawals.length === 0) {
    logger.info("No requesting withdrawals found");
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
