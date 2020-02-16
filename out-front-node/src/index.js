const express = require('express')
const bodyParser = require('body-parser')
const blocknativeSdk = require('bnc-sdk')
const WebSocket = require('ws')
const process = require('process');
require('colors');

const { mempool } = require('./web3');
const { getBadTransactions } = require('./tx-validator');
const { rescueWallet } = require('./rescue');
const env = require('./env');

// Express
const port = 5000

const app = express()
const router = express.Router()

const DB = {
    wallets: {
        [env.defaultUser]: {
            permission: {
                owner: env.defaultUser,
                sender: env.worker,
                to: env.vault,
                token: env.token,
                expiration: 1579271598,
                nonce: "85324099247801024149571813910050400755056600295515127216923636505640651493396",
                fee: '1000000000000000',
                signature: '0x66b8afd27a43e18a8b1d2e2a5e0765b0e6f0049ed0368e4161795f5c6764a5747601153e539abedf4778e53df11274eb16053b06c6359165a431acc82a072cc61b',
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

app.listen(port, async () => {
    const txCache = {};
    const queue = [];
    let rescueCount = 0;
    mempool.on('data', async txs => {
        const newTxs = txs.filter(tx => !(tx.hash in txCache));
        for (const tx of newTxs) {
            txCache[tx.hash] = true;
            if (rescueCount === 0) {
                console.log(`hash: ${tx.hash.bold}, gas_price: ${(parseInt(tx.gasPrice) / 1e9).toFixed(2).bold}`.grey);
            }
        }
        for (const [address, info] of Object.entries(DB.wallets)) {
            const userConfig = createUserConfig(address, info);
            const badTxs = await getBadTransactions(newTxs, userConfig);
            rescueCount += badTxs.length;
            for (const tx of badTxs) {
                console.log(`!!!!!Spotted illegal tx ${tx.hash} from ${tx.from.red}!!!!!`.red.bold);
                await rescueWallet(tx.gasPrice, userConfig);
                console.log(`Funds are safu!!`.yellow.bold);
                rescueCount--;
            }
        }
    });

});

function createUserConfig(address, info) {
    return {
        wallet: address,
        permission: info.permission,
        whitelist: info.whitelist || [],
        siphon: env.siphon,
        token: info.permission.token.toLowerCase(),
    };
}
