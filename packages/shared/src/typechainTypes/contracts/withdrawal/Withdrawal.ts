/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  AddressLike,
  BaseContract,
  BigNumberish,
  BytesLike,
  ContractMethod,
  ContractRunner,
  EventFragment,
  FunctionFragment,
  Interface,
  Listener,
  Result,
} from "ethers";
import type {
  TypedContractEvent,
  TypedContractMethod,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedLogDescription,
} from "../../common";

export declare namespace WithdrawalLib {
  export type WithdrawalStruct = {
    recipient: AddressLike;
    tokenIndex: BigNumberish;
    amount: BigNumberish;
    nullifier: BytesLike;
  };

  export type WithdrawalStructOutput = [
    recipient: string,
    tokenIndex: bigint,
    amount: bigint,
    nullifier: string,
  ] & {
    recipient: string;
    tokenIndex: bigint;
    amount: bigint;
    nullifier: string;
  };
}

export declare namespace ChainedWithdrawalLib {
  export type ChainedWithdrawalStruct = {
    recipient: AddressLike;
    tokenIndex: BigNumberish;
    amount: BigNumberish;
    nullifier: BytesLike;
    blockHash: BytesLike;
    blockNumber: BigNumberish;
  };

  export type ChainedWithdrawalStructOutput = [
    recipient: string,
    tokenIndex: bigint,
    amount: bigint,
    nullifier: string,
    blockHash: string,
    blockNumber: bigint,
  ] & {
    recipient: string;
    tokenIndex: bigint;
    amount: bigint;
    nullifier: string;
    blockHash: string;
    blockNumber: bigint;
  };
}

export declare namespace WithdrawalProofPublicInputsLib {
  export type WithdrawalProofPublicInputsStruct = {
    lastWithdrawalHash: BytesLike;
    withdrawalAggregator: AddressLike;
  };

  export type WithdrawalProofPublicInputsStructOutput = [
    lastWithdrawalHash: string,
    withdrawalAggregator: string,
  ] & { lastWithdrawalHash: string; withdrawalAggregator: string };
}

export interface WithdrawalInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "UPGRADE_INTERFACE_VERSION"
      | "addDirectWithdrawalTokenIndices"
      | "getDirectWithdrawalTokenIndices"
      | "initialize"
      | "owner"
      | "proxiableUUID"
      | "removeDirectWithdrawalTokenIndices"
      | "renounceOwnership"
      | "submitWithdrawalProof"
      | "transferOwnership"
      | "upgradeToAndCall",
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "ClaimableWithdrawalQueued"
      | "DirectWithdrawalQueued"
      | "DirectWithdrawalTokenIndicesAdded"
      | "DirectWithdrawalTokenIndicesRemoved"
      | "Initialized"
      | "OwnershipTransferred"
      | "Upgraded",
  ): EventFragment;

  encodeFunctionData(functionFragment: "UPGRADE_INTERFACE_VERSION", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "addDirectWithdrawalTokenIndices",
    values: [BigNumberish[]],
  ): string;
  encodeFunctionData(
    functionFragment: "getDirectWithdrawalTokenIndices",
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [
      AddressLike,
      AddressLike,
      AddressLike,
      AddressLike,
      AddressLike,
      AddressLike,
      BigNumberish[],
    ],
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(functionFragment: "proxiableUUID", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "removeDirectWithdrawalTokenIndices",
    values: [BigNumberish[]],
  ): string;
  encodeFunctionData(functionFragment: "renounceOwnership", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "submitWithdrawalProof",
    values: [
      ChainedWithdrawalLib.ChainedWithdrawalStruct[],
      WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputsStruct,
      BytesLike,
    ],
  ): string;
  encodeFunctionData(functionFragment: "transferOwnership", values: [AddressLike]): string;
  encodeFunctionData(
    functionFragment: "upgradeToAndCall",
    values: [AddressLike, BytesLike],
  ): string;

  decodeFunctionResult(functionFragment: "UPGRADE_INTERFACE_VERSION", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "addDirectWithdrawalTokenIndices",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: "getDirectWithdrawalTokenIndices",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "proxiableUUID", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "removeDirectWithdrawalTokenIndices",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: "renounceOwnership", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "submitWithdrawalProof", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "transferOwnership", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "upgradeToAndCall", data: BytesLike): Result;
}

export namespace ClaimableWithdrawalQueuedEvent {
  export type InputTuple = [
    withdrawalHash: BytesLike,
    recipient: AddressLike,
    withdrawal: WithdrawalLib.WithdrawalStruct,
  ];
  export type OutputTuple = [
    withdrawalHash: string,
    recipient: string,
    withdrawal: WithdrawalLib.WithdrawalStructOutput,
  ];
  export interface OutputObject {
    withdrawalHash: string;
    recipient: string;
    withdrawal: WithdrawalLib.WithdrawalStructOutput;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace DirectWithdrawalQueuedEvent {
  export type InputTuple = [
    withdrawalHash: BytesLike,
    recipient: AddressLike,
    withdrawal: WithdrawalLib.WithdrawalStruct,
  ];
  export type OutputTuple = [
    withdrawalHash: string,
    recipient: string,
    withdrawal: WithdrawalLib.WithdrawalStructOutput,
  ];
  export interface OutputObject {
    withdrawalHash: string;
    recipient: string;
    withdrawal: WithdrawalLib.WithdrawalStructOutput;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace DirectWithdrawalTokenIndicesAddedEvent {
  export type InputTuple = [tokenIndices: BigNumberish[]];
  export type OutputTuple = [tokenIndices: bigint[]];
  export interface OutputObject {
    tokenIndices: bigint[];
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace DirectWithdrawalTokenIndicesRemovedEvent {
  export type InputTuple = [tokenIndices: BigNumberish[]];
  export type OutputTuple = [tokenIndices: bigint[]];
  export interface OutputObject {
    tokenIndices: bigint[];
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace InitializedEvent {
  export type InputTuple = [version: BigNumberish];
  export type OutputTuple = [version: bigint];
  export interface OutputObject {
    version: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OwnershipTransferredEvent {
  export type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [previousOwner: string, newOwner: string];
  export interface OutputObject {
    previousOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace UpgradedEvent {
  export type InputTuple = [implementation: AddressLike];
  export type OutputTuple = [implementation: string];
  export interface OutputObject {
    implementation: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface Withdrawal extends BaseContract {
  connect(runner?: ContractRunner | null): Withdrawal;
  waitForDeployment(): Promise<this>;

  interface: WithdrawalInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined,
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined,
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>,
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>,
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>,
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>,
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent,
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;

  UPGRADE_INTERFACE_VERSION: TypedContractMethod<[], [string], "view">;

  addDirectWithdrawalTokenIndices: TypedContractMethod<
    [tokenIndices: BigNumberish[]],
    [void],
    "nonpayable"
  >;

  getDirectWithdrawalTokenIndices: TypedContractMethod<[], [bigint[]], "view">;

  initialize: TypedContractMethod<
    [
      _admin: AddressLike,
      _scrollMessenger: AddressLike,
      _withdrawalVerifier: AddressLike,
      _liquidity: AddressLike,
      _rollup: AddressLike,
      _contribution: AddressLike,
      _directWithdrawalTokenIndices: BigNumberish[],
    ],
    [void],
    "nonpayable"
  >;

  owner: TypedContractMethod<[], [string], "view">;

  proxiableUUID: TypedContractMethod<[], [string], "view">;

  removeDirectWithdrawalTokenIndices: TypedContractMethod<
    [tokenIndices: BigNumberish[]],
    [void],
    "nonpayable"
  >;

  renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;

  submitWithdrawalProof: TypedContractMethod<
    [
      withdrawals: ChainedWithdrawalLib.ChainedWithdrawalStruct[],
      publicInputs: WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputsStruct,
      proof: BytesLike,
    ],
    [void],
    "nonpayable"
  >;

  transferOwnership: TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;

  upgradeToAndCall: TypedContractMethod<
    [newImplementation: AddressLike, data: BytesLike],
    [void],
    "payable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;

  getFunction(
    nameOrSignature: "UPGRADE_INTERFACE_VERSION",
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "addDirectWithdrawalTokenIndices",
  ): TypedContractMethod<[tokenIndices: BigNumberish[]], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "getDirectWithdrawalTokenIndices",
  ): TypedContractMethod<[], [bigint[]], "view">;
  getFunction(
    nameOrSignature: "initialize",
  ): TypedContractMethod<
    [
      _admin: AddressLike,
      _scrollMessenger: AddressLike,
      _withdrawalVerifier: AddressLike,
      _liquidity: AddressLike,
      _rollup: AddressLike,
      _contribution: AddressLike,
      _directWithdrawalTokenIndices: BigNumberish[],
    ],
    [void],
    "nonpayable"
  >;
  getFunction(nameOrSignature: "owner"): TypedContractMethod<[], [string], "view">;
  getFunction(nameOrSignature: "proxiableUUID"): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "removeDirectWithdrawalTokenIndices",
  ): TypedContractMethod<[tokenIndices: BigNumberish[]], [void], "nonpayable">;
  getFunction(nameOrSignature: "renounceOwnership"): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "submitWithdrawalProof",
  ): TypedContractMethod<
    [
      withdrawals: ChainedWithdrawalLib.ChainedWithdrawalStruct[],
      publicInputs: WithdrawalProofPublicInputsLib.WithdrawalProofPublicInputsStruct,
      proof: BytesLike,
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "transferOwnership",
  ): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "upgradeToAndCall",
  ): TypedContractMethod<[newImplementation: AddressLike, data: BytesLike], [void], "payable">;

  getEvent(
    key: "ClaimableWithdrawalQueued",
  ): TypedContractEvent<
    ClaimableWithdrawalQueuedEvent.InputTuple,
    ClaimableWithdrawalQueuedEvent.OutputTuple,
    ClaimableWithdrawalQueuedEvent.OutputObject
  >;
  getEvent(
    key: "DirectWithdrawalQueued",
  ): TypedContractEvent<
    DirectWithdrawalQueuedEvent.InputTuple,
    DirectWithdrawalQueuedEvent.OutputTuple,
    DirectWithdrawalQueuedEvent.OutputObject
  >;
  getEvent(
    key: "DirectWithdrawalTokenIndicesAdded",
  ): TypedContractEvent<
    DirectWithdrawalTokenIndicesAddedEvent.InputTuple,
    DirectWithdrawalTokenIndicesAddedEvent.OutputTuple,
    DirectWithdrawalTokenIndicesAddedEvent.OutputObject
  >;
  getEvent(
    key: "DirectWithdrawalTokenIndicesRemoved",
  ): TypedContractEvent<
    DirectWithdrawalTokenIndicesRemovedEvent.InputTuple,
    DirectWithdrawalTokenIndicesRemovedEvent.OutputTuple,
    DirectWithdrawalTokenIndicesRemovedEvent.OutputObject
  >;
  getEvent(
    key: "Initialized",
  ): TypedContractEvent<
    InitializedEvent.InputTuple,
    InitializedEvent.OutputTuple,
    InitializedEvent.OutputObject
  >;
  getEvent(
    key: "OwnershipTransferred",
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;
  getEvent(
    key: "Upgraded",
  ): TypedContractEvent<
    UpgradedEvent.InputTuple,
    UpgradedEvent.OutputTuple,
    UpgradedEvent.OutputObject
  >;

  filters: {
    "ClaimableWithdrawalQueued(bytes32,address,tuple)": TypedContractEvent<
      ClaimableWithdrawalQueuedEvent.InputTuple,
      ClaimableWithdrawalQueuedEvent.OutputTuple,
      ClaimableWithdrawalQueuedEvent.OutputObject
    >;
    ClaimableWithdrawalQueued: TypedContractEvent<
      ClaimableWithdrawalQueuedEvent.InputTuple,
      ClaimableWithdrawalQueuedEvent.OutputTuple,
      ClaimableWithdrawalQueuedEvent.OutputObject
    >;

    "DirectWithdrawalQueued(bytes32,address,tuple)": TypedContractEvent<
      DirectWithdrawalQueuedEvent.InputTuple,
      DirectWithdrawalQueuedEvent.OutputTuple,
      DirectWithdrawalQueuedEvent.OutputObject
    >;
    DirectWithdrawalQueued: TypedContractEvent<
      DirectWithdrawalQueuedEvent.InputTuple,
      DirectWithdrawalQueuedEvent.OutputTuple,
      DirectWithdrawalQueuedEvent.OutputObject
    >;

    "DirectWithdrawalTokenIndicesAdded(uint256[])": TypedContractEvent<
      DirectWithdrawalTokenIndicesAddedEvent.InputTuple,
      DirectWithdrawalTokenIndicesAddedEvent.OutputTuple,
      DirectWithdrawalTokenIndicesAddedEvent.OutputObject
    >;
    DirectWithdrawalTokenIndicesAdded: TypedContractEvent<
      DirectWithdrawalTokenIndicesAddedEvent.InputTuple,
      DirectWithdrawalTokenIndicesAddedEvent.OutputTuple,
      DirectWithdrawalTokenIndicesAddedEvent.OutputObject
    >;

    "DirectWithdrawalTokenIndicesRemoved(uint256[])": TypedContractEvent<
      DirectWithdrawalTokenIndicesRemovedEvent.InputTuple,
      DirectWithdrawalTokenIndicesRemovedEvent.OutputTuple,
      DirectWithdrawalTokenIndicesRemovedEvent.OutputObject
    >;
    DirectWithdrawalTokenIndicesRemoved: TypedContractEvent<
      DirectWithdrawalTokenIndicesRemovedEvent.InputTuple,
      DirectWithdrawalTokenIndicesRemovedEvent.OutputTuple,
      DirectWithdrawalTokenIndicesRemovedEvent.OutputObject
    >;

    "Initialized(uint64)": TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;
    Initialized: TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;

    "OwnershipTransferred(address,address)": TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
    OwnershipTransferred: TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;

    "Upgraded(address)": TypedContractEvent<
      UpgradedEvent.InputTuple,
      UpgradedEvent.OutputTuple,
      UpgradedEvent.OutputObject
    >;
    Upgraded: TypedContractEvent<
      UpgradedEvent.InputTuple,
      UpgradedEvent.OutputTuple,
      UpgradedEvent.OutputObject
    >;
  };
}
