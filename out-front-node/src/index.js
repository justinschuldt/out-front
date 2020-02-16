

require('dotenv').config()
const express = require('express')
const app = express()
const blocknativeSdk = require('bnc-sdk')
const WebSocket = require('ws') 

// Express
const port = 5000

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/api/add-watcher/', (req, res) => {
  console.log('add-watcher req.body: ', req.body)
  res.status(200)
})

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
