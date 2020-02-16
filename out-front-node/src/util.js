'use strict'
const BigNumber = require('bignumber.js');
const crypto = require('crypto');
const ethjs = require('ethereumjs-util');

module.exports = {
    randomAddress() {
        return ethjs.bufferToHex(crypto.randomBytes(20));
    },
    toAddress(v) {
        return ethjs.bufferToHex(ethjs.setLengthLeft(v, 20));
    },
    toHex(v) {
        return `0x${new BigNumber(v).integerValue().toString(16)}`;
    },
    fromBlockNativeTransaction(tx) {
        // TODO
        return tx;
    },
    fromGethTx(tx) {
        // TODO
        return tx;
    }
};
