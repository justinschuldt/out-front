const net = require('net');
const chalk = require('chalk')
const fetch = require("node-fetch");

const URL = 'http://0.0.0.0:5000/api/debug/db'
let wallet
const start = async() => {
  await fetch(URL)
    .then(res => res.json())
    .then((json) => {
     wallet = Object.keys(json.wallets)[0] 
    })
  var re = new RegExp(wallet)
  var server = net.createServer(function(stream) {
    stream.on('data', function(c) {
      let line = c.toString()
      if (re.test(line)) {
        console.log(chalk.green(line))
      } else if (/0x5f/i.test(line)) {
        console.log(chalk.red(line))
      }
    })
  })
  process.on('SIGINT', function (){
      console.log('Goodbye!');
      server.close();
    process.exit()
  });
  process.on('exit', function (){
      console.log('Goodbye!');
      server.close();
    process.exit()
  });
  server.listen('/tmp/test6.sock');
}
start()

