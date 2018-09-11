// @flow
// import i18n from 'i18next';
// import _ from 'lodash';
import React, {Component} from 'react';
import {Nav, NavItem, Navbar} from 'react-bootstrap';
import {Link} from 'react-router';
import PropTypes from 'prop-types';

import Styles from './HeaderNavBarComponent.css';

class HeaderNavBarComponent extends Component {
  static propTypes = {
    children: PropTypes.node,
    title: PropTypes.string,
  }

  static defaultProps = {
    children: [],
    title: '',
  }

  render(): Object {
    return (
      <Navbar className={Styles.header}>
        <Navbar.Collapse className={Styles.navbarCollapse}>
          <Nav pullRight>
            <NavItem className={Styles.corporationSelection}>{this.props.children}</NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default HeaderNavBarComponent;
