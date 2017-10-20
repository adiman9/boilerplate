import React from 'react';
import ReactDOM from 'react-dom';

import Routes from './routes';
import { AppContainer   } from 'react-hot-loader';

import './index.css';

import { Provider  } from 'react-redux';
import Store from './store.js';

const render = Component => {
  return ReactDOM.render(
    <AppContainer>
      <Provider store={Store}>
        <Component />
      </Provider>
    </AppContainer>,
    document.getElementById('app')
  );
}

render(Routes);

if(module.hot) {
  module.hot.accept('./routes', () => render(Routes));
}
