import React, { Component } from 'react';
import { Skeleton, Button, Card, Icon, Avatar, List, Select } from 'antd';
const Option = Select.Option;
import { Link } from 'react-router-dom';

const { Meta } = Card;

interface IUserPageProps {
  web3: any;
  getUserPastEvents: (userAddress: string) => void;
  kickoffBlocknative: () => void
}

class UserPage extends Component<IUserPageProps> {
  state: {
    loading: boolean;
  };
  constructor(props: IUserPageProps) {
    super(props);
    this.state = {
      loading: true
    };
  }
  componentWillMount() {
    setTimeout(() => {
      this.setState(() => ({
        loading: false
      }));
    }, 800);
  }

  render() {
    const recentActivity = [
      {
        name: 'royalty 1',
        id: '0x82b387f7228d2c91abb50f15ab27c1c16566ff7cf51923cfb8f4fe2269e7046e'
      },
      {
        name: 'submission accepted',
        id: '0x95f1c67f0252e61906b706de81fa0b8471af4ef7e9594ec32c8d02c0e074fa7b'
      },
      {
        name: 'bounty submitted',
        id: '0x93aa586501a9c8de0ff83caf6f74828556f3036dfcc54d28b480a723f1bfc4f0'
      },
      {
        name: 'account created',
        id: '0xe569ab943d21ffbacbe82e9986c6138ee41382dd7866f112299a4ce343962d44'
      }
    ];
    const stats = [
      'Submissions: 1',
      'Accepted Submissions: 1',
      'Rejected Submissions: 0',
      'Submission earnings: $4.00',
      'Royalty earnings: $0.32'
    ];
    const badges = [
      { imageUrl: '/noob.jpg', title: 'Noob - submit for one bounty' }
    ];
    return (
      <>
        <Button
          type="primary"
          onClick={this.props.kickoffBlocknative}
          style={{ position: 'absolute', top: 48, right: 48, zIndex: 100 }}
        >
          Set up Wallet & Withdrawal
      </Button>
        <Card
          style={{ width: '100%', padding: 12 }}
          actions={[
            <Icon type="setting" />,
            <Icon type="edit" />,
            <Icon type="ellipsis" />
          ]}
        >
          <Skeleton loading={this.state.loading} avatar active>
            <Meta
              avatar={<Avatar icon="user" size="large" />}
              title="Total Earned: $4.32"
              description="Joined 18 Hours ago"
            />
            <p
              style={{
                fontSize: 24,
                color: 'rgba(0, 0, 0, 0.85)',
                margin: 24,
                fontWeight: 500
              }}
            >
              Account Data
          </p>
            <Card type="inner" title="Recent Activity" style={{ margin: 4 }}>
              <List
                size="small"
                bordered={false}
                dataSource={recentActivity}
                renderItem={(item: any) => (
                  <List.Item>
                    {item.name}
                    {` transaction:   `}
                    <Link to={`/transaction/${item.id}`}>{item.id}</Link>
                  </List.Item>
                )}
              />
            </Card>
            <Card type="inner" title="Stats" style={{ margin: 8 }}>
              <List
                size="small"
                bordered={false}
                dataSource={stats}
                renderItem={(item: string) => <List.Item>{item}</List.Item>}
              />
            </Card>
            <Card type="inner" title="Causes" style={{ margin: 4 }} bodyStyle={{ display: 'flex', justifyContent: 'space-between' }}>

              <Select defaultValue="unicef" style={{ width: 160 }} >
                <Option value="unicef">UNICEF</Option>
                <Option value="worldbank">World Bank</Option>
                <Option value="ethereumfoundation">Ethereum Foundation</Option>
              </Select>
              <Button type="primary">
                Set Royalty Recipient
              </Button>
            </Card>
          </Skeleton>
        </Card>
      </>
    );
  }
}
export default UserPage;
