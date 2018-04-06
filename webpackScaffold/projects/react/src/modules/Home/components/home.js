import React, { Component } from 'react';
import { connect } from 'react-redux';
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

function mapStateToProps(state) {
  // return {
  //   myProp: mySelector(state)
  // };
  return {

  };
}

function mapDispatchToProps(dispatch) {
  // return {
  //   myAction: (args) => dispatch(myActionCall(args))
  // };
  return {

  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
