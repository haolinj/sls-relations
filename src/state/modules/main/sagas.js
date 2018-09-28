import { all, takeLatest, call, put } from 'redux-saga/effects';
import mainActions from './actions';
import fp from 'lodash/fp';

const apiServerUrl = process.env.REACT_APP_API_SERVER_URL || 'http://localhost:8001';

export function* handleFetchServices(action) {
  try {
    const services = yield call(fetchServices, action.payload.files);
    const transformed = fp.map(s => ({
      ...s,
      serviceName: s.service.name ? s.service.name : s.service
    }))(services);
    yield put(mainActions.main.fetchServicesSuccess(transformed));
  }
  catch (err) {
    console.error(err);
  }
}

const fetchServices = (files) => {
  const formData = new FormData();
  fp.convert({ cap: false }).forEach((f, i) => {
    formData.append(`files-${i}`, f, f.name);
  })(files);

  return fetch(`${apiServerUrl}/services`,
    {
      method: 'POST',
      body: formData
    })
    .then(response => response.json());
};

function* configSagas() {
  yield all([
    takeLatest(mainActions.main.fetchServices().type, handleFetchServices)
  ]);
}

export default configSagas;
