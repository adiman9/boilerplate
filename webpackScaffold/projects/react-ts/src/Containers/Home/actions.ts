import * as ActionTypes from './actionTypes';

export function hash(data: any) {
  return {
    type: ActionTypes.Hash,
    data
  }
}
