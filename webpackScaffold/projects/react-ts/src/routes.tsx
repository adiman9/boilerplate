import * as React from 'react';
import { Component } from 'react';
import {
    BrowserRouter as Router,
    Route,
} from 'react-router-dom';

import HomeModule from './Containers/Home';

class Routes extends Component {
  constructor(props: any) {
    super(props);
    console.log('starting App...');
  }
  render() {
    return (
      <Router basename="/">
        <div>
          <Route exact path="/" component={HomeModule.container}/>
        </div>
      </Router>
    );
  }
}

export default Routes;
