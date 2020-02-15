'use strict'
const BigNumber = require('bignumber.js');
const process = require('process');
const FlexContract = require('flex-contract');
const fs = require('fs');
const path = require('path');
const SECRETS = require('../../secrets.json');

const SIPHON_ABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../build/Siphon.abi')));
const SIPHON_BYTECODE = fs.readFileSync(path.resolve(__dirname, '../build/Siphon.bin'));
const TOKEN_ABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../build/TronToken.abi')));
const TOKEN_BYTECODE = fs.readFileSync(path.resolve(__dirname, '../build/TronToken.bin'));
const DEPLOYMENTS_PATH = path.resolve(__dirname, '../deployments.json');
const DEPLOYMENTS = JSON.parse(fs.readFileSync(DEPLOYMENTS_PATH));

const TESTNET_INITIAL_TOKEN_BALANCE = new BigNumber('1337e18').toString(10);

const DEPLOYER = SECRETS.accounts.deployer;
const USER = SECRETS.accounts.user;
const NETWORK = process.env.NETWORK || 'ropsten';

(async () => {
    const addresses = {};
    console.log(`Using network ${NETWORK}`);
    const siphon = new FlexContract(SIPHON_ABI, { network: NETWORK, bytecode: `0x${SIPHON_BYTECODE}` });
    console.log('Deploying Siphon...');
    await siphon.new().send({ key: DEPLOYER.privateKey });
    console.log(`Deployed Siphon at ${siphon.address}`);
    addresses['Siphon'] = siphon.address;
    if (NETWORK !== 'main') {
        const token = new FlexContract(TOKEN_ABI, { network: NETWORK, bytecode: `0x${TOKEN_BYTECODE}` });
        console.log('Deploying TronToken...');
        await token.new().send({ key: DEPLOYER.privateKey });
        console.log(`Deployed TestToken at ${token.address}`);
        console.log(`Minting ${TESTNET_INITIAL_TOKEN_BALANCE} tokens to ${USER.address}...`);
        await token.mint(TESTNET_INITIAL_TOKEN_BALANCE).send({ key: USER.privateKey });
        addresses['TronToken'] = token.address;
    }
    DEPLOYMENTS[NETWORK] = Object.assign(DEPLOYMENTS[NETWORK] || {}, addresses);
    fs.writeFileSync(DEPLOYMENTS_PATH, JSON.stringify(DEPLOYMENTS, null, '    '));
})();
