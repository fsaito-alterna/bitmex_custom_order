// @flow
/*
 * Copyright(c) 2016 ACCESS CO., LTD. All rights reserved.
 */

import React from 'react';
import PropTypes from 'prop-types';

import CustomCommonEditField from './CustomCommonEditField';
import CustomNumberEditField from './CustomNumberEditField';
import CustomTextAreaEditField from './CustomTextAreaEditField';
import CustomButtonField from './CustomButtonField';

/* eslint-disable */
const clsMap = {
  text: CustomCommonEditField,
  number: CustomNumberEditField,
  textarea: CustomTextAreaEditField,
  button: CustomButtonField,
  submit: CustomButtonField,
};

class CustomEditField extends React.Component {

  static propTypes = {
    baseSchema: PropTypes.object.isRequired,
    schema: PropTypes.object,
    formField: PropTypes.object.isRequired,
    baseValue: PropTypes.any,
    value: PropTypes.any,
    itemPath: PropTypes.string,
    validity: PropTypes.shape({
      valid: PropTypes.bool,
    }),
    onChange: PropTypes.func.isRequired, // (fieldValue, validity, itemPath, formField) => {}
    onRemove: PropTypes.func.isRequired, // (itemPath) => {}
    onMove: PropTypes.func.isRequired, // (itemPath, diff) => {}
    wrapping: PropTypes.object, // See CustomFieldWrapping for detail
    scope: PropTypes.object, // angular expression's execution scope
  }

  _onChange = (fieldValue: any, validity: Object) => {
    this.props.onChange(fieldValue, validity, this.props.itemPath, this.props.formField);
  }

  _component: ?Object;

  getValidity = (): ?Object => {
    if ((this._component: any).getValidity) {
      return (this._component: any).getValidity();
    }
    return undefined;
  }

  render(): Object {
    const Component = clsMap[this.props.formField.type];
    if (!Component) {
      console.error('unsupported form type: ', this.props.formField);
      return <div ref={(c) => { this._component = c; }} />;
    }

    // NOTE: onChange should be pure instance method for performance.
    //       See CustomFieldUtil.genericShouldComponentUpdate() for detail.
    return (
      <div className={`custom-edit-field ${this.props.formField.wrapHtmlClass ? this.props.formField.wrapHtmlClass : ''}`}>
        <Component
          {...this.props}
          onChange={this._onChange}
          ref={(c) => { this._component = c; }}
        />
      </div>
    );
  }

}

export default CustomEditField;
