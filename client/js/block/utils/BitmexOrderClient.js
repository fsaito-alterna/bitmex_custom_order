/*
 * Copyright(c) 2016 ACCESS CO., LTD. All rights reserved.
 */
/* eslint-disable */
import _ from 'lodash';
import bluebird from 'bluebird';

import HTTPHelper from '../../common/utils/HTTPHelper';

const request = HTTPHelper.request;

const LIMIT = 1000;

let handleLoginStatusError = () => {
  console.log('user is not login status');
};

function handleCredencialError(e) {
  if (_.get(e, 'status') === 401) {
    const json = _.get(e, 'res.text');
    try {
      const errBody = JSON.parse(json);
      const code = _.get(errBody, 'code');
      if (code === '401-00' || code === '401-02') {
        handleLoginStatusError();
        return;
      }
    } catch (parseError) {
      console.log('failed to parse error response', parseError);
    }
  }
  throw e;
}

class BaseClient {
  constructor(settings = {}) {
    this._domain = settings.domain || '';
    this._settings = settings;
  }
}

class BitmexClient extends BaseClient {
  constructor(settings = {}) {
    super(settings);
  }

  getURL() {
    const url = `https://nh5d83ot80.execute-api.ap-northeast-1.amazonaws.com/prod`;
    return url;
  }

  send(data) {
    return request
    .post(this.getURL())
    .send(data)
    .then((res) => {
      return res.body;
    });
  }
}

class BitmexOrderClient {
  static get BitmexClient() {
    return BitmexClient;
  }

  static setHandleLoginStatusError(handler) {
    handleLoginStatusError = handler;
  }
}

export default BitmexOrderClient;
