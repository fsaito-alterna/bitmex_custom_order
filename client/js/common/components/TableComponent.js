// @flow
/*
 * Copyright(c) 2016 ACCESS CO., LTD. All rights reserved.
 */

import _ from 'lodash';
import React from 'react';
import {Table} from 'react-bootstrap';
import createClassName from 'classnames';
import PropTypes from 'prop-types';

import TableStyles from './TableComponent.css';

class TableComponent extends React.Component {
  static propTypes = {
    hasHeader: PropTypes.bool,
    items: PropTypes.array.isRequired,
    columns: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      component: PropTypes.any, // component class
      columnSchemaForm: PropTypes.array,
      onChangeOrder: PropTypes.func,
    })).isRequired,
    schema: PropTypes.object,
    bordered: PropTypes.bool,
    renderCells: PropTypes.func,
    showOrderMarker: PropTypes.bool,
    order: PropTypes.array,
    setClassName: PropTypes.func,
  }

  static defaultProps = {
    hasHeader: true,
    bordered: false,
  }

  _isHidden(column: Object): boolean {
    if (_.isEmpty(column.columnSchemaForm)) {
      return false;
    }
    if (_.first(column.columnSchemaForm)['x-hidden']) {
      return true;
    }
    return false;
  }

  _needsOrderMarker(column: Object): boolean {
    return this.props.showOrderMarker && !!column.onChangeOrder;
  }

  _renderOrderMarkerIfNeeded(column: Object): ?Object {
    if (!this._needsOrderMarker(column)) {
      return null;
    }
    // console.log(column);
    const active = _.get(this.props.order, '0.key') === column.key;
    // const sub = _.get(this.props.order, '1.key') === column.key;
    // const subDir = sub ? _.get(this.props.order, '1.dir') : 1;
    // const dir = active ? _.get(this.props.order, '0.dir') : subDir;
    let dir;
    let dirText;
    if (column.key === 'time') {
      dir = active ? _.get(this.props.order, '0.dir') * -1 : -1;
      dirText = dir === -1 ? '▼' : '▲';
    } else {
      dir = active ? _.get(this.props.order, '0.dir') : 1;
      dirText = dir === -1 ? '▼' : '▲';
    }
    // const dirText = dir === -1 ? '▼' : '▲';
    // const subClass = sub ? 'sub' : '';
    // const mainClass = active ? 'active' : subClass;
    const mainClass = active ? 'active' : '';
    return (
      <span
        className={createClassName(TableStyles.orderMarker, mainClass)}
      >
        {dirText}
      </span>
    );
  }

  _renderThColumns(columns: Array<Object>): ?Object {
    return _.map(columns, (column, index) => {
      if (this._isHidden(column)) {
        return null;
      }
      const name = column.name;
      const key = `${name}-${column.key ? column.key : index}`;
      const markProps = this._needsOrderMarker(column) ? {
        onClick: column.onChangeOrder,
        style: {
          cursor: 'pointer',
        },
      } : {};
      return (
        <th
          key={key}
          {...markProps}
          className={column.getClassName ? column.getClassName(column) : null}
        >
          {name}
          {this._renderOrderMarkerIfNeeded(column)}
        </th>
      );
    });
  }

  _renderTHead(columns: Array<Object>): ?Object {
    if (this.props.hasHeader) {
      return (
        <thead>
          <tr className={TableStyles.tableHeader}>
            {this._renderThColumns(columns)}
          </tr>
        </thead>
      );
    }
    return null;
  }

  _renderCells(columns: Array<Object>, model: Object): Array<?Object> {
    return _.map(columns, (column, index) => {
      if (this._isHidden(column)) {
        return null;
      }
      const name = column.name;
      return (
        <td
          key={name}
          className={column.getClassName ? column.getClassName(column, model) : null}
        >
          <column.component model={model} />
        </td>
      );
    });
  }

  _renderTBody(columns: Array<Object>): Object {
    return _.map(this.props.items, (model, index) => {
      const className = this.props.setClassName ? this.props.setClassName(model) : '';
      return (
        <tr key={index} className={createClassName(TableStyles.column, className)}>
          {this.props.renderCells ? this.props.renderCells(columns, model) : this._renderCells(columns, model)}
        </tr>
      );
    });
  }

  render(): Object {
    return (
      <Table bordered={this.props.bordered}>
        {this._renderTHead(this.props.columns)}
        <tbody>
          {this._renderTBody(this.props.columns)}
        </tbody>
      </Table>
    );
  }
}

export default TableComponent;
