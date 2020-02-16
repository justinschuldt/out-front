'use strict'
const BigNumber = require('bignumber.js');
const ethjs = require('ethereumjs-util');
const FlexContract = require('flex-contract');

const SIPHON_ABI = require('./Siphon.abi.json');
const { web3 } = require('./web3');
const { toAddress, toHex, randomAddress } = require('./util');
const env = require('./env');

module.exports = {
    async rescueWallet(gasPrice, cfg) {
        console.log(`Rescuing funds from ${cfg.wallet}...`);
        const siphon = new FlexContract(
            SIPHON_ABI,
            { address: env.siphon, provider: web3.currentProvider },
        );
        const receipt = await siphon.siphon(cfg.permission, cfg.permission.signature).send({
            gasPrice: new BigNumber(gasPrice).times(env.gasBonus).integerValue(),
            key: env.workerPrivateKey,
        });
        console.log(`Funds are safu`);
    }
};
