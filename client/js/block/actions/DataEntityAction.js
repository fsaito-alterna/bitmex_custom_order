// @flow

import OrderClientHelper from '../utils/OrderClientHelper';
import LocalStoreUtil from '../../common/utils/LocalStoreUtil';

export const UPDATE_ITEMS = 'dataEntity/UPDATE_ITEMS';
export const CREATE_ITEM = 'dataEntity/CREATE_ITEM';
export const UPDATE_ITEM = 'dataEntity/UPDATE_ITEM';
export const DELETE_ITEM = 'dataEntity/DELETE_ITEM';

function createClient() {
  return OrderClientHelper.createDataEntityClient();
}

export function indexItems(name: string, path: string, options: Object = {}): Function {
  return (dispatch: Function) => {
    return createClient().index(path, options)
      .then((item: any) => {
        const sellGroups = _.groupBy(_.first(item).sell_data, _.first);
        const buyGroups = _.groupBy(_.reverse(_.first(item).buy_data), _.first);
        const sellOrders = _.reduce(sellGroups, (m, v, k) => {
          const last = _.last(_.last(v));
          const total = _.round(last - (_.isEmpty(m) ? 0 : _.last(m).last), 8);
          return _.concat(m,{
            price: k,
            nanj: _.round(total / k, 8).toFixed(8),
            btc: _.round(total, 8).toFixed(8),
            last,
          });
        }, []);
        const buyOrders = _.reduce(buyGroups, (m, v, k) => {
          const last = _.last(_.last(v));
          const total = _.round(last - (_.isEmpty(m) ? 0 : _.last(m).last), 8);
          return _.concat(m,{
            price: k,
            nanj: _.round(total / k, 8).toFixed(8),
            btc: _.round(total, 8).toFixed(8),
            last,
          });
        }, []);
        const totalSells = _.reduce(sellOrders, (m, data) => {
          return _.round(m + _.toNumber(data.nanj), 9);
        }, 0);
        const totalBuys = _.reduce(buyOrders, (m, data) => {
          return _.round(m + _.toNumber(data.btc), 9);
        }, 0);

        const items = {
          sellOrders,
          buyOrders,
          totalSells,
          totalBuys,
        };

        return dispatch({
          name,
          type: LocalStoreUtil.appendLocakKey(UPDATE_ITEMS, options.localKey),
          items: [items],
        });
      })
      .catch((e) => {
        if (e.status === 404) {
          return dispatch({
            name,
            type: LocalStoreUtil.appendLocakKey(UPDATE_ITEMS, options.localKey),
            items: [],
          });
        }
        throw e;
      });
  };
}
