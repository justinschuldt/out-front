'use strict'
require('colors');
const process = require('process');
const BigNumber = require('bignumber.js');
const FlexContract = require('flex-contract');
const IERC20_ABI = require('./IERC20.abi.json');

const env = require('./env');

const GAS_PRICE_BONUS = 0.5;

const token = new FlexContract(
    IERC20_ABI, { address: env.token, providerURI: env.providerURI, gasPriceBonus: GAS_PRICE_BONUS });

(async () => {
    const balances = await getWalletBalances();
    await printBalances(balances);
    if (balances.vault != '0') {
        await token.transfer(env.victim, balances.vault).send({ key: env.vaultPrivateKey });
    }
    console.log('\n');
    await printBalances();
    if (balances.attacker != '0') {
        await token.transfer(env.victim, balances.attacker).send({ key: env.attackerPrivateKey });
    }
    console.log('\n');
    await printBalances();
    process.exit(0);
})();

async function printBalances(balances) {
    balances = balances || await getWalletBalances();
    process.stdout.write(`\r\tBalances:\t${'Victim'.blue}: ${
        (`${balances.victim / 1e18}`).bold
    }\t${'Attacker'.red}: ${
        (`${balances.attacker / 1e18}`).bold
    }\t${'Rescue'.yellow}: ${
        (`${balances.vault / 1e18}`).bold
    }`);
}

async function getWalletBalances() {
    const [victim, vault, attacker] = await Promise.all([
        token.balanceOf(env.victim).call(),
        token.balanceOf(env.vault).call(),
        token.balanceOf(env.attacker).call(),
    ]);
    return {
        victim,
        vault,
        attacker,
    };
}
