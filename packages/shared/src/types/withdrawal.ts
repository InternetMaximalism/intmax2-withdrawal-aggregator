export enum WithdrawalGroupStatus {
  PENDING,
  PROCESSING,
}

export interface WithdrawalGroup {
  requestingWithdrawals: RequestingWithdrawal[];
  status: WithdrawalGroupStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequestingWithdrawal {
  withdrawalHash: string;
}
