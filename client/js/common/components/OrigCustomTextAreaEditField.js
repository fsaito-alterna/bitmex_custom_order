/*
 * Copyright(c) 2016 ACCESS CO., LTD. All rights reserved.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {FormControl} from 'react-bootstrap';
import PropTypes from 'prop-types';

import CustomFieldUtil from '../utils/CustomFieldUtil';
import CustomFieldWrapping from './CustomFieldWrapping';

class OrigCustomTextAreaEditField extends React.Component {
  static propTypes = {
    schema: PropTypes.object.isRequired,
    formField: PropTypes.shape({
      key: PropTypes.string.isRequired,
      placeholder: PropTypes.string,
      readonly: PropTypes.bool,
      fieldHtmlClass: PropTypes.string,
    }).isRequired,
    value: PropTypes.string,
    validity: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    fieldWrapping: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.func,
    ]),
  }

  shouldComponentUpdate(nextProps, nextState) {
    return CustomFieldUtil.genericShouldComponentUpdate(this.props, this.state, nextProps, nextState);
  }

  _onChange(e) {
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
    const control = (
      <FormControl
        ref={(c) => { this._input = c; }}
        componentClass="textarea"
        name={this.props.formField.key}
        className={this.props.formField.fieldHtmlClass}
        placeholder={this.props.formField.placeholder}
        readOnly={this.props.formField.readonly}
        maxLength={this.props.schema.maxLength}
        minLength={this.props.schema.minLength}
        required={this.props.schema.required}
        value={this.props.value || ''}
        onChange={this._onChange}
        bsStyle={CustomFieldUtil.getBsStyleByValidity(this.props.validity)}
      />
    );
    const FieldWrapping = this.props.fieldWrapping || CustomFieldWrapping;
    return <FieldWrapping {...this.props}>{control}</FieldWrapping>;
  }
}

export default OrigCustomTextAreaEditField;
