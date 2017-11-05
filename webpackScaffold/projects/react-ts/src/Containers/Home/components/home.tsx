import * as React from 'react';
import { Component } from 'react';
import { Link  } from 'react-router-dom';
import './home.css';

class Home extends Component {
  constructor(props: any) {
    super(props);
  }
  componentWillMount() {
    console.log('Starting home...');
  }
  render() {
    return (
      <div>
      </div>
    );
  }
}

export default Home;
