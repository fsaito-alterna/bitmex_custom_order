/*
 * Copyright(c) 2016-2017 ACCESS CO., LTD. All rights reserved.
 */
import _ from 'lodash';
import React from 'react';
import {Label} from 'react-bootstrap';
import i18n from 'i18next';
import PropTypes from 'prop-types';

import Schema from '../utils/Schema';

class CustomFieldWrapping extends React.Component {
  static propTypes = {
    baseSchema: PropTypes.object.isRequired,
    schema: PropTypes.object.isRequired,
    formField: PropTypes.shape({
      title: PropTypes.node,
      description: PropTypes.node,
      htmlClass: PropTypes.string,
      labelHtmlClass: PropTypes.string,
      notitle: PropTypes.bool,
    }).isRequired,
    wrapping: PropTypes.shape({
      // NOTE: Not be expected recursive merge to React's getDefaultProps
      withRequiredLabel: PropTypes.bool,
      withOptionalLabel: PropTypes.bool,
      horizontalLabelCols: PropTypes.number, // Bootstrap's column number. if 0, do vertical layout.
      horizontalLabelFlexBasis: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // css flex-basis
      noDescription: PropTypes.bool,
    }),
    children: PropTypes.node,
    titleAddOn: PropTypes.node,
  }

  _renderLabelNode() {
    if (this.props.formField.title || this.props.titleAddOn) {
      return (
        <span>
          <label className={`control-label ${this.props.formField.labelHtmlClass || ''}`}>
            {this.props.formField.title}
          </label>
          {this.props.titleAddOn}
        </span>
      );
    }
    return null;
  }

  render() {
    const wrapping = _.merge({
      withRequiredLabel: false,
      withOptionalLabel: false,
      horizontalLabelCols: 0,
    }, !_.isUndefined(this.props.wrapping) ? this.props.wrapping : {});

    if (this.props.formField.notitle) {
      return (
        <div className={this.props.formField.htmlClass}>
          {this.props.children}
          <div>
            {wrapping.noDescription ? '' : this.props.formField.description}
          </div>
        </div>
      );
    }

    const labelNode = this._renderLabelNode();
    const isRequired = Schema.getRequired(this.props.schema);

    // vertical layout
    if (wrapping.horizontalLabelCols <= 0 && _.isUndefined(wrapping.horizontalLabelFlexBasis)) {
      let wrappedLabelNode;
      if (isRequired && wrapping.withRequiredLabel) {
        wrappedLabelNode = (
          <div>
            {labelNode}
            &nbsp;
            <Label bsStyle="warning">
              {i18n.t('common.required')}
            </Label>
          </div>
        );
      } else if (!isRequired && wrapping.withOptionalLabel) {
        wrappedLabelNode = (
          <div>
            {labelNode}
            &nbsp;
            <Label bsStyle="default">
              {i18n.t('common.optional')}
            </Label>
          </div>
        );
      } else {
        wrappedLabelNode = (
          <div>
            {labelNode}
          </div>
        );
      }
      return (
        <div className={this.props.formField.htmlClass}>
          {wrappedLabelNode}
          {this.props.children}
          <div>
            {wrapping.noDescription ? '' : this.props.formField.description}
          </div>
        </div>
      );
    }

    // horizontal layout
    const leftLabelDivStyle = {
      textAlign: 'left',
      float: 'left',
    };
    const rightLabelDivStyle = {
      textAlign: 'right',
    };
    let wrappedLabelNode;
    if (isRequired && wrapping.withRequiredLabel) {
      wrappedLabelNode = (
        <div>
          <div style={leftLabelDivStyle}>
            {labelNode}
          </div>
          <div style={rightLabelDivStyle}>
            <Label bsStyle="warning">
              {i18n.t('common.required')}
            </Label>
          </div>
        </div>
      );
    } else if (!isRequired && wrapping.withOptionalLabel) {
      wrappedLabelNode = (
        <div>
          <div style={leftLabelDivStyle}>
            {labelNode}
          </div>
          <div style={rightLabelDivStyle}>
            <Label bsStyle="default">
              {i18n.t('common.optional')}
            </Label>
          </div>
        </div>
      );
    } else {
      wrappedLabelNode = (
        <div>
          {labelNode}
        </div>
      );
    }
    const leftFlexBasis = !_.isUndefined(wrapping.horizontalLabelFlexBasis) ?
      wrapping.horizontalLabelFlexBasis : `calc(100% * ${wrapping.horizontalLabelCols} / 12)`;
    const leftDivStyle = {
      flexGrow: 0,
      flexBasis: leftFlexBasis,
      paddingRight: 2,
    };
    const rightDivStyle = {
      flexGrow: 1,
      flexBasis: 0,
      paddingLeft: 2,
    };
    return (
      <div className={this.props.formField.htmlClass} style={{display: 'flex'}}>
        <div style={leftDivStyle}>{wrappedLabelNode}</div>
        <div style={rightDivStyle}>
          <div>
            {this.props.children}
            {wrapping.noDescription ? '' : this.props.formField.description}
          </div>
        </div>
      </div>
    );
  }
}

export default CustomFieldWrapping;
