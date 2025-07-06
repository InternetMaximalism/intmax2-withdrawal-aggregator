import {
  BLOCK_RANGE_MINIMUM,
  type ClaimedWithdrawalEvent,
  claimedWithdrawalEvent,
  type DirectWithdrawalSuccessedEvent,
  directWithdrawalSuccessedEvent,
  eventSchema,
  fetchEvents,
  LIQUIDITY_CONTRACT_ADDRESS,
  LIQUIDITY_CONTRACT_DEPLOYED_BLOCK_NUMBER,
  validateBlockRange,
  type WithdrawalClaimableEvent,
  withdrawalClaimableEvent,
} from "@intmax2-withdrawal-aggregator/shared";
import { parseAbiItem } from "abitype";
import type { PublicClient } from "viem";
import type { WithdrawalEventType } from "../types";

const handleWithdrawalEvent = async <
  T extends { args: { withdrawalHash: string }; transactionHash: string },
>(
  ethereumClient: PublicClient,
  params: {
    startBlockNumber: bigint;
    endBlockNumber: bigint;
    eventInterface: ReturnType<typeof parseAbiItem>;
    eventName: WithdrawalEventType;
  },
) => {
  const { eventName, eventInterface, startBlockNumber, endBlockNumber } = params;

  validateBlockRange(eventName, startBlockNumber, endBlockNumber);

  const events = await fetchEvents<T>(ethereumClient, {
    startBlockNumber,
    endBlockNumber,
    blockRange: BLOCK_RANGE_MINIMUM,
    contractAddress: LIQUIDITY_CONTRACT_ADDRESS,
    eventInterface,
  });

  return events.map((log) => ({
    withdrawalHash: log.args.withdrawalHash,
    transactionHash: log.transactionHash,
  }));
};

export const handleAllWithdrawalEvents = async (
  ethereumClient: PublicClient,
  currentBlockNumber: bigint,
  events: (typeof eventSchema.$inferSelect)[],
) => {
  const [directWithdrawals, claimableWithdrawals, claimedWithdrawals] = await Promise.all([
    handleWithdrawalEvent<DirectWithdrawalSuccessedEvent>(ethereumClient, {
      startBlockNumber: getLastProcessedBlockNumberByEventName(events, "DirectWithdrawalSuccessed"),
      endBlockNumber: currentBlockNumber,
      eventInterface: directWithdrawalSuccessedEvent,
      eventName: "DirectWithdrawalSuccessed",
    }),
    handleWithdrawalEvent<WithdrawalClaimableEvent>(ethereumClient, {
      startBlockNumber: getLastProcessedBlockNumberByEventName(events, "WithdrawalClaimable"),
      endBlockNumber: currentBlockNumber,
      eventInterface: withdrawalClaimableEvent,
      eventName: "WithdrawalClaimable",
    }),
    handleWithdrawalEvent<ClaimedWithdrawalEvent>(ethereumClient, {
      startBlockNumber: getLastProcessedBlockNumberByEventName(events, "ClaimedWithdrawal"),
      endBlockNumber: currentBlockNumber,
      eventInterface: claimedWithdrawalEvent,
      eventName: "ClaimedWithdrawal",
    }),
  ]);

  return {
    directWithdrawals,
    claimableWithdrawals,
    claimedWithdrawals,
  };
};

export const getLastProcessedBlockNumberByEventName = (
  events: (typeof eventSchema.$inferSelect)[],
  eventName: WithdrawalEventType,
) => {
  const filteredEvents = events.filter((event) => event.name === eventName);
  if (filteredEvents.length === 0) {
    return LIQUIDITY_CONTRACT_DEPLOYED_BLOCK_NUMBER;
  }

  const lastEvent = filteredEvents.reduce((prev, current) => {
    return prev.lastBlockNumber > current.lastBlockNumber ? prev : current;
  });

  return lastEvent.lastBlockNumber;
};
