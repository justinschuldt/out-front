'use strict'
const BigNumber = require('bignumber.js');
const ethjs = require('ethereumjs-util');

const ERC20_ABI = require('./IERC20.abi.json');
const { web3 } = require('./web3');

module.exports = {
    async getERC20Allowance(token, wallet, spender) {
        const inst = new web3.eth.Contract(ERC20_ABI, token);
        return inst.methods.allowance(wallet, spender).call();
    },
    ERC20Selectors: {
        Transfer: 'a9059cbb',
        TransferFrom: '23b872dd',
        Approve: '095ea7b3',
    },
    getSelector(txData) {
        return ethjs.toBuffer(txData).slice(0, 4).toString('hex');
    }
};
