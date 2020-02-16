const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const WebpackBar = require("webpackbar");
const CracoAntDesignPlugin = require("craco-antd");
const path = require("path");
const process = require('process');
const DEPLOYMENTS = require('../contracts/deployments.json');
const fs = require('fs');


require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const NETWORK = process.env.NETWORK || 'ropsten';
// Don't open the browser during development
process.env.BROWSER = "none";

const updateFile = (name, value) => {
  // add a line to a lyric file, using appendFile
  fs.appendFile('.env', `\nREACT_APP_${name.toUpperCase()}=${value}`, (err) => {
    if (err) throw err;
    console.log(`added \n${name}=${value}`);
  });
}

updateFile('network', NETWORK)
updateFile('victim_address', process.env.USER_ADDRESS.toLowerCase())
updateFile('attacker_address', process.env.ATTACKER_ADDRESS.toLowerCase())
updateFile('token', NETWORK !== 'main' ? DEPLOYMENTS[NETWORK].TronToken : process.env.USER_TOKEN)
updateFile('verifying_contract', DEPLOYMENTS[NETWORK].Siphon)
updateFile('worker_address', process.env.WORKER_ADDRESS)
updateFile('vault_address', process.env.VAULT_ADDRESS)

module.exports = {
  webpack: {
    plugins: [
      new WebpackBar({ profile: true }),
      ...(process.env.NODE_ENV === "development"
        ? [new BundleAnalyzerPlugin({ openAnalyzer: false })]
        : []),
    ]
  },
  plugins: [
    {
      plugin: CracoAntDesignPlugin,
      options: {
        customizeThemeLessPath: path.join(
          __dirname,
          "src/theme.less"
        )
      }
    }
  ],
};
