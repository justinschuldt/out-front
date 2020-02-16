'use strict'
const BigNumber = require('bignumber.js');
const ethjs = require('ethereumjs-util');
const fs = require('fs');
const path = require('path');

const { web3, callRpc } = require('./web3');
const { ERC20Selectors, getERC20Allowance, getSelector } = require('./erc20');
const { toAddress, toHex, randomAddress } = require('./util');
const env = require('./env');

const WRAPPER_BYTECODE = fs.readFileSync(path.resolve(__dirname, './TokenBalanceCheckCallWrapper.bin-runtime'));

module.exports = {
    async getBadTransactions(txs, cfg) {
        // Augment cfg with allowance.
        const _cfg = { ...cfg, allowance: getERC20Allowance(cfg.token, cfg.wallet, cfg.siphon) };
        // Don't race ourselves.
        txs = txs.filter(tx => tx.from !== env.worker);
        // Get the illegal status of each transaction.
        const statuses = await Promise.all(txs.map(tx => isIllegalTransaction(tx, _cfg)));
        // Return the illegal transactions.
        return statuses.map((s, i) => s ? txs[i] : undefined).filter(tx => tx);
    }
};

async function isIllegalTransaction(tx, cfg) {
    // If no tx data, it's just an ETH transfer, which we don't cover.
    if (tx.input === '0x') {
        return false;
    }
    // Handle calls directly to the token contract.
    // TODO: Unify this logic with the wrapped call logic.
    if (tx.to === cfg.token) {
        return checkDirectTokenCall(tx, cfg);
    }
    // Handle all other calls by using geth eth_call and the wrapper contract.
    return checkWrappedCall(tx, cfg);
}

const ENCODED_TRUE = ethjs.setLengthLeft('0x01', 32);

async function checkDirectTokenCall(tx, cfg) {
    switch (getSelector(tx.data)) {
        case ERC20Selectors.Transfer:
            {
                const [to, amount] = getTxDataParams(tx.data, 2);
                if (new BigNumber(amount).isZero() || tx.whitelist.includes(toAddress(to))) {
                    return false;
                }
            }
            break;
        case ERC20Selectors.TransferFrom:
            {
                const [from, to, amount] = getTxDataParams(tx.data, 3);
                if (new BigNumber(amount).isZero() ||
                        toAddress(from) !== cfg.wallet ||
                        tx.whitelist.includes(toAddress(to))) {
                    return false;
                }
            }
            break;
        case ERC20Selectors.Approve:
            {
                const [spender, allowance] = getTxDataParams(tx.data, 2);
                if (toAddress(pender) !== cfg.siphon ||
                        cfg.allowance.lte(allowance)) {
                    return false;
                }
            }
            break;
        default:
            return false;
    }
    const r = await web3.eth.call(tx, 'pending');
    return r === '0x' || r === ENCODED_TRUE;
}

const ERROR_BYTES = Buffer.from('TokenBalanceCheckCallWrapper/').toString('hex');

async function checkWrappedCall(tx, cfg) {
    // We overwrite the bytecode at the target address with our wrapper contract
    // and clone the original target bytecode at a random address.
    // The wrapper contract will delegatecall to the random address and monitor
    // before and after states.
    const newTargetAddress = randomAddress();
    const targetBytecode = tx.to ? await web3.eth.getCode(tx.to, 'pending') : '0x';
    const result = await callRpc(
        'eth_call',
        [
            {
                ...(tx.to ? { to: tx.to } : {}),
                gas: toHex(new BigNumber(tx.gas).plus(100e6)),
                gasPrice: toHex(new BigNumber(tx.gasPrice).times(1.5)),
                value: toHex(tx.value),
                // Append the details needed to reconstruct the original call
                // to the call data.
                data: augmentCallData(
                    tx.input,
                    {
                        target: newTargetAddress,
                        token: cfg.token,
                        wallet: cfg.wallet,
                        siphon: cfg.siphon,
                    },
                ),
            },
            'pending',
            {
                ...(tx.to ? { [tx.to]: { code: `0x${WRAPPER_BYTECODE}` } } : {}),
                ...(targetBytecode !== '0x'
                    ? { [newTargetAddress]: { code: targetBytecode } }
                    : {}
                ),
            }
        ],
    );
    if (!result) {
        console.error(`Could not simulate wrapped call for ${tx.hash}`);
        return false;
    }
    return result.includes(ERROR_BYTES);
}

function augmentCallData(callData, opts) {
    return ethjs.bufferToHex(Buffer.concat([
        ethjs.toBuffer(callData),
        ethjs.setLengthLeft(opts.target, 32),
        ethjs.setLengthLeft(opts.token, 32),
        ethjs.setLengthLeft(opts.wallet, 32),
        ethjs.setLengthLeft(opts.siphon, 32),
    ]));
}
