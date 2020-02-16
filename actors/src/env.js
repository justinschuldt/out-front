'use strict'
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const process = require('process');
const DEPLOYMENTS = require('../../contracts/deployments.json');

const NETWORK = process.env.NETWORK || 'ropsten';
module.exports = {
    network: NETWORK,
    victim: process.env.USER_ADDRESS.toLowerCase(),
    victimPrivateKey: process.env.USER_PRIVATE_KEY.toLowerCase(),
    vault: process.env.VAULT_ADDRESS.toLowerCase(),
    vaultPrivateKey: process.env.VAULT_PRIVATE_KEY,
    attacker: process.env.ATTACKER_ADDRESS.toLowerCase(),
    attackerPrivateKey: process.env.ATTACKER_PRIVATE_KEY,
    dapp: DEPLOYMENTS[NETWORK].CrapDapp,
    token: NETWORK !== 'main'
        ? DEPLOYMENTS[NETWORK].TronToken
        : process.env.MAINNET_USER_TOKEN,
    gasBonus: 1.25,
    providerURI: NETWORK !== 'main'
        ? process.env.TESTNET_PROVIDER
        : process.env.MAINNET_PROVIDER,
};
