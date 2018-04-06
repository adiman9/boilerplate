import React, { Component  } from 'react';
import { connect } from 'react-redux';
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
