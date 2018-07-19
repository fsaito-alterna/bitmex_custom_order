// @flow
/*
 * Copyright(c) 2016 ACCESS CO., LTD. All rights reserved.
 */

import _ from 'lodash';
import expressions from 'angular-expressions';
import React from 'react';
import ice from 'icepick';
import PropTypes from 'prop-types';

import Schema from '../utils/Schema';
import SchemaForm from '../utils/SchemaForm';
import SchemaConverter from '../utils/SchemaConverter';
import CustomEditField from './CustomEditField';

type FormContext = {
  arrayIndex?: number,
};

class CustomEditObjectField extends React.Component {

  static propTypes = {
    schema: PropTypes.object.isRequired,
    schemaForm: PropTypes.array.isRequired,
    baseFieldId: PropTypes.string,
    htmlClassName: PropTypes.string,
    value: PropTypes.object,
    validityMap: PropTypes.objectOf(
      PropTypes.shape({
        valid: PropTypes.bool,
      })
    ),
    onChange: PropTypes.func.isRequired, // (value, validityMap) => {}
    fieldWrapping: PropTypes.object, // See CustomFieldWrapping for detail
    scope: PropTypes.object, // angular expression's execution scope
  }

  static defaultProps = {
    validityMap: {},
  }

  constructor(props: Object) {
    super(props);
    this._fields = this._fields || {};
  }

  _onChange = (fieldValue: any, validity: Object, itemPath: string, formField: Object) => {
    const value = Schema.updateImmutable(this.props.value, itemPath, fieldValue);
    const validityMap = _.assign({}, this.props.validityMap, {[itemPath]: validity});
    const value2 = _.reduce(formField.copyValueTo, (acc, toPath) => {
      return Schema.updateImmutable(acc, toPath, fieldValue);
    }, value);
    this.props.onChange(value2, validityMap);
  }

  _onRemove = (itemPath: string) => {
    const splitted = itemPath.split('.');
    const index = parseInt(_.last(splitted), 10);
    console.assert(_.isSafeInteger(index));
    const arrayPath = splitted.slice(0, -1).join('.');
    const value2 = _.update(_.cloneDeep(this.props.value), arrayPath, (a) => {
      return ice.splice(a, index, 1);
    });
    this.props.onChange(value2, this.props.validityMap);
  }

  _onMove = (itemPath: string, diff: -1 | 1) => {
    // support item of array only
    const splitted = itemPath.split('.');
    const index = parseInt(_.last(splitted), 10);
    console.assert(_.isSafeInteger(index));
    const arrayPath = splitted.slice(0, -1).join('.');
    const value2 = _.update(_.cloneDeep(this.props.value), arrayPath, (orig) => {
      if (index < 0 || index >= orig.length || index + diff < 0 || index + diff >= orig.length) {
        return orig;
      }
      const fixed = orig.slice();
      fixed[index + diff] = orig[index];
      fixed[index] = orig[index + diff];
      return fixed;
    });
    this.props.onChange(value2, this.props.validityMap);
  }

  _fields: Object;

  getValidityMap = (): Object => {
    return _.transform(this._fields, (acc: Object, component: Object, key: string) => {
      acc[key] = component.getValidity();
    }, {});
  }

  _renderField(formFieldOrKey: any, fieldIndex: number, formContext: FormContext, resolvedBaseSchema: Object): ?Object {
    if (formFieldOrKey['x-hidden']) {
      return null;
    }
    const {formField, targetSchema} = SchemaForm.inheritFormField(formFieldOrKey, resolvedBaseSchema);
    const fieldKey = formField.key;
    let itemPath;
    let value;
    if (_.isString(fieldKey)) {
      if (_.isNumber(formContext.arrayIndex)) {
        const resolvedKey = fieldKey.replace('[]', `.${(formContext: any).arrayIndex}`);
        itemPath = `${this.props.baseFieldId}${resolvedKey}`;
      } else {
        itemPath = `${this.props.baseFieldId}${fieldKey}`;
      }
      value = _.get(this.props.value, itemPath);
    }
    const validity = this.props.validityMap[itemPath];
    if (formField.condition) {
      const evaluate = expressions.compile(formField.condition);
      const scope = _.assign({}, this.props.scope, {model: this.props.value, modelValue: value, arrayIndex: formContext.arrayIndex});
      const result = evaluate(scope);
      if (!result) {
        return null;
      }
    }
    let children;
    if (formField.type === 'array') {
      console.assert(!_.isNumber(formContext.arrayIndex), 'nested array is not supported');
      if (formField.multi) {
        children = this._renderFields(formField.items, formContext);
      } else {
        children = _.map(value, (_arrayItem, arrayIndex) => {
          const newContext = _.assign({}, formContext, {arrayIndex});
          return this._renderFields(formField.items, newContext);
        });
      }
    } else if (formField.items) {
      children = this._renderFields(formField.items, formContext);
    } else {
      children = '';
    }

    return (
      <CustomEditField
        key={`${fieldKey}#${fieldIndex}`}
        ref={(c) => { this._fields[fieldKey] = c; }}
        baseSchema={this.props.schema}
        schema={targetSchema}
        formField={formField}
        baseValue={this.props.value}
        value={value}
        itemPath={itemPath}
        validity={validity}
        onChange={this._onChange}
        onRemove={this._onRemove}
        onMove={this._onMove}
        wrapping={this.props.fieldWrapping}
        scope={this.props.scope}
      >
        {children}
      </CustomEditField>
    );
  }

  _renderFields(schemaForm: Object, formContext: FormContext): Array<?Object> {
    const resolvedBaseSchema = SchemaConverter.convertRequired(this.props.schema);
    return _.map(schemaForm, (formFieldOrKey, fieldIndex) => {
      return this._renderField(formFieldOrKey, fieldIndex, formContext, resolvedBaseSchema);
    });
  }

  render(): Object {
    return (
      <div className={this.props.htmlClassName}>
        {this._renderFields(this.props.schemaForm, {})}
      </div>
    );
  }
}

export default CustomEditObjectField;
