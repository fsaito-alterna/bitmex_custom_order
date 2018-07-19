/*
 * Copyright(c) 2016 ACCESS CO., LTD. All rights reserved.
 */
/* eslint-disable */
import _ from 'lodash';

import LocaleHelper from './LocaleHelper';

const getCurrentLocale = LocaleHelper.getCurrentLocale;

const regexpMap = {};

class Schema {
  static getRequired(schema) {
    return _.get(schema, 'required') || false;
  }

  static getDefault(schema) {
    return _.get(schema, 'default');
  }

  static getPropertyIds(data) {
    return _.keys(_.get(data, 'properties'));
  }

  static join(data, other, prefix) {
    console.assert(data.type === 'object');
    console.assert(other.type === 'object');
    const joinedProperties = _.reduce(other.properties, (acc, value, key) => {
      acc[`${prefix}${key}`] = value;
      return acc;
    }, _.clone(data.properties));
    return _.defaults({properties: joinedProperties}, data);
  }

  // 'sections.1' => 'properties.sections.items.1'
  // 'array[]' => 'properties.array.items'
  // NOTE: 'sections[1]' is not supported.
  static makeSchemaPath(fieldId) {
    return _.chain(fieldId.split('.'))
    .map((string) => {
      if (_.isFinite(parseInt(string, 10))) {
        // tuple
        return ['items', string];
      }
      if (string === '[]') {
        // array
        return ['items'];
      }
      if (_.endsWith(string, '[]')) {
        // array
        return ['properties', string.slice(0, -2), 'items'];
      }
      return ['properties', string];
    })
    .flatten()
    .thru((array) => array.join('.'))
    .value();
  }

  static setImmutable(object, path, value) {
    const newObject = _.defaultsDeep(_.set(_.isArray(object) ? [] : {}, path, 'dummy'), object);
    _.set(newObject, path, value);
    return newObject;
  }

  static _isPrunable(value) {
    if (_.isUndefined(value)) {
      return true;
    }
    if (_.isObject(value) && !_.isArray(value) && _.every(value, Schema._isPrunable)) {
      return true;
    }
    return false;
  }

  static _getPrunablePath(object, path) {
    const segments = path.split('.');
    let prunablePath;
    for (let n = _.size(segments); n >= 1; n--) {
      const path2 = _.take(segments, n).join('.');
      const v = _.get(object, path2);
      if (Schema._isPrunable(v)) {
        prunablePath = path2;
      } else {
        break;
      }
    }
    return prunablePath;
  }

  static updateImmutable(object, path, value) {
    const newObject = _.defaultsDeep(_.set(_.isArray(object) ? [] : {}, path, 'dummy'), object);
    _.set(newObject, path, value);
    if (Schema._isPrunable(value)) {
      const prunablePath = Schema._getPrunablePath(newObject, path);
      if (_.isString(prunablePath)) {
        _.set(newObject, prunablePath, undefined);
      }
    }
    return newObject;
  }

  // Parse a date time field.
  //   'YYYY-MM-DDTHH:mm:ss.sssZ' => The number of milliseconds since 00:00:00 UTC on 1 January 1970
  //   undefined => NaN
  // NOTE: We do not use moment(string) because it takes time very much.
  static parseDateTime(value) {
    if (_.isString(value)) {
      // TODO: check by using pattern?
      console.assert(value.length === 24 && value[4] === '-' && value[7] === '-' && value[10] === 'T'
         && value[13] === ':' && value[16] === ':' && value[19] === '.' && value[23] === 'Z', 'Invalid DateTime');
      return Date.parse(value);
    }
    console.assert(_.isUndefined(value), 'Invalid DateTime');
    return NaN;
  }

  static _isInteger(value) {
    return (_.isNumber(value)) && (isFinite(value)) && (Math.floor(value) === value);
  }

  static _isValidNumber(value, schema) {
    if (schema.type === 'integer') {
      if (!Schema._isInteger(value)) {
        return false;
      }
    } else if (schema.type === 'number') {
      if (!_.isNumber(value)) {
        return false;
      }
    } else {
      console.assert(false, 'never reach here');
    }
    if (_.isNumber(schema.minimum)) {
      if (!(value >= schema.minimum)) {
        return false;
      }
    }
    if (_.isNumber(schema.maximum)) {
      if (!(value <= schema.maximum)) {
        return false;
      }
    }
    if (_.isNumber(schema.multipleOf)) {
      const stringOfMultipleOf = schema.multipleOf.toString(10);
      if (stringOfMultipleOf.indexOf('e') !== -1) {
        // FIXME: gave up correction of rounding error...
        if (value % schema.multipleOf !== 0) {
          return false;
        }
      } else {
        const parts = stringOfMultipleOf.split('.');
        if (_.size(parts) === 1) {
          if (value % schema.multipleOf !== 0) {
            return false;
          }
        } else if (_.size(parts) === 2) {
          const n = Math.pow(10, _.size(parts[1]));
          if ((value * n) % (schema.multipleOf * n) !== 0) {
            return false;
          }
        } else {
          console.assert(false, 'never reach here');
        }
      }
    }
    return true;
  }

  static _isValidString(value, schema) {
    if (!_.isString(value)) {
      return false;
    }
    if (_.has(schema, 'pattern')) {
      console.assert(_.isString(schema.pattern));
      if (!_.has(regexpMap, schema.pattern)) {
        regexpMap[schema.pattern] = new RegExp(schema.pattern);
      }
      const regexp = regexpMap[schema.pattern];
      if (!regexp.test(value)) {
        return false;
      }
    }
    if (_.has(schema, 'minLength')) {
      console.assert(_.isNumber(schema.minLength));
      if (!(value.length >= schema.minLength)) {
        return false;
      }
    }
    if (_.has(schema, 'maxLength')) {
      console.assert(_.isNumber(schema.maxLength));
      if (!(value.length <= schema.maxLength)) {
        return false;
      }
    }
    return true;
  }

  static _isValidBoolean(value, schema) {
    if (!_.isBoolean(value)) {
      return false;
    }
    return true;
  }

  static _isValidObject(value, baseSchema, key, schema) {
    if (!_.isObject(value)) {
      return false;
    }
    if (_.has(schema, 'properties')) {
      if (!_.every(schema.properties, (property, name) => Schema.isValid(_.get(value, name), baseSchema, `${key}.${name}`))) {
        return false;
      }
    }
    return true;
  }

  static _isValidArray(value, baseSchema, key, schema) {
    if (!_.isArray(value)) {
      return false;
    }
    if (_.has(schema, 'items')) {
      if (_.isArray(schema.items)) {
        // tuple
        if (!_.every(schema.items, (item, i) => Schema.isValid(_.get(value, i), baseSchema, `${key}.${i}`))) {
          return false;
        }
      } else if (_.isObject(schema.items)) {
        // array
        if (!_.every(value, (arrayItem) => Schema.isValid(arrayItem, baseSchema, `${key}[]`))) {
          return false;
        }
      } else {
        console.assert('never reach here', schema);
      }
    }
    return true;
  }

  static isValid(value, baseSchema, key) {
    const schemaPath = Schema.makeSchemaPath(key);
    const schema = _.get(baseSchema, schemaPath);

    if (_.isUndefined(value)) {
      if (schema.required) {
        return false;
      }
    } else {
      switch (schema.type) {
      case 'integer':
      case 'number':
        if (!Schema._isValidNumber(value, schema)) {
          return false;
        }
        break;
      case 'string':
        if (!Schema._isValidString(value, schema)) {
          return false;
        }
        break;
      case 'boolean':
        if (!Schema._isValidBoolean(value, schema)) {
          return false;
        }
        break;
      case 'object':
        if (!Schema._isValidObject(value, baseSchema, key, schema)) {
          return false;
        }
        break;
      case 'array':
        if (!Schema._isValidArray(value, baseSchema, key, schema)) {
          return false;
        }
        break;
      default:
        console.assert(false, 'not supported', schema);
        break;
      }
      if (schema.enum) {
        if (!_.includes(schema.enum, value)) {
          return false;
        }
      }
    }
    return true;
  }
}
Schema.lang = getCurrentLocale();

export default Schema;
