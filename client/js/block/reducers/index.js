// @flow
import {combineReducers} from 'redux';
import reduceReducers from 'reduce-reducers';

import LocalStoreUtil from '../../common/utils/LocalStoreUtil';
import * as DataEntityReducer from './DataEntityReducer';

const reducers = {
  btcs: DataEntityReducer.createItemsReducer('btc'),
  doges: DataEntityReducer.createItemsReducer('doge'),
};

export function createRootReducer(): Function {
  const reducersWithLocal = LocalStoreUtil.addLocalStore(reducers);

  return reduceReducers(
    combineReducers(reducersWithLocal),
    (state: Object = {}, action: Object) => {
      return {
        ...state,
      };
    },
  );
}
