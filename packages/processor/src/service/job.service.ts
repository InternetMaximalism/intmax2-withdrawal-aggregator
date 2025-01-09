import {
  QueueJobData,
  WithdrawalGroupStatus,
  WithdrawalStatus,
  logger,
  timeOperation,
  withdrawalManager,
  withdrawalPrisma,
} from "@intmax2-withdrawal-aggregator/shared";
import { EXECUTION_REVERTED_ERROR_MESSAGE } from "../constants";
import { processWithdrawalGroup } from "./withdrawal.service";

export const processQueueJob = async (jobData: QueueJobData) => {
  return await timeOperation(async () => await performJob(jobData));
};

export const performJob = async (data: QueueJobData): Promise<void> => {
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

    await withdrawalPrisma.withdrawal.updateMany({
      where: {
        uuid: {
          in: group.requestingWithdrawals.map((withdrawal) => withdrawal.uuid),
        },
      },
      data: {
        status: WithdrawalStatus.relayed,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    logger.error(`Error processing withdrawal group ${groupId}: ${message}`);

    if (message.includes(EXECUTION_REVERTED_ERROR_MESSAGE)) {
      logger.warn(`Marking all withdrawals in group ${groupId} as failed`);

      const group = await withdrawalManager.getGroup(groupId);
      await withdrawalPrisma.withdrawal.updateMany({
        where: {
          uuid: {
            in: group!.requestingWithdrawals.map((withdrawal) => withdrawal.uuid),
          },
        },
        data: {
          status: WithdrawalStatus.failed,
        },
      });
    }
  } finally {
    await withdrawalManager.deleteGroup(groupId);
  }
};
