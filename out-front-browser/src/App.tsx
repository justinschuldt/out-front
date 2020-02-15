import React, { Component } from 'react';
import './App.less';

import { Button } from 'antd';
import blocknativeSdk from 'bnc-sdk';
import * as Web3 from 'web3';

import LandingPage from './components/LandingPage';

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

  }

  componentDidMount() {
    this.initBlocknative()
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
        // Acccounts now exposed
        // @ts-ignore
        web3.eth.sendTransaction({
          /* ... */
        });
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
          {/* <Button type="primary" onClick={this.initBlocknative}>
            Login with Blocknative
          </Button> */}

        </header>
      </div>
    );
  }
}

export default App;
