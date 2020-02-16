require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const blocknativeSdk = require('bnc-sdk')
const WebSocket = require('ws')

const { mempool } = require('./web3');
const { getBadTransactions } = require('./tx-validator');
const { drainWallet } = require('./drain');
const env = require('./env');

// Express
const port = 5000

const app = express()
const router = express.Router()

const DB = {
    wallets: {
        '0xfbfa018b1f7f515c5d1da1fe47e63ed05d8720b0': {
            permission: {
                sender: env.worker,
                token: '0x45c7c596373dc94e90de436e5925765deeb3909a',
            },
        },
    },
};

// enable CORS
router.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
});
// options requests
router.options('/*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With'
  )
  res.sendStatus(200)
});
router.use(bodyParser.json());

router.post('/add-watcher/', (req, res) => {
  DB.wallets[req.body.account] = {
      permission: {
          ...req.body.signedMessage,
          signature: req.body.signResult,
      },
      whitelist: req.body.whitelist,
  };
  res.status(200);
});

router.get('/debug/db/', (req, res) => {
    res.json(DB);
});

app.use('/api', router);

app.listen(port, () => console.log(`express app listening on port ${port}!`));

(async () => {
    const txCache = {};
    const queue = [];
    mempool.on('data', async txs => {
        const newTxs = txs.filter(tx => !(tx.hash in txCache));
        for (const tx of txs) {
            txCache[tx.hash] = true;
        }
        for (const [address, info] of Object.entries(DB.wallets)) {
            const userConfig = createUserConfig(address, info);
            const badTxs = await getBadTransactions(newTxs, userConfig);
            for (const tx of badTxs) {
                await drainWallet(tx.gasPrice, userConfig);
            }
        }
    });
})();

function createUserConfig(address, info) {
    return {
        wallet: address,
        permission: info.permission,
        whitelist: info.whitelist || [],
        siphon: info.permission.sender.toLowerCase(),
        token: info.permission.token.toLowerCase(),
    };
}
