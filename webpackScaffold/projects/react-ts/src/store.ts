import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createLogger  } from 'redux-logger';
import rootReducer from './rootReducer';

// Custom middleware
import Home from './modules/Home';

const logger = createLogger();

const middleware = [
  thunk,
  !PRODUCTION && logger,
  Home.middleware,
].filter(Boolean);

const store = createStore(
  rootReducer,
  {},
  applyMiddleware(...middleware)
);

export default store;
