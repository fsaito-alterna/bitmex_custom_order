// @flow
import _ from 'lodash';
import moment from 'moment';
import i18n from 'i18next';
import i18nXhr from 'i18next-xhr-backend';

import './client.css';

import './AppConfig';
import configureStore from './store/configureStore';
import CERootPageContainer from './containers/CERootPageContainer';
import HTTPHelper from '../common/utils/HTTPHelper';
import LocaleHelper from '../common/utils/LocaleHelper';

appConfig.domain = _.get(window, 'location.origin', 'https://ce-nanj-orders.s3-ap-northeast-1.amazonaws.com');

function initI18nIfNeeded(done: Function) {
  if (_.size(i18n.options) === 0) {
    i18n
      .use(i18nXhr)
      .init({
        lng: LocaleHelper.lang,
        fallbackLng: LocaleHelper.lang,
        backend: {
          loadPath: `${appConfig.domain ? appConfig.domain : ''}/locales/{{lng}}/{{ns}}.json?uniq=${_.random(0, Number.MAX_VALUE)}`,
        },
      }, done);
    moment.locale('ja');
  } else {
    setTimeout(done, 0);
  }
}

function handleHomeLocation(params) {
  return CERootPageContainer.run(params);
}

function main(deps: Object) {
  const store = configureStore();

  initI18nIfNeeded((err: ?Object) => {
    if (err) {
      console.error(err);
      return;
    }
    window.i18n = i18n;

    const params = {
      store,
      deps,
      done: global.testDone || (() => {}),
    };

    // TODO: use page
    switch (window.location.pathname) {
    default:
      handleHomeLocation(params);
    }
  });
}

export default main;
