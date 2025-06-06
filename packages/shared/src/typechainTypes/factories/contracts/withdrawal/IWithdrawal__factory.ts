/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, type ContractRunner, Interface } from "ethers";
import type { IWithdrawal, IWithdrawalInterface } from "../../../contracts/withdrawal/IWithdrawal";

const _abi = [
  {
    inputs: [],
    name: "AddressZero",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "blockHash",
        type: "bytes32",
      },
    ],
    name: "BlockHashNotExists",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenIndice",
        type: "uint256",
      },
    ],
    name: "TokenAlreadyExist",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenIndice",
        type: "uint256",
      },
    ],
    name: "TokenNotExist",
    type: "error",
  },
  {
    inputs: [],
    name: "WithdrawalAggregatorMismatch",
    type: "error",
  },
  {
    inputs: [],
    name: "WithdrawalChainVerificationFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "WithdrawalProofVerificationFailed",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "withdrawalHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        components: [
          {
            internalType: "address",
            name: "recipient",
            type: "address",
          },
          {
            internalType: "uint32",
            name: "tokenIndex",
            type: "uint32",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "nullifier",
            type: "bytes32",
          },
        ],
        indexed: false,
        internalType: "struct WithdrawalLib.Withdrawal",
        name: "withdrawal",
        type: "tuple",
      },
    ],
    name: "ClaimableWithdrawalQueued",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "withdrawalHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        components: [
          {
            internalType: "address",
            name: "recipient",
            type: "address",
          },
          {
            internalType: "uint32",
            name: "tokenIndex",
            type: "uint32",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "nullifier",
            type: "bytes32",
          },
        ],
        indexed: false,
        internalType: "struct WithdrawalLib.Withdrawal",
        name: "withdrawal",
        type: "tuple",
      },
    ],
    name: "DirectWithdrawalQueued",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256[]",
        name: "tokenIndices",
        type: "uint256[]",
      },
    ],
    name: "DirectWithdrawalTokenIndicesAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256[]",
        name: "tokenIndices",
        type: "uint256[]",
      },
    ],
    name: "DirectWithdrawalTokenIndicesRemoved",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "tokenIndices",
        type: "uint256[]",
      },
    ],
    name: "addDirectWithdrawalTokenIndices",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getDirectWithdrawalTokenIndices",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "tokenIndices",
        type: "uint256[]",
      },
    ],
    name: "removeDirectWithdrawalTokenIndices",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "recipient",
            type: "address",
          },
          {
            internalType: "uint32",
            name: "tokenIndex",
            type: "uint32",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "nullifier",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "blockHash",
            type: "bytes32",
          },
          {
            internalType: "uint32",
            name: "blockNumber",
            type: "uint32",
          },
        ],
        internalType: "struct ChainedWithdrawalLib.ChainedWithdrawal[]",
        name: "withdrawals",
        type: "tuple[]",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "lastWithdrawalHash",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "withdrawalAggregator",
            type: "address",
          },
        ],
        internalType: "struct WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputs",
        name: "publicInputs",
        type: "tuple",
      },
      {
        internalType: "bytes",
        name: "proof",
        type: "bytes",
      },
    ],
    name: "submitWithdrawalProof",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IWithdrawal__factory {
  static readonly abi = _abi;
  static createInterface(): IWithdrawalInterface {
    return new Interface(_abi) as IWithdrawalInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): IWithdrawal {
    return new Contract(address, _abi, runner) as unknown as IWithdrawal;
  }
}
