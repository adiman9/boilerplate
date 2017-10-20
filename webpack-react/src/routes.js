import React, { Component } from 'react';
import {
    BrowserRouter as Router,
    Route,
} from 'react-router-dom';

import HomeModule from './Containers/Home';
import MinerModule from './Containers/Miner';

class Routes extends Component {
  constructor(props) {
    super(props);
    console.log('starting App...');
  }
  render() {
    return (
      <Router basename="/">
        <div>
          <Route exact path="/" component={HomeModule.container}/>
          <Route path="/miner" component={MinerModule.container}/>
        </div>
      </Router>
    );
  }
}

export default Routes;
