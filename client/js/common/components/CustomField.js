// @flow
/*
 * Copyright(c) 2016 ACCESS CO., LTD. All rights reserved.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import CustomCommonField from './CustomCommonField';
import CustomTextAreaField from './CustomTextAreaField';
import CustomButtonField from './CustomButtonField';

const clsMap = {
  text: CustomCommonField,
  number: CustomCommonField,
  textarea: CustomTextAreaField,
  button: CustomButtonField,
  submit: CustomButtonField,
};

class CustomField extends Component {

  static propTypes = {
    baseSchema: PropTypes.object.isRequired,
    schema: PropTypes.object,
    formField: PropTypes.object.isRequired,
    baseValue: PropTypes.any,
    value: PropTypes.any,
    scope: PropTypes.object, // angular expression's execution scope
  }

  render(): Object {
    const ImpComponent = clsMap[this.props.formField.type];
    if (!ImpComponent) {
      console.error('unsupported form type: ', this.props.formField);
      return <div />;
    }

    return (
      <div className="custom-field">
        <ImpComponent
          {...this.props}
        />
      </div>
    );
  }
}

export default CustomField;
