import {
  logger,
  type QueueJobData,
  timeOperation,
  WithdrawalGroupStatus,
  WithdrawalManager,
  withdrawalDB,
  withdrawalSchema,
} from "@intmax2-withdrawal-aggregator/shared";
import { inArray } from "drizzle-orm";
import { EXECUTION_REVERTED_ERROR_MESSAGE } from "../constants";
import { processWithdrawalGroup } from "./withdrawal.service";

export const processQueueJob = async (jobData: QueueJobData) => {
  return await timeOperation(async () => await performJob(jobData));
};

const performJob = async (data: QueueJobData): Promise<void> => {
  const withdrawalManager = WithdrawalManager.getInstance();
  const { groupId } = data.payload;

  try {
    const group = await withdrawalManager.getGroup(groupId);
    if (!group) {
      logger.warn(`Withdrawal group ${groupId} not found`);
      return;
    }

    await withdrawalManager.updateGroup(groupId, {
      status: WithdrawalGroupStatus.PROCESSING,
    });

    await processWithdrawalGroup(group.requestingWithdrawals);

    await withdrawalDB
      .update(withdrawalSchema)
      .set({
        status: "relayed",
      })
      .where(
        inArray(
          withdrawalSchema.withdrawalHash,
          group.requestingWithdrawals.map((withdrawal) => withdrawal.withdrawalHash),
        ),
      );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    logger.error(`Error processing withdrawal group ${groupId}: ${message}`);

    if (message.includes(EXECUTION_REVERTED_ERROR_MESSAGE)) {
      logger.warn(`Marking all withdrawals in group ${groupId} as failed`);

      const group = await withdrawalManager.getGroup(groupId);
      await withdrawalDB
        .update(withdrawalSchema)
        .set({
          status: "failed",
        })
        .where(
          inArray(
            withdrawalSchema.withdrawalHash,
            group!.requestingWithdrawals.map((withdrawal) => withdrawal.withdrawalHash),
          ),
        );
    }
  } finally {
    await withdrawalManager.deleteGroup(groupId);
  }
};
