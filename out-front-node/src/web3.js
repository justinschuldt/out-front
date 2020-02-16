'use strict'
const Web3 = require('web3');
const EventEmitter = require('events');
const { env } = require('process');
const { TxPool } = require('web3-eth-txpool')
const _ = require('lodash');
const { promisify } = require('util');
const bnc = require('bnc-sdk');
const Websocket = require('ws');

const RPC = env.NETWORK !== 'main'
    ? 'https://gethropsten1581714218114.nodes.deploy.radar.tech/?apikey=f9cc7fc3a17b24211cc4484df6ed5e4c408fa4c3552b09f2'
    : 'https://gethmainnet1581821221260.nodes.deploy.radar.tech/?apikey=177098e2cb5660f4e35933de3596028f4c4a8d35920e625d';
    // : 'wss://gethmainnet1581817214993.nodes.deploy.radar.tech/ws?apikey=1bf23782522616df76940709b7772842ac08628e16a12fad';
    // : 'wss://gethmainnet1581821221260.nodes.deploy.radar.tech/ws?apikey=177098e2cb5660f4e35933de3596028f4c4a8d35920e625d';

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
        this._bnc = bnc({
            apiUrl: process.env.BLOCKNATIVE_URL,
            dappId: process.env.BLOCKNATIVE_API_KEY,
            networkId: 1,
            transactionHandlers: [ ({transaction}) => {
                if (transaction.eventCode === 'txPool' && transaction.status === 'pending') {
                    this.emit('data', [transaction]);
                }
            }],
            ws: Websocket,
        });
    }
}

module.exports = {
    web3,
    callRpc,
    mempool: new MempoolEmitter()
};
