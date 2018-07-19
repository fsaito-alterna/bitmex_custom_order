// @flow
/*
 * Copyright(c) 2016 ACCESS CO., LTD. All rights reserved.
 */

import i18n from 'i18next';
import React from 'react';
import {Modal, Button} from 'react-bootstrap';
import PropTypes from 'prop-types';

class ConfirmDialog extends React.Component {

  static propTypes = {
    onSubmit: PropTypes.func,
    onHide: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    titleText: PropTypes.string,
    bodyText: PropTypes.string.isRequired,
    closeText: PropTypes.string,
    option: PropTypes.any,
  }

  _onSubmit = (e: Object) => {
    e.preventDefault();
    this.props.onSubmit(this.props.option);
  }

  _onHide = () => {
    this.props.onHide();
  }

  _titleText() {
    return this.props.titleText || i18n.t('common.confirm');
  }

  _closeText() {
    return this.props.closeText || i18n.t('common.cancel');
  }

  render(): Object {
    return (
      <div>
        <Modal
          keyboard={false}
          backdrop="static"
          show={this.props.show}
          onHide={this._onHide}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {this._titleText()}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {this.props.bodyText}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this._onHide}>{this._closeText()}</Button>
            {
              this.props.onSubmit ?
                <Button onClick={this._onSubmit}>{i18n.t('common.submit')}</Button>
                : null
            }
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default ConfirmDialog;
