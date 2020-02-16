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
const DEPLOYMENTS = require('../deployments.json');
const SECRETS = require('../../secrets.json');

const CHANGER_ABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../build/TestBalanceChanger.abi')));
const WRAPPER_ABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../build/TokenBalanceCheckCallWrapper.abi')));
const WRAPPER_BYTECODE = fs.readFileSync(path.resolve(__dirname, '../build/TokenBalanceCheckCallWrapper.bin-runtime'));
const TOKEN_ABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../build/TronToken.abi')));

const NETWORK = 'ropsten';
const OWNER = SECRETS.accounts.user.address;
const VAULT = SECRETS.accounts.vault.address;

chai.use(chaiAsPromised);
const expect = chai.expect;

describe.only('Live call wrapper tests', () => {
    const token = new FlexContract(
        TOKEN_ABI,
        {
            address: DEPLOYMENTS[NETWORK].TronToken,
            providerURI: 'https://gethropsten1581714218114.nodes.deploy.radar.tech/?apikey=f9cc7fc3a17b24211cc4484df6ed5e4c408fa4c3552b09f2',
        },
    );
    const changer = new FlexContract(
        CHANGER_ABI,
        {
            address: DEPLOYMENTS[NETWORK].TestBalanceChanger,
            provider: token.eth.provider,
        },
    );
    const eth = token.eth;

    function augmentCallData(callData, target, token, owner) {
        return ethjs.bufferToHex(Buffer.concat([
            ethjs.toBuffer(callData),
            ethjs.setLengthLeft(target, 32),
            ethjs.setLengthLeft(token, 32),
            ethjs.setLengthLeft(owner, 32),
        ]));
    }

    async function checkCall(target, token, owner, sender, callData) {
        const newTargetAddress = ethjs.bufferToHex(crypto.randomBytes(20));
        const targetBytecode = await eth.getCode(target);
        const augmentedCallData = augmentCallData(
            callData,
            newTargetAddress,
            token,
            owner,
        );
        const r = await eth.provider.sendPayload({
            jsonrpc: '2.0',
            id: _.random(1, 100000000),
            method: 'eth_call',
            params: [
                {
                    from: sender,
                    to: target,
                    gas: '0x7a120',
                    gasPrice: '0x3b9aca00',
                    value: '0x0',
                    data: augmentedCallData,
                },
                'latest',
                {
                    [target]: { code: `0x${WRAPPER_BYTECODE}` },
                    [newTargetAddress]: { code: targetBytecode },
                }
            ],
        });
        return r.result;
    }

    const ERROR_BYTES = Buffer.from('TokenBalanceCheckCallWrapper/FUNDS_REDUCED').toString('hex');

    it('reverts if a contract call changes token balance', async () => {
        const r = await checkCall(
            changer.address,
            token.address,
            OWNER,
            VAULT,
            await changer.change(token.address, OWNER).encode(),
        );
        expect(r.includes(ERROR_BYTES)).to.be.true;
    });

    it('does not revert if a contract call does not change token balance', async () => {
        const r = await checkCall(
            changer.address,
            token.address,
            OWNER,
            VAULT,
            await changer.noChange(token.address, OWNER).encode(),
        );
        expect(r.includes(ERROR_BYTES)).to.be.false;
    });

    it.skip('parallel benchmarks', async () => {
        await Promise.all(_.times(100, async () => {
            const r = await checkCall(
                changer.address,
                token.address,
                OWNER,
                VAULT,
                await changer.change(token.address, OWNER).encode(),
            );
            expect(r.includes(ERROR_BYTES)).to.be.true;
        }));
    })
});
