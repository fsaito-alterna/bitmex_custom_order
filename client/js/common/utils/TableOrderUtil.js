// @flow
import _ from 'lodash';

class TableOrderUtil {
  static makeNextOrders(next: any, first: any, second: any): Array<Object> {
    let nextOrders;
    if (_.get(first, 'key') === next.key) {
      nextOrders = [next, second];
    } else {
      nextOrders = [next, first];
    }

    return _.compact(nextOrders);
  }
}

export default TableOrderUtil;
