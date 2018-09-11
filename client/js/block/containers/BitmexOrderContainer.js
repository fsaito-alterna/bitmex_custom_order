// @flow
import _ from 'lodash';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {t} from 'i18next';
import {ButtonToolbar, Button} from 'react-bootstrap';
import NotificationSystem from 'react-notification-system';

import SchemaFormUtil from '../../common/utils/SchemaFormUtil';
import CustomCRUDTable from '../components/CustomCRUDTable';
import CustomEditObjectField from '../../common/components/CustomEditObjectField';
import OrderSchema from '../utils/OrderSchema';
import BitmexOrderClient from '../utils/BitmexOrderClient';

import Styles from '../components/Orders.css';

class BTCOrdersTableContainer extends Component {

  static contextTypes = {
    store: PropTypes.object,
  }

  constructor(props: Object) {
    super(props);

    this._client = new BitmexOrderClient.BitmexClient();
    this._notificationSystem = null,

    this.state = {
      showDialog: false,
      item: {
        lossLimit: 5,
        profitLimit: 5,
        amount : 100,
        price: 0,
      },
    };
  }

  componentDidMount() {
    this._notificationSystem = this.refs.notificationSystem;
  }

  _onChange = (item) => {
    this.setState({item});
  }

  _onClickMarketBuy = () => {
    const setting = this._getSetting();
    const item = this.state.item;
    const body = {
      apiKey: setting.apiKey,
      secret: setting.apiSecret,
      amount: item.amount,
      side: "buy",
      orderType: "market",
      lossLimit: item.lossLimit,
      profitLimit: item.profitLimit,
    }
    this._client.send(body)
    .then(() => {
      this._addNotification(body.side);
    });
  }

  _onClickMarketSell = () => {
    const setting = this._getSetting();
    const item = this.state.item;
    const body = {
      apiKey: setting.apiKey,
      secret: setting.apiSecret,
      amount: item.amount,
      side: "sell",
      orderType: "market",
      lossLimit: item.lossLimit,
      profitLimit: item.profitLimit,
    }
    this._client.send(body);
  }

  _onClickLimitBuy = () => {
    const setting = this._getSetting();
    const item = this.state.item;
    const body = {
      apiKey: setting.apiKey,
      secret: setting.apiSecret,
      amount: item.amount,
      price: item.price,
      side: "buy",
      orderType: "limit",
      lossLimit: item.lossLimit,
      profitLimit: item.profitLimit,
    }
    this._client.send(body);
  }

  _onClickLimitSell = () => {
    const setting = this._getSetting();
    const item = this.state.item;
    const body = {
      apiKey: setting.apiKey,
      secret: setting.apiSecret,
      amount: item.amount,
      price: item.price,
      side: "sell",
      orderType: "limit",
      lossLimit: item.lossLimit,
      profitLimit: item.profitLimit,
    }
    this._client.send(body);
  }

  _addNotification = (side) => {
    this._notificationSystem.addNotification({
      message: `${side} request completed.`,
      level: side === 'buy' ? 'success' : 'warning',
      position: 'tl',
    });
  }

  _getSetting(): Object {
    return localStorage.getItem('bitmexSetting') ? JSON.parse(localStorage.getItem('bitmexSetting'))  : {};
  }

  _getEditAndDeletePermission(): number {
    return CustomCRUDTable.NONE;
  }

  _getCreatePermission(): number {
    return CustomCRUDTable.NONE;
  }

  _getTableOrder(name): Object {
    return JSON.parse(localStorage.getItem(name) || '{}');
  }

  render(): Object {
    const schema = OrderSchema.getSchema();
    const schemaForm = SchemaFormUtil.createEditFieldsBySchema(schema);

    return (
      <div className={Styles.panelArea}>
        <div className={Styles.settingArea}>
          <CustomEditObjectField
            schema={schema}
            schemaForm={schemaForm}
            baseFieldId={""}
            value={this.state.item}
            onChange={this._onChange}
          />
        </div>
        <div className={Styles.buttonArea}>
          <ButtonToolbar>
            <Button className={Styles.button} bsStyle="success" bsSize="large" onClick={this._onClickMarketBuy}>{t('Order.marketBuy')}</Button>
            <Button className={Styles.button} bsStyle="danger" bsSize="large"  onClick={this._onClickMarketSell}>{t('Order.marketSell')}</Button>
          </ButtonToolbar>
        </div>
        <div className={Styles.buttonArea}>
          <ButtonToolbar>
            <Button className={Styles.button} bsStyle="success" bsSize="large"  onClick={this._onClickLimitBuy}>{t('Order.limitBuy')}</Button>
            <Button className={Styles.button} bsStyle="danger" bsSize="large"  onClick={this._onClickLimitSell}>{t('Order.limitSell')}</Button>
          </ButtonToolbar>
        </div>
        <NotificationSystem ref="notificationSystem" />
      </div>
    );
  }
}

export default BTCOrdersTableContainer;
