import Order from './Utils/exchange/order';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Routes from './routes';
import { AppContainer   } from 'react-hot-loader';

import './index.css';

import { Provider  } from 'react-redux';
import Store from './store';

const render = (Component:any) => {
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
