// @flow
import {t} from 'i18next';
import _ from 'lodash';
import ice from 'icepick';

import LocaleHelper from '../../common/utils/LocaleHelper';

class SettingSchema {
  static getSchema(): Object {
    return {
      type: 'object',
      properties: {
        apiKey: {
          type: 'string',
          'x-title': {
            [LocaleHelper.lang]: t('Setting.apiKey'),
          },
        },
        apiSecret: {
          type: 'string',
          'x-title': {
            [LocaleHelper.lang]: t('Setting.secretKey'),
          },
        },
      },
      required: [],
      'x-field-order': [
        'apiKey',
        'apiSecret',
      ],
      'x-fieldset-map': {},
    };
  }
}

export default SettingSchema;
