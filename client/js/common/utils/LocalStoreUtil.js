// @flow
import _ from 'lodash';
import {combineReducers} from 'redux';

// Usage:
//
// const localKey = '';
// LocalStoreUtil.registerLocalStoreUtil({key: localKey});
//
// class ExampleContainer extends Component {
//   ...
//   _onClick() {
//     this.context.store.dispatch(indexItems('incident', {localKey}));
//   }
// }
//
// const mapStateToProps = (state: Object, ownProps: Object) => {
//   return {
//     items: state.local[localKey].incidents,
//   };
// };
//
// const localConfig = {
//   key: localKey,
// };
//
// export default connect(
//   mapStateToProps
// )(
//   LocalStoreUtil.connect(
//     localConfig
//   )(IncidentTableContainer)
// );

class LocalStoreUtil {
  static _registerd = {}; // singleton

  static appendLocakKey(type: string, localKey: ?string) {
    return localKey ? `local/${localKey}/${type}` : type;
  }

  static connect({key}: {key: string}) {
    // TODO: add fieldNames
    this._registerd[key] = {};
    return (component: Object) => {
      // TODO: create wrapper component and register/unregister reducers on componentWillUnmount/componentWillUnmount for performance
      return component;
    };
  }

  static addLocalStore(reducers: Object) {
    if (_.size(this._registerd) === 0) {
      return reducers;
    }
    const locals = _.reduce(this._registerd, (m, _v, key) => {
      return {
        ...m,
        [key]: combineReducers(this._wrapReducers(reducers, key)),
      };
    }, {});
    return {
      ...reducers,
      local: combineReducers(locals),
    };
  }

  static _wrapReducer(reducer: Function, localKey: string) {
    return (state: any, action: any) => {
      const re = new RegExp(`^local/(${localKey})/(.*)`);
      const m = action.type.match(re);
      if (m && m[1] === localKey) {
        return reducer(state, _.assign({}, action, {
          type: m[2],
        }));
      }
      const isReduxBuildInAction = !!action.type.match(/^@@/);
      if (isReduxBuildInAction) {
        return reducer(state, action);
      }
      // another local key or global type
      // If you don't call reducer, this function reutrn undefined in the case of arguments[0] is undefined.
      // It makes error on redux
      return reducer(state, _.assign({}, action, {
        type: `ignore/${action.type}`,
      }));
    };
  }

  static _wrapReducers(reducers: Object, localKey: string) {
    return _.transform(reducers, (m: Object, reducer: Function, key: string) => {
      m[key] = this._wrapReducer(reducer, localKey);
    }, {});
  }
}

export default LocalStoreUtil;

