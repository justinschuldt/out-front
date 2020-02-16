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
        const siphon = new FlexContract(
            SIPHON_ABI,
            { address: env.siphon, provider: web3.currentProvider },
        );
        const newGasPrice = new BigNumber(gasPrice).times(env.gasBonus).integerValue().toString(10);
        const tx = siphon.siphon(cfg.permission, cfg.permission.signature).send({
            gasPrice: newGasPrice,
            key: env.workerPrivateKey,
        });
        const txId = await tx.txId;
        console.log(`${txId.bold}: Rescuing funds from ${cfg.wallet.bold} with gas price ${(parseInt(newGasPrice) / 1e9).toFixed(2).bold}...`.green);
        return tx;
    }
};
