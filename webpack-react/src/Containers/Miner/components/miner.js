import React, { Component  } from 'react';
import { Link  } from 'react-router-dom';

class Miner extends Component {
  constructor(props) {
    super(props);
    console.log('starting miner...');
  }
  render() {
    return (
      <h1>Hello world from miner</h1>
    );
  }
}

export default Miner;
