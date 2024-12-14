import { FeeData, ethers } from "ethers";
import type { PublicClient } from "viem";

const PRECISION = 10n;

const calculateAdjustedGasPrices = (multiplier: number, feeData: FeeData) => {
  const multiplierScaled = BigInt(Math.round(multiplier * Number(PRECISION)));

  const gasPrice = (feeData.gasPrice! * multiplierScaled) / PRECISION;
  const maxFeePerGas = (feeData.maxFeePerGas! * multiplierScaled) / PRECISION;
  const maxPriorityFeePerGas = (feeData.maxPriorityFeePerGas! * multiplierScaled) / PRECISION;

  return {
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
  };
};

export const getEthersMaxGasMultiplier = async (
  ethereumClient: PublicClient,
  multiplier: number,
) => {
  const provider = new ethers.JsonRpcProvider(ethereumClient.transport.url);
  const feeData = await provider.getFeeData();
  const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = calculateAdjustedGasPrices(
    multiplier,
    feeData,
  );

  return { gasPrice, maxFeePerGas, maxPriorityFeePerGas };
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
