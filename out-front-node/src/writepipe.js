const fetch = require("node-fetch")
const net = require('net')
const express = require('express')
const bodyParser = require('body-parser')
const blocknativeSdk = require('bnc-sdk')
const WebSocket = require('ws')
const trash = process.argv.slice(2).toString()
const chalk = require('chalk')
const env = require('./env')
const URL = 'http://0.0.0.0:5000/api/debug/db'
let wallet
let filter = false

console.log(env)

const stream = net.connect('/tmp/test6.sock');
const main = async() => {
  console.log('here')
  let wallet = ""
  await fetch(URL)
    .then(res => res.json())
    .then((json) => {
     wallet = Object.keys(json.wallets)[0] 
    })
  const re = new RegExp(wallet)
  const bnKey = env.bnKey
  const bnUrl = env.bnUrl
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
       line += `from: ${event.transaction.from.slice(0, 6)}...,\t`
       line += `to: ${event.transaction.to.slice(0, 6)}...,\t`
       line += `gasPrice: ${event.transaction.gasPrice},\t`
       line += `hash: ${event.transaction.hash.slice(0, 6)}...`
      if (re.test(line)) {
        console.log(chalk.green(line))
        stream.write(line);
      } else if (/0x5f/i.test(line)) {
        console.log(chalk.red(line))
        stream.write(line);
      } else {
        console.log(line)
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
