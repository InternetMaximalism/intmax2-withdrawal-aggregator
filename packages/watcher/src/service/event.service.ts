import {
  BLOCK_RANGE_MINIMUM,
  ClaimedWithdrawalEvent,
  type DirectWithdrawalSuccessedEvent,
  type Event,
  type WithdrawalClaimableEvent,
  claimedWithdrawalEvent,
  directWithdrawalSuccessedEvent,
  fetchEvents,
  logger,
  withdrawalClaimableEvent,
} from "@intmax2-withdrawal-aggregator/shared";
import { parseAbiItem } from "abitype";
import type { PublicClient } from "viem";
import { LIQUIDITY_CONTRACT_ADDRESS, LIQUIDITY_CONTRACT_DEPLOYED_BLOCK } from "../constants";
import type { WithdrawalEventType } from "../types";

const handleWithdrawalEvent = async <T extends { args: { withdrawalHash: string } }>(
  ethereumClient: PublicClient,
  params: {
    startBlockNumber: bigint;
    endBlockNumber: bigint;
    eventInterface: ReturnType<typeof parseAbiItem>;
    eventName: WithdrawalEventType;
  },
) => {
  logger.info(
    `Fetching ${params.eventName} events from block ${params.startBlockNumber} to ${params.endBlockNumber}`,
  );

  const events = await fetchEvents<T>(ethereumClient, {
    startBlockNumber: params.startBlockNumber,
    endBlockNumber: params.endBlockNumber,
    blockRange: BLOCK_RANGE_MINIMUM,
    contractAddress: LIQUIDITY_CONTRACT_ADDRESS,
    eventInterface: params.eventInterface,
  });

  return events.map((log) => ({
    withdrawalHash: log.args.withdrawalHash,
  }));
};

export const handleAllWithdrawalEvents = async (
  ethereumClient: PublicClient,
  currentBlockNumber: bigint,
  events: Event[],
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
  events: Event[],
  eventName: WithdrawalEventType,
) => {
  const filteredEvents = events.filter((event) => event.name === eventName);
  if (filteredEvents.length === 0) {
    return LIQUIDITY_CONTRACT_DEPLOYED_BLOCK;
  }

  const lastEvent = filteredEvents.reduce((prev, current) => {
    return prev.lastBlockNumber > current.lastBlockNumber ? prev : current;
  });

  return lastEvent.lastBlockNumber;
};
