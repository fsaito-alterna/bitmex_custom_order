/*
#    FormFieldIterator.js
#    Copyright(c) 2017 ACCESS CO., LTD.
#    All rights are reserved by ACCESS CO., LTD., whether the whole or
#    part of the source code including any modifications.
*/
// @flow
import _ from 'lodash';

import SchemaForm from './SchemaForm';

export type Query = {
  value: Object,
  schema: Object,
  pattern?: string,
  baseFieldId: string,
  iteratee: Function,
}

export type ValueWithContinue = [any, boolean] // [acc, needsContinue]

class FormFieldIterator {
  static iterateFields(aAcc: any, schemaForm: Array<any>, formContext: Object, query: Query): ValueWithContinue {
    return this._iterate(schemaForm, aAcc, (acc, formFieldOrKey, fieldIndex) => {
      return this.iterateField(acc, formFieldOrKey, fieldIndex, formContext, query);
    });
  }

  static iterateField(aAcc: any, formFieldOrKey: string | Object, fieldIndex: number, formContext: Object, query: Query): ValueWithContinue {
    const {formField, targetSchema} = SchemaForm.inheritFormField(formFieldOrKey, query.schema);
    if (formField['x-hidden']) {
      return [aAcc, true];
    }
    const fieldKey = formField.key;
    let itemPath;
    let fieldValue;
    if (_.isString(fieldKey)) {
      if (_.isNumber(formContext.arrayIndex)) {
        const resolvedKey = fieldKey.replace('[]', `.${formContext.arrayIndex}`);
        itemPath = `${query.baseFieldId}${resolvedKey}`;
      } else {
        itemPath = `${query.baseFieldId}${fieldKey}`;
      }
      fieldValue = _.get(query.value, itemPath);
    }
    if (formField.xIsIteratableUnit) {
      return query.iteratee(aAcc, fieldValue, formField, targetSchema, query);
    }
    if (formField.type === 'array') {
      return this._iterate(fieldValue || [], aAcc, (acc, _arrayItem, arrayIndex) => {
        const newContext = _.assign({}, formContext, {arrayIndex});
        return this.iterateFields(acc, formField.items, newContext, query);
      });
    } else if (formField.items) {
      return this.iterateFields(aAcc, formField.items, formContext, query);
    }
    return query.iteratee(aAcc, fieldValue, formField, targetSchema, query);
  }

  static _iterate(col: Object | Array<any>, aAcc: any, iteratee: Function): ValueWithContinue {
    let acc = aAcc;
    let needsContinue = true;
    _.forEach(col, (item, indexOrKey) => {
      [acc, needsContinue] = iteratee(acc, item, indexOrKey);
      return needsContinue;
    });
    return [acc, needsContinue];
  }
}

export default FormFieldIterator;
