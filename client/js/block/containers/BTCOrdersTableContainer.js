// @flow
import _ from 'lodash';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {t} from 'i18next';
import moment from 'moment';

import {
  indexItems,
} from '../actions/DataEntityAction';
import SchemaFormUtil from '../../common/utils/SchemaFormUtil';
import CustomCRUDTable from '../components/CustomCRUDTable';
import BlockUtil from '../utils/BlockUtil';

import Styles from '../components/Orders.css';

const INTERVAL_SEC = 30;

class BTCOrdersTableContainer extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object),
  }

  static contextTypes = {
    store: PropTypes.object,
  }

  constructor(props: Object) {
    super(props);
    this.timerID = null;
    this.time = moment();
  }

  static defaultProps = {
    items: [],
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this._tick(),
      1000
    );
    this._retrieve();
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  _getEditAndDeletePermission(): number {
    return CustomCRUDTable.NONE;
  }

  _getCreatePermission(): number {
    return CustomCRUDTable.NONE;
  }

  _retrieve() {
    this.context.store.dispatch(indexItems('btc', 'nanj_orders.json'));
  }

  _onChangeSellOrder = (order: Object) => {
    localStorage.setItem('sellOrder', JSON.stringify(order));
  }

  _onChangeBuyOrder = (order: Object) => {
    localStorage.setItem('buyOrder', JSON.stringify(order));
  }

  _getTableOrder(name): Object {
    return JSON.parse(localStorage.getItem(name) || '{}');
  }

  _tick() {
    this.time = this.time ? moment(this.time).add(1, 'seconds') : moment();
    const timesec = this.time.unix();
    if (timesec % INTERVAL_SEC === 0) {
      this._retrieve();
    }
  }

  timerID: any;
  time: any;

  render(): Object {
    const blockSchema = BlockUtil.blockTableSchema();
    const blockSchemaForm = BlockUtil.setTableXHiddenSchemaForm(SchemaFormUtil.createFieldsBySchema(blockSchema));

    const sells = _.get(_.first(this.props.items), 'sellOrders', []);
    const buys = _.get(_.first(this.props.items), 'buyOrders', []);
    const totalSells = _.get(_.first(this.props.items), 'totalSells', []);
    const totalBuys = _.get(_.first(this.props.items), 'totalBuys', []);

    return (
      <div key={'ordersArea'} className={Styles.ordersArea}>
        <div key={'sellOrders'} className={Styles.sellOrders}>
          <div key={'titleArea'} className={Styles.titleArea}>
            <div key={'title'} className={Styles.title}>
              {i18n.t('Orders.sellOrders')}
            </div>
            <div key={'count'} className={Styles.title}>
              {`Total: ${totalSells} NANJ`}
            </div>
          </div>
          <CustomCRUDTable
            hasPager={false}
            pageSize={3000}
            hasButtonColumn={false}
            items={sells}
            schema={blockSchema}
            schemaForm={blockSchemaForm}
            defaultSort={JSON.stringify({'data.c_kana': 1})}
            getEditAndDeletePermission={this._getEditAndDeletePermission}
            getCreatePermission={this._getCreatePermission}
            order={this._getTableOrder('sellOrder')}
            onChangeOrder={this._onChangeSellOrder}
          />
        </div>
        <div key={'buyOrders'} className={Styles.buyOrders}>
          <div key={'titleArea'} className={Styles.titleArea}>
            <div key={'title'} className={Styles.title}>
              {i18n.t('Orders.buyOrders')}
            </div>
            <div key={'count'} className={Styles.title}>
              {`Total: ${totalBuys} BTC`}
            </div>
          </div>
          <CustomCRUDTable
            hasPager={false}
            pageSize={3000}
            hasButtonColumn={false}
            items={buys}
            schema={blockSchema}
            schemaForm={blockSchemaForm}
            defaultSort={JSON.stringify({'data.c_kana': 1})}
            getEditAndDeletePermission={this._getEditAndDeletePermission}
            getCreatePermission={this._getCreatePermission}
            order={this._getTableOrder('buyOrder')}
            onChangeOrder={this._onChangeBuyOrder}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: Object, ownProps: Object) => {
  return {
    items: state.btcs,
  };
};

export default connect(mapStateToProps)(BTCOrdersTableContainer);
