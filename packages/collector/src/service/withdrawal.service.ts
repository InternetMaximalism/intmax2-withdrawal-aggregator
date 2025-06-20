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
import { MAX_PG_SQL_PARAMS, MAX_RESULTS_LIMIT, QUERY_BATCH_SIZE } from "../constants";
import type { WithdrawalResult } from "../types";

export const fetchRequestingWithdrawals = async () => {
  const processedUUIDs = await WithdrawalManager.getInstance().getAllProcessedUUIDs();

  if (processedUUIDs.length > MAX_PG_SQL_PARAMS) {
    return await fetchRequestingWithdrawalsBatch(processedUUIDs);
  }

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

// NOTE: better performance
export const fetchRequestingWithdrawalsBatch = async (processedUUIDs: string[]) => {
  const processedUUIDSet = new Set(processedUUIDs);
  const results: WithdrawalResult[] = [];
  let offset = 0;
  let totalFetched = 0;

  while (results.length < MAX_RESULTS_LIMIT) {
    const batch = await withdrawalDB
      .select({
        uuid: withdrawalSchema.uuid,
        createdAt: withdrawalSchema.createdAt,
      })
      .from(withdrawalSchema)
      .where(eq(withdrawalSchema.status, "requested"))
      .orderBy(asc(withdrawalSchema.createdAt))
      .limit(QUERY_BATCH_SIZE)
      .offset(offset);

    if (batch.length === 0) {
      break;
    }

    totalFetched += batch.length;

    const filtered = batch.filter((claim) => !processedUUIDSet.has(claim.uuid));

    const remainingSlots = MAX_RESULTS_LIMIT - results.length;
    const toAdd = filtered.slice(0, remainingSlots);
    results.push(...toAdd);

    logger.info(
      `Batch: ${batch.length} fetched, ${filtered.length} unprocessed, ${toAdd.length} added (total results: ${results.length}/${MAX_RESULTS_LIMIT})`,
    );

    if (results.length >= MAX_RESULTS_LIMIT) {
      break;
    }

    offset += QUERY_BATCH_SIZE;
  }

  logger.info(
    `Batch processing completed: ${results.length} unprocessed withdrawals found from ${totalFetched} total fetched records`,
  );

  return results;
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
