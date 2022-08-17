/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { Treasury, TreasuryInterface } from "../Treasury";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_treasuryHandler",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "proposalNonce",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "address payable",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amountToRescue",
        type: "uint256",
      },
      {
        internalType: "uint32",
        name: "nonce",
        type: "uint32",
      },
    ],
    name: "rescueTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newHandler",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "nonce",
        type: "uint32",
      },
    ],
    name: "setHandler",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

const _bytecode =
  "0x60806040526000805534801561001457600080fd5b506040516107e53803806107e583398101604081905261003391610058565b600180546001600160a01b0319166001600160a01b0392909216919091179055610088565b60006020828403121561006a57600080fd5b81516001600160a01b038116811461008157600080fd5b9392505050565b61074e806100976000396000f3fe6080604052600436106100385760003560e01c8063622c77d91461004457806372c1ad0314610066578063cc3c74a11461008657600080fd5b3661003f57005b600080fd5b34801561005057600080fd5b5061006461005f36600461057c565b6100ae565b005b34801561007257600080fd5b506100646100813660046105cd565b610447565b34801561009257600080fd5b5061009c60005481565b60405190815260200160405180910390f35b6001546001600160a01b031633146100e15760405162461bcd60e51b81526004016100d890610644565b60405180910390fd5b6001600160a01b0383166101455760405162461bcd60e51b815260206004820152602560248201527f43616e6e6f742073656e64206c697175696469747920746f207a65726f206164604482015264647265737360d81b60648201526084016100d8565b6001600160a01b03841630141561019e5760405162461bcd60e51b815260206004820152601b60248201527f43616e6e6f74207265736375652077726170706564206173736574000000000060448201526064016100d8565b8063ffffffff16600054106101e55760405162461bcd60e51b815260206004820152600d60248201526c496e76616c6964206e6f6e636560981b60448201526064016100d8565b6000546101f4906104186106da565b8163ffffffff16106102185760405162461bcd60e51b81526004016100d890610693565b6001600160a01b0384166102a8574782811061026a576040516001600160a01b0385169084156108fc029085906000818181858888f19350505050158015610264573d6000803e3d6000fd5b506102a2565b6040516001600160a01b0385169082156108fc029083906000818181858888f193505050501580156102a0573d6000803e3d6000fd5b505b50610439565b6040516370a0823160e01b81523060048201526000906001600160a01b038616906370a082319060240160206040518083038186803b1580156102ea57600080fd5b505afa1580156102fe573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610322919061062b565b90508281106103b35760405163a9059cbb60e01b81526001600160a01b0385811660048301526024820185905286169063a9059cbb90604401602060405180830381600087803b15801561037557600080fd5b505af1158015610389573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103ad9190610602565b50610437565b60405163a9059cbb60e01b81526001600160a01b0385811660048301526024820183905286169063a9059cbb90604401602060405180830381600087803b1580156103fd57600080fd5b505af1158015610411573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104359190610602565b505b505b63ffffffff16600055505050565b6001546001600160a01b031633146104715760405162461bcd60e51b81526004016100d890610644565b6001600160a01b0382166104bd5760405162461bcd60e51b8152602060048201526013602482015272048616e646c65722063616e6e6f74206265203606c1b60448201526064016100d8565b8063ffffffff16600054106105045760405162461bcd60e51b815260206004820152600d60248201526c496e76616c6964206e6f6e636560981b60448201526064016100d8565b600054610513906104186106da565b8163ffffffff16106105375760405162461bcd60e51b81526004016100d890610693565b600180546001600160a01b0319166001600160a01b03939093169290921790915563ffffffff16600055565b803563ffffffff8116811461057757600080fd5b919050565b6000806000806080858703121561059257600080fd5b843561059d81610700565b935060208501356105ad81610700565b9250604085013591506105c260608601610563565b905092959194509250565b600080604083850312156105e057600080fd5b82356105eb81610700565b91506105f960208401610563565b90509250929050565b60006020828403121561061457600080fd5b8151801515811461062457600080fd5b9392505050565b60006020828403121561063d57600080fd5b5051919050565b6020808252602f908201527f46756e6374696f6e2063616e206f6e6c792062652063616c6c6564206279207460408201526e3932b0b9bab93c903430b7323632b960891b606082015260800190565b60208082526027908201527f4e6f6e6365206d757374206e6f7420696e6372656d656e74206d6f72652074686040820152660c2dc40626068760cb1b606082015260800190565b600082198211156106fb57634e487b7160e01b600052601160045260246000fd5b500190565b6001600160a01b038116811461071557600080fd5b5056fea26469706673582212208fd2c2cf5ee90dbeb243e22b0d4d06fc77a7639fd0b018e566957f2d85776f7964736f6c63430008050033";

export class Treasury__factory extends ContractFactory {
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
    _treasuryHandler: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<Treasury> {
    return super.deploy(_treasuryHandler, overrides || {}) as Promise<Treasury>;
  }
  getDeployTransaction(
    _treasuryHandler: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_treasuryHandler, overrides || {});
  }
  attach(address: string): Treasury {
    return super.attach(address) as Treasury;
  }
  connect(signer: Signer): Treasury__factory {
    return super.connect(signer) as Treasury__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TreasuryInterface {
    return new utils.Interface(_abi) as TreasuryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Treasury {
    return new Contract(address, _abi, signerOrProvider) as Treasury;
  }
}
