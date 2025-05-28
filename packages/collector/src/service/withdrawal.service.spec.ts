import { logger } from "@intmax2-withdrawal-aggregator/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { chunkArray } from "../lib/utils";
import { performJob } from "./job.service";
import { createWithdrawalGroup, fetchRequestingWithdrawals } from "./withdrawal.service";

vi.mock("./withdrawal.service");
vi.mock("@intmax2-withdrawal-aggregator/shared", () => ({
  config: {
    WITHDRAWAL_GROUP_SIZE: 10,
    WITHDRAWAL_MIN_BATCH_SIZE: 5,
    WITHDRAWAL_MIN_WAIT_MINUTES: 30,
  },
  logger: {
    info: vi.fn(),
  },
}));
vi.mock("../lib/utils");

const mockFetchRequestingWithdrawals = vi.mocked(fetchRequestingWithdrawals);
const mockCreateWithdrawalGroup = vi.mocked(createWithdrawalGroup);
const mockChunkArray = vi.mocked(chunkArray);

describe("performJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should exit early when no requesting withdrawals are found", async () => {
    mockFetchRequestingWithdrawals.mockResolvedValue([]);

    await performJob();

    expect(logger.info).toHaveBeenCalledWith("No requesting withdrawals found");
    expect(mockCreateWithdrawalGroup).not.toHaveBeenCalled();
  });

  it("should exit early when processing conditions are not met", async () => {
    const mockWithdrawals = [
      { uuid: "1", createdAt: new Date() },
      { uuid: "2", createdAt: new Date() },
    ];
    mockFetchRequestingWithdrawals.mockResolvedValue(mockWithdrawals);

    await performJob();

    expect(logger.info).toHaveBeenCalledWith("Conditions not met for processing withdrawals");
    expect(mockCreateWithdrawalGroup).not.toHaveBeenCalled();
  });

  it("should create withdrawal groups when there are enough withdrawals", async () => {
    const mockWithdrawals = Array.from({ length: 15 }, (_, i) => ({
      uuid: `${i + 1}`,
      createdAt: new Date(),
    }));

    mockFetchRequestingWithdrawals.mockResolvedValue(mockWithdrawals);
    mockChunkArray.mockReturnValue([mockWithdrawals.slice(0, 10), mockWithdrawals.slice(10, 15)]);
    mockCreateWithdrawalGroup.mockResolvedValue("group-id");

    await performJob();

    expect(mockChunkArray).toHaveBeenCalledWith(mockWithdrawals, 10);
    expect(mockCreateWithdrawalGroup).toHaveBeenCalledTimes(2);
    expect(logger.info).toHaveBeenCalledWith(
      "Successfully processed requesting withdrawals 15 withdrawals and created 2 groups",
    );
  });

  it("should process withdrawals when they are old enough, even with small quantity", async () => {
    const oldDate = new Date();
    oldDate.setMinutes(oldDate.getMinutes() - 35);

    const mockWithdrawals = [
      { uuid: "1", createdAt: oldDate },
      { uuid: "2", createdAt: new Date() },
    ];

    mockFetchRequestingWithdrawals.mockResolvedValue(mockWithdrawals);
    mockChunkArray.mockReturnValue([mockWithdrawals]);
    mockCreateWithdrawalGroup.mockResolvedValue("group-id");

    await performJob();

    expect(mockCreateWithdrawalGroup).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(
      "Successfully processed requesting withdrawals 2 withdrawals and created 1 groups",
    );
  });

  it("should propagate error when createWithdrawalGroup fails", async () => {
    const mockWithdrawals = Array.from({ length: 10 }, (_, i) => ({
      uuid: `${i + 1}`,
      createdAt: new Date(),
    }));

    mockFetchRequestingWithdrawals.mockResolvedValue(mockWithdrawals);
    mockChunkArray.mockReturnValue([mockWithdrawals]);
    mockCreateWithdrawalGroup.mockRejectedValue(new Error("Database error"));

    await expect(performJob()).rejects.toThrow("Database error");
  });
});
