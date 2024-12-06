import { DEFAULT_POLL_OPTIONS } from "../constants";
import type { PollOptions, PollResult } from "../types";
import { getGnarkProof, getWithdrawalProof, getWithdrawalWrapperProof } from "./zkp";

const poll = async (pollFn: () => Promise<PollResult>, options?: PollOptions) => {
  const pollOptions = { ...DEFAULT_POLL_OPTIONS, ...options };

  const startTime = Date.now();
  let attempts = 0;

  while (attempts < pollOptions.maxAttempts) {
    try {
      const result = await pollFn();

      if (!result.success) {
        throw new Error(`Operation failed: ${result.errorMessage || "Unknown error"}`);
      }

      if (result.proof) {
        return result;
      }

      if (Date.now() - startTime > pollOptions.timeoutMs) {
        throw new Error(`Polling timed out after ${pollOptions.timeoutMs}ms`);
      }

      attempts++;
      await new Promise((resolve) => setTimeout(resolve, pollOptions.intervalMs));
    } catch (error) {
      if (error instanceof Error && error.message.includes("Operation failed")) {
        throw error;
      }

      attempts++;
      await new Promise((resolve) => setTimeout(resolve, pollOptions.intervalMs));
    }
  }

  throw new Error(`Maximum polling attempts (${pollOptions.maxAttempts}) exceeded`);
};

export const pollWithdrawalProof = (proofId: string, options?: PollOptions) => {
  return poll(async () => {
    const proof = await getWithdrawalProof(proofId);
    return proof;
  }, options);
};

export const pollWithdrawalWrapperProof = (proofId: string, options?: PollOptions) => {
  return poll(async () => {
    const proof = await getWithdrawalWrapperProof(proofId);
    return proof;
  }, options);
};

export const pollGnarkProof = (proofId: string, options?: PollOptions) => {
  return poll(async () => {
    const proof = await getGnarkProof(proofId);
    return proof;
  }, options);
};
