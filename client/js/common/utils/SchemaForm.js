/*
 * Copyright(c) 2016 ACCESS CO., LTD. All rights reserved.
 */
import _ from 'lodash';
import i18n from 'i18next';

import Schema from './Schema';

// titleMap = [{name, value}, ...] | {[value]: name, ...}
class TitleMap {
  static getNameByValue(titleMap, value) {
    if (_.isArray(titleMap)) {
      return _.result(_.find(titleMap, {value: value}), 'name');
    }
    return titleMap[value];
  }

  static makeFromDodaiItems(items, displayNameFieldId, sortKeyFieldId = undefined) {
    const sortedItems = _.isUndefined(sortKeyFieldId) ? items : _.sortBy(items, sortKeyFieldId);
    const titleMap = _.map(sortedItems, (item) => {
      return {
        name: _.get(item, displayNameFieldId, ''),
        value: item._id,
      };
    });
    return titleMap;
  }

  static getValueTypeForTitleMap(schema) {
    if (schema.type === 'array' && _.isObject(schema.items)) {
      return schema.items.type;
    }
    return schema.type;
  }

  static toArray(titleMap, schema) {
    if (_.isArray(titleMap)) {
      return titleMap;
    }
    const valueType = TitleMap.getValueTypeForTitleMap(schema);
    if (valueType === 'number' || valueType === 'integer' || valueType === 'boolean') {
      return _.map(titleMap, (name, value) => {
        return {name: name, value: JSON.parse(value)};
      });
    }
    return _.map(titleMap, (name, value) => {
      return {name: name, value: value};
    });
  }
}

class ValidityMap {
  static hasError(validityMap) {
    return _.some(validityMap, (validity) => {
      return _.get(validity, 'valid') === false;
    });
  }
}

// schemaForm = [formFieldOrKey, ...]
// formFieldOrKey = key | formField
// formField = {key, title, titleMap, ...}

class SchemaForm {
  static getDefaultFormType(schema) {
    switch (schema.type) {
    case 'string':
      if (schema.enum) {
        return 'select';
      }
      return 'text';
    case 'number':
    case 'integer':
      return 'number';
    case 'boolean':
      return 'checkbox';
    case 'object':
      return 'fieldset';
    case 'array':
      if (_.has(schema, 'items.enum')) {
        return 'checkboxes';
      }
      return 'array';
    default:
      console.assert(false, 'never reach here', schema);
      return 'x-unknown';
    }
  }

  static inheritFormFieldX(formFieldOrKey, targetSchema) {
    const formField = {};
    _.assign(formField, _.get(targetSchema, 'x-schema-form'));
    _.assign(formField, _.isString(formFieldOrKey) ? {key: formFieldOrKey} : formFieldOrKey);
    if (!_.has(formField, 'type')) {
      const type = SchemaForm.getDefaultFormType(targetSchema);
      _.assign(formField, {type: type});
    }
    return formField;
  }

  static inheritFormField(formFieldOrKey, schema) {
    const fieldKey = _.isString(formFieldOrKey) ? formFieldOrKey : formFieldOrKey.key;
    if (!_.isString(fieldKey)) {
      // no key. for section, fieldset
      return {formField: formFieldOrKey, targetSchema: null};
    }
    const schemaPath = Schema.makeSchemaPath(fieldKey);
    const targetSchema = _.get(schema, schemaPath);
    console.assert(_.isObject(targetSchema), 'Not found target schema. ', formFieldOrKey, schema);
    const formField = SchemaForm.inheritFormFieldX(formFieldOrKey, targetSchema);
    return {formField, targetSchema};
  }

  static getTitle(collection, key) {
    return i18n.t(`schemaForm#${collection}#${key}#title`, {keySeparator: '#'});
  }

  static getXCheckboxTitle(collection, key) {
    return i18n.t(`schemaForm#${collection}#${key}#xCheckboxTitle`, {keySeparator: '#'});
  }

  static getTitleMap(collection, key) {
    const titleMap = i18n.t(`schemaForm#${collection}#${key}#titleMap`, {keySeparator: '#', returnObjects: true});
    if (_.isObject(titleMap)) {
      return titleMap;
    }
    return undefined;
  }

  static getI18NMap(collection, key) {
    // title, xCheckboxTitle, titleMap, placeholder, description
    const i18nMap = i18n.t(`schemaForm#${collection}#${key}`, {keySeparator: '#', returnObjects: true});
    if (_.isObject(i18nMap)) {
      return i18nMap;
    }
    return undefined;
  }

  static flattenX(schemaForm) {
    return _.map(schemaForm, (formFieldOrKey) => {
      if (_.isObject(formFieldOrKey)) {
        if (_.isArray(formFieldOrKey.items)) {
          // section, fieldset
          return SchemaForm.flattenX(formFieldOrKey.items);
        }
      }
      return formFieldOrKey;
    }, []);
  }

  static flatten(schemaForm) {
    return _.flattenDeep(SchemaForm.flattenX(schemaForm));
  }

  static getKey(formFieldOrKey) {
    return _.isString(formFieldOrKey) ? formFieldOrKey : formFieldOrKey.key;
  }

  static makeSchemaForm(collection, formFieldOrKeys, commonFormField = {}) {
    return _.map(formFieldOrKeys, (formFieldOrKey) => {
      const formField = _.clone(commonFormField);
      if (_.isString(formFieldOrKey)) {
        _.assign(formField, {key: formFieldOrKey});
      } else {
        _.assign(formField, formFieldOrKey);
        if (formField.items) {
          formField.items = SchemaForm.makeSchemaForm(collection, formField.items, commonFormField);
        }
      }
      const key = formField.key;
      if (!_.isString(key)) {
        // section, fieldset
        return formField;
      }
      const i18nMap = SchemaForm.getI18NMap(collection, key);
      if (_.isObject(i18nMap)) {
        _.defaults(formField, i18nMap);
      }
      return formField;
    });
  }

  static join(self, other, prefix) {
    const cloned = _.map(other, (formFieldOrKey) => {
      if (_.isString(formFieldOrKey)) {
        return `${prefix}${formFieldOrKey}`;
      }
      if (!_.isString(formFieldOrKey.key)) {
        // section, fieldset
        return formFieldOrKey;
      }
      const formField = _.clone(formFieldOrKey);
      formField.key = `${prefix}${formField.key}`;
      return formField;
    });
    return [].concat(self, cloned);
  }

  static map(schemaForm, iteratee) {
    return _.map(schemaForm, (formFieldOrKey) => {
      if (_.isObject(formFieldOrKey)) {
        if (_.isArray(formFieldOrKey.items)) {
          // section, fieldset
          const items = SchemaForm.map(formFieldOrKey.items, iteratee);
          return _.assign({}, formFieldOrKey, {items: items});
        }
      }
      return iteratee(formFieldOrKey);
    });
  }
}

SchemaForm.TitleMap = TitleMap;
SchemaForm.ValidityMap = ValidityMap;

export default SchemaForm;
