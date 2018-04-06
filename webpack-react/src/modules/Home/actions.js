import * as ActionTypes from './actionTypes';

export function hash(data) {
  return {
    type: ActionTypes.Hash,
    data
  }
}
