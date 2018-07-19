/*
 * Copyright(c) 2016 ACCESS CO., LTD. All rights reserved.
 */
import React from 'react';
import {FormControl} from 'react-bootstrap';
import PropTypes from 'prop-types';

import CustomFieldWrapping from './CustomFieldWrapping';

class CustomTextAreaField extends React.Component {
  static propTypes = {
    formField: PropTypes.shape({
      fieldHtmlClass: PropTypes.string,
    }).isRequired,
    value: PropTypes.string,
  }

  render() {
    const control = (
      <FormControl
        componentClass="textarea"
        className={this.props.formField.fieldHtmlClass}
        value={this.props.value || ''}
        readOnly
      />
    );
    return <CustomFieldWrapping {...this.props}>{control}</CustomFieldWrapping>;
  }
}

export default CustomTextAreaField;
