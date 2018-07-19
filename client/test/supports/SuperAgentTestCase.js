// @flow
import superagent from 'superagent-bluebird-promise';
import mocker from 'superagent-mocker';

export function importSetup() {
  beforeEach(function() {
    this.superAgentMock = mocker(superagent);
  });

  afterEach(function() {
    this.superAgentMock.clearRoutes();
  });
}
