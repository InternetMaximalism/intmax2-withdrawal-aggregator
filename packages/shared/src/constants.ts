import { config } from "./config";

// block event
export const BLOCK_RANGE_MINIMUM = 10000n;
export const BLOCK_RANGE_NORMAL = 30000n;
export const BLOCK_RANGE_MAX = 100000n;

// config
export const LIQUIDITY_CONTRACT_ADDRESS = config.LIQUIDITY_CONTRACT_ADDRESS as `0x${string}`;
export const LIQUIDITY_CONTRACT_DEPLOYED_BLOCK = BigInt(
  config.LIQUIDITY_CONTRACT_DEPLOYED_BLOCK,
) as bigint;
