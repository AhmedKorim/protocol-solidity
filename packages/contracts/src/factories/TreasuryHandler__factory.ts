/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  Signer,
  utils,
  BytesLike,
  Contract,
  ContractFactory,
  Overrides,
} from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  TreasuryHandler,
  TreasuryHandlerInterface,
} from "../TreasuryHandler";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "bridgeAddress",
        type: "address",
      },
      {
        internalType: "bytes32[]",
        name: "initialResourceIDs",
        type: "bytes32[]",
      },
      {
        internalType: "address[]",
        name: "initialContractAddresses",
        type: "address[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "_bridgeAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "_contractAddressToResourceID",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "_contractWhitelist",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "_resourceIDToContractAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "resourceID",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "executeProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newBridge",
        type: "address",
      },
    ],
    name: "migrateBridge",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "resourceID",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "contractAddress",
        type: "address",
      },
    ],
    name: "setResource",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b5060405162000a8f38038062000a8f83398101604081905262000034916200022e565b8051825114620000b05760405162461bcd60e51b815260206004820152603c60248201527f696e697469616c5265736f7572636549447320616e6420696e697469616c436f60448201527f6e7472616374416464726573736573206c656e206d69736d6174636800000000606482015260840160405180910390fd5b600080546001600160a01b0319166001600160a01b0385161781555b8251811015620001355762000120838281518110620000ef57620000ef62000393565b60200260200101518383815181106200010c576200010c62000393565b60200260200101516200013f60201b60201c565b806200012c8162000369565b915050620000cc565b50505050620003bf565b600082815260016020818152604080842080546001600160a01b039096166001600160a01b0319909616861790559383526002815283832094909455600390935220805460ff19169091179055565b80516001600160a01b0381168114620001a657600080fd5b919050565b600082601f830112620001bd57600080fd5b81516020620001d6620001d08362000343565b62000310565b80838252828201915082860187848660051b8901011115620001f757600080fd5b60005b8581101562000221576200020e826200018e565b84529284019290840190600101620001fa565b5090979650505050505050565b6000806000606084860312156200024457600080fd5b6200024f846200018e565b602085810151919450906001600160401b03808211156200026f57600080fd5b818701915087601f8301126200028457600080fd5b815162000295620001d08262000343565b8082825285820191508585018b878560051b8801011115620002b657600080fd5b600095505b83861015620002db578051835260019590950194918601918601620002bb565b5060408a01519097509450505080831115620002f657600080fd5b50506200030686828701620001ab565b9150509250925092565b604051601f8201601f191681016001600160401b03811182821017156200033b576200033b620003a9565b604052919050565b60006001600160401b038211156200035f576200035f620003a9565b5060051b60200190565b60006000198214156200038c57634e487b7160e01b600052601160045260246000fd5b5060010190565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6106c080620003cf6000396000f3fe608060405234801561001057600080fd5b506004361061007d5760003560e01c8063c54c2a111161005b578063c54c2a11146100fa578063d7f5b35914610123578063e248cff214610136578063ec97d3b41461014957600080fd5b8063318c136e146100825780637f79bea8146100b2578063b8fa3736146100e5575b600080fd5b600054610095906001600160a01b031681565b6040516001600160a01b0390911681526020015b60405180910390f35b6100d56100c03660046104fb565b60036020526000908152604090205460ff1681565b60405190151581526020016100a9565b6100f86100f3366004610536565b610177565b005b61009561010836600461051d565b6001602052600090815260409020546001600160a01b031681565b6100f86101313660046104fb565b6101cf565b6100f8610144366004610562565b6101f9565b6101696101573660046104fb565b60026020526000908152604090205481565b6040519081526020016100a9565b61017f610483565b600082815260016020818152604080842080546001600160a01b0319166001600160a01b0387169081179091558452600282528084208690556003909152909120805460ff191690911790555050565b6101d7610483565b600080546001600160a01b0319166001600160a01b0392909216919091179055565b610201610483565b600080368161021360208287896105de565b61021c9161063d565b935061022c6024602087896105de565b6102359161065c565b925061024485602481896105de565b60008981526001602052604090205491935091506001600160a01b0316806001600160e01b031985166372c1ad0360e01b141561032657600061028a60048286886105de565b6102939161065c565b60e01c905060006102a86018600487896105de565b6102b191610608565b6040516372c1ad0360e01b815260609190911c6004820181905263ffffffff8416602483015291506001600160a01b038416906372c1ad0390604401600060405180830381600087803b15801561030757600080fd5b505af115801561031b573d6000803e3d6000fd5b505050505050610478565b6001600160e01b0319851663622c77d960e01b141561043457600061034e60048286886105de565b6103579161065c565b60e01c9050600061036c6018600487896105de565b61037591610608565b60601c9050600061038a602c6018888a6105de565b61039391610608565b60601c905060006103a8604c602c898b6105de565b6103b19161063d565b60405163622c77d960e01b81526001600160a01b03858116600483015284811660248301526044820183905263ffffffff871660648301529192509086169063622c77d990608401600060405180830381600087803b15801561041357600080fd5b505af1158015610427573d6000803e3d6000fd5b5050505050505050610478565b60405162461bcd60e51b8152602060048201526014602482015273496e76616c69642066756e6374696f6e2073696760601b60448201526064015b60405180910390fd5b505050505050505050565b6000546001600160a01b031633146104dd5760405162461bcd60e51b815260206004820152601e60248201527f73656e646572206d7573742062652062726964676520636f6e74726163740000604482015260640161046f565b565b80356001600160a01b03811681146104f657600080fd5b919050565b60006020828403121561050d57600080fd5b610516826104df565b9392505050565b60006020828403121561052f57600080fd5b5035919050565b6000806040838503121561054957600080fd5b82359150610559602084016104df565b90509250929050565b60008060006040848603121561057757600080fd5b83359250602084013567ffffffffffffffff8082111561059657600080fd5b818601915086601f8301126105aa57600080fd5b8135818111156105b957600080fd5b8760208285010111156105cb57600080fd5b6020830194508093505050509250925092565b600080858511156105ee57600080fd5b838611156105fb57600080fd5b5050820193919092039150565b6bffffffffffffffffffffffff1981358181169160148510156106355780818660140360031b1b83161692505b505092915050565b8035602083101561065657600019602084900360031b1b165b92915050565b6001600160e01b031981358181169160048510156106355760049490940360031b84901b169092169291505056fea26469706673582212206faf0068a51d6ca16a0c5753a7b079be27d9d1890132f5497d58fe10040e9e9264736f6c63430008050033";

export class TreasuryHandler__factory extends ContractFactory {
  constructor(
    ...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>
  ) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0]);
    } else {
      super(...args);
    }
  }

  deploy(
    bridgeAddress: string,
    initialResourceIDs: BytesLike[],
    initialContractAddresses: string[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<TreasuryHandler> {
    return super.deploy(
      bridgeAddress,
      initialResourceIDs,
      initialContractAddresses,
      overrides || {}
    ) as Promise<TreasuryHandler>;
  }
  getDeployTransaction(
    bridgeAddress: string,
    initialResourceIDs: BytesLike[],
    initialContractAddresses: string[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      bridgeAddress,
      initialResourceIDs,
      initialContractAddresses,
      overrides || {}
    );
  }
  attach(address: string): TreasuryHandler {
    return super.attach(address) as TreasuryHandler;
  }
  connect(signer: Signer): TreasuryHandler__factory {
    return super.connect(signer) as TreasuryHandler__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TreasuryHandlerInterface {
    return new utils.Interface(_abi) as TreasuryHandlerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): TreasuryHandler {
    return new Contract(address, _abi, signerOrProvider) as TreasuryHandler;
  }
}
