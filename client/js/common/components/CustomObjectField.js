// @flow
/*
 * Copyright(c) 2016 ACCESS CO., LTD. All rights reserved.
 */

import _ from 'lodash';
import expressions from 'angular-expressions';
import React from 'react';
import PropTypes from 'prop-types';

import SchemaForm from '../utils/SchemaForm';
import CustomField from './CustomField';

class CustomObjectField extends React.Component {

  static propTypes = {
    schema: PropTypes.object.isRequired,
    schemaForm: PropTypes.array.isRequired,
    baseFieldId: PropTypes.string,
    value: PropTypes.object,
    fieldWrapping: PropTypes.object, // See CustomFieldWrapping for detail
    scope: PropTypes.object, // angular expression's execution scope
    wrapStyle: PropTypes.object, // parent div style
    wrapChildStyle: PropTypes.object, // children div style
  }

  _renderField(formFieldOrKey: any, fieldIndex: number, formContext: Object): ?Object {
    if (formFieldOrKey['x-hidden']) {
      return null;
    }
    const {formField, targetSchema} = SchemaForm.inheritFormField(formFieldOrKey, this.props.schema);
    const fieldKey = formField.key;
    let itemPath;
    let value;
    if (_.isString(fieldKey)) {
      if (_.isNumber(formContext.arrayIndex)) {
        const resolvedKey = fieldKey.replace('[]', `.${formContext.arrayIndex}`);
        itemPath = `${this.props.baseFieldId}${resolvedKey}`;
      } else {
        itemPath = `${this.props.baseFieldId}${fieldKey}`;
      }
      value = _.get(this.props.value, itemPath);
    }
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
      children = _.map(value, (_arrayItem, arrayIndex) => {
        const newContext = _.assign({}, formContext, {arrayIndex});
        return this._renderFields(formField.items, newContext);
      });
    } else if (formField.items) {
      children = this._renderFields(formField.items, formContext);
    } else {
      children = null;
    }
    const fieldWrapping = _.defaults({
      noDescription: true,
    }, this.props.fieldWrapping);

    return (
      <div
        key={`wraped{fieldKey}#${fieldIndex}`}
        style={this.props.wrapChildStyle}
      >
        <CustomField
          key={`${fieldKey}#${fieldIndex}`}
          ref={fieldKey}
          baseSchema={this.props.schema}
          schema={targetSchema}
          formField={formField}
          baseValue={this.props.value}
          value={value}
          wrapping={fieldWrapping}
          scope={this.props.scope}
        >
          {children}
        </CustomField>
      </div>
    );
  }

  _renderFields(schemaForm: Object, formContext: Object): Array<?Object> {
    return _.map(schemaForm, (formFieldOrKey, fieldIndex) => this._renderField(formFieldOrKey, fieldIndex, formContext));
  }

  render(): Object {
    return (
      <div style={this.props.wrapStyle}>
        {this._renderFields(this.props.schemaForm, {})}
      </div>
    );
  }
}

export default CustomObjectField;
