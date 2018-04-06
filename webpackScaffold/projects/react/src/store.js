import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createLogger  } from 'redux-logger';
import rootReducer from './rootReducer';

// Custom middleware
import Home from './modules/Home';

const logger = createLogger();

const store = createStore(
  rootReducer,
  {},
  applyMiddleware(
    thunk,
    logger,
    Home.middleware,
  )
);

export default store;
