// @flow
import _ from 'lodash';
import React, {Component} from 'react';
import {DropdownButton, MenuItem} from 'react-bootstrap';
import PropTypes from 'prop-types';

class DropDownButtonComponent extends Component {
  static propTypes = {
    onSelect: PropTypes.func,
    menuItems: PropTypes.array.isRequired,
    bsStyle: PropTypes.string,
    title: PropTypes.string.isRequired,
    className: PropTypes.string,
  }

  _renderItems(): ?Array<Object> {
    return _.map(this.props.menuItems, (item, index) => {
      return (
        <MenuItem key={item.key} eventKey={item.key}>{item.name}</MenuItem>
      );
    });
  }

  render(): Object {
    return (
      <DropdownButton
        className={this.props.className}
        id={`dropdown_${this.props.title}`}
        title={this.props.title}
        bsStyle={this.props.bsStyle}
        onSelect={this.props.onSelect}
      >
        {this._renderItems()}
      </DropdownButton>
    );
  }
}

export default DropDownButtonComponent;
