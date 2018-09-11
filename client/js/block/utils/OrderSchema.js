// @flow
import {t} from 'i18next';
import _ from 'lodash';
import ice from 'icepick';

import LocaleHelper from '../../common/utils/LocaleHelper';

class OrderSchema {
  static getSchema(): Object {
    return {
      type: 'object',
      properties: {
        lossLimit: {
          type: 'number',
          'x-title': {
            [LocaleHelper.lang]: t('Order.lossLimit'),
          },
        },
        profitLimit: {
          type: 'number',
          'x-title': {
            [LocaleHelper.lang]: t('Order.profitLimit'),
          },
        },
        amount: {
          type: 'number',
          'x-title': {
            [LocaleHelper.lang]: t('Order.amount'),
          },
        },
        price: {
          type: 'number',
          'x-title': {
            [LocaleHelper.lang]: t('Order.price'),
          },
        },
      },
      required: [],
      'x-field-order': [
        'lossLimit',
        'profitLimit',
        'amount',
        'price',
      ],
      'x-fieldset-map': {},
    };
  }
}

export default OrderSchema;
