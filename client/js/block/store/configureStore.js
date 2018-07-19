// @flow
import {createStore, applyMiddleware, compose} from 'redux';
import thunkMiddleware from 'redux-thunk';
import freezeMiddleware from 'redux-freeze';

import {createRootReducer} from '../reducers';

export default function configureStore(initialState: ?Object): Object {
  const middlewares = [thunkMiddleware].concat(USE_FREEZED_STORE ? [freezeMiddleware] : []);
  return createStore(
    createRootReducer(),
    initialState,
    compose(
      applyMiddleware(...middlewares),
      window.devToolsExtension ? window.devToolsExtension() : f => f,
    ),
  );
}
