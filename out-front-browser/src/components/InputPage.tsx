import React, { Component } from 'react';
import { Card, Form, Icon, Input, Button, Select, Spin } from 'antd';
const Option = Select.Option
import { FormComponentProps } from 'antd/lib/form';
import crypto from 'crypto';
import BigNumber from 'bignumber.js';
import * as util from 'util'
import web3 from 'web3';
import WhitelistForm from './WhitelistForm'

interface IInputPageProps extends FormComponentProps {
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
  payload?: any,
  signResult?: string
  whitelist?: string[]
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

const hasErrors = (fieldsError: any) => {
  return Object.keys(fieldsError).some((field: any) => fieldsError[field]);
}


export class InputPage extends Component<IInputPageProps, IInputState> {

  constructor(props: IInputPageProps) {
    super(props)
    this.state = {
      loading: false
    }
    this.createSignedTransaction = this.createSignedTransaction.bind(this)
    this.whitelistSet = this.whitelistSet.bind(this)
  }

  async createEIP712Data(values: any) {
    const newWeb3 = new web3((window as any).ethereum)
    const accounts = await newWeb3.eth.getAccounts();

    const domainData = {
      name: "Siphon",
      version: "1.0.0",
      chainId: await newWeb3.eth.net.getId(),
      verifyingContract: "0x2f79d27225543423c4caca23f9f58cea1cde6c56",
    }

    const siphonPermissionData = {
      owner: accounts[0],
      from: accounts[0],
      sender: '0xFb50029AAD6C7AfE2fBD319596D9eC024c2Da8Bd',
      token: values.token,
      to: values.vaultAddress,
      expiration: Math.floor(Date.now() / 1000) - 2592000,
      nonce: new BigNumber(`0x${crypto.randomBytes(32).toString('hex')}`).toString(10),
      fee: values.fee
    }
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
      newWeb3,
      EIP712Data: data
    }
  }
  async signEIP712(web3: web3, data: any) {
    this.setState(() => ({
      loading: true
    }))
    const { result } = await util.promisify((web3 as any).currentProvider.send)(data);
    console.log('signResult', result)
    await this.setState(() => ({
      signResult: result,
      loading: false
    }))
    // clear the form so it makes sense to the user
    this.props.form.resetFields()
    if (this.state.whitelist) {
      // if we already have the whitelist, start the watcher
      this.sendDataToWatcher(this.state.whitelist, result)
    }
  }

  componentDidMount() {
    // To disable submit button at the beginning.
    this.props.form.validateFields();
  }

  createSignedTransaction(e: any) {
    e.preventDefault();
    this.props.form.validateFields(async (err, values: IFormValues) => {
      if (!err) {
        console.log('Received values of form: ', values);
        console.log('this.props.bnClient: ', this.props.bnClient)
        const { newWeb3, EIP712Data } = await this.createEIP712Data(values)
        this.signEIP712(newWeb3, EIP712Data)
      }
    });
  }
  whitelistSet(whitelist: string[]) {
    console.log('whitelist from form: ', whitelist)
    this.setState(() => ({
      whitelist
    }))
    if (this.state.signResult) {
      this.sendDataToWatcher(whitelist, this.state.signResult)
    }
  }
  sendDataToWatcher(whitelist: string[], signResult: string) {
    console.log('sendDataToWatcxher: ', whitelist, signResult)
  }
  render() {
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
    // Only show error after a field is touched.
    const usernameError = isFieldTouched('vaultAddress') && getFieldError('vaultAddress');
    const feeError = isFieldTouched('fee') && getFieldError('fee');
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 },
      },
    };
    return (
      <>
        <h2>InputPage</h2>
        <Spin spinning={this.state.loading}>
          <Card title="Create new watcher" bordered={false} style={{ width: '80%' }}>
            <p>create a new watcher</p>
            <Form onSubmit={this.createSignedTransaction}>
              <Form.Item
                {...formItemLayout}
                validateStatus={usernameError ? 'error' : ''}
                help={usernameError || ''}
                label="Recovery Address"
              >
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
              <Form.Item
                {...formItemLayout}
                validateStatus={feeError ? 'error' : ''}
                help={feeError || ''}
                label="Fee you'll pay"
              >
                {getFieldDecorator('fee', {
                  initialValue: 0.1,
                  rules: [{ required: true, message: 'Please enter your vault address!' }],
                })(
                  <Input
                    prefix={<Icon type="upload" style={{ color: 'rgba(0,0,0,.25)' }} />}
                    placeholder="Enter the fee you're willing to pay."
                  />,
                )}
              </Form.Item>
              <Form.Item
                {...formItemLayout}
                label="Token to watch"
              >
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
              <Form.Item {...formItemLayoutWithOutLabel}>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={hasErrors(getFieldsError())}
                  style={{ width: '100%' }}
                >
                  Sign
              </Button>
              </Form.Item>
              {this.state.signResult ? (
                <>
                  <Icon type="success" style={{ fontSize: 32, color: 'rgba(0,0,0,.25)' }} />
                  <h3>Sign complete!</h3>
                </>
              ) : null}
            </Form>

          </Card>
        </Spin>
        {this.state.signResult ? (
          <WhitelistForm
            whitelistSet={this.whitelistSet}
          />
        ) : null}

      </>
    );
  }
}
const WrappedInputPage = Form.create({ name: 'input_page' })(InputPage)
export default WrappedInputPage;
