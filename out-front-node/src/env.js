'use strict'
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const process = require('process');
const DEPLOYMENTS = require('../../contracts/deployments.json');

const NETWORK = process.env.NETWORK || 'ropsten';
module.exports = {
    network: NETWORK,
    worker: process.env.WORKER_ADDRESS.toLowerCase(),
    workerPrivateKey: process.env.WORKER_PRIVATE_KEY,
    siphon: DEPLOYMENTS[NETWORK].Siphon,
    defaultUser: process.env.USER_ADDRESS.toLowerCase(),
    vault: process.env.VAULT_ADDRESS.toLowerCase(),
    token: NETWORK !== 'main'
        ? DEPLOYMENTS[NETWORK].TronToken
        : process.env.MAINNET_USER_TOKEN,
    gasBonus: 1.25,
    bnKey: process.env.BLOCKNATIVE_API_KEY,
    bnUrl: process.env.BLOCKNATIVE_URL,
    providerURI: NETWORK !== 'main'
        ? process.env.TESTNET_PROVIDER
        : process.env.MAINNET_PROVIDER,
};
