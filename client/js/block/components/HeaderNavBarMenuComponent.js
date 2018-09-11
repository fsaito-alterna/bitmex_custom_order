// @flow
// import i18n from 'i18next';
import React from 'react';
import _ from 'lodash';
import {Nav, Navbar, NavItem, MenuItem} from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap';
import PropTypes from 'prop-types';
import {t} from 'i18next';

import HeaderNavBarComponent from './HeaderNavBarComponent';
import SettingSchema from '../utils/SettingSchema';
import CustomEditDialog from '../../common/components/CustomEditDialog';
import SchemaFormUtil from '../../common/utils/SchemaFormUtil';

import Styles from './HeaderNavBarComponent.css';

class HeaderNavBarMenuComponent extends HeaderNavBarComponent {
  static propTypes = {
    menuItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  }

  constructor(props: Object) {
    super(props);
    this.state = {
      showDialog: false,
    };
  }

  _onSubmitSetting = (setting: Object) => {
    localStorage.setItem('bitmexSetting', JSON.stringify(setting));
    this.setState({
      showDialog: false,
    });
  }

  _onClickSetting = () => {
    this.setState({
      showDialog: true,
    });
  }

  _onHideDialog = () => {
    this.setState({showDialog: false});
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

  render(): Object {
    const setting = localStorage.getItem('bitmexSetting') ? JSON.parse(localStorage.getItem('bitmexSetting'))  : {};
    const settingSchema = SettingSchema.getSchema();
    const settingSchemaForm = SchemaFormUtil.createEditFieldsBySchema(settingSchema);

    return (
      <div>
        <CustomEditDialog
          dialogTitle={t('Setting.title')}
          mode="edit"
          key={"setting"}
          schema={settingSchema}
          schemaForm={settingSchemaForm}
          onSubmit={this._onSubmitSetting}
          baseFieldId={""}
          show={this.state.showDialog}
          onHide={this._onHideDialog}
          item={setting}
        />
        <Navbar className={Styles.header}>
          <Navbar.Header>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse className={Styles.navbarCollapse}>
            <Nav>{this._renderNav()}</Nav>
            <Nav pullRight>
              <NavItem eventKey={1} onClick={this._onClickSetting}>
                Setting
              </NavItem>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>
    );
  }
}

export default HeaderNavBarMenuComponent;
