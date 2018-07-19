// @flow
/* eslint import/no-unresolved: 0 */
import jsdom from 'jsdom';
import i18next from 'i18next';

function initI18n(done: Function) {
  i18next.init({
    lng: 'ja',
    resources: {
      ja: {
        // $FlowNode
        translation: JSON.parse(require('fs').readFileSync('locales/ja/translation.json')), // eslint-disable-line global-require
      },
    },
  }, (_err, t) => {
    done();
  });
}

function setupDom(done: Function) {
  jsdom.env(
    '<html><body><div id="main"></div></body></html>',
    ['http://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js'],
    (err, window) => {
      global.window = window;
      global.document = window.document;
      global.navigator = window.navigator;
      global.$ = window.jQuery;
      global.location = window.location;
      initI18n(done);
    }
  );
}

export function importSetup() {
  beforeEach((done: Function) => {
    setupDom(done);
  });
}

export function dumpTexts($els: Object): Array<string> {
  const jqueryArray = $els.map(function() {
    return $(this).text();
  }).get();
  return [].concat(jqueryArray);  // to pure array
}
