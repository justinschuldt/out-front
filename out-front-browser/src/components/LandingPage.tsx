import React, { Component } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';

import AdminPage from './AdminPage';
import InputPage from './InputPage';


interface ILandingPageProps {
  web3: any;
}
class LandingPage extends Component<ILandingPageProps> {
  constructor(props: ILandingPageProps) {
    super(props);
  }
  render() {
    return (
      <div className="landing-page">
        <Router>
          <>
            <Route exact path="/" component={InputPage} />
            <Route
              path="/bounty/:id"
              render={routerProps => (
                <InputPage
                  web3={this.props.web3}
                  match={routerProps.match}
                />
              )}
            />
            <Route
              path="/admin"
              render={routerProps => (
                <AdminPage
                  web3={this.props.web3}
                />
              )}
            />
          </>
        </Router>
      </div>
    );
  }
}

export default LandingPage;
