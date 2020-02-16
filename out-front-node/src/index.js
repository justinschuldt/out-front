

require('dotenv').config()
const express = require('express')
const blocknativeSdk = require('bnc-sdk')
const WebSocket = require('ws') 

// Express
const port = 5000

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


router.post('/add-watcher/', (req, res) => {
  console.log('add-watcher req.body: ', req.body)
  res.status(200)
})

app.use('/api', router)

app.listen(port, () => console.log(`express app listening on port ${port}!`))


const main = () => {
  const bnKey = process.env.BLOCKNATIVE_API_KEY
  const bnUrl = process.env.BLOCKNATIVE_URL
  if (!bnKey) {
    throw new Error('blocknative key not provided as environment variable.')
  }
  const bnOptions = {
    apiUrl: bnUrl,
    dappId: bnKey,
    networkId: 1,
    transactionHandlers: [event => console.log(event.transaction)],
    ws: WebSocket
  }

  // initialize and connect to the api
  const blocknative = blocknativeSdk(bnOptions)


  const { clientIndex } = blocknative
  const {
    emitter,
    details
  } = blocknative.transaction(clientIndex, '0x5ecc7df8f9db451ca98055ac35a2a1a6fac3d1ed4233a85d5e57fb13594c323c')

  console.log('details: ', details)

  // register a callback for a txPool event
  emitter.on("txPool", transaction => {
    console.log("Transaction", transaction)
  })


}

// main()
