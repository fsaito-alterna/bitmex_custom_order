// @flow
import {assert} from '../../../supports/Assert';

import '../../../TestHelper';
import DataEntity from '../../../../../client/js/common/utils/entities/DataEntity';

const dataEntity = {
  _id: '58298709270000ae96658b71',
  owner: '581f36e5270000827063b15c',
  sections: ['base/global/c0/s0/'],
  createdAt: '2016-11-14T09:42:33+00:00',
  updatedAt: '2016-11-22T08:23:07+00:00',
  version: 9,
  data: {
    'base_-child': {
      f0: 'f0_v',
    },
  },
};

describe('DataEntity', () => {
  describe('getBase', () => {
    it('', () => {
      const v = DataEntity.getBase(dataEntity);
      assert(v === 'base/global/c0/s0/');
    });
  });

  describe('fromSchemaData', () => {
    describe('when it has prefix', () => {
      it('', () => {
        const v = DataEntity.fromSchemaData({'base_-child/f0': 'f0_v'});
        assert.deepStrictEqual(v, {'base_-child': {f0: 'f0_v'}});
      });
    });

    describe('when it doesn\'t have prefix', () => {
      it('', () => {
        const v = DataEntity.fromSchemaData({'f0': 'f0_v'});
        assert.deepStrictEqual(v, {f0: 'f0_v'});
      });
    });
  });
});
