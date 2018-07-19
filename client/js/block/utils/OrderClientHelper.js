// @flow

import CEOrderClient from './CEOrderClient';

CEOrderClient.setHandleLoginStatusError(() => {
  // If user is not logging status, redirect to login page
  // localStorage.removeItem('token');
  // localStorage.removeItem('tokenExpiresAt');
  // window.location.href = '/login';
});

class OrderClientHelper {
  static createDataEntityClient(): Object {
    const setting = this._setting;
    return new CEOrderClient.CEClient(setting);
  }

  static get _setting(): Object {
    return {
      hookQuery: this._hookQuery,
      version: '',
      domain: appConfig.domain || undefined,
    };
  }

  static _hookQuery(query: ?Object): ?Object {
    return query;
  }
}

export default OrderClientHelper;
