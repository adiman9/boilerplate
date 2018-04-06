import React, { Component  } from 'react';
import { Link  } from 'react-router-dom';

class Home extends Component {
  constructor(props) {
    super(props);
    console.log('starting home...');
  }
  render() {
    return (
      <div>
        <h1>Hello world</h1>
        <Link to="/miner">Miner</Link>
      </div>
    );
  }
}

export default Home;
