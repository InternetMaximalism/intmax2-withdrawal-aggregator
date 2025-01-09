export const WithdrawalEvents = {
  DIRECT_WITHDRAWAL_SUCCESSED: "DirectWithdrawalSuccessed",
  WITHDRAWAL_CLAIMABLE: "WithdrawalClaimable",
  CLAIMED_WITHDRAWAL: "ClaimedWithdrawal",
} as const;

export type WithdrawalEventType = (typeof WithdrawalEvents)[keyof typeof WithdrawalEvents];

export const WITHDRAWAL_EVENT_NAMES = Object.values(WithdrawalEvents);
