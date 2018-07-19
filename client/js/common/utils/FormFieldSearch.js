/*
#    FormFieldSearch.js
#    Copyright(c) 2017 ACCESS CO., LTD.
#    All rights are reserved by ACCESS CO., LTD., whether the whole or
#    part of the source code including any modifications.
*/
// @flow
import _ from 'lodash';

import FormFieldIterator from './FormFieldIterator';
import type {ValueWithContinue, Query} from './FormFieldIterator'; // eslint-disable-line no-duplicate-imports
import FormFieldStringifier from './FormFieldStringifier';

class FormFieldSearch {
  static matchesForm(value: Object, schema: Object, schemaForm: Array<Object>, baseFieldId: string, pattern: ?string): boolean {
    if (!pattern) {
      return false;
    }
    const [isMatched] = FormFieldIterator.iterateFields(true, schemaForm, {}, {
      pattern,
      value,
      schema,
      baseFieldId,
      iteratee: _.bind(FormFieldSearch.matchesField, FormFieldSearch),
    });
    return isMatched;
  }

  static matchesField(_acc: any, fieldValue: any, formField: Object, targetSchema: ?Object, query: Query): ValueWithContinue {
    const str = FormFieldStringifier.stringify(fieldValue, formField, targetSchema);
    const isMatched = _.includes(str, query.pattern);
    return [isMatched, !isMatched];
  }
}

export default FormFieldSearch;
