/*
 * Copyright(c) 2016 ACCESS CO., LTD. All rights reserved.
 */
import _ from 'lodash';

class CustomFieldUtil {
  static getBsStyleByValidity(validity) {
    const valid = _.get(validity, 'valid');
    if (valid === false) {
      return 'error';
    } else if (valid === true) {
      return 'success';
    }
    return undefined;
  }

  static getBsClassNameByValidity(validity) {
    const valid = _.get(validity, 'valid');
    if (valid === false) {
      return 'has-error';
    } else if (valid === true) {
      return 'has-success';
    }
    return undefined;
  }

  static isValid(schema, value) {
    // minimum implementation
    if (_.isUndefined(value)) {
      if (schema.required) {
        return false;
      }
    } else if (schema.enum) {
      if (!_.includes(schema.enum, value)) {
        return false;
      }
    }
    return true;
  }

  static getValidity(schema, value) {
    const valid = CustomFieldUtil.isValid(schema, value);
    return {valid: valid};
  }

  static genericShouldComponentUpdate(prevProps, prevState, nextProps, nextState) {
    const omittedPropKeys = ['baseValue'];
    const omittedPrevProps = _.omit(prevProps, omittedPropKeys);
    const omittedNextProps = _.omit(nextProps, omittedPropKeys);
    const isEqual = _.isEqual(omittedPrevProps, omittedNextProps) && _.isEqual(prevState, nextState);
    if (!isEqual && omittedPrevProps.onChange !== omittedNextProps.onChange) {
      console.info('If onChange are same instance to each other, the efficiency will be better.');
    }
    return !isEqual;
  }
}

export default CustomFieldUtil;
