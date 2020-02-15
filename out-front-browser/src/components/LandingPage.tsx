import React, { Component } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';

import AdminPage from './AdminPage';
import InputPage from './InputPage';


interface ILandingPageProps {
  web3: any;
  bnClient: any;
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
            <Route exact path="/"
              render={routerProps => (
                <InputPage
                  match={routerProps.match}
                  {...this.props}
                />
              )}
            />
            <Route
              path="/admin"
              render={routerProps => (
                <AdminPage
                  {...this.props}
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
