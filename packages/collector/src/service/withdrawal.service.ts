import {
  QueueManager,
  RequestingWithdrawal,
  WithdrawalGroupStatus,
  WithdrawalPrisma,
  WithdrawalStatus,
  logger,
  withdrawalManager,
  withdrawalPrisma,
} from "@intmax2-withdrawal-aggregator/shared";

export const fetchRequestingWithdrawals = async () => {
  const processedUUIDs = await withdrawalManager.getAllProcessedUUIDs();

  const requestingWithdrawals = await withdrawalPrisma.withdrawal.findMany({
    select: {
      uuid: true,
    },
    where: {
      status: WithdrawalStatus.requested,
      uuid: {
        notIn: processedUUIDs,
      },
    },
    orderBy: {
      createdAt: WithdrawalPrisma.SortOrder.desc,
    },
  });

  return requestingWithdrawals;
};

export const createWithdrawalGroup = async (group: RequestingWithdrawal[]) => {
  const now = new Date();
  const queueManager = QueueManager.getInstance("withdrawal-aggregator");

  const groupId = await withdrawalManager.addGroup({
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
