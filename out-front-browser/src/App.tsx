import React, { Component } from 'react';
import './App.less';

import { Button } from 'antd';
import blocknativeSdk from 'bnc-sdk';
import * as Web3 from 'web3';
const FlexContract = require('flex-contract');
import LandingPage from './components/LandingPage';
import IERC20 from './data/IERC20.json'
import deployments from './data/deployments.json'
const BigNumber = require('bignumber.js');

interface IAppState {
  web3?: any;
  bnClient?: any
}

class App extends Component<{}, IAppState> {
  // Web3
  web3?: any;

  constructor(props: any) {
    super(props);
    this.state = {}
    this.initBlocknative = this.initBlocknative.bind(this);
    this.test = this.test.bind(this);
  }

  componentDidMount() {
    this.initBlocknative()
    this.connectToMetamask()
  }

  async test () {
    const data = { username: 'example' };
    fetch('http://localhost:5000/api/add-watcher/', {
      method: 'POST', // or 'PUT'
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then((response) => response.json())
    .then((data) => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    }) 
    // console.log(deployments)
    // let contract = new FlexContract(IERC20, {address: '0x51A82284E4a3b87Ce26473909D92B58C8Fca7852', provider: ( window as any ).ethereum})
    // const MAX_UINT256 = new BigNumber(2).pow(256).minus(1).toString(10);
    // await contract.approve('0x51A82284E4a3b87Ce26473909D92B58C8Fca7852', MAX_UINT256).send()
    // console.log('test', contract)
  }

  async initBlocknative() {
    const bnKey = process.env.REACT_APP_BLOCKNATIVE_API_KEY || ''
    const main = 1;
    const ropsten = 3;
    const rinkeby = 4;
    const options = {
      dappId: bnKey,
      networkId: ropsten,
      transactionHandlers: [(event: any) => console.log(event.transaction)],
    }
    try {
      // onboard visitors

      // initialize and connect to the api
      const blocknative = await blocknativeSdk(options)
      console.log('blocknative: ', blocknative)
      this.setState(() => ({
        bnClient: blocknative
      }))
    } catch (error) {
      // user exited onboarding before completion
      console.log(error.msg);
    }
  }

  async setWeb3(web3: any) {
    if (web3) {
      this.web3 = web3;
      console.log('web3 available');
      // @ts-ignore
      this.BN = web3.utils.BN;
      web3.eth.getAccounts((error: any, accounts: any) => {
        console.log(accounts);
      });

    }
  }

  async connectToMetamask() {
    // Modern dapp browsers...
    // @ts-ignore
    if (window.ethereum) {
      // @ts-ignore
      this.setWeb3(new Web3(ethereum));
      try {
        // Request account access if needed
        // @ts-ignore
        await ethereum.enable();
        console.log('ethereum enabled')
        // Acccounts now exposed
        // @ts-ignore
        // web3.eth.sendTransaction({
        //   /* ... */
        // });
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    // @ts-ignore
    else if (window.web3) {
      // @ts-ignore
      this.setWeb3(new Web3(web3.currentProvider));
      // Acccounts always exposed
      // @ts-ignore
      web3.eth.sendTransaction({
        /* ... */
      });
    }
    // Non-dapp browsers...
    else {
      console.log(
        'Non-Ethereum browser detected. You should consider trying MetaMask!'
      );
    }
  }



  render() {
    return (
      <div className="App">
        <header className="App-header">
          <div className="logo" />
          <LandingPage
            web3={this.web3}
            bnClient={this.state.bnClient}
          />

          {/* for debugging  */}
          <Button type="primary" onClick={this.test}>
            Login with Blocknative
          </Button> 

        </header>
      </div>
    );
  }
}

export default App;
