import * as ActionTypes from './actionTypes';
import {
} from './actions';

export default store => next => action => {
  switch(action.type) {
    case(ActionTypes.Hash): {
      break;
    }
    default: {
      break;
    }
  }
  next(action);
}
