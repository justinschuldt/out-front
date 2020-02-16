
const net = require('net');
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const blocknativeSdk = require('bnc-sdk')
const WebSocket = require('ws')
const trash = process.argv.slice(2).toString()
const chalk = require('chalk')
let filter = false
if (/filter/.test(trash)) {
  filter = true
}

// Express
const port = filter ? 5000 : 5001

const app = express()
const router = express.Router()

// enable CORS
router.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})
// options requests
router.options('/*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With'
  )
  res.sendStatus(200)
})
router.use(bodyParser.json())


router.post('/add-watcher/', (req, res) => {
  console.log('add-watcher req.body: ', req.body)
  res.status(200)
})

app.use('/api', router)

app.listen(port, () => console.log(`express app listening on port ${port}!`))


var stream = net.connect('/tmp/test6.sock');
const main = () => {
  const bnKey = process.env.BLOCKNATIVE_API_KEY
  const bnUrl = process.env.BLOCKNATIVE_URL
  if (!bnKey) {
    throw new Error('blocknative key not provided as environment variable.')
  }
  const emitter2 = (event) => {
    let line = ''
    if (
      event.transaction.from &&
      event.transaction.to &&
      event.transaction.gasPrice &&
      event.transaction.hash
    ) {
       line += `from: ${event.transaction.from.slice(0, 6)},\t`
       line += `to: ${event.transaction.to.slice(0, 6)},\t`
       line += `gasPrice: ${event.transaction.gasPrice},\t`
       line += `hash: ${event.transaction.hash.slice(0, 6)}`
      if (/0xf2/i.test(line)) {
        console.log(chalk.red(line))
        stream.write(line);
      } else if (/0x5f/i.test(line)) {
        console.log(chalk.green(line))
        stream.write(line);
      } else {
        if (!filter) {
          console.log(line)
        }
      }
    }
  }
  const bnOptions = {
    apiUrl: bnUrl,
    dappId: bnKey,
    networkId: 1,
    transactionHandlers: [emitter2],
    ws: WebSocket
  }

  // initialize and connect to the api
  const blocknative = blocknativeSdk(bnOptions)


  const { clientIndex } = blocknative
  const {
    emitter,
    details
  } = blocknative.transaction(clientIndex, '0x5ecc7df8f9db451ca98055ac35a2a1a6fac3d1ed4233a85d5e57fb13594c323c')

}
  process.on('SIGINT', function (){
    console.log('Goodbye!');
    stream.end();
    process.exit()
  });
  process.on('exit', function (){
    console.log('Goodbye!');
    stream.end();
    process.exit()
  });

main()
