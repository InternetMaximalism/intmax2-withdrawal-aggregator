import {
  logger,
  QueueManager,
  type RequestingWithdrawal,
  WithdrawalGroupStatus,
  WithdrawalManager,
  withdrawalDB,
  withdrawalSchema,
} from "@intmax2-withdrawal-aggregator/shared";
import { and, asc, eq, notInArray } from "drizzle-orm";
import { MAX_PG_SQL_PARAMS, MAX_RESULTS_LIMIT, QUERY_BATCH_SIZE } from "../constants";
import type { WithdrawalResult } from "../types";

export const fetchRequestingWithdrawals = async () => {
  const processedKeys = await WithdrawalManager.getInstance().getAllProcessedHashes();

  if (processedKeys.length > MAX_PG_SQL_PARAMS) {
    return await fetchRequestingWithdrawalsBatch(processedKeys);
  }

  const requestingWithdrawals = await withdrawalDB
    .select({
      withdrawalHash: withdrawalSchema.withdrawalHash,
      createdAt: withdrawalSchema.createdAt,
    })
    .from(withdrawalSchema)
    .where(
      and(
        eq(withdrawalSchema.status, "requested"),
        notInArray(withdrawalSchema.withdrawalHash, processedKeys),
      ),
    )
    .orderBy(asc(withdrawalSchema.createdAt));

  return requestingWithdrawals;
};

// NOTE: better performance
export const fetchRequestingWithdrawalsBatch = async (processedKeys: string[]) => {
  const processedKeySet = new Set(processedKeys);
  const results: WithdrawalResult[] = [];
  let offset = 0;
  let totalFetched = 0;

  while (results.length < MAX_RESULTS_LIMIT) {
    const batch = await withdrawalDB
      .select({
        withdrawalHash: withdrawalSchema.withdrawalHash,
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

    const filtered = batch.filter((claim) => !processedKeySet.has(claim.withdrawalHash));

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
      withdrawalHash: withdrawal.withdrawalHash,
    })),
    status: WithdrawalGroupStatus.PENDING,
    createdAt: now,
    updatedAt: now,
  });

  await queueManager.addJob("processBatch", { groupId });

  logger.debug(`Created withdrawal group ${groupId}`);

  return groupId;
};
