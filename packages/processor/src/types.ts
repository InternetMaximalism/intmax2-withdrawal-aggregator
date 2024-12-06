import type { ContractWithdrawal } from "@intmax2-withdrawal-aggregator/shared";

export interface GetZKProofResponse {
  success: boolean;
  proof: string | null;
  errorMessage: string | null;
}

export interface CreateProofResponse {
  success: boolean;
  message: string;
}

export interface CreateGnarkProofResponse {
  success: boolean;
  jobId: string;
}

export interface SubmitWithdrwalParams {
  recipient: string;
  tokenIndex: bigint;
  amount: bigint;
  nullifier: string;
  blockHash: string;
  blockNumber: bigint;
}

export interface WithdrawalWithProof {
  uuid: string;
  singleWithdrawalProof: Uint8Array | null;
  contractWithdrawal: ContractWithdrawal;
  withdrawalHash: string;
}

export interface GnarkProof {
  publicInputs: string[];
  proof: string;
}

export interface PollOptions {
  maxAttempts?: number;
  intervalMs?: number;
  timeoutMs?: number;
}

export interface PollResult {
  success: boolean;
  proof: string | null;
  errorMessage: string | null;
}
