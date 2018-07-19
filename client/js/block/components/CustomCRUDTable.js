// @flow
/*
 * Copyright(c) 2016 ACCESS CO., LTD. All rights reserved.
 */

import _ from 'lodash';
import bluebird from 'bluebird';
import React from 'react';
import PropTypes from 'prop-types';

import CustomTable from '../../common/components/CustomTable';
import CustomEditDialog from '../../common/components/CustomEditDialog';

class CustomCRUDTable extends React.Component {
  static propTypes = {
    // common
    schema: PropTypes.object.isRequired,
    schemaForm: PropTypes.array.isRequired,
    createSchemaForm: PropTypes.array,
    editSchemaForm: PropTypes.array,
    baseFieldId: PropTypes.string,
    additionalHeaderNode: PropTypes.node,
    fieldWrapping: PropTypes.object, // See CustomFieldWrapping for detail
    scope: PropTypes.object, // angular expression's execution scope
    sections: PropTypes.array,
    dialogClassName: PropTypes.string,
    htmlClassName: PropTypes.string,
    hookEditSchema: PropTypes.func,
    hookEditItem: PropTypes.func,
    onBeforeClickCreateItem: PropTypes.func, // () => boolean
    onChangeStore: PropTypes.func, // (event) => {}
    hasPager: PropTypes.bool,
    hasPanelHeader: PropTypes.bool,
    tableName: PropTypes.string,
    bordered: PropTypes.bool,
    hasButtonColumn: PropTypes.bool,
    childCreateButtonTitle: PropTypes.string,
    registerButtonTitle: PropTypes.string,
    getColumnClassName: PropTypes.func,
    order: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
    ]),
    setClassName: PropTypes.func,
    mode: PropTypes.string,
    // create
    initialItem: PropTypes.object,
    getCreatePermission: PropTypes.func, // () => permission
    onCreate: PropTypes.func, // (item) => Promise
    childInitialItem: PropTypes.object,
    childSchema: PropTypes.object,
    childSchemaForm: PropTypes.array,
    // edit/delete
    getEditAndDeletePermission: PropTypes.func, // (item) => permission
    onEdit: PropTypes.func, // (item) => Promise
    // enable/disable
    getEnablePermission: PropTypes.func, // (item) => permission
    getDisablePermission: PropTypes.func, // (item) => permission
    // export
    getExportPermission: PropTypes.func, // (item) => permission
    // import
    getImportPermission: PropTypes.func,
    handleParseImportCsv: PropTypes.func, // handleParseImportCsv()
    // index
    onSubmitHiddenColMap: PropTypes.func,
    onChangeOrder: PropTypes.func,
    actions: PropTypes.object, // PaginationActions
    pageSize: PropTypes.number,
    defaultSort: PropTypes.string, // JSON String
    queryFields: PropTypes.array, // Cf. PaginationHelper.makeFilterQuery
    items: PropTypes.array,
  }

  static defaultProps = {
    hasButtonColumn: true,
    sections: [],
    getCreatePermission: () => CustomTable.CREATE,
    getEditAndDeletePermission: (_item: Object) => { return CustomTable.EDIT; },
    getDisablePermission: (_item: Object) => { return CustomTable.NONE; },
    getEnablePermission: (_item: Object) => { return CustomTable.NONE; },
    getExportPermission: (_item: Object) => { return CustomTable.NONE; },
  }

  constructor(props: Object) {
    super(props);
    this.state = {
      showCreactionDialog: false,
      showRegisterDialog: false,
      showEditDialog: false,
      showBlockEditDialog: false,
      editingItem: {},
    };
  }

  _onClickCreateItem = () => {
    if (this.props.onBeforeClickCreateItem) {
      if (!this.props.onBeforeClickCreateItem()) {
        return;
      }
    }
    this.setState({
      showCreactionDialog: true,
      creationDialogKey: _.uniqueId(),
    });
  }

  _onClickRegisterItem = () => {
    this.setState({
      showRegisterDialog: true,
      registerDialogKey: _.uniqueId(),
    });
  }

  _onClickEditItem = (item: Object) => {
    if (_.get(this.props, 'mode') === 'block') {
      this.setState({
        showBlockEditDialog: true,
        blockEditDialogKey: _.uniqueId(),
        editingItem: item,
      });
      return;
    }
    this.setState({
      showEditDialog: true,
      editDialogKey: _.uniqueId(),
      editingItem: item,
    });
  }

  _onCreate = (item: Object) => {
    return bluebird.resolve()
      .then(() => {
        if (this.props.onCreate) {
          return this.props.onCreate(item);
        }
        return this.props.actions.create(item);
      })
      .then(() => {
        return this._onHideCreactionDialog();
      });
  }

  _onRegister = (item: Object) => {
    return bluebird.resolve()
      .then(() => {
        return this.props.actions.create(item);
      })
      .then((result) => {
        if (_.get(result, 'status', null)) {
          return result;
        }
        return this._onHideRegisterDialog();
      });
  }

  _onEdit = (item: Object) => {
    bluebird.resolve()
      .then(() => {
        if (this.props.onEdit) {
          return this.props.onEdit(item);
        }
        return this.props.actions.update(item._id, item);
      })
      .then(() => {
        if (_.get(this.props, 'mode') === 'block') {
          this._onHideBlockEditDialog();
          return;
        }
        this._onHideEditDialog();
      });
  }

  _onClickDeleteItem = (item: Object) => {
    this.props.actions.delete(item);
  }

  _onClickDisableItem = (item: Object) => {
    this.props.actions.disable(item._id, item);
  }

  _onClickEnableItem = (item: Object) => {
    this.props.actions.enable(item._id, item);
  }

  _onHideCreactionDialog = () => {
    this.setState({showCreactionDialog: false});
  }

  _onHideEditDialog = () => {
    this.setState({showEditDialog: false});
  }

  _onHideBlockEditDialog = () => {
    this.setState({showBlockEditDialog: false});
  }

  _onHideRegisterDialog = () => {
    this.setState({showRegisterDialog: false});
  }

  _onClickExportItem = (item: Object) => {
    this.props.actions.export(item);
  }

  _onClickImportItem = () => {
    this.props.actions.import();
  }

  _filtereSchemaForm(schemaForm?: Array<Object>): ?Array<Object> {
    return schemaForm;
  }

  state: {
    showCreactionDialog: boolean,
    showEditDialog: boolean,
    showRegisterDialog: boolean,
    showBlockEditDialog: boolean,
    editingItem?: ?Object, // ?: for babel
    editDialogKey?: ?string, // ?: for babel
    blockEditDialogKey?: ? string,
    creationDialogKey?: ?string, // ?: for babel
    registerDialogKey?: ?string,
  };

  static NONE = CustomTable.NONE;
  static CREATE = CustomTable.CREATE;
  static EDIT = CustomTable.EDIT;
  static DELETE = CustomTable.DELETE;
  static DISABLE = CustomTable.DISABLE;
  static ENABLE = CustomTable.ENABLE;
  static EXPORT = CustomTable.EXPORT;
  static IMPORT = CustomTable.IMPORT;

  render(): Object {
    const filteredSchemaForm = this._filtereSchemaForm(this.props.schemaForm);
    return (
      <div>
        <CustomEditDialog
          mode="create"
          key={this.state.creationDialogKey}
          schema={this.props.schema}
          schemaForm={this.props.createSchemaForm || this.props.editSchemaForm || this.props.schemaForm}
          dialogClassName={this.props.dialogClassName}
          htmlClassName={this.props.htmlClassName}
          fieldWrapping={this.props.fieldWrapping}
          scope={this.props.scope}
          item={this.props.initialItem}
          onSubmit={this._onCreate}
          baseFieldId={this.props.baseFieldId}
          show={this.state.showCreactionDialog}
          onHide={this._onHideCreactionDialog}
          hookSchema={this.props.hookEditSchema}
          hookItem={this.props.hookEditItem}
        />
        <CustomEditDialog
          mode="edit"
          key={this.state.editDialogKey}
          schema={this.props.schema}
          schemaForm={this.props.editSchemaForm || this.props.schemaForm}
          dialogClassName={this.props.dialogClassName}
          htmlClassName={this.props.htmlClassName}
          fieldWrapping={this.props.fieldWrapping}
          scope={this.props.scope}
          onSubmit={this._onEdit}
          show={this.state.showEditDialog}
          onHide={this._onHideEditDialog}
          item={this.state.editingItem}
          hookSchema={this.props.hookEditSchema}
          hookItem={this.props.hookEditItem}
        />
        <CustomTable
          tableName={this.props.tableName}
          items={this.props.items}
          schema={this.props.schema}
          schemaForm={filteredSchemaForm}
          baseFieldId={this.props.baseFieldId}
          additionalHeaderNode={this.props.additionalHeaderNode}
          fieldWrapping={this.props.fieldWrapping}
          scope={this.props.scope}
          hasPager={this.props.hasPager}
          actions={this.props.actions}
          pageSize={this.props.pageSize}
          defaultSort={this.props.defaultSort}
          queryFields={this.props.queryFields}
          hasButtonColumn={this.props.hasButtonColumn}
          hasPanelHeader={this.props.hasPanelHeader}
          getCreatePermission={this.props.getCreatePermission}
          getEditAndDeletePermission={this.props.getEditAndDeletePermission}
          getExportPermission={this.props.getExportPermission}
          getImportPermission={this.props.getImportPermission}
          getDisablePermission={this.props.getDisablePermission}
          getEnablePermission={this.props.getEnablePermission}
          onClickCreateItem={this._onClickCreateItem}
          onClickEditItem={this._onClickEditItem}
          onClickDeleteItem={this._onClickDeleteItem}
          onClickDisableItem={this._onClickDisableItem}
          onClickEnableItem={this._onClickEnableItem}
          onClickExportItem={this._onClickExportItem}
          onClickRegisterItem={this._onClickRegisterItem}
          handleParseImportCsv={this.props.handleParseImportCsv}
          onClickChangeHiddenColSetting={undefined}
          onChangeStore={this.props.onChangeStore}
          onChangeOrder={this.props.onChangeOrder}
          bordered={this.props.bordered}
          childCreateButtonTitle={this.props.childCreateButtonTitle}
          getColumnClassName={this.props.getColumnClassName}
          order={this.props.order}
          setClassName={this.props.setClassName}
          registerButtonTitle={this.props.registerButtonTitle}
        />
      </div>
    );
  }
}

export default CustomCRUDTable;
