import React, { Component } from 'react';
import { Card, Form, Icon, Input, Button, Select } from 'antd';
const Option = Select.Option
import { FormComponentProps } from 'antd/lib/form';

interface IInputPageProps extends FormComponentProps {
  match: any;
  web3: any;
  bnClient: any;
}
interface IInputState {
  bnClient: any
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
    this.createSignedTransaction = this.createSignedTransaction.bind(this)
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
          <Form {...formItemLayout} onSubmit={this.createSignedTransaction}>
            <Form.Item validateStatus={usernameError ? 'error' : ''} help={usernameError || ''}>
              {getFieldDecorator('vaultAddress', {
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
                rules: [{ required: true, message: 'Please select a token!' }],
              })(
                <Select
                  placeholder="Select a token"
                  defaultValue="ETH"
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
