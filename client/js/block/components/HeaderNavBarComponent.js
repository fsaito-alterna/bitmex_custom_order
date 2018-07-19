// @flow
// import i18n from 'i18next';
// import _ from 'lodash';
import React, {Component} from 'react';
import {Nav, NavItem, Navbar} from 'react-bootstrap';
import {Link} from 'react-router';
import PropTypes from 'prop-types';

import Styles from './HeaderNavBarComponent.css';
// import {
//   logout,
// } from '../actions/UserAction';

class HeaderNavBarComponent extends Component {
  static propTypes = {
    // me: React.PropTypes.object,
    children: PropTypes.node,
    title: PropTypes.string,
  }

  static defaultProps = {
    children: [],
    title: '',
  }

  _logout = () => {
    // logout();
  }

  /*
  _getUserName() {
    const me = this.props.me;
    if (_.isEmpty(me.data['base_-staff'])) {
      return `${me.data['base_-operator'].name.family} ${me.data['base_-operator'].name.given}`;
    }
    return `${me.data['base_-staff'].name.family} ${me.data['base_-staff'].name.given}`;
  }
  */

  _renderLogo() {
    return (
      <div className={Styles.navbarBrand}>
        <img alt="" src={`${window.location.origin}/images/new_logo.png`} />
      </div>
    );
  }

  render(): Object {
    return (
      <Navbar className={Styles.header}>
        <Navbar.Header>
          <Navbar.Brand>
            <Link href={{pathname: '/block_table'}}>{this._renderLogo()}</Link>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
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
