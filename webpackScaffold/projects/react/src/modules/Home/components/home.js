import React, { Component } from 'react';
import { Link  } from 'react-router-dom';
import './home.css';

class Home extends Component {
  constructor(props) {
    super(props);
  }
  componentWillMount() {
    console.log('Starting home...');
  }
  render() {
    return (
      <div>
        Hello
      </div>
    );
  }
}

export default Home;
