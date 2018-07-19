/*
#    FormFieldStringifier.js
#    Copyright(c) 2017 ACCESS CO., LTD.
#    All rights are reserved by ACCESS CO., LTD., whether the whole or
#    part of the source code including any modifications.
*/
// @flow
import _ from 'lodash';

import FormFieldIterator from './FormFieldIterator';
import type {ValueWithContinue} from './FormFieldIterator'; // eslint-disable-line no-duplicate-imports

class FormFieldStringifier {
  static deepStringify(value: Object, schema: Object, schemaForm: Object, baseFieldId: string): ?string {
    const [str] = FormFieldIterator.iterateField('', schemaForm, 0, {}, {
      value,
      schema,
      baseFieldId,
      iteratee: _.bind(FormFieldStringifier._stringifyOne, FormFieldStringifier),
    });
    if (str === ' ') {
      return null;
    }
    return str;
  }

  static stringify(fieldValue: any, formField: Object, targetSchema: ?Object): string {
    if (_.isUndefined(fieldValue) || !targetSchema || formField.xSkipStringify) {
      return '';
    }
    const stringifiers = [
      {
        matches: this._matchSelect,
        stringify: this._stringifyAsSelect,
      },
      {
        matches: this._matchNumber,
        stringify: this._stringifyAsNumber,
      },
      {
        matches: this._matchText,
        stringify: this._stringifyAsText,
      },
    ];
    if (formField.xStringify) {
      return formField.xStringify(fieldValue, formField, targetSchema);
    }
    const found = _.find(stringifiers, stringifier => stringifier.matches(fieldValue, formField, targetSchema));
    if (found) {
      return found.stringify(fieldValue, formField, targetSchema);
    }
    if (targetSchema.type === 'object') {
      return '';
    }
    console.warn('Missing stringifier', fieldValue, formField, targetSchema);
    return '';
  }

  static _stringifyOne(acc: string, fieldValue: any, formField: Object, targetSchema: ?Object): ValueWithContinue {
    const str = this.stringify(fieldValue, formField, targetSchema);
    return [`${acc} ${str || ''}`, true];
  }

  static _matchText(fieldValue: any, formField: Object, targetSchema: Object): boolean {
    return targetSchema.type === 'string';
  }

  static _matchNumber(fieldValue: any, formField: Object, targetSchema: Object): boolean {
    return targetSchema.type === 'number';
  }

  static _matchSelect(fieldValue: any, formField: Object, targetSchema: Object): boolean {
    return _.has(targetSchema, 'enum') || _.has(targetSchema, 'items') || targetSchema.type === 'boolean';
  }

  static _stringifyAsText(fieldValue: string, formField: Object, targetSchema: Object): string {
    return fieldValue || '';
  }

  static _stringifyAsNumber(fieldValue: number, formField: Object, targetSchema: Object): string {
    return `${fieldValue}`;
  }

  static _stringifyAsSelect(fieldValue: string | Array<string> | boolean | number | Array<number>, formField: Object, targetSchema: Object): string {
    if (_.isArray(fieldValue)) {
      const strs = _.map(fieldValue, (value) => {
        return _.get(formField, `titleMap.${((value: any): string)}`, '');
      });
      return strs.join(' ');
    }
    return _.get(formField, `titleMap.${((fieldValue: any): string)}`, '');
  }
}

export default FormFieldStringifier;
