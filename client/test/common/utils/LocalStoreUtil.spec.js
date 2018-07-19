// @flow
import sinon from 'sinon';
import {combineReducers} from 'redux';

import {assert} from '../../supports/Assert';
import '../../TestHelper';
import LocalStoreUtil from '../../../../client/js/common/utils/LocalStoreUtil';

describe('LocalStoreUtil', () => {
  beforeEach(() => {
    LocalStoreUtil._registerd = {};
  });

  describe('appendLocakKey', () => {
    it('', () => {
      const res0 = LocalStoreUtil.appendLocakKey('ACTION0', 'key0');
      assert(res0 === 'local/key0/ACTION0');
      const res1 = LocalStoreUtil.appendLocakKey('ACTION0', undefined);
      assert(res1 === 'ACTION0');
    });
  });

  describe('connect', () => {
    it('should register', () => {
      LocalStoreUtil.connect({key: 'key0'});
      assert.deepStrictEqual(LocalStoreUtil._registerd, {key0: {}});
    });
  });

  describe('_wrapReducer', () => {
    let target;
    let spy;

    beforeEach(() => {
      target = {
        reducer: (state = {f0: 'default'}, action) => {
          if (action.type === 'ACTION0') {
            return {f0: 'chnaged'};
          }
          return state;
        },
      };
      spy = sinon.spy(target, 'reducer');
    });

    afterEach(() => {
      target.reducer.restore();
    });

    describe('when action.type is global', () => {
      it('should call wrapped function with "ignore" type', () => {
        const wrapped = LocalStoreUtil._wrapReducer(target.reducer, 'key0');
        assert.deepStrictEqual(wrapped({f0: 'sent'}, {type: 'ACTION0'}), {f0: 'sent'});
        assert.deepStrictEqual(spy.args[0], [{f0: 'sent'}, {type: 'ignore/ACTION0'}]);
      });
    });

    describe('when action.type is another key', () => {
      it('should call wrapped function with "ignore" type', () => {
        const wrapped = LocalStoreUtil._wrapReducer(target.reducer, 'key0');
        assert.deepStrictEqual(wrapped({f0: 'sent'}, {type: 'local/another_key/ACTION0'}), {f0: 'sent'});
        assert.deepStrictEqual(spy.args[0], [{f0: 'sent'}, {type: 'ignore/local/another_key/ACTION0'}]);
      });
    });

    describe('when action.type matches key', () => {
      it('should call wrapped function with global name type', () => {
        const stub = sinon.stub().returns({f0: 1});
        const wrapped = LocalStoreUtil._wrapReducer(stub, 'key0');
        assert.deepStrictEqual(wrapped({f0: 0}, {type: 'local/key0/ACTION0'}), {f0: 1});
        assert.deepStrictEqual(stub.args[0], [{f0: 0}, {type: 'ACTION0'}]);
      });
    });

    describe('when action.type matches redux build-in action type', () => {
      it('should call wrapped function with original type', () => {
        const stub = sinon.stub().returns({f0: 1});
        const wrapped = LocalStoreUtil._wrapReducer(stub, 'key0');
        assert.deepStrictEqual(wrapped(undefined, {type: '@@redux/INIT'}), {f0: 1});
        assert(stub.called);
        assert.deepStrictEqual(stub.args[0], [undefined, {type: '@@redux/INIT'}]);
      });
    });
  });

  describe('addLocalStore', () => {
    describe('when action.type is local action', () => {
      it('should change only local field', () => {
        LocalStoreUtil.connect({key: 'key0'});
        const recuders = {
          stateField0: (state = {f0: 'default'}, action) => {
            if (action.type === 'ACTION0') {
              return {f0: 'chnaged'};
            }
            return state;
          },
        };
        const reducersWithLocal = LocalStoreUtil.addLocalStore(recuders);
        const combined = combineReducers(reducersWithLocal);
        const res = combined({}, {type: 'local/key0/ACTION0'});
        assert.deepStrictEqual(res, {
          stateField0: {
            f0: 'default',
          },
          local: {
            key0: {
              stateField0: {
                f0: 'chnaged',
              },
            },
          },
        });
      });
    });

    describe('when action.type is global action', () => {
      it('should update only global field', () => {
        const comp = {};
        assert.deepStrictEqual(LocalStoreUtil.connect({key: 'key0'})(comp), comp);
        const recuders = {
          stateField0: (state = {f0: 'default'}, action) => {
            if (action.type === 'ACTION0') {
              return {f0: 'chnaged'};
            }
            return state;
          },
        };
        const reducersWithLocal = LocalStoreUtil.addLocalStore(recuders);
        const combined = combineReducers(reducersWithLocal);
        const res = combined({}, {type: 'ACTION0'});
        assert.deepStrictEqual(res, {
          stateField0: {
            f0: 'chnaged',
          },
          local: {
            key0: {
              stateField0: {
                f0: 'default',
              },
            },
          },
        });
      });
    });
  });
});
