/*
 * Copyright(c) 2016 ACCESS CO., LTD. All rights reserved.
 */
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import {FormControl} from 'react-bootstrap';
import PropTypes from 'prop-types';

import CustomFieldUtil from '../utils/CustomFieldUtil';
import CustomFieldWrapping from './CustomFieldWrapping';

class CustomNumberEditField extends React.Component {
  static propTypes = {
    schema: PropTypes.object.isRequired,
    formField: PropTypes.shape({
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
    let value;
    if (rawValue === '') {
      // remove field itself
      // Because
      // - null is bad for json format validation
      // - -1 or 0 is bad for numeric mongo query($gt or $lt)
      value = undefined;
    } else if (this.props.schema.type === 'integer') {
      value = parseInt(rawValue, 10);
    } else if (this.props.schema.type === 'number') {
      value = parseFloat(rawValue);
    } else {
      console.assert(false, 'never reach here');
      value = rawValue;
    }
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
        type="number"
        name={this.props.formField.key}
        className={this.props.formField.fieldHtmlClass}
        placeholder={this.props.formField.placeholder}
        readOnly={this.props.formField.readonly}
        max={this.props.schema.maximum}
        min={this.props.schema.minimum}
        step={_.get(this.props.schema, 'multipleOf', 1)}
        required={this.props.schema.required}
        value={this.props.value}
        onChange={this._onChange}
        bsStyle={CustomFieldUtil.getBsStyleByValidity(this.props.validity)}
      />
    );
    return <CustomFieldWrapping {...this.props}>{control}</CustomFieldWrapping>;
  }
}

export default CustomNumberEditField;
