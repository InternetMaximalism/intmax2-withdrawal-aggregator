import type { Abi, Account, PublicClient } from "viem";

export interface ContractCallParameters {
  contractAddress: `0x${string}`;
  abi: Abi;
  functionName: string;
  account: Account;
  args: any[];
}

export interface ContractCallOptions {
  value?: bigint;
  nonce?: number;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
}

export interface RetryOptions {
  nonce?: number | null;
  maxFeePerGas: bigint | null;
  maxPriorityFeePerGas: bigint | null;
}

export interface GetTotalFeeParams {
  ethereumClient: PublicClient;
  contractCallParams: ContractCallParameters;
  multiplier: number;
}

export interface GasPriceData {
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
}

export interface BaseEvent {
  name: string;
  address: string;
  blockNumber: bigint;
  blockTimestamp: string;
}

export interface DirectWithdrawalSuccessedEvent extends BaseEvent {
  args: DirectWithdrawalSuccessedEventLog;
}

export interface WithdrawalEventLog {
  withdrawalHash: string;
}

export interface DirectWithdrawalSuccessedEventLog extends WithdrawalEventLog {
  recipient: string;
}

export interface WithdrawalClaimableEvent extends BaseEvent {
  args: WithdrawalClaimableEventLog;
}

export interface WithdrawalClaimableEventLog extends WithdrawalEventLog {}

export interface ClaimedWithdrawalEvent extends BaseEvent {
  args: ClaimedWithdrawalEventLog;
}

export interface ClaimedWithdrawalEventLog extends WithdrawalEventLog {
  recipient: string;
}
