// @flow
import {t} from 'i18next';
import _ from 'lodash';
import ice from 'icepick';

import LocaleHelper from '../../common/utils/LocaleHelper';

class BlockUtil {
  static blockTableSchema(): Object {
    return {
      type: 'object',
      properties: {
        price: {
          type: 'string',
          'x-title': {
            [LocaleHelper.lang]: t('Orders.price'),
          },
        },
        nanj: {
          type: 'string',
          'x-title': {
            [LocaleHelper.lang]: t('Orders.nanj'),
          },
        },
        btc: {
          type: 'string',
          'x-title': {
            [LocaleHelper.lang]: t('Orders.btc'),
          },
        },
      },
      required: [],
      'x-field-order': [
        'price',
        'nanj',
        'btc'
      ],
      'x-fieldset-map': {},
    };
  }

  static dogeTableSchema(): Object {
    return {
      type: 'object',
      properties: {
        price: {
          type: 'string',
          'x-title': {
            [LocaleHelper.lang]: t('Orders.price'),
          },
        },
        nanj: {
          type: 'string',
          'x-title': {
            [LocaleHelper.lang]: t('Orders.nanj'),
          },
        },
        btc: {
          type: 'string',
          'x-title': {
            [LocaleHelper.lang]: t('Orders.doge'),
          },
        },
      },
      required: [],
      'x-field-order': [
        'price',
        'nanj',
        'btc'
      ],
      'x-fieldset-map': {},
    };
  }

  static getTitle(schema: Object): ?string {
    return _.get(schema, `title.${LocaleHelper.lang}`);
  }

  static getDescription(schema: Object): ?string {
    return _.get(schema, `description.${LocaleHelper.lang}`);
  }

  static createFormFields(base: Object): Object {
    if (_.isEmpty(base)) {
      return base;
    }
    return ice.merge(base, {
      title: this.getTitle(base),
      description: this.getDescription(base),
      preferences: JSON.stringify(base.preferences, undefined, 2),
      input: JSON.stringify(base.input, undefined, 2),
      output: JSON.stringify(base.output, undefined, 2),
    });
  }

  static typeCheck(key: string, value: any): boolean {
    const type = this.blockTableSchema().properties[`${key}`].type;
    if (type === 'string') {
      return _.isString(value);
    } else if (type === 'number') {
      return _.isNumber(value);
    }
    return true;
  }

  static validateRequired(json: Object) {
    const fields = this.createFormFields(json);
    return _.map(this.blockTableSchema().required, (key) => {
      const value = fields[`${key}`];
      if (!value || !this.typeCheck(key, value)) {
        return {key, result: false}
      }
      return {key, result: true}
    });
  }

  static setRegisterXHiddenSchemaForm(schemaForm: Array<Object>): Array<Object> {
    return _.map(schemaForm, (schema) => {
      if (schema.key === 'version') {
        return ice.setIn(schema, ['x-hidden'], true);
      }
      return schema;
    });
  }

  static setTableXHiddenSchemaForm(schemaForm: Array<Object>): Array<Object> {
    return _.map(schemaForm, (schema) => {
      if (schema.key === 'toolId' ||
          schema.key === 'preferences' ||
          schema.key === 'executor' ||
          schema.key === 'input' ||
          schema.key === 'output') {
        return ice.setIn(schema, ['x-hidden'], true);
      }
      return schema;
    });
  }
}

export default BlockUtil;
