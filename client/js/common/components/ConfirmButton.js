/*
 * Copyright(c) 2016 ACCESS CO., LTD. All rights reserved.
 */
import i18n from 'i18next';
import React from 'react';
import {Button, Modal} from 'react-bootstrap';
import PropTypes from 'prop-types';

class ConfirmButton extends React.Component {
  static propTypes = {
    modalTitle: PropTypes.node,
    modalBody: PropTypes.node,
    children: PropTypes.node,
    onClick: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      show: false,
    };
  }

  _onClickShow = () => {
    this.setState({show: true});
  }

  _onHide = () => {
    this.setState({show: false});
  }

  _onClickConfirm = () => {
    this.props.onClick();
    // We do not call this._onHide() here, because we assume that this component is unmounted by a rendering of a parent component. Cf. #78925
  }

  render() {
    const {modalBody, ...rest} = this.props;
    return (
      <span>
        <Button
          {...rest}
          onClick={this._onClickShow}
        >
          {this.props.children}
        </Button>
        <Modal
          keyboard={false}
          backdrop="static"
          onHide={this._onHide}
          show={this.state.show}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {this.props.modalTitle || i18n.t('common.confirm')}
            </Modal.Title>
          </Modal.Header>
          {
            modalBody ? (
              <Modal.Body>
                {modalBody}
              </Modal.Body>
            ) : (
              ''
            )
          }
          <Modal.Footer>
            <Button onClick={this._onHide}>{i18n.t('common.cancel')}</Button>
            <Button onClick={this._onClickConfirm}>{i18n.t('common.submit')}</Button>
          </Modal.Footer>
        </Modal>
      </span>
    );
  }
}

export default ConfirmButton;
