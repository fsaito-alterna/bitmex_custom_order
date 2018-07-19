/*
 * Copyright(c) 2016 ACCESS CO., LTD. All rights reserved.
 */
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import PropTypes from 'prop-types';
// import {Input} from 'react-bootstrap';

// function _hookSelectComponentDidUpdate(defaultSelectComponentDidUpdate, prevProps, prevState) {
//   defaultSelectComponentDidUpdate(prevProps, prevState);
//   const selectDOMNode = ReactDOM.findDOMNode(this);
//   const selectMenuOuterDOMNodes = selectDOMNode.getElementsByClassName('Select-menu-outer');
//   // FIXME: Often, it returned an array of size 0. But not know why.
//   if (selectMenuOuterDOMNodes !== null && _.size(selectMenuOuterDOMNodes) === 1) {
//     const selectMenuOuterDOMNode = selectMenuOuterDOMNodes[0];
//     const selectMenuOuterClientRect = selectMenuOuterDOMNode.getBoundingClientRect();
//     const selectControlDOMNodes = selectDOMNode.getElementsByClassName('Select-control');
//     console.assert(selectControlDOMNodes !== null && _.size(selectControlDOMNodes) === 1);
//     const selectControlDOMNode = selectControlDOMNodes[0];
//     const selectControlClientRect = selectControlDOMNode.getBoundingClientRect();
//     let marginTop = _.parseInt(selectMenuOuterDOMNode.style.marginTop);
//     marginTop = _.isFinite(marginTop) ? marginTop : 0;
//     if (marginTop === 0) {
//       if (document.documentElement.clientHeight < selectMenuOuterClientRect.bottom) {
//         marginTop -= selectControlClientRect.height + selectMenuOuterClientRect.height;
//         marginTop += 1;
//       } else {
//         marginTop -= 1;
//       }
//       selectMenuOuterDOMNode.style.marginTop = `${marginTop}px`;
//     }
//   }
// }

// const SearchableSelect = React.createClass({
//   propTypes: {
//     // <Input> as a wrapper
//     label: PropTypes.string,
//     help: PropTypes.node,
//     addonAfter: PropTypes.node,
//     addonBefore: PropTypes.node,
//     buttonAfter: PropTypes.node,
//     buttonBefore: PropTypes.node,
//     labelClassName: PropTypes.string,
//     wrapperClassName: PropTypes.string,
//     bsStyle: PropTypes.oneOf(['success', 'warning', 'error']),
//     standalone: PropTypes.bool,
//     wrapperStyle: PropTypes.object, // style object
//     // <Select>
//     options: PropTypes.arrayOf(PropTypes.shape({
//       value: PropTypes.any,
//       label: PropTypes.string,
//     })),
//     initialValue: PropTypes.any,
//     onChange: PropTypes.func,
//     name: PropTypes.string,
//     placeholder: PropTypes.string,
//     noResultsText: PropTypes.string,
//     disabled: PropTypes.bool,
//     searchable: PropTypes.bool,
//     matchProp: PropTypes.oneOf(['any', 'value', 'label']),
//     ignoreCase: PropTypes.bool,
//     backspaceRemoves: PropTypes.bool,
//     valueKey: PropTypes.string,
//     labelKey: PropTypes.string,
//     multi: PropTypes.bool,
//     // <input> for HTML5 form validation
//     required: PropTypes.bool,
//   },

//   getDefaultProps() {
//     return {
//       options: [],
//       onChange: (value) => {},
//       placeholder: '', // Clear <Select>'s default
//       noResultsText: '', // Clear <Select>'s default
//       disabled: false,
//       searchable: true,
//       matchProp: 'label',
//       ignoreCase: true,
//       backspaceRemoves: true,
//       valueKey: 'value',
//       labelKey: 'label',
//       required: false,
//     };
//   },

//   componentDidMount() {
//     const selectNode = this.refs.select;
//     const defaultSelectComponentDidUpdate = selectNode.componentDidUpdate.bind(selectNode);
//     selectNode.componentDidUpdate = _hookSelectComponentDidUpdate.bind(selectNode, defaultSelectComponentDidUpdate);
//   },

//   _onChange(value) {
//     ReactDOM.findDOMNode(this.refs.input).value = value;
//     // NOTE: When there is no select, value is an empty string
//     let newValue;
//     if (this.props.multi && value) {
//       newValue = value.split(',');
//     } else if (this.props.multi) {
//       newValue = undefined;
//     } else {
//       newValue = value;
//     }
//     this.props.onChange(newValue);
//   },

//   render() {
//     // <Select>'s clearable prop is reversal of required because it allows for there is no select
//     const clearable = !this.props.required && !this.props.multi;
//     // <Select>'s backspaceRemoves prop has meaning only when clearable is true
//     const backspaceRemoves = clearable && this.props.backspaceRemoves;
//     // <Input>'s hasFeedback prop can not be used since overlap with arrow zone
//     const hasFeedback = false;
//     return (
//       <Input
//         hasFeedback={hasFeedback}
//         label={this.props.label}
//         help={this.props.help}
//         addonAfter={this.props.addonAfter}
//         addonBefore={this.props.addonBefore}
//         buttonAfter={this.props.buttonAfter}
//         buttonBefore={this.props.buttonBefore}
//         labelClassName={this.props.labelClassName}
//         wrapperClassName={this.props.wrapperClassName}
//         bsStyle={this.props.bsStyle}
//         standalone={this.props.standalone}
//         style={this.props.wrapperStyle}
//       >
//         <div style={{position: 'relative'}}>
//           <input
//             className="SearchableSelect-input"
//             tabIndex="-1"
//             required={this.props.required}
//             value={this.props.initialValue}
//             onChange={() => {
//               // NOTE: This empty function is to avoid react's warning
//             }}
//             ref="input"
//           />
//         </div>
//         <Select
//           options={this.props.options}
//           value={this.props.initialValue}
//           onChange={this._onChange}
//           placeholder={this.props.placeholder}
//           noResultsText={this.props.noResultsText}
//           name={this.props.name}
//           disabled={this.props.disabled}
//           searchable={this.props.searchable}
//           matchProp={this.props.matchProp}
//           ignoreCase={this.props.ignoreCase}
//           clearable={clearable}
//           backspaceRemoves={backspaceRemoves}
//           valueKey={this.props.valueKey}
//           labelKey={this.props.labelKey}
//           multi={this.props.multi}
//           ref="select"
//         />
//       </Input>
//     );
//   },
// });

class SearchableSelect extends React.Component {
  static propTypes = {
    // <Input> as a wrapper
    label: PropTypes.string,
    help: PropTypes.node,
    addonAfter: PropTypes.node,
    addonBefore: PropTypes.node,
    buttonAfter: PropTypes.node,
    buttonBefore: PropTypes.node,
    labelClassName: PropTypes.string,
    wrapperClassName: PropTypes.string,
    bsStyle: PropTypes.oneOf(['success', 'warning', 'error']),
    standalone: PropTypes.bool,
    wrapperStyle: PropTypes.object, // style object
    // <Select>
    options: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.any,
      label: PropTypes.string,
    })),
    initialValue: PropTypes.any,
    onChange: PropTypes.func,
    name: PropTypes.string,
    placeholder: PropTypes.string,
    noResultsText: PropTypes.string,
    disabled: PropTypes.bool,
    searchable: PropTypes.bool,
    matchProp: PropTypes.oneOf(['any', 'value', 'label']),
    ignoreCase: PropTypes.bool,
    backspaceRemoves: PropTypes.bool,
    valueKey: PropTypes.string,
    labelKey: PropTypes.string,
    multi: PropTypes.bool,
    // <input> for HTML5 form validation
    required: PropTypes.bool,
  }

  getDefaultProps() {
    return {
      options: [],
      onChange: (value) => {},
      placeholder: '', // Clear <Select>'s default
      noResultsText: '', // Clear <Select>'s default
      disabled: false,
      searchable: true,
      matchProp: 'label',
      ignoreCase: true,
      backspaceRemoves: true,
      valueKey: 'value',
      labelKey: 'label',
      required: false,
    };
  }

  _onChange(option) { // option is null on clear
    const value = _.get(option, 'value', null);
    ReactDOM.findDOMNode(this._input).value = value;
    // NOTE: When there is no select, value is an empty string
    let newValue;
    if (this.props.multi && value) {
      newValue = value.split(',');
    } else if (this.props.multi) {
      newValue = undefined;
    } else {
      newValue = value;
    }
    this.props.onChange(newValue);
  }

  render() {
    // <Select>'s clearable prop is reversal of required because it allows for there is no select
    const clearable = !this.props.required && !this.props.multi;
    // <Select>'s backspaceRemoves prop has meaning only when clearable is true
    const backspaceRemoves = clearable && this.props.backspaceRemoves;
    return (
      <div
        style={this.props.wrapperStyle}
      >
        <div style={{position: 'relative'}}>
          <input
            className="SearchableSelect-input"
            tabIndex="-1"
            required={this.props.required}
            value={this.props.initialValue}
            onChange={() => {
              // NOTE: This empty function is to avoid react's warning
            }}
            ref={(c) => { this._input = c; }}
          />
        </div>
        <Select
          options={this.props.options}
          value={this.props.initialValue}
          onChange={this._onChange}
          placeholder={this.props.placeholder}
          noResultsText={this.props.noResultsText}
          name={this.props.name}
          disabled={this.props.disabled}
          searchable={this.props.searchable}
          matchProp={this.props.matchProp}
          ignoreCase={this.props.ignoreCase}
          clearable={clearable}
          backspaceRemoves={backspaceRemoves}
          valueKey={this.props.valueKey}
          labelKey={this.props.labelKey}
          multi={this.props.multi}
          ref={(c) => { this._select = c; }}
        />
      </div>
    );
  }
}

export default SearchableSelect;
