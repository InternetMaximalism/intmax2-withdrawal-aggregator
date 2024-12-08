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
  uuid: string;
}

export interface ContractWithdrawal {
  recipient: string;
  tokenIndex: number;
  amount: string;
  nullifier: string;
}
