const net = require('net');
const chalk = require('chalk')
var server = net.createServer(function(stream) {
  stream.on('data', function(c) {
    let line = c.toString()
    if (/0xf2/i.test(line)) {
      console.log(chalk.red(line))
    } else if (/0x5f/i.test(line)) {
      console.log(chalk.green(line))
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

