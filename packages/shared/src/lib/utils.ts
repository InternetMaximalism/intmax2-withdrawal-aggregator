import { randomBytes } from "crypto";

export const sleep = (ms = 1000) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getRandomString = (length: number): string => {
  const bytes = randomBytes(Math.ceil(length / 2));
  return bytes.toString("hex").slice(0, length);
};

export const uint8ArrayToString = (uint8Array: Uint8Array): string => {
  return new TextDecoder().decode(uint8Array);
};
