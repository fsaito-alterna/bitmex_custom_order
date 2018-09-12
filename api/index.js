"use strict";

const ccxt = require('ccxt');
const BitmexClient = require('./lib/bitmex_client');

const testdata = {
  apiKey: '',
  secret: '',
  price: 6436.0,
  amount: 1,
  side: 'buy',
  orderType: 'market', // limit, market, traillimit,
  lossLimit: 5,
  profitLimit: 10,
  trailLimit: 3, 
  type: 'override', // override, close
  stage: 'test',
};

// const handler = async (event) => {
exports.handler = async (event) => {
  console.log(event);
  const body = event.body;

  const timestamp = new Date().getTime();
  
  const bitmex = new ccxt.bitmex({
    apiKey: body.apiKey,
    secret: body.secret,
    enableRateLimit: true,
  });

  if (event.stage === 'test') {
    bitmex.urls['api'] = bitmex.urls['test'];
  }


  //ポジションの取得
  const positions = await bitmex.private_get_position();
  //array(object)
  //currentQty: 現在のposition( x > 0: 買い, x < 0: 売り, x == 0:無し )
  //avgEntryPrice: 平均購入価格
  //console.log(positions);

  let isHaveSamePosition = false;

  positions.forEach(async position => {
    // already have same side position.
    if (body.type !== 'close') {
      if (position.currentQty > 0 && body.side === 'buy') {
        console.log('already have position[buy] return.');
        isHaveSamePosition = true;
        return;
      }
      if (position.currentQty < 0 && body.side === 'sell') {
        console.log('already have position[sell] return.');
        isHaveSamePosition = true;
        return;
      }
      // already have position and normal order.
      if (position.currentQty !== 0 && !body.type) {
        console.log('already have position and not overdide or close return.');
        isHaveSamePosition = true;
        return;
      }
    }

    // override or close.
    if (position.currentQty !== 0) {
      let closeOrder = {
        symbol: 'BTC/USD',
        orderType: 'market',
        side: position.currentQty > 0 ? 'sell' : 'buy',
        amount: body.amount,
        params: {
          execInst: 'Close',
        },
      };
      const result = await bitmex.createOrder(closeOrder.symbol, closeOrder.orderType, closeOrder.side, closeOrder.amount, null, closeOrder.params);
    }
  });

  //注文の取得
  if (!isHaveSamePosition) {
    const open_orders = await bitmex.fetch_open_orders();
    //console.log(open_orders);
  
    open_orders.forEach(async order => {
      const cancel = await bitmex.cancel_order(order.id);
    });
  }

  // don't order.
  if (body.type === 'close' || isHaveSamePosition) {
    return;
  }

  let inOrder = {
    symbol: 'BTC/USD',
    orderType: body.orderType,
    side: body.side,
    amount: body.amount,
    params: {
      clOrdLinkID: `in_${timestamp}`,
      contingencyType: 'OneTriggersTheOther',
    },
  };

  if (body.orderType === 'limit') {
    inOrder.price = body.price;
    inOrder.params.execInst = 'ParticipateDoNotInitiate';
  }

  const inres = await BitmexClient.createInOrder(bitmex,  inOrder);
  console.log(inres);

  const outProfitOrder = {
    symbol: inOrder.symbol,
    orderType: 'limit',
    side: inOrder.side === 'buy' ? 'sell' : 'buy',
    amount: inOrder.amount,
    price: inOrder.side === 'buy' ? inres.price + body.profitLimit : inres.price - body.profitLimit,
    params: {
      clOrdLinkID: `in_${timestamp}`,
      contingencyType: 'OneCancelsTheOther',
      execInst: 'ReduceOnly',
    },
  }

  const outLossOrder = {
    symbol: inOrder.symbol,
    orderType: 'stop',
    side: inOrder.side === 'buy' ? 'sell' : 'buy',
    amount: inOrder.amount,
    params: {
      clOrdLinkID: `in_${timestamp}`,
      stopPx: inOrder.side === 'buy' ? inres.price - body.lossLimit : inres.price + body.lossLimit,
      contingencyType: 'OneCancelsTheOther',
      execInst: 'LastPrice',
    },
  }

  const outres = await BitmexClient.createOutOrder(bitmex, outProfitOrder, outLossOrder);
};

//handler(testdata);
