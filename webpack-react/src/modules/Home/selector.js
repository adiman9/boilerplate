import { createSelector  } from 'reselect';
import _ from 'lodash';
import { NAME } from './constants';
//https://jaysoo.ca/2016/02/28/organizing-redux-application/
// import { filterActive, filterCompleted } from './model';

export const getAllData = state => state[NAME];

export const getAllTrades = state => state[NAME].trades;
export const getAllCandles = state => state[NAME].candles;
export const getTimeframe = state => state[NAME].timeframe;

// export const getCompleted = _.compose(filterCompleted, getAll);
// export const getActive = _.compose(filterActive, getAll);

// export const getCounts = createSelector(
//   getAll,
//   getCompleted,
//   getActive,
//   (allTodos, completedTodos, activeTodos) => ({
//     all: allTodos.length,
//     completed: completedTodos.length,
//     active: activeTodos.length
//   })
// );
