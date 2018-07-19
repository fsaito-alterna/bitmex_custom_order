// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import styles from './PageContentComponent.css';

class PageContentComponent extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
  }

  static defaultProps = {
    children: [],
  }

  render(): Object {
    return (
      <div className={styles.self}>
        {this.props.children}
        <div className={styles.padForFooter} />
      </div>
    );
  }
}

export default PageContentComponent;
