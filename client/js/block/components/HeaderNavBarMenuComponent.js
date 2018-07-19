// @flow
// import i18n from 'i18next';
import React from 'react';
import _ from 'lodash';
import {Nav, Navbar, NavItem, MenuItem} from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap';
import PropTypes from 'prop-types';

import HeaderNavBarComponent from './HeaderNavBarComponent';
import Styles from './HeaderNavBarComponent.css';

class HeaderNavBarMenuComponent extends HeaderNavBarComponent {
  static propTypes = {
    menuItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  }

  _renderMenuItems(items: Array<Object>): Array<Object> {
    return _.map(items, (item) => {
      return (
        <LinkContainer key={item.id} to={{pathname: item.basePath}}><MenuItem>{item.title}</MenuItem></LinkContainer>
      );
    });
  }

  _renderMenuItem(item: Object): Object {
    return (
      <LinkContainer key={item.id} to={{pathname: item.basePath}}><NavItem>{item.title}</NavItem></LinkContainer>
    );
  }

  _renderNav(): Array<Object> {
    return _.map(this.props.menuItems, (item) => {
      return this._renderMenuItem(item);
    });
  }


  _renderLogo() {
    return (
      <div>
        <img className={Styles.navbarBrand} alt="" src={`${window.location.origin}/images/new_logo.png`} />
      </div>
    );
  }

  render(): Object {
    return (
      <Navbar className={Styles.header}>
        <Navbar.Header>
          <Navbar.Brand>
            {this._renderLogo()}
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse className={Styles.navbarCollapse}>
          <Nav>{this._renderNav()}</Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default HeaderNavBarMenuComponent;
