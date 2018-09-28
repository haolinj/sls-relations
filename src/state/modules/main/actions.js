import { createActions } from 'redux-actions';

const actions = createActions({
  MAIN: {
    FETCH_SERVICES: (files) => ({ files }),
    FETCH_SERVICES_SUCCESS: (services) => ({ services })
  }
});

export default actions;
