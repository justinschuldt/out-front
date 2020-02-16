import React, { Component } from 'react';
import './App.less';

import blocknativeSdk from 'bnc-sdk';
import * as Web3 from 'web3';
import RouterContainer from './components/RouterContainer';

interface IAppState {
  web3?: any;
  bn?: any
}

class App extends Component<{}, IAppState> {
  web3?: any;

  constructor(props: any) {
    super(props);
    this.state = {}
    this.initBlocknative = this.initBlocknative.bind(this);
    console.log('process.env: ', process.env)
  }

  async componentDidMount() {
    await this.connectToMetamask()
    // this.initBlocknative()
  }

  async initBlocknative() {
    const bnKey = String(process.env.REACT_APP_BLOCKNATIVE_API_KEY)
    const network = await this.web3.eth.net.getId()

    const options = {
      dappId: bnKey,
      networkId: network,
      // transactionHandlers: [(event: any) => console.log(event.transaction)],
    }
    try {
      // onboard visitors

      // initialize and connect to the api
      const blocknative = await blocknativeSdk(options)
      console.log('blocknative: ', blocknative)
      this.setState(() => ({
        bn: blocknative
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
      await web3.eth.getAccounts((error: any, accounts: any) => {
        console.log(accounts);
      });

    }
  }

  async connectToMetamask() {
    // Modern dapp browsers...
    // @ts-ignore
    if (window.ethereum) {
      // @ts-ignore
      await this.setWeb3(new Web3(ethereum));
      try {
        // Request account access if needed
        // @ts-ignore
        await ethereum.enable();
        console.log('ethereum enabled')
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    // @ts-ignore
    else if (window.web3) {
      // @ts-ignore
      await this.setWeb3(new Web3(web3.currentProvider));

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
          <RouterContainer
            web3={this.web3}
            bn={this.state.bn}
          />
        </header>
      </div>
    );
  }
}

export default App;
