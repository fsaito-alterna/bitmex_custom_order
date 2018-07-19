// @flow
import _ from 'lodash';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import PropTypes from 'prop-types';

import Orig from './OrigCustomTextAreaEditField';
import CustomFieldWrapping from './CustomFieldWrapping';

function EmptyFieldWrapping(props: Object) {
  return <div>{props.children}</div>;
}

class CustomTextAreaEditField extends Component {
  static propTypes = {
    formField: PropTypes.shape({
      xTextTemplates: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
      })),
    }).isRequired,
  }

  _onChangeSelect = (e: Object) => {
    if (e.text) {
      // use validation of original component
      const $el = $(ReactDOM.findDOMNode(this));
      const $textarea = $el.find('textarea');
      $textarea.val(e.text);
      ((this._origRef: any): Object)._onChange({target: {value: e.text}});
    }
  }

  _getOptions() {
    return _.map(this.props.formField.xTextTemplates, (item, i) => {
      return {
        label: item.title,
        text: item.text,
        value: i,
      };
    });
  }

  _origRef: ?Object;

  _renderSelect(): ?Object {
    if (_.isEmpty(this.props.formField.xTextTemplates)) {
      return null;
    }
    return (
      <Select
        options={this._getOptions()}
        onChange={this._onChangeSelect}
        value={-1}  // for clear
        clearable={false}
        searchable={false}
      />
    );
  }

  render() {
    const props = _.assign({}, this.props, {fieldWrapping: EmptyFieldWrapping});
    return (
      <CustomFieldWrapping {...this.props}>
        {this._renderSelect()}
        <Orig
          ref={(c) => { this._origRef = c; }}
          {...props}
        />
      </CustomFieldWrapping>
    );
  }
}

export default CustomTextAreaEditField;
