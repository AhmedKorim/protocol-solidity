/**
 * Copyright 2021-2022 Webb Technologies
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
const assert = require('assert');
const path = require('path');
import { ethers } from 'hardhat';
const hre = require('hardhat');
const TruffleAssert = require('truffle-assertions');

import { SignatureBridgeSide } from '@webb-tools/bridges';
import { VAnchor, AnchorHandler, PoseidonHasher } from '@webb-tools/anchors';
import { Verifier } from '@webb-tools/vbridge';
import {
  MintableToken,
  Treasury,
  TreasuryHandler,
  FungibleTokenWrapper,
  TokenWrapperHandler,
} from '@webb-tools/tokens';
import { fetchComponentsFromFilePaths, getChainIdType, ZkComponents } from '@webb-tools/utils';
import { BigNumber } from 'ethers';
import { HARDHAT_PK_1 } from '../../hardhatAccounts.js';
import { CircomUtxo, Keypair } from '@webb-tools/sdk-core';

describe('SignatureBridgeSide use', () => {
  let zkComponents2_2: ZkComponents;
  let zkComponents16_2: ZkComponents;
  let admin = new ethers.Wallet(HARDHAT_PK_1, ethers.provider);
  let bridgeSide: SignatureBridgeSide;
  let maxEdges = 1;
  const zeroAddress = '0x0000000000000000000000000000000000000000';
  const chainID1 = getChainIdType(31337);

  before(async () => {
    zkComponents2_2 = await fetchComponentsFromFilePaths(
      path.resolve(
        __dirname,
        '../../solidity-fixtures/solidity-fixtures/vanchor_2/2/poseidon_vanchor_2_2.wasm'
      ),
      path.resolve(
        __dirname,
        '../../solidity-fixtures/solidity-fixtures/vanchor_2/2/witness_calculator.cjs'
      ),
      path.resolve(
        __dirname,
        '../../solidity-fixtures/solidity-fixtures/vanchor_2/2/circuit_final.zkey'
      )
    );

    zkComponents16_2 = await fetchComponentsFromFilePaths(
      path.resolve(
        __dirname,
        '../../solidity-fixtures/solidity-fixtures/vanchor_16/2/poseidon_vanchor_16_2.wasm'
      ),
      path.resolve(
        __dirname,
        '../../solidity-fixtures/solidity-fixtures/vanchor_16/2/witness_calculator.cjs'
      ),
      path.resolve(
        __dirname,
        '../../solidity-fixtures/solidity-fixtures/vanchor_16/2/circuit_final.zkey'
      )
    );
  });

  beforeEach(async () => {
    bridgeSide = await SignatureBridgeSide.createBridgeSide(admin);
  });

  it('should set resource with signature', async () => {
    // Create the Hasher and Verifier for the chain
    const hasherInstance = await PoseidonHasher.createPoseidonHasher(admin);
    const verifier = await Verifier.createVerifier(admin);
    const tokenInstance = await MintableToken.createToken('testToken', 'TEST', admin);
    await tokenInstance.mintTokens(admin.address, '100000000000000000000000');

    const anchorHandler = await AnchorHandler.createAnchorHandler(
      bridgeSide.contract.address,
      [],
      [],
      admin
    );
    const anchor = await VAnchor.createVAnchor(
      verifier.contract.address,
      30,
      hasherInstance.contract.address,
      anchorHandler.contract.address,
      tokenInstance.contract.address,
      maxEdges,
      zkComponents2_2,
      zkComponents16_2,
      admin
    );
    await tokenInstance.approveSpending(anchor.contract.address, BigNumber.from(1e7));
    bridgeSide.setAnchorHandler(anchorHandler);
    // Function call below sets resource with signature
    await bridgeSide.connectAnchorWithSignature(anchor);
    //Check that proposal nonce is updated on anchor contract since handler prposal has been executed
    assert.strictEqual((await bridgeSide.contract.proposalNonce()).toNumber(), 1);
  });

  it('execute anchor proposal', async () => {
    // Create the Hasher and Verifier for the chain
    const hasherInstance = await PoseidonHasher.createPoseidonHasher(admin);

    const verifier = await Verifier.createVerifier(admin);

    const tokenInstance = await MintableToken.createToken('testToken', 'TEST', admin);
    await tokenInstance.mintTokens(admin.address, '100000000000000000000000');

    const anchorHandler = await AnchorHandler.createAnchorHandler(
      bridgeSide.contract.address,
      [],
      [],
      admin
    );

    const srcAnchor = await VAnchor.createVAnchor(
      verifier.contract.address,
      30,
      hasherInstance.contract.address,
      anchorHandler.contract.address,
      tokenInstance.contract.address,
      maxEdges,
      zkComponents2_2,
      zkComponents16_2,
      admin
    );

    await tokenInstance.approveSpending(srcAnchor.contract.address, BigNumber.from(1e7));

    bridgeSide.setAnchorHandler(anchorHandler);
    const res = await bridgeSide.connectAnchorWithSignature(srcAnchor);

    await bridgeSide.executeMinWithdrawalLimitProposalWithSig(
      srcAnchor,
      BigNumber.from(0).toString()
    );
    await bridgeSide.executeMaxDepositLimitProposalWithSig(
      srcAnchor,
      BigNumber.from(1e8).toString()
    );

    // Define inputs/outputs for transact function
    const depositUtxo = await CircomUtxo.generateUtxo({
      curve: 'Bn254',
      backend: 'Circom',
      amount: BigNumber.from(1e7).toString(),
      originChainId: chainID1.toString(),
      chainId: chainID1.toString(),
      keypair: new Keypair(),
    });
    // Transact on the bridge
    await srcAnchor.transact([], [depositUtxo], '0', '0', zeroAddress, zeroAddress, '', {
      [chainID1.toString()]: [],
    });
  });

  it('execute fee proposal', async () => {
    //Deploy TokenWrapperHandler
    const tokenWrapperHandler = await TokenWrapperHandler.createTokenWrapperHandler(
      bridgeSide.contract.address,
      [],
      [],
      admin
    );

    // Create Treasury and TreasuryHandler
    const treasuryHandler = await TreasuryHandler.createTreasuryHandler(
      bridgeSide.contract.address,
      [],
      [],
      admin
    );
    const treasury = await Treasury.createTreasury(treasuryHandler.contract.address, admin);

    // Create a FungibleTokenWrapper
    const fungibleToken = await FungibleTokenWrapper.createFungibleTokenWrapper(
      `webbETH-test-1`,
      `webbETH-test-1`,
      0,
      treasury.contract.address,
      tokenWrapperHandler.contract.address,
      '10000000000000000000000000',
      false,
      admin
    );

    // Set bridgeSide handler to tokenWrapperHandler
    bridgeSide.setTokenWrapperHandler(tokenWrapperHandler);
    // Connect resourceID of FungibleTokenWrapper with TokenWrapperHandler
    await bridgeSide.setFungibleTokenResourceWithSignature(fungibleToken);
    // Execute change fee proposal
    await bridgeSide.executeFeeProposalWithSig(fungibleToken, 5);
    // Check that fee actually changed
    assert.strictEqual((await fungibleToken.contract.getFee()).toString(), '5');
  });

  it('execute cannot set fee > 10000', async () => {
    // Deploy TokenWrapperHandler
    const tokenWrapperHandler = await TokenWrapperHandler.createTokenWrapperHandler(
      bridgeSide.contract.address,
      [],
      [],
      admin
    );

    // Create Treasury and TreasuryHandler
    const treasuryHandler = await TreasuryHandler.createTreasuryHandler(
      bridgeSide.contract.address,
      [],
      [],
      admin
    );
    const treasury = await Treasury.createTreasury(
      treasuryHandler.contract.address,
      bridgeSide.admin
    );

    // Create a FungibleTokenWrapper
    const fungibleToken = await FungibleTokenWrapper.createFungibleTokenWrapper(
      `webbETH-test-1`,
      `webbETH-test-1`,
      0,
      treasury.contract.address,
      tokenWrapperHandler.contract.address,
      '10000000000000000000000000',
      false,
      admin
    );

    // Set bridgeSide handler to tokenWrapperHandler
    bridgeSide.setTokenWrapperHandler(tokenWrapperHandler);

    // Connect resourceID of FungibleTokenWrapper with TokenWrapperHandler
    await bridgeSide.setFungibleTokenResourceWithSignature(fungibleToken);

    // Execute change fee proposal
    await TruffleAssert.reverts(
      bridgeSide.executeFeeProposalWithSig(fungibleToken, 10001),
      'FungibleTokenWrapper: Invalid fee percentage'
    );
  });

  it('execute add token proposal', async () => {
    // Deploy TokenWrapperHandler
    const tokenWrapperHandler = await TokenWrapperHandler.createTokenWrapperHandler(
      bridgeSide.contract.address,
      [],
      [],
      admin
    );

    // Create Treasury and TreasuryHandler
    const treasuryHandler = await TreasuryHandler.createTreasuryHandler(
      bridgeSide.contract.address,
      [],
      [],
      bridgeSide.admin
    );
    const treasury = await Treasury.createTreasury(
      treasuryHandler.contract.address,
      bridgeSide.admin
    );

    // Create a FungibleTokenWrapper
    const fungibleToken = await FungibleTokenWrapper.createFungibleTokenWrapper(
      `webbETH-test-1`,
      `webbETH-test-1`,
      0,
      treasury.contract.address,
      tokenWrapperHandler.contract.address,
      '10000000000000000000000000',
      false,
      admin
    );

    // Set bridgeSide handler to tokenWrapperHandler
    bridgeSide.setTokenWrapperHandler(tokenWrapperHandler);

    // Connect resourceID of FungibleTokenWrapper with TokenWrapperHandler
    await bridgeSide.setFungibleTokenResourceWithSignature(fungibleToken);

    // Create an ERC20 Token
    const tokenInstance = await MintableToken.createToken('testToken', 'TEST', admin);
    await tokenInstance.mintTokens(admin.address, '100000000000000000000000');

    // Execute Proposal to add that token to the fungibleToken
    await bridgeSide.executeAddTokenProposalWithSig(fungibleToken, tokenInstance.contract.address);

    // Check that fungibleToken contains the added token
    assert((await fungibleToken.contract.getTokens()).includes(tokenInstance.contract.address));
  });

  it('execute remove token proposal', async () => {
    // Deploy TokenWrapperHandler
    const tokenWrapperHandler = await TokenWrapperHandler.createTokenWrapperHandler(
      bridgeSide.contract.address,
      [],
      [],
      admin
    );

    // Create Treasury and TreasuryHandler
    const treasuryHandler = await TreasuryHandler.createTreasuryHandler(
      bridgeSide.contract.address,
      [],
      [],
      bridgeSide.admin
    );
    const treasury = await Treasury.createTreasury(
      treasuryHandler.contract.address,
      bridgeSide.admin
    );

    // Create a FungibleTokenWrapper
    const fungibleToken = await FungibleTokenWrapper.createFungibleTokenWrapper(
      `webbETH-test-1`,
      `webbETH-test-1`,
      0,
      treasury.contract.address,
      tokenWrapperHandler.contract.address,
      '10000000000000000000000000',
      false,
      admin
    );

    // Set bridgeSide handler to tokenWrapperHandler
    bridgeSide.setTokenWrapperHandler(tokenWrapperHandler);

    // Connect resourceID of FungibleTokenWrapper with TokenWrapperHandler
    await bridgeSide.setFungibleTokenResourceWithSignature(fungibleToken);

    // Add a Token---------

    // Create an ERC20 Token
    const tokenInstance = await MintableToken.createToken('testToken', 'TEST', admin);
    await tokenInstance.mintTokens(admin.address, '100000000000000000000000');

    // Execute Proposal to add that token to the fungibleToken
    await bridgeSide.executeAddTokenProposalWithSig(fungibleToken, tokenInstance.contract.address);

    // Check that fungibleToken contains the added token
    assert((await fungibleToken.contract.getTokens()).includes(tokenInstance.contract.address));
    // End Add a Token--------

    // Remove a Token
    await bridgeSide.executeRemoveTokenProposalWithSig(
      fungibleToken,
      tokenInstance.contract.address
    );

    assert((await fungibleToken.contract.getTokens()).length === 0);
  });

  it('check nonce is increasing across multiple proposals', async () => {
    // Deploy TokenWrapperHandler
    const tokenWrapperHandler = await TokenWrapperHandler.createTokenWrapperHandler(
      bridgeSide.contract.address,
      [],
      [],
      admin
    );

    // Create Treasury and TreasuryHandler
    const treasuryHandler = await TreasuryHandler.createTreasuryHandler(
      bridgeSide.contract.address,
      [],
      [],
      bridgeSide.admin
    );
    const treasury = await Treasury.createTreasury(
      treasuryHandler.contract.address,
      bridgeSide.admin
    );

    // Create a FungibleTokenWrapper
    const fungibleToken = await FungibleTokenWrapper.createFungibleTokenWrapper(
      `webbETH-test-1`,
      `webbETH-test-1`,
      0,
      treasury.contract.address,
      tokenWrapperHandler.contract.address,
      '10000000000000000000000000',
      false,
      admin
    );

    // Set bridgeSide handler to tokenWrapperHandler
    bridgeSide.setTokenWrapperHandler(tokenWrapperHandler);

    // Connect resourceID of FungibleTokenWrapper with TokenWrapperHandler
    await bridgeSide.setFungibleTokenResourceWithSignature(fungibleToken);

    // Execute change fee proposal
    await bridgeSide.executeFeeProposalWithSig(fungibleToken, 5);

    // Check that fee actually changed
    assert.strictEqual((await fungibleToken.contract.getFee()).toString(), '5');
    assert.strictEqual((await fungibleToken.contract.proposalNonce()).toString(), '1');

    // Create an ERC20 Token
    const tokenInstance = await MintableToken.createToken('testToken', 'TEST', admin);
    await tokenInstance.mintTokens(admin.address, '100000000000000000000000');

    // Execute Proposal to add that token to the fungibleToken
    await bridgeSide.executeAddTokenProposalWithSig(fungibleToken, tokenInstance.contract.address);

    // Check that fungibleToken contains the added token
    assert((await fungibleToken.contract.getTokens()).includes(tokenInstance.contract.address));
    // End Add a Token--------
    assert.strictEqual((await fungibleToken.contract.proposalNonce()).toString(), '2');

    // Remove a Token
    await bridgeSide.executeRemoveTokenProposalWithSig(
      fungibleToken,
      tokenInstance.contract.address
    );

    assert((await fungibleToken.contract.getTokens()).length === 0);
    assert.strictEqual((await fungibleToken.contract.proposalNonce()).toString(), '3');
  });

  it('bridge nonce should update upon setting resource with sig', async () => {
    // Create the Hasher and Verifier for the chain
    const hasherInstance = await PoseidonHasher.createPoseidonHasher(admin);

    const verifier = await Verifier.createVerifier(admin);

    const tokenInstance = await MintableToken.createToken('testToken', 'TEST', admin);
    await tokenInstance.mintTokens(admin.address, '100000000000000000000000');

    const anchorHandler = await AnchorHandler.createAnchorHandler(
      bridgeSide.contract.address,
      [],
      [],
      admin
    );

    const anchor = await VAnchor.createVAnchor(
      verifier.contract.address,
      30,
      hasherInstance.contract.address,
      anchorHandler.contract.address,
      tokenInstance.contract.address,
      maxEdges,
      zkComponents2_2,
      zkComponents16_2,
      admin
    );

    await tokenInstance.approveSpending(anchor.contract.address, BigNumber.from(1e7));

    await bridgeSide.setAnchorHandler(anchorHandler);
    // Function call below sets resource with signature
    await bridgeSide.connectAnchorWithSignature(anchor);
    // Check that proposal nonce is updated on anchor contract since handler prposal has been executed
    assert.strictEqual((await bridgeSide.contract.proposalNonce()).toString(), '1');

    await bridgeSide.connectAnchorWithSignature(anchor);
    assert.strictEqual((await bridgeSide.contract.proposalNonce()).toString(), '2');

    await bridgeSide.connectAnchorWithSignature(anchor);
    assert.strictEqual((await bridgeSide.contract.proposalNonce()).toString(), '3');

    await bridgeSide.connectAnchorWithSignature(anchor);
    assert.strictEqual((await bridgeSide.contract.proposalNonce()).toString(), '4');

    await bridgeSide.connectAnchorWithSignature(anchor);
    assert.strictEqual((await bridgeSide.contract.proposalNonce()).toString(), '5');
  });
});

describe('Rescue Tokens Tests for ERC20 Tokens', () => {
  let zkComponents2_2: ZkComponents;
  let zkComponents16_2: ZkComponents;
  let srcAnchor: VAnchor;
  let anchorHandler: AnchorHandler;
  let erc20TokenInstance: MintableToken;
  let admin = new ethers.Wallet(HARDHAT_PK_1, ethers.provider);
  let bridgeSide: SignatureBridgeSide;
  let wrappingFee: number;
  let signers;
  let fungibleToken: FungibleTokenWrapper;
  let treasuryHandler: TreasuryHandler;
  let treasury;
  const zeroAddress = '0x0000000000000000000000000000000000000000';
  const chainID1 = getChainIdType(31337);
  let maxEdges = 1;

  before(async () => {
    zkComponents2_2 = await fetchComponentsFromFilePaths(
      path.resolve(
        __dirname,
        '../../solidity-fixtures/solidity-fixtures/vanchor_2/2/poseidon_vanchor_2_2.wasm'
      ),
      path.resolve(
        __dirname,
        '../../solidity-fixtures/solidity-fixtures/vanchor_2/2/witness_calculator.cjs'
      ),
      path.resolve(
        __dirname,
        '../../solidity-fixtures/solidity-fixtures/vanchor_2/2/circuit_final.zkey'
      )
    );

    zkComponents16_2 = await fetchComponentsFromFilePaths(
      path.resolve(
        __dirname,
        '../../solidity-fixtures/solidity-fixtures/vanchor_16/2/poseidon_vanchor_16_2.wasm'
      ),
      path.resolve(
        __dirname,
        '../../solidity-fixtures/solidity-fixtures/vanchor_16/2/witness_calculator.cjs'
      ),
      path.resolve(
        __dirname,
        '../../solidity-fixtures/solidity-fixtures/vanchor_16/2/circuit_final.zkey'
      )
    );
  });

  beforeEach(async () => {
    signers = await ethers.getSigners();
    bridgeSide = await SignatureBridgeSide.createBridgeSide(admin);

    // Create Treasury and TreasuryHandler
    treasuryHandler = await TreasuryHandler.createTreasuryHandler(
      bridgeSide.contract.address,
      [],
      [],
      admin
    );
    treasury = await Treasury.createTreasury(treasuryHandler.contract.address, admin);
    await bridgeSide.setTreasuryHandler(treasuryHandler);
    await bridgeSide.setTreasuryResourceWithSignature(treasury);

    // Deploy TokenWrapperHandler
    const tokenWrapperHandler = await TokenWrapperHandler.createTokenWrapperHandler(
      bridgeSide.contract.address,
      [],
      [],
      admin
    );

    // Create ERC20 Token
    erc20TokenInstance = await MintableToken.createToken('testToken', 'TEST', admin);
    await erc20TokenInstance.mintTokens(admin.address, '100000000000000000000000');

    // Create a FungibleTokenWrapper
    fungibleToken = await FungibleTokenWrapper.createFungibleTokenWrapper(
      `webbETH-test-1`,
      `webbETH-test-1`,
      0,
      zeroAddress,
      tokenWrapperHandler.contract.address,
      '10000000000000000000000000',
      true,
      admin
    );

    // Set bridgeSide handler to tokenWrapperHandler
    bridgeSide.setTokenWrapperHandler(tokenWrapperHandler);

    // Connect resourceID of FungibleTokenWrapper with TokenWrapperHandler
    await bridgeSide.setFungibleTokenResourceWithSignature(fungibleToken);

    wrappingFee = 10;
    // Execute change fee proposal
    await bridgeSide.executeFeeProposalWithSig(fungibleToken, wrappingFee);

    // Check that fee actually changed
    assert.strictEqual((await fungibleToken.contract.getFee()).toString(), '10');
    assert.strictEqual((await fungibleToken.contract.proposalNonce()).toString(), '1');

    // Execute Proposal to add that token to the fungibleToken
    await bridgeSide.executeAddTokenProposalWithSig(
      fungibleToken,
      erc20TokenInstance.contract.address
    );

    // Check that fungibleToken contains the added token
    assert(
      (await fungibleToken.contract.getTokens()).includes(erc20TokenInstance.contract.address)
    );

    assert.strictEqual((await fungibleToken.contract.proposalNonce()).toString(), '2');

    // Create an anchor whose token is the fungibleToken
    // Wrap and Deposit ERC20 liquidity into that anchor

    // Create the Hasher and Verifier for the chain
    const hasherInstance = await PoseidonHasher.createPoseidonHasher(admin);

    const verifier = await Verifier.createVerifier(admin);

    anchorHandler = await AnchorHandler.createAnchorHandler(
      bridgeSide.contract.address,
      [],
      [],
      admin
    );

    let depositAmount = 1e7;
    srcAnchor = await VAnchor.createVAnchor(
      verifier.contract.address,
      30,
      hasherInstance.contract.address,
      anchorHandler.contract.address,
      fungibleToken.contract.address,
      maxEdges,
      zkComponents2_2,
      zkComponents16_2,
      admin
    );

    await fungibleToken.grantMinterRole(srcAnchor.contract.address);
    let amountToWrap = await fungibleToken.contract.getAmountToWrap(BigNumber.from(1e7));
    await erc20TokenInstance.approveSpending(fungibleToken.contract.address, amountToWrap);
    bridgeSide.setAnchorHandler(anchorHandler);
    const res = await bridgeSide.connectAnchorWithSignature(srcAnchor);
    await bridgeSide.executeMinWithdrawalLimitProposalWithSig(
      srcAnchor,
      BigNumber.from(0).toString()
    );
    await bridgeSide.executeMaxDepositLimitProposalWithSig(
      srcAnchor,
      BigNumber.from(1e8).toString()
    );

    // Define inputs/outputs for transact function
    const depositUtxo = await CircomUtxo.generateUtxo({
      curve: 'Bn254',
      backend: 'Circom',
      amount: depositAmount.toString(),
      originChainId: chainID1.toString(),
      chainId: chainID1.toString(),
      keypair: new Keypair(),
    });

    await TruffleAssert.reverts(
      srcAnchor.transact(
        [],
        [depositUtxo],
        '0',
        '0',
        zeroAddress,
        zeroAddress,
        erc20TokenInstance.contract.address,
        {}
      ),
      'Fee Recipient cannot be zero address'
    );

    // Change Fee Recipient to treasury Address
    await bridgeSide.executeFeeRecipientProposalWithSig(fungibleToken, treasury.contract.address);

    // For ERC20 Tests
    await srcAnchor.transact(
      [],
      [depositUtxo],
      '0',
      '0',
      zeroAddress,
      zeroAddress,
      erc20TokenInstance.contract.address,
      {}
    );

    // Anchor Denomination amount should go to TokenWrapper
    assert.strictEqual(
      (await erc20TokenInstance.getBalance(fungibleToken.contract.address)).toString(),
      depositAmount.toString()
    );

    // The wrapping fee should be transferred to the treasury
    assert.strictEqual(
      (await erc20TokenInstance.getBalance(treasury.contract.address)).toString(),
      parseInt((depositAmount * (wrappingFee / (10000 - wrappingFee))).toString()).toString()
    );

    assert.strictEqual(
      (await fungibleToken.contract.balanceOf(srcAnchor.contract.address)).toString(),
      depositAmount.toString()
    );
  });

  it('should rescue tokens', async () => {
    let balTreasuryBeforeRescue = await erc20TokenInstance.getBalance(treasury.contract.address);
    let to = signers[2].address;
    let balToBeforeRescue = await erc20TokenInstance.getBalance(to);

    await bridgeSide.executeRescueTokensProposalWithSig(
      treasury,
      erc20TokenInstance.contract.address,
      to,
      BigNumber.from('500')
    );

    let balTreasuryAfterRescue = await erc20TokenInstance.getBalance(treasury.contract.address);
    let balToAfterRescue = await erc20TokenInstance.getBalance(to);

    assert.strictEqual(balTreasuryBeforeRescue.sub(balTreasuryAfterRescue).toString(), '500');

    assert.strictEqual(balToAfterRescue.sub(balToBeforeRescue).toString(), '500');

    assert.strictEqual((await treasury.contract.proposalNonce()).toString(), '1');
  });

  it('should rescue all tokens when amount to rescue is larger than treasury balance', async () => {
    let balTreasuryBeforeRescue = await erc20TokenInstance.getBalance(treasury.contract.address);
    let to = signers[2].address;
    let balToBeforeRescue = await erc20TokenInstance.getBalance(to);

    await bridgeSide.executeRescueTokensProposalWithSig(
      treasury,
      erc20TokenInstance.contract.address,
      to,
      BigNumber.from('500000000000000000000000')
    );

    let balTreasuryAfterRescue = await erc20TokenInstance.getBalance(treasury.contract.address);
    let balToAfterRescue = await erc20TokenInstance.getBalance(to);

    // balTreasuryAfterRescue = 0
    assert.strictEqual(
      balTreasuryBeforeRescue.sub(balTreasuryAfterRescue).toString(),
      balTreasuryBeforeRescue.toString()
    );

    // Should be balTreasuryBeforeRescue, since all tokens are transferred to the to address
    assert.strictEqual(
      balToAfterRescue.sub(balToBeforeRescue).toString(),
      balTreasuryBeforeRescue.toString()
    );

    assert.strictEqual((await treasury.contract.proposalNonce()).toString(), '1');
  });
});

describe('Rescue Tokens Tests for Native ETH', () => {
  let zkComponents2_2: ZkComponents;
  let zkComponents16_2: ZkComponents;
  let srcAnchor: VAnchor;
  let anchorHandler: AnchorHandler;
  let admin = new ethers.Wallet(HARDHAT_PK_1, ethers.provider);
  let bridgeSide: SignatureBridgeSide;
  let wrappingFee: number;
  let signers;
  let fungibleToken: FungibleTokenWrapper;
  let treasury;
  let treasuryHandler;
  const zeroAddress = '0x0000000000000000000000000000000000000000';
  const chainID1 = getChainIdType(31337);
  let maxEdges = 1;

  before(async () => {
    zkComponents2_2 = await fetchComponentsFromFilePaths(
      path.resolve(
        __dirname,
        '../../solidity-fixtures/solidity-fixtures/vanchor_2/2/poseidon_vanchor_2_2.wasm'
      ),
      path.resolve(
        __dirname,
        '../../solidity-fixtures/solidity-fixtures/vanchor_2/2/witness_calculator.cjs'
      ),
      path.resolve(
        __dirname,
        '../../solidity-fixtures/solidity-fixtures/vanchor_2/2/circuit_final.zkey'
      )
    );

    zkComponents16_2 = await fetchComponentsFromFilePaths(
      path.resolve(
        __dirname,
        '../../solidity-fixtures/solidity-fixtures/vanchor_16/2/poseidon_vanchor_16_2.wasm'
      ),
      path.resolve(
        __dirname,
        '../../solidity-fixtures/solidity-fixtures/vanchor_16/2/witness_calculator.cjs'
      ),
      path.resolve(
        __dirname,
        '../../solidity-fixtures/solidity-fixtures/vanchor_16/2/circuit_final.zkey'
      )
    );
  });

  beforeEach(async () => {
    signers = await ethers.getSigners();
    bridgeSide = await SignatureBridgeSide.createBridgeSide(admin);

    // Deploy TokenWrapperHandler
    const tokenWrapperHandler = await TokenWrapperHandler.createTokenWrapperHandler(
      bridgeSide.contract.address,
      [],
      [],
      admin
    );

    // Create Treasury and TreasuryHandler
    treasuryHandler = await TreasuryHandler.createTreasuryHandler(
      bridgeSide.contract.address,
      [],
      [],
      admin
    );
    treasury = await Treasury.createTreasury(treasuryHandler.contract.address, admin);
    await bridgeSide.setTreasuryHandler(treasuryHandler);
    await bridgeSide.setTreasuryResourceWithSignature(treasury);

    // Create a FungibleTokenWrapper
    fungibleToken = await FungibleTokenWrapper.createFungibleTokenWrapper(
      `webbETH-test-1`,
      `webbETH-test-1`,
      0,
      zeroAddress,
      tokenWrapperHandler.contract.address,
      '10000000000000000000000000',
      true,
      admin
    );

    // Set bridgeSide handler to tokenWrapperHandler
    bridgeSide.setTokenWrapperHandler(tokenWrapperHandler);

    // Connect resourceID of FungibleTokenWrapper with TokenWrapperHandler
    await bridgeSide.setFungibleTokenResourceWithSignature(fungibleToken);

    wrappingFee = 10;
    // Execute change fee proposal
    await bridgeSide.executeFeeProposalWithSig(fungibleToken, wrappingFee);

    // Check that fee actually changed
    assert.strictEqual((await fungibleToken.contract.getFee()).toString(), '10');

    // Create an anchor whose token is the fungibleToken
    // Wrap and Deposit ERC20 liquidity into that anchor

    // Create the Hasher and Verifier for the chain
    const hasherInstance = await PoseidonHasher.createPoseidonHasher(admin);

    const verifier = await Verifier.createVerifier(admin);

    anchorHandler = await AnchorHandler.createAnchorHandler(
      bridgeSide.contract.address,
      [],
      [],
      admin
    );

    let depositAmount = 1e7;
    srcAnchor = await VAnchor.createVAnchor(
      verifier.contract.address,
      30,
      hasherInstance.contract.address,
      anchorHandler.contract.address,
      fungibleToken.contract.address,
      maxEdges,
      zkComponents2_2,
      zkComponents16_2,
      admin
    );

    await fungibleToken.grantMinterRole(srcAnchor.contract.address);
    bridgeSide.setAnchorHandler(anchorHandler);
    const res = await bridgeSide.connectAnchorWithSignature(srcAnchor);
    await bridgeSide.executeMinWithdrawalLimitProposalWithSig(
      srcAnchor,
      BigNumber.from(0).toString()
    );
    await bridgeSide.executeMaxDepositLimitProposalWithSig(
      srcAnchor,
      BigNumber.from(1e8).toString()
    );

    // Define inputs/outputs for transact function
    const depositUtxo = await CircomUtxo.generateUtxo({
      curve: 'Bn254',
      backend: 'Circom',
      amount: depositAmount.toString(),
      originChainId: chainID1.toString(),
      chainId: chainID1.toString(),
      keypair: new Keypair(),
    });

    await TruffleAssert.reverts(
      srcAnchor.transact([], [depositUtxo], '0', '0', zeroAddress, zeroAddress, zeroAddress, {
        [chainID1.toString()]: [],
      }),
      'Fee Recipient cannot be zero address'
    );

    // Change Fee Recipient to treasury Address
    await bridgeSide.executeFeeRecipientProposalWithSig(fungibleToken, treasury.contract.address);

    // For Native ETH Tests
    await srcAnchor.transact([], [depositUtxo], '0', '0', zeroAddress, zeroAddress, zeroAddress, {
      [chainID1.toString()]: [],
    });

    // Anchor Denomination amount should go to TokenWrapper
    assert.strictEqual(
      (await ethers.provider.getBalance(fungibleToken.contract.address)).toString(),
      depositAmount.toString()
    );

    // The wrapping fee should be transferred to the treasury
    assert.strictEqual(
      (await ethers.provider.getBalance(treasury.contract.address)).toString(),
      parseInt((depositAmount * (wrappingFee / (10000 - wrappingFee))).toString()).toString()
    );

    assert.strictEqual(
      (await fungibleToken.contract.balanceOf(srcAnchor.contract.address)).toString(),
      depositAmount.toString()
    );
  });

  it('should rescue native eth', async () => {
    let balTreasuryBeforeRescue = await ethers.provider.getBalance(treasury.contract.address);
    let to = signers[2].address;
    let balToBeforeRescue = await ethers.provider.getBalance(to);

    await bridgeSide.executeRescueTokensProposalWithSig(
      treasury,
      zeroAddress,
      to,
      BigNumber.from('500')
    );

    let balTreasuryAfterRescue = await ethers.provider.getBalance(treasury.contract.address);
    let balToAfterRescue = await ethers.provider.getBalance(to);

    assert.strictEqual(balTreasuryBeforeRescue.sub(balTreasuryAfterRescue).toString(), '500');

    assert.strictEqual(balToAfterRescue.sub(balToBeforeRescue).toString(), '500');

    assert.strictEqual((await treasury.contract.proposalNonce()).toString(), '1');
  });

  it('should rescue all native eth when amountToRescue greater than treasury balance', async () => {
    let balTreasuryBeforeRescue = await ethers.provider.getBalance(treasury.contract.address);
    let to = signers[2].address;
    let balToBeforeRescue = await ethers.provider.getBalance(to);

    await bridgeSide.executeRescueTokensProposalWithSig(
      treasury,
      zeroAddress,
      to,
      BigNumber.from('500000000000000')
    );

    let balTreasuryAfterRescue = await ethers.provider.getBalance(treasury.contract.address);
    let balToAfterRescue = await ethers.provider.getBalance(to);

    // balTreasuryAfterRescue = 0
    assert.strictEqual(
      balTreasuryBeforeRescue.sub(balTreasuryAfterRescue).toString(),
      balTreasuryBeforeRescue.toString()
    );

    // Should be balTreasuryBeforeRescue, since all tokens are transferred to the to address
    assert.strictEqual(
      balToAfterRescue.sub(balToBeforeRescue).toString(),
      balTreasuryBeforeRescue.toString()
    );

    assert.strictEqual((await treasury.contract.proposalNonce()).toString(), '1');
  });
});
