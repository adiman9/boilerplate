import * as React from 'react';
import { connect } from 'react-redux';
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

function mapStateToProps(state: any) {
  // return {
  //   myProp: mySelector(state)
  // };
  return {

  };
}

function mapDispatchToProps(dispatch: any) {
  // return {
  //   myAction: (args) => dispatch(myActionCall(args))
  // };
  return {

  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
