/*
 * Copyright(c) 2016 ACCESS CO., LTD. All rights reserved.
 */
import i18n from 'i18next';
import ReactDOM from 'react-dom';
import React from 'react';
import {FormGroup, FormControl, Button, Glyphicon, Form} from 'react-bootstrap';
import PropTypes from 'prop-types';

class SearchComponent extends React.Component {
  static propTypes = {
    initialPattern: PropTypes.string,
    onChange: PropTypes.func.isRequired, // onChange(string)
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    standalone: PropTypes.bool,
    bsSize: PropTypes.string, // entrust 'oneOf' to React-Bootstrap
    inputBsStyle: PropTypes.string, // (ditto)
    buttonBsStyle: PropTypes.string, // (ditto)
    inputStyle: PropTypes.object, // style object
    buttonStyle: PropTypes.object, // (ditto)
  }

  static defaultProps = {
    initialPattern: '',
  }

  _onChange = () => {
    const input = ReactDOM.findDOMNode(this._input);
    const pattern = input.value;
    this.setState({pattern: pattern}, () => {
      this.props.onChange(this.state.pattern);
    });
  }

  _onClickButton = (e) => { // e is SyntheticEvent
    e.preventDefault();
    this._onChange();
  }

  _onKeyPressInput = (e) => { // e is SyntheticEvent
    if (e.which === 13) { // ENTER key pressed
      e.preventDefault();
      this._onChange();
    }
  }

  render() {
    return (
      <div role="search">
        <Form inline>
          <FormGroup>
            <FormControl
              ref={(c) => { this._input = c; }}
              type="text"
              defaultValue={this.props.initialPattern}
              onKeyPress={this._onKeyPressInput}
              placeholder={this.props.placeholder}
              bsSize={this.props.bsSize}
              bsStyle={this.props.inputBsStyle}
              style={this.props.inputStyle}
              disabled={this.props.disabled}
            />
            <Button
              onClick={this._onClickButton}
              bsSize={this.props.bsSize}
              bsStyle={this.props.buttonBsStyle}
              style={this.props.buttonStyle}
              disabled={this.props.disabled}
            >
              <Glyphicon glyph="search" /> {i18n.t('common.search')}
            </Button>
          </FormGroup>
        </Form>
      </div>
    );
  }
}

export default SearchComponent;
