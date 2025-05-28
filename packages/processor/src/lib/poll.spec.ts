import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { pollGnarkProof, pollWithdrawalProof, pollWithdrawalWrapperProof } from "./poll";

vi.mock("./zkp", () => ({
  getWithdrawalProof: vi.fn(),
  getWithdrawalWrapperProof: vi.fn(),
  getGnarkProof: vi.fn(),
}));

vi.mock("../constants", () => ({
  DEFAULT_POLL_OPTIONS: {
    maxAttempts: 5,
    timeoutMs: 30000,
    intervalMs: 1000,
  },
}));

import { getGnarkProof, getWithdrawalProof, getWithdrawalWrapperProof } from "./zkp";

describe("Polling Service", () => {
  const mockGetWithdrawalProof = getWithdrawalProof as any;
  const mockGetWithdrawalWrapperProof = getWithdrawalWrapperProof as any;
  const mockGetGnarkProof = getGnarkProof as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("pollWithdrawalProof", () => {
    it("should return proof immediately when available on first attempt", async () => {
      const mockProof = { proof: "mock-withdrawal-proof", success: true };
      mockGetWithdrawalProof.mockResolvedValue(mockProof);

      const result = await pollWithdrawalProof("proof-id-1");

      expect(result).toEqual(mockProof);
      expect(mockGetWithdrawalProof).toHaveBeenCalledTimes(1);
      expect(mockGetWithdrawalProof).toHaveBeenCalledWith("proof-id-1");
    });

    it("should retry when proof is not available initially", async () => {
      const mockProofNotReady = { proof: null, success: true };
      const mockProofReady = { proof: "mock-withdrawal-proof", success: true };

      mockGetWithdrawalProof
        .mockResolvedValueOnce(mockProofNotReady)
        .mockResolvedValueOnce(mockProofNotReady)
        .mockResolvedValueOnce(mockProofReady);

      const pollPromise = pollWithdrawalProof("proof-id-1");

      await vi.advanceTimersByTimeAsync(2000);

      const result = await pollPromise;

      expect(result).toEqual(mockProofReady);
      expect(mockGetWithdrawalProof).toHaveBeenCalledTimes(3);
    });

    it("should throw error when operation fails", async () => {
      const mockError = { success: false, errorMessage: "Proof generation failed" };
      mockGetWithdrawalProof.mockResolvedValue(mockError);

      await expect(pollWithdrawalProof("proof-id-1")).rejects.toThrow(
        "Operation failed: Proof generation failed",
      );
    });

    it("should use custom poll options", async () => {
      const mockProofNotReady = { proof: null, success: true };
      const mockProofReady = { proof: "mock-withdrawal-proof", success: true };

      mockGetWithdrawalProof
        .mockResolvedValueOnce(mockProofNotReady)
        .mockResolvedValueOnce(mockProofReady);

      const customOptions = {
        maxAttempts: 2,
        timeoutMs: 10000,
        intervalMs: 500,
      };

      const pollPromise = pollWithdrawalProof("proof-id-1", customOptions);

      await vi.advanceTimersByTimeAsync(500);

      const result = await pollPromise;

      expect(result).toEqual(mockProofReady);
      expect(mockGetWithdrawalProof).toHaveBeenCalledTimes(2);
    });

    it("should handle network errors and retry", async () => {
      const networkError = new Error("Network error");
      const mockProofReady = { proof: "mock-withdrawal-proof", success: true };

      mockGetWithdrawalProof
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce(mockProofReady);

      const pollPromise = pollWithdrawalProof("proof-id-1");

      await vi.advanceTimersByTimeAsync(2000);

      const result = await pollPromise;

      expect(result).toEqual(mockProofReady);
      expect(mockGetWithdrawalProof).toHaveBeenCalledTimes(3);
    });
  });

  describe("pollWithdrawalWrapperProof", () => {
    it("should return wrapper proof when available", async () => {
      const mockProof = { proof: "mock-wrapper-proof", success: true };
      mockGetWithdrawalWrapperProof.mockResolvedValue(mockProof);

      const result = await pollWithdrawalWrapperProof("wrapper-proof-id");

      expect(result).toEqual(mockProof);
      expect(mockGetWithdrawalWrapperProof).toHaveBeenCalledWith("wrapper-proof-id");
    });

    it("should handle operation failure", async () => {
      const mockError = { success: false, errorMessage: "Wrapper proof failed" };
      mockGetWithdrawalWrapperProof.mockResolvedValue(mockError);

      await expect(pollWithdrawalWrapperProof("wrapper-id")).rejects.toThrow(
        "Operation failed: Wrapper proof failed",
      );
    });
  });

  describe("pollGnarkProof", () => {
    it("should return gnark proof when available", async () => {
      const mockProof = { proof: { pi_a: [], pi_b: [], pi_c: [] }, success: true };
      mockGetGnarkProof.mockResolvedValue(mockProof);

      const result = await pollGnarkProof("gnark-proof-id");

      expect(result).toEqual(mockProof);
      expect(mockGetGnarkProof).toHaveBeenCalledWith("gnark-proof-id");
    });

    it("should handle gnark proof generation failure", async () => {
      const mockError = { success: false, errorMessage: "Gnark proof generation failed" };
      mockGetGnarkProof.mockResolvedValue(mockError);

      await expect(pollGnarkProof("gnark-id")).rejects.toThrow(
        "Operation failed: Gnark proof generation failed",
      );
    });

    it("should retry until gnark proof is ready", async () => {
      const mockProofNotReady = { proof: null, success: true };
      const mockProofReady = {
        proof: { pi_a: ["0x123"], pi_b: [["0x456"]], pi_c: ["0x789"] },
        success: true,
      };

      mockGetGnarkProof
        .mockResolvedValueOnce(mockProofNotReady)
        .mockResolvedValueOnce(mockProofReady);

      const pollPromise = pollGnarkProof("gnark-proof-id");

      await vi.advanceTimersByTimeAsync(1000);

      const result = await pollPromise;

      expect(result).toEqual(mockProofReady);
      expect(mockGetGnarkProof).toHaveBeenCalledTimes(2);
    });
  });
});
