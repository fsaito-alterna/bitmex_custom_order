// @flow
import {assert} from '../../supports/Assert';
import {createMockStore} from '../../TestHelper';
import {importSetup as importSuperAgentSetup} from '../../supports/SuperAgentTestCase';
import {
  indexItems,
  showItem,
  createItem,
  updateItem,
  deleteItem,
  UPDATE_ITEMS,
  UPDATE_ITEM,
  CREATE_ITEM,
  DELETE_ITEM,
} from '../../../../client/js/block/actions/DataEntityAction';

describe('DataEntityAction', () => {
  importSuperAgentSetup();

  describe('indexItems', () => {
    it('should GET items and dispatch UPDATE_ITEMS', function(done) {
      this.superAgentMock.get('/api/blocks', () => {
        return {
          body: [{
            _id: 'id0',
            data: {
            },
          }],
        };
      });
      const expected = [{
        name: 'col0',
        type: UPDATE_ITEMS,
        items: [{
          _id: 'id0',
          data: {
          },
        }],
      }];
      const store = createMockStore({});
      store.dispatch(indexItems('col0'))
        .then(() => {
          assert.deepStrictEqual(store.getActions(), expected);
          done();
        });
    });
  });

  describe('showItem', () => {
    it('should GET item and dispatch UPDATE_ITEMS', function(done) {
      this.superAgentMock.get('/api/blocks/id0', () => {
        return {
          body: {
            _id: 'id0',
            data: {
            },
          },
        };
      });
      const expected = [{
        name: 'col0',
        type: UPDATE_ITEMS,
        items: [{
          _id: 'id0',
          data: {
          },
        }],
      }];
      const store = createMockStore({});
      store.dispatch(showItem('col0', 'id0'))
        .then(() => {
          assert.deepStrictEqual(store.getActions(), expected);
          done();
        });
    });
  });

  describe('createItem', () => {
    it('should POST and dispatch CREATE_ITEM', function(done) {
      this.superAgentMock.post('/api/blocks', ({body}) => {
        assert.deepStrictEqual(body, {_id: 'id0', data: {f0: 'v0'}});
        return {
          body,
        };
      });
      const expected = [{
        name: 'col0',
        type: CREATE_ITEM,
        item: {
          _id: 'id0',
          data: {f0: 'v0'},
        },
      }];
      const store = createMockStore({});
      store.dispatch(createItem('col0', {_id: 'id0', data: {f0: 'v0'}}))
        .then(() => {
          assert.deepStrictEqual(store.getActions(), expected);
          done();
        });
    });
  });

  describe('updateItem', () => {
    it('should PUT and dispatch UPDATE_ITEM', function(done) {
      this.superAgentMock.put('/api/blocks/id0', ({body}) => {
        assert.deepStrictEqual(body, {data: {f0: 'v0'}});
        return {
          body,
        };
      });
      const expected = [{
        name: 'col0',
        type: UPDATE_ITEM,
        item: {data: {f0: 'v0'}},
      }];
      const store = createMockStore({});
      store.dispatch(updateItem('col0', 'id0', {data: {f0: 'v0'}}))
        .then(() => {
          assert.deepStrictEqual(store.getActions(), expected);
          done();
        });
    });
  });

  describe('deleteItem', () => {
    it('should DELETE and dispatch DELETE_ITEM', function(done) {
      this.superAgentMock.del('/api/blocks/id0', () => {
        return {};
      });
      const expected = [{
        name: 'col0',
        type: DELETE_ITEM,
        id: 'id0',
      }];
      const store = createMockStore({});
      store.dispatch(deleteItem('col0', 'id0'))
        .then(() => {
          assert.deepStrictEqual(store.getActions(), expected);
          done();
        });
    });
  });
});
