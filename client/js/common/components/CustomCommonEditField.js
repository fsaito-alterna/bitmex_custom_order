/*
 * Copyright(c) 2016 ACCESS CO., LTD. All rights reserved.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {FormControl} from 'react-bootstrap';
import PropTypes from 'prop-types';

import CustomFieldUtil from '../utils/CustomFieldUtil';
import CustomFieldWrapping from './CustomFieldWrapping';

class CustomCommonEditField extends React.Component {
  static propTypes = {
    schema: PropTypes.object.isRequired,
    formField: PropTypes.shape({
      type: PropTypes.oneOf(['text', 'x-email', 'x-tel']).isRequired,
      key: PropTypes.string.isRequired,
      placeholder: PropTypes.string,
      readonly: PropTypes.bool,
      fieldHtmlClass: PropTypes.string,
    }).isRequired,
    value: PropTypes.any,
    validity: PropTypes.object,
    onChange: PropTypes.func.isRequired,
  }

  shouldComponentUpdate(nextProps, nextState) {
    return CustomFieldUtil.genericShouldComponentUpdate(this.props, this.state, nextProps, nextState);
  }

  _onChange = (e) => {
    const rawValue = e.target.value;
    const value = rawValue === '' ? undefined : rawValue;
    const validity = this.getValidity();
    this.props.onChange(value, validity);
  }

  getValidity() {
    const element = ReactDOM.findDOMNode(this._input);
    const valid = element.checkValidity();
    return {valid: valid};
  }

  render() {
    const formType = this.props.formField.type;
    let inputType;

    if (formType === 'x-email') {
      inputType = 'email';
    } else if (formType === 'x-tel') {
      inputType = 'tel';
    } else {
      inputType = 'text';
    }

    const control = (
      <FormControl
        ref={(c) => { this._input = c; }}
        type={inputType}
        name={this.props.formField.key}
        className={this.props.formField.fieldHtmlClass}
        placeholder={this.props.formField.placeholder}
        readOnly={this.props.formField.readonly}
        maxLength={this.props.schema.maxLength}
        minLength={this.props.schema.minLength}
        pattern={this.props.schema.pattern}
        required={this.props.schema.required}
        value={this.props.value}
        onChange={this._onChange}
        bsStyle={CustomFieldUtil.getBsStyleByValidity(this.props.validity)}
      />
    );
    return <CustomFieldWrapping {...this.props}>{control}</CustomFieldWrapping>;
  }
}

export default CustomCommonEditField;
