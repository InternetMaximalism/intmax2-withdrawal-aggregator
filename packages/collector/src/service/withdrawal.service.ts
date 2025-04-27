import {
  QueueManager,
  type RequestingWithdrawal,
  WithdrawalGroupStatus,
  WithdrawalManager,
  logger,
  withdrawalDB,
  withdrawalSchema,
} from "@intmax2-withdrawal-aggregator/shared";
import { and, asc, eq, notInArray } from "drizzle-orm";

export const fetchRequestingWithdrawals = async () => {
  const processedUUIDs = await WithdrawalManager.getInstance().getAllProcessedUUIDs();
  const requestingWithdrawals = await withdrawalDB
    .select({
      uuid: withdrawalSchema.uuid,
      createdAt: withdrawalSchema.createdAt,
    })
    .from(withdrawalSchema)
    .where(
      and(
        eq(withdrawalSchema.status, "requested"),
        notInArray(withdrawalSchema.uuid, processedUUIDs),
      ),
    )
    .orderBy(asc(withdrawalSchema.createdAt));

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
