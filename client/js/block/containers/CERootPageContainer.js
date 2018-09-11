// @flow
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {Router, Route, hashHistory, Redirect} from 'react-router';

import CERootPageInnerContainer from './CERootPageInnerContainer';
import BitmexOrderContainer from './BitmexOrderContainer';

class CERootPageContainer extends Component {
  static run({store, done}: {store: Object, done: Function}) {
    setTimeout(() => {
      ReactDOM.render(
        <Provider store={store}>
          <Router history={hashHistory}>
            <Route component={CERootPageInnerContainer}>
              <Redirect from="/" to="bitmex_order" />
              <Route path="/bitmex_order" component={BitmexOrderContainer} />
            </Route>
          </Router>
        </Provider>,
        $('#main')[0],
      );
      done();
    }, 0);
  }
}

export default CERootPageContainer;

