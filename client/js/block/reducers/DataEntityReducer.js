// @flow

import {
  updateEntityItem,
  updateEntityItems,
  deleteEntityItem,
  createEntityItem,
} from '../../common/utils/ReducerUtil';
import {
  UPDATE_ITEMS,
  UPDATE_ITEM,
  CREATE_ITEM,
  DELETE_ITEM,
} from '../actions/DataEntityAction';

export function createItemsReducer(name: string): Function {
  return (state: Array<Object> = [], action: Object) => {
    if (name !== action.name) {
      return state;
    }
    switch (action.type) {
    case UPDATE_ITEMS:
      return updateEntityItems(state, action);
    case UPDATE_ITEM:
      return updateEntityItem(state, action);
    case DELETE_ITEM:
      return deleteEntityItem(state, action);
    case CREATE_ITEM:
      return createEntityItem(state, action);
    default:
      return state;
    }
  };
}
