import React, { Component } from 'react';
import { Card, Button, Icon, Form, Timeline } from 'antd';
import crypto from 'crypto';
import BigNumber from 'bignumber.js';
import * as util from 'util'
import web3 from 'web3';
import AttemptForm from './AttemptForm'
import WhitelistForm from './WhitelistForm'
import { Link } from "react-router-dom";
import { formItemLayoutWithOutLabel } from './AttemptForm'

const FlexContract = require('flex-contract');
import IERC20 from './../data/IERC20.json'
import deployments from './../data/deployments.json'

interface IInputPageProps {
  match: any;
  web3: any;
  bnClient: any;
}
interface IInputState {
  loading: boolean
  bnClient?: any,
  domain?: any,
  siphonPermission?: any,
  domainData?: any,
  siphonPermissionData?: any,
  types?: any
  approveComplete?: boolean
  payload?: any,
  signedMessage?: {
    owner: string
    from: string
    sender: string
    token: string
    to: string
    expiration: number
    nonce: string
    fee: string
  }
  signResult?: string
  whitelist?: string[]
}

export class InputPage extends Component<IInputPageProps, IInputState> {
  web3: web3
  constructor(props: IInputPageProps) {
    super(props)
    this.state = {
      loading: false
    }
    this.approveContract = this.approveContract.bind(this)
    this.attemptDataSet = this.attemptDataSet.bind(this)
    this.whitelistSet = this.whitelistSet.bind(this)
    this.web3 = new web3((window as any).ethereum)
  }

  async createEIP712Data(vaultAddress: string, fee: string) {
    const accounts = await this.web3.eth.getAccounts();

    const domainData = {
      name: "Siphon",
      version: "1.0.0",
      chainId: await this.web3.eth.net.getId(),
      verifyingContract: "0x2f79d27225543423c4caca23f9f58cea1cde6c56",
    }

    const siphonPermissionData = {
      owner: accounts[0],
      from: accounts[0],
      sender: '0xFb50029AAD6C7AfE2fBD319596D9eC024c2Da8Bd',
      token: this.props.match.params.token,
      to: vaultAddress,
      expiration: Math.floor(Date.now() / 1000) - 2592000,
      nonce: new BigNumber(`0x${crypto.randomBytes(32).toString('hex')}`).toString(10),
      fee
    }
    // set message to state for later
    this.setState(() => ({
      signedMessage: siphonPermissionData
    }))
    const types = {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      SiphonPermission: [
        { name: 'owner', type: 'address' },
        { name: 'sender', type: 'address' },
        { name: 'token', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'expiration', type: 'uint64' },
        { name: 'nonce', type: 'uint256' },
        { name: 'fee', type: 'uint256' },
      ],
    }

    const payload = {
      types: types,
      domain: domainData,
      primaryType: 'SiphonPermission',
      message: siphonPermissionData,
    }
    const payloadString = JSON.stringify(payload)
    const data = {
      method: 'eth_signTypedData_v3',
      params: [accounts[0], payloadString],
      from: accounts[0],
    }

    return {
      EIP712Data: data
    }
  }

  async signEIP712(data: any) {
    this.setState(() => ({
      loading: true
    }))
    const res = await util.promisify((this.web3 as any).currentProvider.send)(data);
    const result = res.result
    this.setState(() => ({
      signResult: result,
      loading: false
    }))
    // if (this.state.whitelist) {
    // if we already have the whitelist, start the watcher
    await this.sendDataToWatcher([], result)
    // }
    return // resolve the promise
  }


  async approveContract() {
    console.log(deployments)
    let contract = new FlexContract(IERC20, { address: '0x51A82284E4a3b87Ce26473909D92B58C8Fca7852', provider: (window as any).ethereum })
    const network = await this.props.web3.eth.net.getId()
    console.log('approveContract network: ', network)
    const MAX_UINT256 = new BigNumber(2).pow(256).minus(1).toString(10);
    await contract.approve('0x51A82284E4a3b87Ce26473909D92B58C8Fca7852', MAX_UINT256).send()
    this.setState(() => ({
      approveComplete: true
    }))
    console.log('contract', contract)

    return
  }
  async attemptDataSet(vaultAddress: string, fee: string) {
    const { EIP712Data } = await this.createEIP712Data(vaultAddress, fee)
    await this.signEIP712(EIP712Data)
    return // resolve promise for form component visuals
  }
  async whitelistSet(whitelist: string[]) {
    console.log('whitelist from form: ', whitelist)
    this.setState(() => ({
      whitelist
    }))
    if (this.state.signResult) {
      await this.sendDataToWatcher(whitelist, this.state.signResult)
    }
    return // resolve async
  }

  async sendDataToWatcher(whitelist: string[], signResult: string) {
    console.log('sendDataToWatcher: ', whitelist, signResult)
    const accounts = await this.web3.eth.getAccounts();
    const data = {
      account: accounts[0],
      signResult,
      signedMessage: this.state.signedMessage,
      whitelist,
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_NODE_APP_URL}/api/add-watcher/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      // const body = await res.json()
      // console.log('POST res body: ', body)
      return // body

    } catch (e) {
      console.error('error POSTing: ', e)
      throw e // reject
    }
  }

  render() {
    const cardTitle = (
      <div style={{ display: 'flex' }}>
        <Link to="/" >
          <Icon type="left" style={{ fontSize: 24 }} />
        </Link>
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <h3 style={{ marginLeft: '2em' }} >new {this.props.match.params.token} watcher</h3>
        </div>
      </div>
    )
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'center' }} >
          <Card
            title={cardTitle}
            bordered={false}
            style={{ width: '80%', justifySelf: 'stretch' }}
          >
            <Timeline>
              <Timeline.Item>Approve contract to send your recovery attempt</Timeline.Item>
              <Timeline.Item>Create recovery attempt</Timeline.Item>
              {/* <Timeline.Item>Watching for transactions</Timeline.Item> */}
            </Timeline>
            <Card title="1 - Approve Contract" style={{ marginBottom: '1em' }}>
              {/* <div style={{ display: 'flex' }}>
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}> */}
              <Form>

                <Form.Item
                  {...formItemLayoutWithOutLabel}
                >
                  <Button
                    type="primary"
                    disabled={this.state.approveComplete}
                    style={{ width: '100%' }}
                    onClick={this.approveContract}
                  >
                    Approve contract to send your recovery attempt
                  </Button>

                </Form.Item>
              </Form>
              {/* </div>
              </div> */}
            </Card>
            <AttemptForm
              attemptDataSet={this.attemptDataSet}
            />
            {this.state.signResult ? (
              <WhitelistForm
                whitelistSet={this.whitelistSet}
              />
            ) : null}
          </Card>
        </div>
      </>
    );
  }
}

export default InputPage;
