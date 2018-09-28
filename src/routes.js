import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { withRouter } from 'react-router';
import App from './App';
import { persistStore } from 'redux-persist';
import { compose, lifecycle } from 'recompose';

const Routes = ({ rehydrated, }) => (
  <div>
    {
      rehydrated ?
        <Switch>
          <Route path={'/'} component={App} />
        </Switch> : null
    }
  </div>
);

export default compose(
  withRouter,
  lifecycle({
    componentDidMount() {
      const store = require('./state/store');
      persistStore(store.default, null, () => {
        this.setState({ rehydrated: true });
      });
    }
  })
)(Routes);
