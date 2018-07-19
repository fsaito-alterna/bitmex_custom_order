// @flow
import _ from 'lodash';
import {t} from 'i18next';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import PageContentComponent from '../components/PageContentComponent';
import HeaderNavBarMenuComponent from '../components/HeaderNavBarMenuComponent';

class CERootPageInnerContainer extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]).isRequired,
  }

  static contextTypes = {
    store: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
  }

  componentDidMount() {
    this._retrieve();
  }

  _retrieve() {
  }

  _getMenuItems(): Array<Object> {
    return _.map(this.constructor.menuItems, ({id, enabled, type}) => {
      return {
        id,
        enabled,
        title: t(`Orders.${id}`),
        basePath: `/${id}`,
        type,
      };
    });
  }

  static menuItems = [
    {
      id: 'btc_orders',
      enabled: true,
    },
    {
      id: 'doge_orders',
      enabled: true,
    },
  ];

  render(): Object {
    const pageName = 'page';
    return (
      <div className={pageName}>
        <HeaderNavBarMenuComponent
          menuItems={this._getMenuItems()}
        />
        <div className="page-main">
          <PageContentComponent>
            <div>
              {this.props.children}
            </div>
          </PageContentComponent>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: Object, ownProps: Object) => {
  return {
    // relatedBases: state.relatedBases,
  };
};

export default connect(mapStateToProps)(CERootPageInnerContainer);
