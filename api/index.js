"use strict";

const ccxt = require('ccxt');

const testdata = {
  apiKey: '',
  secret: '',
  price: 6436.0,
  amount: 1,
  side: 'sell',
  orderType: 'market',
  lossLimit: 5,
  profitLimit: 10,
};

// const handler = async (event) => {
exports.handler = async (event) => {
  //console.log(event);
  
  const exchange = new ccxt.bitmex({
    apiKey: event.apiKey,
    secret: event.secret,
    enableRateLimit: true,
  });

  let inOrder = {
    symbol: 'BTC/USD',
    orderType: event.orderType,
    side: event.side,
    amount: event.amount,
    params: {
      clOrdLinkID: 'in',
      contingencyType: 'OneTriggersTheOther',
    },
  };

  if (event.orderType === 'limit') {
    inOrder.price = event.price;
    inOrder.params.execInst = 'ParticipateDoNotInitiate';
  }

  const inres = await createInOrder(exchange,  inOrder);
  console.log(inres);

  const outProfitOrder = {
    symbol: inOrder.symbol,
    orderType: 'limit',
    side: inOrder.side === 'buy' ? 'sell' : 'buy',
    amount: inOrder.amount,
    price: inOrder.side === 'buy' ? inres.price + event.profitLimit : inres.price - event.profitLimit,
    params: {
      clOrdLinkID: 'in',
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
      clOrdLinkID: 'in',
      stopPx: inOrder.side === 'buy' ? inres.price - event.lossLimit : inres.price + event.lossLimit,
      contingencyType: 'OneCancelsTheOther',
      execInst: 'LastPrice',
    },
  }

  const outres = await createOutOrder(exchange, outProfitOrder, outLossOrder);
};

const createInOrder = async (exchange, inOrder) => {
  return exchange.createOrder(inOrder.symbol, inOrder.orderType, inOrder.side, inOrder.amount, inOrder.price, inOrder.params);
};

const createOutOrder = async (exchange, outProfitOrder, outLossOrder) => {
	await exchange.createOrder(outProfitOrder.symbol, outProfitOrder.orderType, outProfitOrder.side, outProfitOrder.amount, outProfitOrder.price, outProfitOrder.params);
	return await exchange.createOrder(outLossOrder.symbol, outLossOrder.orderType, outLossOrder.side, outLossOrder.amount, outLossOrder.price, outLossOrder.params);
};

// handler(testdata);