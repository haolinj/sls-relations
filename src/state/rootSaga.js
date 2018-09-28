import { sagaMiddleware } from './store';
import { mainSagas } from './modules/main';

function run() {
  sagaMiddleware.run(mainSagas);
}

export default { run };
