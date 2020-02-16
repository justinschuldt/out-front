import React, { Component } from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';

import LandingPage from './LandingPage';
import AdminPage from './AdminPage';
import InputPage from './InputPage';


interface IRouterContainerProps {
  web3: any;
  bn: any;
}
class RouterContainer extends Component<IRouterContainerProps> {
  constructor(props: IRouterContainerProps) {
    super(props);
  }
  render() {
    return (
      <div className="landing-page">
        <Router>
          <>
            <Route exact path="/"
              component={LandingPage}
            />
            <Switch>
              <Route
                path="/admin"
                render={routerProps => (
                  <AdminPage
                    {...this.props}
                  />
                )}
              />
              <Route path="/:token"
                render={routerProps => (
                  <InputPage
                    match={routerProps.match}
                    {...this.props}
                  />
                )}
              />
            </Switch>
          </>

        </Router>
      </div>
    );
  }
}

export default RouterContainer;
