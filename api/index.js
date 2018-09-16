"use strict";

const ccxt = require('ccxt');
const BitmexClient = require('./lib/bitmex_client');

const testdata = {
  stage: 'test',
  body: {
    apiKey: '',
    secret: '',
    price: null,
    amount: 20,
    side: 'buy_close', // buy, sell, buy_close, sell_close
    orderType: 'market', // limit, market, traillimit,
    lossLimit: 5,
    profitLimit: 10,
    trailLimit: 3, 
    type: 'override', // override
  }
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

  let isOverride = false;
  let isSamePosition = false;
  
  await (async () => {
    for(let i = 0; i < positions.length; i++) {
      const position = positions[i];
      console.log(position);
      if (isSamePositionEntry(position, body)) {
        isSamePosition = true;
      }

      if (position.currentQty === 0) {
        isOverride = true;
        let closeOrder = {
          symbol: 'BTC/USD',
          orderType: 'market',
          side: position.openingQty > 0 ? 'sell' : 'buy',
          amount: body.amount,
          params: {
            execInst: 'Close',
          },
        };
        const result = await bitmex.createOrder(closeOrder.symbol, closeOrder.orderType, closeOrder.side, closeOrder.amount, null, closeOrder.params);
        // limit close.
      }

      // override or close.
      if (isOverridePosition(position, body)) {
        isOverride = true;
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
        // limit close.
      }
      if (((body.side === 'buy_close') || (body.side === 'sell_close')) && !isReversePositionClose(position, body)) {
        let limitCloseOrder = {
          symbol: 'BTC/USD',
          orderType: 'limit',
          side: position.currentQty > 0 ? 'sell' : 'buy',
          amount: body.amount,
          price: null,
          params: {
            execInst: 'ReduceOnly',
          },
        };
        //get order book
        console.log('limit close, get orderbook');
        const orderbook = await bitmex.fetch_order_book('BTC/USD');
        console.log(orderbook);
        if (body.side === 'buy_close') {
          limitCloseOrder.price = orderbook['asks'][0][0];
        } else if (body.side === 'sell_close') {
          limitCloseOrder.price = orderbook['bids'][0][0];
        }
        const res = await BitmexClient.createInOrder(bitmex,  limitCloseOrder);
        console.log(res);
      }
    };
  })();

  //注文の取得
  if (isOverride) {
    const open_orders = await bitmex.fetch_open_orders();
    //console.log(open_orders);
  
    await (async () => {
      for(let i = 0; i < open_orders.length; i++) {
        const order = open_orders[i];
        console.log('cancel order');
        console.log(order);
        const cancel = await bitmex.cancel_order(order.id);
      };
    })();
  }

  // don't order.
  if (body.side === 'buy_close' || body.side === 'sell_close' || isSamePosition || !isOverride) {
    console.log('end.');
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
    if (body.price) {
      inOrder.price = body.price;
    } else {
      //get order book
      const orderbook = await bitmex.fetch_order_book('BTC/USD');
      if (body.side === 'buy') {
        inOrder.price = orderbook['bids'][0][0];
      } else if (body.side === 'sell') {
        inOrder.price = orderbook['asks'][0][0];
      }
    }
    inOrder.params.execInst = 'ParticipateDoNotInitiate';
  }

  const inres = await BitmexClient.createInOrder(bitmex,  inOrder);
  console.log(inres);

  const outProfitOrder = {
    symbol: inOrder.symbol,
    orderType: 'limit',
    side: inOrder.side === 'buy' ? 'sell' : 'buy',
    amount: inOrder.amount,
    price: inOrder.side === 'buy' ? inres.price + parseFloat(body.profitLimit) : inres.price - parseFloat(body.profitLimit),
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
      stopPx: inOrder.side === 'buy' ? inres.price - parseFloat(body.lossLimit) : inres.price + parseFloat(body.lossLimit),
      contingencyType: 'OneCancelsTheOther',
      execInst: 'LastPrice,ReduceOnly',
    },
  }

  const outres = await BitmexClient.createOutOrder(bitmex, outProfitOrder, outLossOrder);
};

function checkExecClose(position, body) {
  // already have same side position.
  if (position.currentQty > 0 && (body.side === 'buy' || body.side === 'sell_close')) {
    console.log('already have position[buy] return.');
    return false;
  } else if (position.currentQty < 0 && (body.side === 'sell' || body.side === 'buy_close')) {
    console.log('already have position[sell] return.');
    return false;
  } else if (position.currentQty !== 0 && body.type !== 'override') {
    console.log('already have position and not overdide or close return.');
    return false;
  }
  return true;
}

function isSamePositionEntry(position, body) {
  if (position.currentQty > 0 && body.side === 'buy') {
    return true;
  } else if (position.currentQty < 0 && body.side === 'sell') {
    return true;
  }
  return false;
}

function isReversePositionClose(position, body) {
  if (position.currentQty < 0 && body.side === 'buy_close') {
    return true;
  } else if (position.currentQty > 0 && body.side === 'sell_close') {
    return true;
  }
  return false;
}

function isOverridePosition(position, body) {
  if ((body.side === 'buy' || body.side === 'sell') &&
      !isSamePositionEntry(position, body) && body.type === 'override') {
    return true;
  }
}

//handler(testdata);
