// @flow
import _ from 'lodash';

export function createReducer(initialState: any, handlers: Object): Function {
  return (state: any = initialState, action: Object): any => {
    if (handlers[action.type]) {
      return handlers[action.type](state, action);
    }
    return state;
  };
}

export function updateEntityItem(state: Array<Object>, action: Object): Array<Object> {
  return _.map(state, (item) => {
    if (item._id === action.item._id) {
      return action.item;
    }
    return item;
  });
}

export function updateEntityItems(state: Array<Object>, action: Object): Array<Object> {
  return action.items;
}

export function deleteEntityItem(state: Array<Object>, action: Object): Array<Object> {
  return _.filter(state, (item) => {
    if (!item._id) {
      return item.id !== action.id;
    }
    return item._id !== action.id;
  });
}

export function createEntityItem(state: Array<Object>, action: Object): Array<Object> {
  return [action.item].concat(state);
}
