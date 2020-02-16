import React, { Component } from 'react';
import { Card, Form, Icon, Input, Button } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import {
  // formItemLayout,
  formItemLayoutWithOutLabel
} from './AttemptForm';


interface IWhitelistFormProps extends FormComponentProps {
  whitelistSet: (whitelist: string[]) => Promise<void>
}
interface FormValues {
  keys: number[]
  names: string[]
}

const formItemLayout = {
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
    sm: { span: 22 },
    md: { span: 20, offset: 1 },
    lg: { span: 18, offset: 2 },
    xl: { span: 16, offset: 3 },
    xxl: { span: 14, offset: 4 },
  },
};

class WhitelistForm extends Component<IWhitelistFormProps, {}> {
  id: number
  constructor(props: IWhitelistFormProps) {
    super(props)
    this.state = {}
    this.id = 0
    this.createWhitelist = this.createWhitelist.bind(this)
  }

  componentDidMount() {
    // To disable submit button at the beginning.
    this.props.form.validateFields();
  }
  remove(k: number) {
    const { form } = this.props;
    // can use data-binding to get
    const keys: number[] = form.getFieldValue('keys')
    // We need at least one passenger
    if (keys.length === 1) {
      return;
    }

    // can use data-binding to set
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    });
  };

  add = () => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    const nextKeys = keys.concat(this.id++);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys: nextKeys,
    });
  };
  createWhitelist(e: any) {
    e.preventDefault();
    this.props.form.validateFields(async (err, values: FormValues) => {
      if (!err) {
        const { keys, names } = values;
        console.log('Received values of form: ', values);
        const whitelist = keys.map(key => names[key])
        console.log('whitelist:', whitelist);
        this.props.whitelistSet(whitelist)

      }
    });
  }
  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    getFieldDecorator('keys', { initialValue: [] });
    const keys = getFieldValue('keys');
    const formItems = keys.map((k: number, index: number) => (
      <Form.Item
        {...formItemLayout}
        label={index === 0 ? 'Addresses' : ''}
        required={false}
        key={k}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {getFieldDecorator(`names[${k}]`, {
            validateTrigger: ['onChange', 'onBlur'],
            rules: [
              {
                required: true,
                whitespace: true,
                message: "Please enter an address you'd like to whitelist.",
              },
            ],
          })(<Input placeholder="Address" />)}
          <Icon
            className="dynamic-delete-button"
            type="minus-circle-o"
            onClick={() => this.remove(k)}
            style={{ marginLeft: '1em', marginTop: '0.5em' }}
          />

        </div>
      </Form.Item>
    ));
    return (
      <Card title="Optional - Whitelist Address" style={{ marginBottom: '1em' }}>
        <Form onSubmit={this.createWhitelist} >
          {formItems}
          <Form.Item {...formItemLayout}>
            <Button type="dashed" onClick={this.add} style={{ width: '100%' }}>
              <Icon type="plus" /> Add field
            </Button>
          </Form.Item>
          <Form.Item {...formItemLayoutWithOutLabel} >
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: '100%' }}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Card >
    )
  }
}


const WrappedWhitelistForm = Form.create<IWhitelistFormProps>({ name: 'whitelist_form' })(WhitelistForm)
export default WrappedWhitelistForm;
