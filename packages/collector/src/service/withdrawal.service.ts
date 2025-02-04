import {
  QueueManager,
  type RequestingWithdrawal,
  WithdrawalGroupStatus,
  WithdrawalManager,
  WithdrawalPrisma,
  WithdrawalStatus,
  logger,
  withdrawalPrisma,
} from "@intmax2-withdrawal-aggregator/shared";

export const fetchRequestingWithdrawals = async () => {
  const processedUUIDs = await WithdrawalManager.getInstance().getAllProcessedUUIDs();

  const requestingWithdrawals = await withdrawalPrisma.withdrawal.findMany({
    select: {
      uuid: true,
      createdAt: true,
    },
    where: {
      status: WithdrawalStatus.requested,
      uuid: {
        notIn: processedUUIDs,
      },
    },
    orderBy: {
      createdAt: WithdrawalPrisma.SortOrder.asc,
    },
  });

  return requestingWithdrawals;
};

export const createWithdrawalGroup = async (group: RequestingWithdrawal[]) => {
  const queueManager = QueueManager.getInstance("withdrawal-aggregator");
  const now = new Date();

  const groupId = await WithdrawalManager.getInstance().addGroup({
    requestingWithdrawals: group.map((withdrawal) => ({
      uuid: withdrawal.uuid,
    })),
    status: WithdrawalGroupStatus.PENDING,
    createdAt: now,
    updatedAt: now,
  });

  await queueManager.addJob("processBatch", { groupId });

  logger.debug(`Created withdrawal group ${groupId}`);

  return groupId;
};
