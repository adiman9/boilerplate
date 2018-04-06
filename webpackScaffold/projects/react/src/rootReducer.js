import { combineReducers  } from 'redux';

// reducers
import Home from './modules/Home';

const rootReducer = combineReducers({
  [Home.constants.NAME]: Home.reducer,
});

export default rootReducer;
