import { combineReducers  } from 'redux';

// reducers
import Home from './Containers/Home';

const rootReducer = combineReducers({
  [Home.constants.NAME]: Home.reducer,
});

export default rootReducer;
