import React, { Component } from 'react';
import { Card, Form, Icon, Input, Button, Select, Spin } from 'antd';
const Option = Select.Option
import { FormComponentProps } from 'antd/lib/form';
import { FormatConfig } from 'antd/lib/statistic/utils';

interface IAttemptFormValues {
  vaultAddress: string
  fee: string
}
interface IAttemptFormProps extends FormComponentProps {
  attemptDataSet: (vaultAddress: string, fee: string) => Promise<void>
}
interface IAttemptFormState {
  loading: boolean
  signComplete?: true
}

// form layout
export const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 24 },
    md: { span: 24 },
    lg: { span: 24 },
    xl: { span: 24 },
    xxl: { span: 24 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 22, offset: 1 },
    md: { span: 20, offset: 2 },
    lg: { span: 18, offset: 3 },
    xl: { span: 16, offset: 4 },
    xxl: { span: 14, offset: 5 },
  },
};
export const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 20, offset: 2 },
    md: { span: 16, offset: 4 },
    lg: { span: 12, offset: 6 },
    xl: { span: 8, offset: 8 },
    xxl: { span: 4, offset: 10 },
  },
};

const hasErrors = (fieldsError: any) => {
  return Object.keys(fieldsError).some((field: any) => fieldsError[field]);
}


class AttemptForm extends Component<IAttemptFormProps, IAttemptFormState> {
  constructor(props: IAttemptFormProps) {
    super(props)
    this.state = {
      loading: false
    }
    this.handleSubmit = this.handleSubmit.bind(this)
  }
  componentDidMount() {
    // To disable submit button at the beginning.
    this.props.form.validateFields();
    console.log('inputPage props: ', this.props)
  }
  handleSubmit(e: any) {
    e.preventDefault();
    this.props.form.validateFields(async (err, values: IAttemptFormValues) => {
      if (!err) {
        console.log('Received values of form: ', values);
        this.setState(() => ({
          loading: true
        }))
        await this.props.attemptDataSet(values.vaultAddress, values.fee)
        this.setState(() => ({
          loading: false,
          signComplete: true
        }))
      }
    });
  }
  render() {
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
    // Only show error after a field is touched.
    const usernameError = isFieldTouched('vaultAddress') && getFieldError('vaultAddress');
    const feeError = isFieldTouched('fee') && getFieldError('fee');

    return (
      <Spin spinning={this.state.loading}>
        <Card title="2 - Create recovery-attempt payload" style={{ marginBottom: '1em' }}>

          <Form onSubmit={this.handleSubmit}>
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
                />
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
            <Form.Item {...formItemLayoutWithOutLabel}>
              <Button
                type="primary"
                htmlType="submit"
                disabled={hasErrors(getFieldsError()) || this.state.signComplete}
                style={{ width: '100%' }}
              >
                Sign
            </Button>
            </Form.Item>
            {this.state.signComplete ? (
              <>
                <Icon type="success" style={{ fontSize: 32, color: 'rgba(0,0,0,.25)' }} />
                <h3>Sign complete!</h3>
              </>
            ) : null}
          </Form>
        </Card>
      </Spin>
    )
  }
}
const WrappedAttemptForm = Form.create<IAttemptFormProps>({ name: 'attempt_form' })(AttemptForm)
export default WrappedAttemptForm;
