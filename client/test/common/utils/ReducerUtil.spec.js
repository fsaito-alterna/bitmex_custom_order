// @flow
import {assert} from '../../supports/Assert';

import '../../TestHelper';
import {
  createReducer,
  updateEntityItem,
  updateEntityItems,
  deleteEntityItem,
  createEntityItem,
} from '../../../../client/js/common/utils/ReducerUtil';

describe('SchemaFormUtil', () => {
  describe('createReducer', () => {
    it('', () => {
      const reducer = createReducer(0, {
        action0: (state, action) => {
          return action.value;
        },
      });
      assert(reducer(undefined, {type: 'action0', value: 2}) === 2);
      assert(reducer(undefined, {type: 'bad_action', value: 2}) === 0);
    });
  });

  const state = [
    {_id: 'id0', v: 0},
    {_id: 'id1', v: 1},
  ];

  describe('updateEntityItem', () => {
    it('', () => {
      assert.deepStrictEqual(updateEntityItem(state, {item: {_id: 'id0', v: 1}}), [
        {_id: 'id0', v: 1},
        {_id: 'id1', v: 1},
      ]);
      assert.deepStrictEqual(updateEntityItem(state, {item: {_id: 'none', v: 1}}), [
        {_id: 'id0', v: 0},
        {_id: 'id1', v: 1},
      ]);
    });
  });

  describe('updateEntityItems', () => {
    it('', () => {
      assert.deepStrictEqual(updateEntityItems(state, {items: [{_id: 'id0', v: 1}]}), [
        {_id: 'id0', v: 1},
      ]);
    });
  });

  describe('deleteEntityItem', () => {
    it('', () => {
      assert.deepStrictEqual(deleteEntityItem(state, {id: 'id0'}), [
        {_id: 'id1', v: 1},
      ]);
    });
  });

  describe('createEntityItem', () => {
    it('', () => {
      assert.deepStrictEqual(createEntityItem(state, {item: {_id: 'id2', v: 2}}), [
        {_id: 'id2', v: 2},
        {_id: 'id0', v: 0},
        {_id: 'id1', v: 1},
      ]);
    });
  });
});
