import { handleActions } from 'redux-actions';
import mainActions from './actions';

export const initialState = {
  services: []
};

const reducer = handleActions(
  {
    [mainActions.main.fetchServicesSuccess]: (state, action) => ({
      ...state,
      services: action.payload.services
    })
  },
  {
    ...initialState
  }
);

export default reducer;
