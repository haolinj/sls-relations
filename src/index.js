import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import rootSaga from './state/rootSaga';
import { ConnectedRouter } from 'react-router-redux';
import store, { history } from './state/store';
import Routes from './routes';

rootSaga.run();

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Routes />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);
