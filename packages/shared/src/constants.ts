import { config } from "./config";

// block event
export const BLOCK_RANGE_MINIMUM = 10000n;

// contract
export const LIQUIDITY_CONTRACT_ADDRESS = config.LIQUIDITY_CONTRACT_ADDRESS as `0x${string}`;
export const LIQUIDITY_CONTRACT_DEPLOYED_BLOCK_NUMBER = BigInt(
  config.LIQUIDITY_CONTRACT_DEPLOYED_BLOCK_NUMBER,
) as bigint;

// blockchain
export const PRECISION = 10n;
