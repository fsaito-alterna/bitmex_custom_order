"use strict";

const ccxt = require('ccxt');

//const handler = async (event) => {
exports.handler = async (event) => {
  //console.log(event);
  
  const exchange = new ccxt.bitmex({
    apiKey: event.apiKey,
    secret: event.secret,
    enableRateLimit: true,
  });

  const inOrder = {
    symbol: 'BTC/USD',
    orderType: 'limit',
    side: event.side,
    amount: event.amount,
    price: event.price,
    params: {
      clOrdLinkID: 'in',
      contingencyType: 'OneTriggersTheOther',
    },
  };

  const outProfitOrder = {
    symbol: inOrder.symbol,
    orderType: 'limit',
    side: inOrder.side === 'buy' ? 'sell' : 'buy',
    amount: inOrder.amount,
    price: inOrder.side === 'buy' ? inOrder.price + event.profitLimit : inOrder.price - event.profitLimit,
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
      stopPx: inOrder.side === 'buy' ? inOrder.price - event.lossLimit : inOrder.price + event.lossLimit,
      contingencyType: 'OneCancelsTheOther',
      execInst: 'ReduceOnly',
    },
  }

  const inres = await createInOrder(exchange,  inOrder);
  const outres = await createOutOrder(exchange, outProfitOrder, outLossOrder);
};

const createInOrder = async (exchange, inOrder) => {
  return exchange.createOrder(inOrder.symbol, inOrder.orderType, inOrder.side, inOrder.amount, inOrder.price, inOrder.params);
};

const createOutOrder = async (exchange, outProfitOrder, outLossOrder) => {
	await exchange.createOrder(outProfitOrder.symbol, outProfitOrder.orderType, outProfitOrder.side, outProfitOrder.amount, outProfitOrder.price, outProfitOrder.params);
	return await exchange.createOrder(outLossOrder.symbol, outLossOrder.orderType, outLossOrder.side, outLossOrder.amount, outLossOrder.price, outLossOrder.params);
};
