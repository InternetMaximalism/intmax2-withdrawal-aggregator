import type { PollOptions } from "./types";

// id
export const DEFAULT_ID_LENGTH = 20;

// poll
export const DEFAULT_POLL_OPTIONS: Required<PollOptions> = {
  maxAttempts: 30,
  intervalMs: 5_000,
  timeoutMs: 180_000,
};

// transaction
export const REPLACED_TX_WAIT_TIMEOUT = 30_000;
export const WAIT_TRANSACTION_TIMEOUT = 30_000;
export const TRANSACTION_MAX_RETRIES = 5;

// errors
export const TRANSACTION_WAIT_TIMEOUT_ERROR_MESSAGE =
  "Timed out while waiting for transaction with hash";
