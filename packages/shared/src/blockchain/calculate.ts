import { Block, FeeData, ethers } from "ethers";
import type { PublicClient } from "viem";

const PRECISION = 10n;
const SCROLL_GAS_MULTIPLIER = 1.2; // for l1 fee

const calculateAdjustedGasPrices = (multiplier: number, baseGasPrice: bigint) => {
  const multiplierScaled = BigInt(Math.round(multiplier * Number(PRECISION)));

  const gasPrice = (baseGasPrice * multiplierScaled) / PRECISION;

  return {
    gasPrice,
  };
};

export const getEthersMaxGasMultiplier = async (
  ethereumClient: PublicClient,
  multiplier: number,
) => {
  const provider = new ethers.JsonRpcProvider(ethereumClient.transport.url);

  const [block, feeData] = await Promise.all([provider.getBlock("latest"), provider.getFeeData()]);
  const baseGasPrice = getGasPrice(block, feeData);

  const { gasPrice } = calculateAdjustedGasPrices(multiplier, baseGasPrice);

  return { gasPrice };
};

const getGasPrice = (block: Block | null, feeData: FeeData) => {
  const baseFee = block?.baseFeePerGas ?? 0n;
  const gasPrice = feeData.gasPrice ?? 0n;
  const baseGasPrice = baseFee > gasPrice ? baseFee : gasPrice;

  const multiplierGasPrice = calculateAdjustedGasPrices(SCROLL_GAS_MULTIPLIER, baseGasPrice);
  return multiplierGasPrice.gasPrice + (feeData?.maxPriorityFeePerGas ?? 0n);
};

export const calculateEthersIncreasedGasPrice = (
  previousGasPrice: bigint,
  currentGasPrice: bigint,
) => {
  const newGasPrice = previousGasPrice > currentGasPrice ? previousGasPrice + 1n : currentGasPrice;

  return {
    newGasPrice,
  };
};

export const calculateGasMultiplier = (attempt: number, incrementRate: number = 0.2) => {
  if (attempt === 0) return 1;

  return 1 + attempt * incrementRate;
};
