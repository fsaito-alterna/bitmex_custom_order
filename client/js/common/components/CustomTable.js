// @flow
/*
 * Copyright(c) 2016 ACCESS CO., LTD. All rights reserved.
 */
/* eslint-disable react/prop-types */ // to avoid eslint error because this.props.model is considered as the member of CustomTable.propTypes.
/* eslint-disable react/jsx-no-bind */
import _ from 'lodash';
import ice from 'icepick';
import i18n from 'i18next';
import React from 'react';
import ReactDOM from 'react-dom';
import {Button, Input, Pagination, Panel} from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import Papa from 'papaparse';
import Encoding from 'encoding-japanese';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';

import ConfirmButton from './ConfirmButton';
import ConfirmDialog from './ConfirmDialog';
import SearchComponent from './SearchComponent';
import TableComponent from './TableComponent';
import CustomObjectField from './CustomObjectField';
import FormFieldSearch from '../utils/FormFieldSearch';
import FormFieldStringifier from '../utils/FormFieldStringifier';
import TableOrderUtil from '../utils/TableOrderUtil';

// permission
const NONE = 0;
const CREATE = 1;
const EDIT = 2;
const DELETE = 4;
const ENABLE = 8;
const DISABLE = 16;
const EXPORT = 32;
const IMPORT = 64;

class CustomTable extends React.Component {
  static propTypes = {
    // common
    schema: PropTypes.object.isRequired,
    schemaForm: PropTypes.array.isRequired,
    baseFieldId: PropTypes.string,
    additionalHeaderNode: PropTypes.node,
    fieldWrapping: PropTypes.object, // See CustomFieldWrapping for detail
    scope: PropTypes.object, // angular expression's execution scope
    onChangeStore: PropTypes.func,
    onChangePage: PropTypes.func, // {page: number, items: array, totalPages: number, totalItems: number}
    hasPanelHeader: PropTypes.bool,
    tableName: PropTypes.string,
    bordered: PropTypes.bool,
    hasNestTable: PropTypes.bool, // for !hasPager
    childCreateButtonTitle: PropTypes.string, // for hasNestTable
    registerButtonTitle: PropTypes.string,
    getColumnClassName: PropTypes.func,
    showOrderMarker: PropTypes.bool,
    order: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
    ]),
    onChangeOrder: PropTypes.func,
    setClassName: PropTypes.func,
    // index
    hasPager: PropTypes.bool,
    actions: PropTypes.object, // PaginationActions. for hasPager or hasButtonColumn
    pageSize: PropTypes.number, // for hasPager
    items: PropTypes.array, // for !hasPager
    defaultSort: PropTypes.string, // JSON String
    // queryFields: PropTypes.array, // Cf. PaginationHelper.makeFilterQuery
    // select
    hasCheckbox: PropTypes.bool,
    hasRadio: PropTypes.bool,
    checkedIds: PropTypes.array,
    onChangeChecked: PropTypes.func, // onChangeChecked(ids)
    // create
    getCreatePermission: PropTypes.func, // () => permission
    // edit/delete
    hasButtonColumn: PropTypes.bool,
    onClickCreateItem: PropTypes.func, // onClickCreateItem()
    onClickEditItem: PropTypes.func, // onClickEditItem(item)
    onClickDeleteItem: PropTypes.func, // onClickDeleteItem(item)
    getEditAndDeletePermission: PropTypes.func, // (item) => permission
    // enable/disable
    getDisablePermission: PropTypes.func, // (item) => permission
    getEnablePermission: PropTypes.func, // (item) => permission
    onClickDisableItem: PropTypes.func, // onClickDisableItem(item)
    onClickEnableItem: PropTypes.func, // onClickEnableItem(item)
    // export
    onClickExportItem: PropTypes.func, // onClickExportItem(item)
    getExportPermission: PropTypes.func, // (item) => permission
    // import
    handleParseImportCsv: PropTypes.func, // handleParseImportCsv()
    getImportPermission: PropTypes.func,
    onClickRegisterItem: PropTypes.func,
    // hidden cols
    onClickChangeHiddenColSetting: PropTypes.func,
  }

  static defaultProps = {
    hasCheckbox: false,
    hasRadio: false,
    hasButtonColumn: true,
    hasPager: true,
    pageSize: 50,
    defaultSort: undefined,
    baseFieldId: '',
    checkedIds: [],
    hasPanelHeader: false,
    onClickCreateItem: (_item: Object) => {},
    handleParseImportCsv: (_items: Object) => {},
    onClickEditItem: (_item: Object) => {},
    onClickDeleteItem: (_item: Object) => {},
    onClickDisableItem: (_item: Object) => {},
    onClickEnableItem: (_item: Object) => {},
    onChangeChecked: (_item: Object) => {},
    getCreatePermission: () => CREATE,
    getImportPermission: () => { return NONE; },
    getEditAndDeletePermission: (_item: Object) => { return EDIT; },
    getDisablePermission: (_item: Object) => { return NONE; },
    getEnablePermission: (_item: Object) => { return NONE; },
    onClickExportItem: (_item: Object) => {},
    getExportPermission: (_item: Object) => { return EXPORT; },
    onClickRegisterItem: (_item: Object) => {},
  }

  constructor(props: Object) {
    super(props);

    if (this.props.hasPager) {
      console.assert(this.props.actions, 'actions is required');
    } else {
      console.assert(this.props.items, 'items is required');
    }

    let order;
    if (!_.isArray(props.order)) {
      // old version is not array
      if (_.isObject(props.order)) {
        order = [{
          key: _.get(props.order, 'key', undefined),
          dir: _.get(props.order, 'dir', 0),
        }];
      } else {
        order = [{
          key: undefined,
          dir: 0,
        }];
      }
    } else if (_.isEmpty(props.order)) {
      order = [{
        key: undefined,
        dir: 0,
      }];
    } else {
      order = props.order;
    }
    this.state = {
      checkedIds: this.props.checkedIds,
      page: 0, // zero-based
      order,
      showConfirmDialog: false,
    };
    this._pattern = '';
  }

  componentDidMount() {
    if (this.props.hasPager) {
      this._pattern = ''; // _pattern does not have an influence on rendering directly.
      this._refreshPage();
    }
  }

  _onClickCreateItem = () => {
    this.props.onClickCreateItem();
  }

  _onClickRegisterItem = () => {
    this.props.onClickRegisterItem();
  }

  _onClickImportItem = () => {
    this.props.onClickImportItem();
  }

  _onClickDeleteItem = (item: Object) => {
    this.props.onClickDeleteItem(item);
  }

  _onClickDisableItem = (item: Object) => {
    this.props.onClickDisableItem(item);
  }

  _onClickEnableItem = (item: Object) => {
    this.props.onClickEnableItem(item);
  }

  _onClickEditItem = (item: Object) => {
    this.props.onClickEditItem(item);
  }

  _onClickExportItem = (item: Object) => {
    this.props.onClickExportItem(item);
  }

  _onClickChangeHiddenColSetting = () => {
    this.props.onClickChangeHiddenColSetting();
  }

  _onChangeChecked = (model: Object) => {
    let ids;
    if (this.props.hasCheckbox) {
      ids = _.xor(this.state.checkedIds, [model._id]);
    } else {
      console.assert(this.props.hasRadio);
      ids = [model._id];
    }
    this.setState({
      checkedIds: ids,
    });
    this.props.onChangeChecked(ids);
  }

  _onSelectPage = (page: number) => {
    const filteredItems = this._filteredItems();
    const {totalPages, items} = this._calcPagenation(page, filteredItems);
    if (this.props.onChangePage) {
      this.props.onChangePage({page, items, totalPages, totalItems: filteredItems.length});
    }
    this.setState({page});
  }

  _onChangeSearch = (pattern: string) => {
    if (this._pattern === pattern) {
      return;
    }
    this._pattern = pattern;
    this._refreshPage();
  }

  _onChangeOrder = (formField: Object) => {
    const order = {
      key: formField.key,
      dir: this._toggledOrderDir(formField.key),
    };
    this.props.onChangeOrder(order);
    const next = TableOrderUtil.makeNextOrders(order, _.first(this.state.order), _.last(this.state.order));
    this.setState({order: next});
  }

  _onHideConfirmDialog = () => {
    this.setState({showConfirmDialog: false});
  }

  _onDropRejected = () => {
    this.setState({showConfirmDialog: true});
  }

  _onDropAccepted = (files: Array<any>) => {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const codes = new Uint8Array(e.target.result);
      const encoding = Encoding.detect(codes);
      const unicodeString = Encoding.convert(codes, {
        to: 'unicode',
        from: encoding,
        type: 'string',
      });
      Papa.parse(unicodeString, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          this._onComplete(results);
        },
      });
    };
    reader.readAsArrayBuffer(file);
  }

  _onComplete = (results: Object) => {
    this.props.handleParseImportCsv(results.data);
  }

  _toggledOrderDir(newKey: string): -1 | 1 {
    const isChangedKey = _.get(this.state.order, '0.key') !== newKey;
    if (isChangedKey) {
      return 1;
    }
    return _.get(this.state.order, '0.dir') === 1 ? -1 : 1;
  }

  _refreshPage(page: number = 0) {
    this.setState({page});
  }

  _calcPagenation(page: number, filteredItems: Array<Object>): Object {
    const totalPages = Math.ceil(filteredItems.length / this.props.pageSize);
    const items = ice.slice(filteredItems, page * this.props.pageSize, (page * this.props.pageSize) + this.props.pageSize);
    return {
      totalPages,
      items,
    };
  }

  _isMatchedItem(item: Object, pattern: string): boolean {
    if (pattern === '') {
      return true;
    }
    const words = pattern.split(/[\s\u00A0\u3000]/); // half and full space
    return _.every(words, (word) => {
      return FormFieldSearch.matchesForm(item, this.props.schema, this.props.schemaForm, this.props.baseFieldId, word);
    });
  }

  _filteredItems(): Array<Object> {
    const items = this.props.items;
    const filtered = _.filter(items, item => this._isMatchedItem(item, this._pattern));
    return this._sortItems(filtered);
  }

  _isNumberByKey(schema: Object, key: string) {
    if (key === 'price' || key === 'btc' || key === 'nanj') {
      return true;
    }
    return _.get(schema, `properties.${key}.type`, '') === 'number';
  }

  _sortItems(items: Array<Object>): Array<Object> {
    if (!_.get(this.state.order, '0.key')) {
      return items;
    }
    const firstField = _.find(this.props.schemaForm, {key: _.get(this.state.order, '0.key')});
    if (!firstField) {
      return items;
    }

    const funcs = [(item) => {
      const str = FormFieldStringifier.deepStringify(item, this.props.schema, firstField, this.props.baseFieldId);
      return this._isNumberByKey(this.props.schema, _.get(firstField, 'key')) && str ? _.toNumber(str) : str;
    }];
    const orders = [_.get(this.state.order, '0.dir') === 1 ? 'asc' : 'desc'];

    const secondField = _.find(this.props.schemaForm, {key: _.get(this.state.order, '1.key')});
    if (secondField) {
      funcs.push((item) => {
        const str = FormFieldStringifier.deepStringify(item, this.props.schema, secondField, this.props.baseFieldId);
        return this._isNumberByKey(this.props.schema, _.get(secondField, 'key')) && str ? _.toNumber(str) : str;
      });
      orders.push(_.get(this.state.order, '1.dir') === 1 ? 'asc' : 'desc');
    }

    return _.orderBy(items, funcs, orders);
  }

  _pattern: string;
  _store: any;

  state: {
    checkedIds?: Array<string>, // ?: for babel
    page: number,
    order?: Array<Object>,
    showConfirmDialog: boolean,
  };

  static NONE = NONE;
  static CREATE = CREATE;
  static EDIT = EDIT;
  static DELETE = DELETE;
  static DISABLE = DISABLE;
  static ENABLE = ENABLE;
  static EXPORT = EXPORT;
  static IMPORT = IMPORT;

  _renderCreateButton(): Object {
    return (
      <Button onClick={this._onClickCreateItem}>
        {
          this.props.childCreateButtonTitle ? this.props.childCreateButtonTitle : i18n.t('common.create')
        }
      </Button>
    );
  }

  _renderImportButton(): Object {
    let dropzoneRef;
    return (
      <div>
      </div>
    );
  }

  _renderRegisterButton(): Object {
    return (
      <Button onClick={this._onClickRegisterItem}>
        {
          this.props.registerButtonTitle ? this.props.registerButtonTitle : i18n.t('common.register')
        }
      </Button>
    );
  }

  _renderHiddenColSettingButton(): Object {
    return (
      <Button onClick={this._onClickChangeHiddenColSetting}>
        {i18n.t('CustomTable.changeHiddenColSetting')}
      </Button>
    );
  }

  _renderButtonColumn(): Object {
    const table = this;

    return {
      name: i18n.t('CustomTable.operation'),
      component: createReactClass({
        propTypes: {
          model: PropTypes.object.isRequired,
        },

        render() {
          /* eslint-disable react/jsx-no-bind */
          const onClickEdit = (table._onClickEditItem || function () {}).bind(table, this.props.model);
          const onClickDelete = (table._onClickDeleteItem || function () {}).bind(table, this.props.model);
          const onClickDisable = (table._onClickDisableItem || function () {}).bind(table, this.props.model);
          const onClickEnable = (table._onClickEnableItem || function () {}).bind(table, this.props.model);
          const onClickExport = (table._onClickExportItem || function () {}).bind(table, this.props.model);
          /* eslint-enable react/jsx-no-bind */

          const flags = table.props.getEditAndDeletePermission(this.props.model);
          const disableFlag = table.props.getDisablePermission(this.props.model);
          const enableFlag = table.props.getEnablePermission(this.props.model);
          const exportFlag = table.props.getExportPermission(this.props.model);
          console.assert(_.isNumber(flags));
          return (
            <span>
              {
                (flags & EDIT) ? (
                  <Button onClick={onClickEdit}>{i18n.t('common.edit')}</Button>
                ) : ('')
              }
              {
                (flags & DELETE) ? (
                  <ConfirmButton modalBody={i18n.t('common.confirmDelete')} onClick={onClickDelete}>{i18n.t('common.delete')}</ConfirmButton>
                ) : ('')
              }
              {
                (disableFlag & DISABLE) ? (
                  <ConfirmButton modalBody={i18n.t('common.confirmDisable')} onClick={onClickDisable}>{i18n.t('common.disable')}</ConfirmButton>
                ) : ('')
              }
              {
                (enableFlag & ENABLE) ? (
                  <ConfirmButton modalBody={i18n.t('common.confirmEnable')} onClick={onClickEnable}>{i18n.t('common.enable')}</ConfirmButton>
                ) : ('')
              }
              {
                (exportFlag & EXPORT) ? (
                  <Button onClick={onClickExport}>{i18n.t('common.export')}</Button>
                ) : ('')
              }
            </span>
          );
        },
      }),
    };
  }

  _renderColumn(formFieldOrKey: any, i: number): Object {
    const table = this;
    const formField = _.isString(formFieldOrKey) ? {key: formFieldOrKey} : formFieldOrKey;
    const schemaForm = [_.assign({}, formField, {notitle: true})];

    const canOder = !_.get(formField, 'xSkipStringify') && _.get(formField, 'type') !== 'section'; // ignore buttons col
    return {
      name: (formField: Object).title,
      key: _.get(formField, 'key', `column${i}`),
      component: createReactClass({
        propTypes: {
          model: PropTypes.object.isRequired,
        },
        render() {
          if (_.isEmpty(table.props.schema)) {
            return (<div />);
          }

          return (
            <CustomObjectField
              schema={table.props.schema}
              schemaForm={schemaForm}
              baseFieldId={table.props.baseFieldId}
              value={this.props.model}
              fieldWrapping={table.props.fieldWrapping}
              scope={table.props.scope}
            />
          );
        },
      }),
      columnSchemaForm: schemaForm,
      getClassName: table.props.getColumnClassName,
      onChangeOrder: canOder ? () => { this._onChangeOrder(formField); } : undefined,
    };
  }

  _renderCheckboxOrRadioColumn(): Object {
    const table = this;
    const inputType = this.props.hasCheckbox ? 'checkbox' : 'radio';
    return {
      name: i18n.t('CustomTable.checkboxColumnName'),
      component: createReactClass({
        propTypes: {
          model: PropTypes.object.isRequired,
        },

        getInitialState() {
          return {
            checked: _.contains(table.state.checkedIds, this.props.model._id),
          };
        },

        componentDidMount() {
          this._updateRowColor();
        },

        componentDidUpdate() {
          this._updateRowColor();
        },

        onChange(e) {
          table._onChangeChecked(this.props.model);
          e.stopPropagation();
        },

        _updateRowColor() {
          $(ReactDOM.findDOMNode(this)).closest('tr').css(this.getStyles().tr);
        },

        getStyles() {
          return {
            tr: {
              backgroundColor: this.state.checked ? '#faa' : 'transparent',
            },
          };
        },

        render() {
          return (
            <span>
              <Input
                label=" " // for layout
                type={inputType}
                onChange={this.onChange}
                checked={this.state.checked}
              />
            </span>
          );
        },
      }),
    };
  }

  _renderColumns(): Array<Object> {
    const columns = [];

    if (this.props.hasCheckbox || this.props.hasRadio) {
      columns.push(this._renderCheckboxOrRadioColumn());
    }

    _.transform(this.props.schemaForm, (acc, formFieldOrKey, i) => {
      acc.push(this._renderColumn(formFieldOrKey, i));
    }, columns);

    if (this.props.hasButtonColumn) {
      columns.push(this._renderButtonColumn());
    }
    return columns;
  }

  _renderAdditionalHeader(): ?Object {
    if (!this.props.additionalHeaderNode) {
      return null;
    }

    return (
      <div style={{marginRight: 15}}>
        {this.props.additionalHeaderNode}
      </div>
    );
  }

  _renderPageableTable(): Object {
    const filteredItems = this._filteredItems();
    const {totalPages, items} = this._calcPagenation(this.state.page, filteredItems);

    return (
      <div className="custom-table">
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0'}}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            {
              (this.props.hasButtonColumn && (this.props.getCreatePermission() & CREATE)) ? (
                <div style={{marginRight: 15}}>
                  {this._renderCreateButton()}
                </div>
              ) : (
                ''
              )
            }
            {
              (this.props.hasButtonColumn && (this.props.getImportPermission() & IMPORT)) ? (
                <div style={{marginRight: 15}}>
                  {this._renderRegisterButton()}
                </div>
              ) : (
                ''
              )
            }
            {
              (this.props.onClickChangeHiddenColSetting) ? (
                <div style={{marginRight: 15}}>
                  {this._renderHiddenColSettingButton()}
                </div>
              ) : (
                ''
              )
            }
            {this._renderAdditionalHeader()}
            <Pagination
              style={{margin: 0}}
              bsSize="small"
              prev="true"
              next="true"
              first="true"
              last="true"
              ellipsis="true"
              items={totalPages}
              maxbuttons={5}
              activepage={this.state.page + 1/* zero-based to one-based */}
              onSelect={pageBasedOne => this._onSelectPage(pageBasedOne - 1 /* one-based to zero-based */)}
            />
            <div style={{paddingLeft: 15}}>
              {(this.state.page * this.props.pageSize) + 1}
              {' - '}
              {_.min([(this.state.page * this.props.pageSize) + this.props.pageSize, this.props.items.length])}
              {' / '}
              {this.props.items.length}
            </div>
          </div>
          <div style={{width: 300}}>
            <SearchComponent
              bsSize="small"
              standalone
              onChange={this._onChangeSearch}
            />
          </div>
        </div>
        <TableComponent
          columns={this._renderColumns()}
          items={items}
          schema={this.props.schema}
          bordered={this.props.bordered}
          order={this.state.order}
          showOrderMarker={!!this.props.onChangeOrder}
        />
        {this.props.children}
      </div>
    );
  }

  _renderEditButtons(): Object {
    const item = _.first(this.props.items);
    /* eslint-disable react/jsx-no-bind */
    const onClickEdit = (this._onClickEditItem || function () {}).bind(this, item);
    const onClickDelete = (this._onClickDeleteItem || function () {}).bind(this, item);
    const onClickDisable = (this._onClickDisableItem || function () {}).bind(this, item);
    const onClickEnable = (this._onClickEnableItem || function () {}).bind(this, item);
    const onClickExport = (this._onClickExportItem || function () {}).bind(this, item);
    /* eslint-enable react/jsx-no-bind */

    const flags = this.props.getEditAndDeletePermission(item);
    const disableFlag = this.props.getDisablePermission(item);
    const enableFlag = this.props.getEnablePermission(item);
    const exportFlag = this.props.getExportPermission(item);
    console.assert(_.isNumber(flags));
    return (
      <span>
        {
          (flags & EDIT) ? (
            <Button onClick={onClickEdit}>{i18n.t('common.edit')}</Button>
          ) : ('')
        }
        {
          (flags & DELETE) ? (
            <ConfirmButton modalBody={i18n.t('common.confirmDelete')} onClick={onClickDelete}>{i18n.t('common.delete')}</ConfirmButton>
          ) : ('')
        }
        {
          (disableFlag & DISABLE) ? (
            <ConfirmButton modalBody={i18n.t('common.confirmDisable')} onClick={onClickDisable}>{i18n.t('common.disable')}</ConfirmButton>
          ) : ('')
        }
        {
          (enableFlag & ENABLE) ? (
            <ConfirmButton modalBody={i18n.t('common.confirmEnable')} onClick={onClickEnable}>{i18n.t('common.enable')}</ConfirmButton>
          ) : ('')
        }
        {
          (exportFlag & EXPORT) ? (
            <Button onClick={onClickExport}>{i18n.t('common.export')}</Button>
          ) : ('')
        }
      </span>
    );
  }

  _renderPanelHeader(): Object {
    return (
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0'}}>
        <div style={{display: 'flex', alignItems: 'center'}}>
          {this.props.tableName}
        </div>
        <div style={{display: 'flex', alignItems: 'center'}}>
          {
            (this.props.getCreatePermission() & CREATE) ? (
              <div style={{marginRight: 15}}>
                {this._renderCreateButton()}
              </div>
            ) : (
              ''
            )
          }
          {
            (this.props.hasNestTable) ? (<div>{this._renderEditButtons()}</div>) : ('')
          }
        </div>
      </div>
    );
  }

  _renderPanelTable(): Object {
    return (
      <div className="custom-table">
        <Panel header={this._renderPanelHeader()}>
          <TableComponent
            columns={this._renderColumns()}
            items={this.props.items}
            schema={this.props.schema}
            hasHeader
            bordered={this.props.bordered}
            fill
          />
          {this.props.children}
        </Panel>
      </div>
    );
  }

  render(): Object {
    const filteredItems = this._filteredItems();
    if (this.props.hasPager) {
      return this._renderPageableTable();
    }
    if (this.props.hasPanelHeader) {
      return this._renderPanelTable();
    }
    return (
      <div className="custom-table">
        {this._renderAdditionalHeader()}
        {
          (this.props.hasNestTable) ? (<div>{this._renderEditButtons()}</div>) : ('')
        }
        <TableComponent
          columns={this._renderColumns()}
          items={filteredItems}
          schema={this.props.schema}
          bordered={this.props.bordered}
          order={this.state.order}
          showOrderMarker={!!this.props.onChangeOrder}
          setClassName={this.props.setClassName}
        />
        {this.props.children}
      </div>
    );
  }
}

export default CustomTable;
/* eslint-enable react/jsx-no-bind */
/* eslint-enable react/prop-types */
