// @flow
/* eslint import/no-unresolved: 0 */
import sinon from 'sinon';
import {fn as momentProto} from 'moment';

export function importFixTimeSetup() {
  const sandbox = sinon.sandbox.create();

  beforeEach(() => {
    sandbox.stub(momentProto, 'year', () => {
      return 2016;
    });
    sandbox.stub(momentProto, 'month', () => {
      return 10;
    });
    sandbox.stub(momentProto, 'date', () => {
      return 1;
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
}
