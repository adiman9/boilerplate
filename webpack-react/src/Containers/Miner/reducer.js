import * as ActionTypes from './actionTypes';

export default function MinerReducer(state = { isMining: false }, action) {
  switch(action.type) {
    case ActionTypes.Start: {
      return Object.assign({}, state, {
        isMining: true
      });
    }
    case ActionTypes.Stop: {
      return Object.assign({}, state, {
        isMining: false
      });
    }
    default:
      return state;
  }
}
