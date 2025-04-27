import { withdrawalDB } from "@intmax2-withdrawal-aggregator/shared";

export const WithdrawalEvents = {
  DIRECT_WITHDRAWAL_SUCCESSED: "DirectWithdrawalSuccessed",
  WITHDRAWAL_CLAIMABLE: "WithdrawalClaimable",
  CLAIMED_WITHDRAWAL: "ClaimedWithdrawal",
} as const;

export type WithdrawalEventType = (typeof WithdrawalEvents)[keyof typeof WithdrawalEvents];

export const WITHDRAWAL_EVENT_NAMES = Object.values(WithdrawalEvents);

export type DatabaseType = typeof withdrawalDB;
export type TransactionType = Parameters<Parameters<DatabaseType["transaction"]>[0]>[0];
export type Transaction = (tx: TransactionType) => Promise<void>;
