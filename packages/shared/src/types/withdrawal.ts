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
  token_index: number;
  amount: string;
  nullifier: string;
  block_hash: string;
  block_number: number;
}
