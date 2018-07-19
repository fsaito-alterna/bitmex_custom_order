// @flow
/*
 * Copyright(c) 2016 ACCESS CO., LTD. All rights reserved.
 */

import i18n from 'i18next';
import React from 'react';
import {Modal, Button} from 'react-bootstrap';
import PropTypes from 'prop-types';

import CustomEditObjectField from './CustomEditObjectField';

class CustomEditDialog extends React.Component {

  static propTypes = {
    mode: PropTypes.oneOf(['create', 'edit']).isRequired,
    schema: PropTypes.object.isRequired,
    schemaForm: PropTypes.array.isRequired,
    baseFieldId: PropTypes.string,
    item: PropTypes.object,
    dialogClassName: PropTypes.string,
    htmlClassName: PropTypes.string,
    onSubmit: PropTypes.func.isRequired, // (item) => {}
    hookSchema: PropTypes.func, // (schema, item) => schema
    hookItem: PropTypes.func, // (nextItem, prevItem) => nextItem
    onHide: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    fieldWrapping: PropTypes.object, // See CustomFieldWrapping for detail
    dialogTitle: PropTypes.string,
  }

  static defaultProps = {
    baseFieldId: 'data.',
    hookSchema: (schema, item) => schema,
    hookItem: (nextItem, prevItem) => nextItem,
  }

  constructor(props: Object) {
    super(props);
    const item = this.props.hookItem(this.props.item, null, this.props.mode);

    this.state = {
      item,
    };
  }

  _onSubmit = (e: Object) => {
    e.preventDefault();
    this.props.onSubmit(this.state.item);
  }

  _onHide = () => {
    this.props.onHide();
  }

  _onChange = (nextItem: Object) => {
    const item = this.props.hookItem(nextItem, this.state.item, this.props.mode);
    this.setState({item});
  }

  _getTitleText(): string {
    if (this.props.dialogTitle) {
      return this.props.dialogTitle;
    }
    if (this.props.mode === 'create') {
      return i18n.t('common.create');
    }
    return i18n.t('common.edit');
  }

  _getSubmitText(): string {
    if (this.props.mode === 'create') {
      return i18n.t('common.create');
    }
    return i18n.t('common.save');
  }

  state: {
    item?: ?Object, // ?: for babel
  }

  render(): Object {
    const schema = this.props.hookSchema(this.props.schema, this.state.item, this.props.mode);
    return (
      <div>
        <Modal
          keyboard={false}
          backdrop="static"
          show={this.props.show}
          onHide={this._onHide}
          dialogClassName={this.props.dialogClassName}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {this._getTitleText()}
            </Modal.Title>
          </Modal.Header>

          <form onSubmit={this._onSubmit}>
            <Modal.Body>
              {
                this.props.show ?
                  <CustomEditObjectField
                    schema={schema}
                    schemaForm={this.props.schemaForm}
                    htmlClassName={this.props.htmlClassName}
                    baseFieldId={this.props.baseFieldId}
                    value={this.state.item}
                    onChange={this._onChange}
                    fieldWrapping={this.props.fieldWrapping}
                  /> : null
              }
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this._onHide}>{i18n.t('common.close')}</Button>
              <Button type="submit">{this._getSubmitText()}</Button>
            </Modal.Footer>
          </form>
        </Modal>
      </div>
    );
  }
}

export default CustomEditDialog;
