import React, { Component } from 'react';
import { Card } from 'antd'
import * as web3 from 'web3';

interface IInputPageProps {
  match: any;
  web3: any;
}

export class InputPage extends Component<IInputPageProps> {
  constructor(props: IInputPageProps) {
    super(props);
  }

  render() {
    return (
      <>
        <h2>InputPage</h2>
        <Card title="Create new watcher" bordered={false} style={{ width: '80%' }}>
          <p>create a new watcher</p>

        </Card>
        <Card title="Add to whitelist" bordered={false} style={{ width: '80%' }}>
          <p>add to whitelist</p>

        </Card>
      </>
    );
  }
}

export default InputPage;
