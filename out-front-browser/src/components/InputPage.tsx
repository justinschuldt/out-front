import React, { Component } from 'react';
import { Card, Form, Icon, Input, Button, Select } from 'antd';
const Option = Select.Option
import { FormComponentProps } from 'antd/lib/form';
import crypto from 'crypto';
import BigNumber from 'bignumber.js';
import * as util from 'util'
import web3 from 'web3';
interface IInputPageProps extends FormComponentProps {
  match: any;
  web3: any;
  bnClient: any;
}
interface IInputState {
  bnClient?: any,
  domain?: any,
  siphonPermission?: any,
  domainData?: any,
  siphonPermissionData?: any,
  types?: any
  payload?: any,
  result?: any
}
interface IFormValues {
  vaultAddress: string
  fee: string
  token: string
}

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

function hasErrors(fieldsError: any) {
  return Object.keys(fieldsError).some((field: any) => fieldsError[field]);
}


export class InputPage extends Component<IInputPageProps, IInputState> {

  constructor(props: IInputPageProps) {
    super(props)
    this.state = {}
    this.createSignedTransaction = this.createSignedTransaction.bind(this)
  }

  createEIP712Data = async(values: any) => {
    const newWeb3 = new web3((window as any).ethereum)
    console.log('newWeb3: ', newWeb3)
    const domainData = {
      name: "Siphon",
      version: "1.0.0",
      chainId: await newWeb3.eth.net.getId(),
      verifyingcontract: "0x2f79d27225543423c4caca23f9f58cea1cde6c56",
    }

    const accounts = await newWeb3.eth.getAccounts();
    const siphonPermissionData = {
      owner: accounts[0],
      sender: '0xFb50029AAD6C7AfE2fBD319596D9eC024c2Da8Bd',
      token: values.token,
      to: values.vaultAddress,
      expiration: Math.floor(Date.now() /1000) - 2592000,
      nonce: new BigNumber(`0x${crypto.randomBytes(32).toString('hex')}`).toString(10),
      fee: values.fee
    }
    await this.setState(() => ({
      domainData,
      siphonPermissionData,
      types: {
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
    }))
      console.log('state: ', this.state)
  }
  async signEIP712() {
    const newWeb3 = new web3((window as any).ethereum)
    const accounts = await newWeb3.eth.getAccounts();
    const payload = {
      types: this.state.types,
      domain: this.state.domainData,
      primaryType: 'SiphonPermission',
      message: this.state.siphonPermissionData,
    };
    const data = JSON.stringify({
      method: 'eth_signTypedData',
      params: [accounts[0], payload],
      from: accounts[0],
    })
    const { result } = await util.promisify((newWeb3 as any).currentProvider.send)(data);
    await this.setState(() => ({
      payload,
      result
    }))
    console.log(this.state)
  }

  componentDidMount() {
    // To disable submit button at the beginning.
    this.props.form.validateFields();
  }

  createSignedTransaction(e: any) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        console.log('this.props.bnClient: ', this.props.bnClient)
      }
      this.createEIP712Data(values)
      this.signEIP712()
    });
  }
  render() {
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
    // Only show error after a field is touched.
    const usernameError = isFieldTouched('vaultAddress') && getFieldError('vaultAddress');
    const feeError = isFieldTouched('fee') && getFieldError('fee');
    return (
      <>
        <h2>InputPage</h2>
        <Card title="Create new watcher" bordered={false} style={{ width: '80%' }}>
          <p>create a new watcher</p>
          <Form onSubmit={this.createSignedTransaction}>
            <Form.Item validateStatus={usernameError ? 'error' : ''} help={usernameError || ''}>
              {getFieldDecorator('vaultAddress', {
                initialValue: '0xFb50029AAD6C7AfE2fBD319596D9eC024c2Da8Bd',
                rules: [{ required: true, message: 'Please enter your vault address!' }],
              })(
                <Input
                  prefix={<Icon type="info-circle" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="vault wallet address"
                />,
              )}
            </Form.Item>
            <Form.Item validateStatus={feeError ? 'error' : ''} help={feeError || ''}>
              {getFieldDecorator('fee', {
                rules: [{ required: true, message: 'Please enter your vault address!' }],
              })(
                <Input
                  prefix={<Icon type="upload" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="Enter the fee you're willing to pay."
                />,
              )}
            </Form.Item>
            <Form.Item label="Token">
              {getFieldDecorator('token', {
	        initialValue: 'ETH',
                rules: [{ required: true, message: 'Please select a token!' }],
              })(
                <Select
                  placeholder="Select a token"
                >
                  <Option value="ETH">ETH</Option>
                  <Option value="TRX">TRX</Option>
                  <Option value="WETH">WETH</Option>
                </Select>
              )}
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" disabled={hasErrors(getFieldsError())}>
                Sign
              </Button>
            </Form.Item>
          </Form>

        </Card>

        <Card title="Add to whitelist" bordered={false} style={{ width: '80%' }}>
          <p>add to whitelist</p>
          <p>coming soon...</p>
        </Card>

      </>
    );
  }
}
const WrappedInputPage = Form.create({ name: 'input_page' })(InputPage)
export default WrappedInputPage;
