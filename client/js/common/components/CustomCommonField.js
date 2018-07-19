/*
 * Copyright(c) 2016 ACCESS CO., LTD. All rights reserved.
 */
import React from 'react';
import PropTypes from 'prop-types';

import CustomFieldWrapping from './CustomFieldWrapping';

class CustomCommonField extends React.Component {
  static propTypes = {
    formField: PropTypes.shape({
      fieldHtmlClass: PropTypes.string,
    }).isRequired,
    value: PropTypes.any,
  }

  render() {
    const control = (
      <div className={this.props.formField.fieldHtmlClass}>
        {this.props.value || '-'}
      </div>
    );
    return <CustomFieldWrapping {...this.props}>{control}</CustomFieldWrapping>;
  }
}

export default CustomCommonField;
