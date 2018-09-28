import { persistCombineReducers } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { routerReducer } from 'react-router-redux';
import * as reducers from './modules';

const config = {
  key: 'primary',
  storage,
  whitelist: ['nothing-stores-here']
};

export default persistCombineReducers(config, {
  ...reducers,
  routing: routerReducer
});
