import React, { Component } from 'react';
import { Button, Card } from 'antd';
import * as web3 from 'web3';

interface IAdminPageProps {
  web3: any;
}

class AdminPage extends Component<IAdminPageProps> {
  constructor(props: IAdminPageProps) {
    super(props);
    console.log('inputPage constructor ran')
    this.clearLocalStorage = this.clearLocalStorage.bind(this);
  }


  clearLocalStorage() {
    localStorage.clear()
    console.log('localStorage cleared');
  }

  render() {
    return (
      <div>
        <Card title="Admin Page" bordered={false} style={{ width: '100%' }}>
          <p>Admin functions</p>
          <Button onClick={this.clearLocalStorage}>Clear local storage</Button>

        </Card>
      </div>
    );
  }
}
export default AdminPage;
