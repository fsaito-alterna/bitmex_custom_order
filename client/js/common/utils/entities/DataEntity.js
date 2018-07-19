// @flow
import _ from 'lodash';
import i18n from 'i18next';

import LocaleHelper from '../LocaleHelper';
import SchemaFormUtil from '../SchemaFormUtil';

class DataEntity {
  static getRootValue(entity: Object, name: string, type: string, dataPath: string = 'data.'): ?any {
    return _.get(entity, `${dataPath}${type}.${name}`);
  }

  static getBase(entity: Object): string {
    return entity.sections[0]; // TODO
  }

  // use this for $set(item update)
  // $set can treat '.' as nexted data
  static schemaDataToUpdateBody(data: Object): Object {
    return _.reduce(data, (m, v, k) => {
      const newKey = k.replace(SchemaFormUtil.splitterText, '.');
      m[newKey] = v;
      return m;
    }, {});
  }

  static getDisabledSchema(): Object {
    return {
      type: 'boolean',
      'x-title': {
        [LocaleHelper.lang]: i18n.t('UserSchema.disabledTitle'),
      },
      default: false, // for creation ui
      'x-schema-form': {
        type: 'radios-inline',
      },
      'x-title-map': {
        [LocaleHelper.lang]: {
          true: i18n.t('common.disable'),
          false: i18n.t('common.enable'),
        },
      },
    };
  }

  // use this for item creation
  static fromSchemaData(data: Object): Object {
    return _.reduce(data, (m, v, k) => {
      const wd = k.split(SchemaFormUtil.splitterText);
      if (wd.length >= 2) {
        console.assert(wd.length === 2);
        const namespace = wd[0];
        const name = wd[1];
        m[namespace] = m[namespace] || {};
        m[namespace][name] = v;
        return m;
      }
      // x-flat schema
      m[k] = v;
      return m;
    }, {});
  }
}

export default DataEntity;
