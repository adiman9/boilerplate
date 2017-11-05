import * as ActionTypes from './actionTypes';
import {
} from './actions';

export default (store:any) => (next:any) => (action:any) => {
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
