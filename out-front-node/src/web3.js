'use strict'
const Web3 = require('web3');
const EventEmitter = require('events');
const { env } = require('process');
const { TxPool } = require('web3-eth-txpool')
const _ = require('lodash');
const { promisify } = require('util');

const RPC = env.NETWORK !== 'main'
    ? 'wss://gethropsten1581714218114.nodes.deploy.radar.tech/ws?apikey=f9cc7fc3a17b24211cc4484df6ed5e4c408fa4c3552b09f2'
    : 'wss://gethmainnet1581817214993.nodes.deploy.radar.tech/ws?apikey=1bf23782522616df76940709b7772842ac08628e16a12fad';

const web3 = new Web3(RPC);

async function callRpc(method, params = []) {
    const r = await promisify(web3.currentProvider.send.bind(web3.currentProvider))({
        jsonrpc: '2.0',
        id: _.random(1, 100000000),
        method,
        params
    });
    if (r.error) {
        throw new Error(r.error.message);
    }
    return r.result;
}

class MempoolEmitter extends EventEmitter {
    constructor() {
        super();
        this._txpool = new TxPool(web3.currentProvider);
        setTimeout(() => this._poll(), 500);
    }

    async _poll() {
        const result = await callRpc('txpool_content');
        const txs = [];
        for (const [sender, nonces] of Object.entries(result.pending)) {
            for (const [nonce, tx] of Object.entries(nonces)) {
                txs.push(tx);
            }
        }
        this.emit('data', txs);
        setTimeout(() => this._poll(), 500);
    }
}

module.exports = {
    web3,
    callRpc,
    mempool: new MempoolEmitter()
};
