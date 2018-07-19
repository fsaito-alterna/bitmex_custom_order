// @flow
import _ from 'lodash';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import {LocalStorage} from 'node-localstorage';

global.appConfig = {
  limitQueryMax: 1000,
  appKey: 'akey_test',
};

global.localStorage = new LocalStorage('./tmp');
global.localStorage.clear();
global.USE_FREEZED_STORE = true;

beforeEach(function() {
  this.appConfigOrig = _.cloneDeep(appConfig);
});

afterEach(function() {
  appConfig = this.appConfigOrig;
});

export function createMockStore(opt: Object = {}): Object {
  const middlewares = [thunk];
  const mockStore = configureMockStore(middlewares);
  return mockStore(_.assignIn({
  }, opt));
}
