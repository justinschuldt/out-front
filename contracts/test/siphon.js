'use strict'
const BigNumber = require('bignumber.js');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const crypto = require('crypto');
const ethjs = require('ethereumjs-util');
const FlexContract = require('flex-contract');
const fs = require('fs');
const ganache = require('ganache-core');
const _ = require('lodash');
const path = require('path');
const process = require('process');
const { promisify } = require('util');

const SIPHON_ABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../build/Siphon.abi')));
const SIPHON_BYTECODE = fs.readFileSync(path.resolve(__dirname, '../build/Siphon.bin'));
const TOKEN_ABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../build/TronToken.abi')));
const TOKEN_BYTECODE = fs.readFileSync(path.resolve(__dirname, '../build/TronToken.bin'));

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Siphon', () => {
    const CHAIN_ID = 1;
    const ACCOUNTS = _.times(8, () => ({
        balance: new BigNumber('100e18').toString(10),
        secretKey: crypto.randomBytes(32),
    })).map(acc => ({
        ...acc,
        address: ethjs.toChecksumAddress(ethjs.bufferToHex(ethjs.privateToAddress(acc.secretKey))),
    }));
    const MAX_UINT256 = new BigNumber(2).pow(256).minus(1).toString(10);
    const [SENDER, OWNER, VAULT] = ACCOUNTS.map(a => a.address);
    const INITIAL_TOKEN_BALANCE = new BigNumber('100e18').toString(10);
    let provider;
    let inst;
    let token;

    before(async () => {
        provider = ganache.provider({
            accounts: ACCOUNTS,
            network_id: CHAIN_ID,
            hardfork: 'istanbul',
        });
        inst = new FlexContract(SIPHON_ABI, {provider, bytecode: `0x${SIPHON_BYTECODE}` });
        await inst.new().send();
        console.log(`Deployed Siphon to ${inst.address}`);
        token = new FlexContract(TOKEN_ABI, {provider, bytecode: `0x${TOKEN_BYTECODE}` });
        await token.new().send();
        console.log(`Deployed token to ${token.address}`);
        await token.mint(INITIAL_TOKEN_BALANCE).send({ from: OWNER });
        await token.approve(inst.address, MAX_UINT256).send({ from: OWNER });
    });

    beforeEach(async () => {
        await promisify(provider.send)({
            method: 'evm_snapshot',
            params: [],
        });
    });

    afterEach(async () => {
        await promisify(provider.send)({
            method: 'evm_revert',
            params: ['0x1'],
        });
    });

    const TYPES = {
        EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
        ],
        SiphonPermission: [
            { name: 'owner', type: 'address' },
            { name: 'sender', type: 'address' },
            { name: 'token', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'expiration', type: 'uint64' },
            { name: 'nonce', type: 'uint256' },
            { name: 'fee', type: 'uint256' },
        ],
    };

    function createDomain() {
        return {
            name: 'Siphon',
            version: '1.0.0',
            chainId: CHAIN_ID,
            verifyingContract: inst.address,
        };
    }

    function createPermission(fields = {}) {
        return {
            owner: OWNER,
            sender: SENDER,
            token: token.address,
            to: VAULT,
            expiration: Math.floor(Date.now() / 1000 + 60 * 60),
            nonce: new BigNumber(ethjs.bufferToHex(crypto.randomBytes(32))).toString(10),
            fee: new BigNumber(0.01e18).toString(10),
            ...fields,
        };
    }

    async function signPermission(perm) {
        const payload = {
            types: TYPES,
            domain: createDomain(),
            primaryType: 'SiphonPermission',
            message: perm,
        };
        const { result } = await promisify(provider.send)({
            method: 'eth_signTypedData',
            params: [OWNER, payload],
            from: OWNER,
        });
        return result;
    }

    it('owner has tokens', async () => {
        const balance = await token.balanceOf(OWNER).call();
        expect(balance).to.not.eq('0');
    });

    describe('isValidSignature()', () => {
        it('validates an EIP712 signature', async () => {
            const permission = createPermission();
            const signature = await signPermission(permission);
            const r = await inst.isValidSignature(permission, signature).call();
            expect(r).to.be.true;
        });

        it('invalidates an invalid EIP712 signature', async () => {
            const permission1 = createPermission();
            const permission2 = createPermission();
            const signature = await signPermission(permission1);
            const r = await inst.isValidSignature(permission2, signature).call();
            expect(r).to.be.false;
        });
    });

    describe('siphon()', () => {
        it('can drain all tokens with no fee', async () => {
            const permission = createPermission({
                fee: '0',
            });
            const signature = await signPermission(permission);
            const receipt = await inst.siphon(permission, signature).send({ from: SENDER });
            const transferEvents = receipt.findEvents('Transfer');
            expect(transferEvents).to.be.length(1);
            expect(transferEvents[0].args.from).to.eq(OWNER);
            expect(transferEvents[0].args.to).to.eq(VAULT);
            expect(transferEvents[0].args.amount).to.eq(INITIAL_TOKEN_BALANCE);
            expect(await token.balanceOf(OWNER).call()).to.eq('0');
            expect(await token.balanceOf(VAULT).call()).to.eq(INITIAL_TOKEN_BALANCE);
            expect(await token.balanceOf(SENDER).call()).to.eq('0');
        });

        it('can drain all tokens with a fee', async () => {
            const permission = createPermission();
            const signature = await signPermission(permission);
            const receipt = await inst.siphon(permission, signature).send({ from: SENDER });
            const transferEvents = receipt.findEvents('Transfer');
            const expectedVaultBalance =
                new BigNumber(INITIAL_TOKEN_BALANCE).minus(permission.fee).toString(10);
            expect(transferEvents).to.be.length(2);
            expect(transferEvents[0].args.from).to.eq(OWNER);
            expect(transferEvents[0].args.to).to.eq(SENDER);
            expect(transferEvents[0].args.amount).to.eq(permission.fee);
            expect(transferEvents[1].args.from).to.eq(OWNER);
            expect(transferEvents[1].args.to).to.eq(VAULT);
            expect(transferEvents[1].args.amount).to.eq(expectedVaultBalance);
            expect(await token.balanceOf(OWNER).call()).to.eq('0');
            expect(await token.balanceOf(VAULT).call()).to.eq(expectedVaultBalance);
            expect(await token.balanceOf(SENDER).call()).to.eq(permission.fee);
        });

        it('cannot execute an expired permission', async () => {
            const permission = createPermission({
                expiration: Math.floor(Date.now() / 1000 - 1),
            });
            const signature = await signPermission(permission);
            const tx = inst.siphon(permission, signature).send({ from: SENDER });
            return expect(tx).to.be.rejectedWith('Siphon/EXPIRED');
        });

        it('cannot execute from the wrong sender', async () => {
            const permission = createPermission();
            const signature = await signPermission(permission);
            const tx = inst.siphon(permission, signature).send({ from: VAULT });
            return expect(tx).to.be.rejectedWith('Siphon/INVALID_SENDER');
        });

        it('cannot execute with invalid signature', async () => {
            const permission = createPermission();
            const signature = await signPermission(createPermission());
            const tx = inst.siphon(permission, signature).send({ from: SENDER });
            return expect(tx).to.be.rejectedWith('Siphon/INVALID_SIGNATURE');
        });

        it('cannot execute when already executed', async () => {
            const permission = createPermission();
            const signature = await signPermission(permission);
            await inst.siphon(permission, signature).send({ from: SENDER });
            const tx = inst.siphon(permission, signature).send({ from: SENDER });
            return expect(tx).to.be.rejectedWith('Siphon/ALREADY_EXECUTED');
        });
    });
});

process.on('unhandledRejection', () => {});
