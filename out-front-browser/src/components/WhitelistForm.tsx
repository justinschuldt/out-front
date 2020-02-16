import React, { Component } from 'react';
import { Card, Form, Icon, Input, Button } from 'antd';
import { FormComponentProps } from 'antd/lib/form';


interface IWhitelistFormProps extends FormComponentProps {
  whitelistSet: (whitelist: string[]) => void
}
interface FormValues {
  keys: number[]
  names: string[]
}

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
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 },
      },
    };
    getFieldDecorator('keys', { initialValue: [] });
    const keys = getFieldValue('keys');
    const formItems = keys.map((k: number, index: number) => (
      <Form.Item
        {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
        label={index === 0 ? 'Addresses' : ''}
        required={false}
        key={k}
      >
        {getFieldDecorator(`names[${k}]`, {
          validateTrigger: ['onChange', 'onBlur'],
          rules: [
            {
              required: true,
              whitespace: true,
              message: "Please enter an address you'd like to whitelist.",
            },
          ],
        })(<Input placeholder="Address" style={{ width: '90%', marginRight: 8 }} />)}
        {keys.length > 1 ? (
          <Icon
            className="dynamic-delete-button"
            type="minus-circle-o"
            onClick={() => this.remove(k)}
          />
        ) : null}
      </Form.Item>
    ));
    return (
      <Card title="Add to whitelist" bordered={false} style={{ width: '80%' }}>
        <p>Address Whitelist</p>
        <Form onSubmit={this.createWhitelist} >
          {formItems}
          <Form.Item {...formItemLayoutWithOutLabel}>
            <Button type="dashed" onClick={this.add} style={{ width: '90%' }}>
              <Icon type="plus" /> Add field
            </Button>
          </Form.Item>
          <Form.Item {...formItemLayoutWithOutLabel} style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Card >
    )
  }
}


const WrappedWhitelistForm = Form.create({ name: 'whitelist_form' })(WhitelistForm)
export default WrappedWhitelistForm;
