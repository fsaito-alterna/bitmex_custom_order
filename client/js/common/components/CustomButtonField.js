/*
 * Copyright(c) 2016 ACCESS CO., LTD. All rights reserved.
 */
import _ from 'lodash';
import classNames from 'classnames';
import expressions from 'angular-expressions';
import React from 'react';
import PropTypes from 'prop-types';

class CustomButtonField extends React.Component {
  static propTypes = {
    baseValue: PropTypes.any,
    formField: PropTypes.shape({
      type: PropTypes.oneOf(['submit', 'button']).isRequired,
      readonly: PropTypes.bool,
      htmlClass: PropTypes.string,
      fieldHtmlClass: PropTypes.string,
      title: PropTypes.string,
      style: PropTypes.string, // bootstrap button class name
      onClick: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    }).isRequired,
    scope: PropTypes.object, // angular expression's execution scope
  }

  _onClick() {
    if (_.isFunction(this.props.formField.onClick)) {
      this.props.formField.onClick();
      return;
    }
    if (this.props.formField.onClick) {
      const evaluate = expressions.compile(this.props.formField.onClick);
      const scope = _.assign({}, this.props.scope, {model: this.props.baseValue});
      evaluate(scope);
      return;
    }
  }

  render() {
    const formType = this.props.formField.type;
    let buttonType;

    if (formType === 'submit') {
      buttonType = 'submit';
    } else {
      buttonType = 'button';
    }
    const inputClass = classNames(
      'btn',
      this.props.formField.style,
      this.props.formField.fieldHtmlClass
    );

    return (
      <div className={this.props.formField.htmlClass}>
        <button
          type={buttonType}
          disabled={this.props.formField.readonly}
          className={inputClass}
          onClick={this._onClick}
        >
          {this.props.formField.title}
        </button>
      </div>
    );
  }
}

export default CustomButtonField;
