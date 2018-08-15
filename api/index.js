"use strict";

const ccxt = require('ccxt');

// ②bitflyer ccxt取得
let exchange = new ccxt.bitmex({
  apiKey: '',
  secret: '',
  enableRateLimit: true,
});

const LossLimit = 5;
const ProfitLimit = 10;

const inOrder = {
  symbol: 'BTC/USD',
  orderType: 'limit',
  side: 'sell',
  amount: 1,
  price: 6315.0,
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
  price: inOrder.side === 'buy' ? inOrder.price + ProfitLimit : inOrder.price - ProfitLimit,
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
	stopPx: inOrder.side === 'buy' ? inOrder.price - LossLimit : inOrder.price + LossLimit,
    contingencyType: 'OneCancelsTheOther',
    execInst: 'ReduceOnly',
  },
}

const handler = async (event) => {
// exports.handler = async (event) => {
  console.log(event);
  console.log(exchange.has);

  // createInOrder();
  // createOutOrder();
};

const createInOrder = () => {
  exchange.createOrder(inOrder.symbol, inOrder.orderType, inOrder.side, inOrder.amount, inOrder.price, inOrder.params)
  .then((res) => {
    console.log('inOrder');
    console.log(res);
  });
};

const createOutOrder = () => {
	exchange.createOrder(outProfitOrder.symbol, outProfitOrder.orderType, outProfitOrder.side, outProfitOrder.amount, outProfitOrder.price, outProfitOrder.params)
	.then((res) => {
		console.log('outProfitOrder');
		console.log(res);
	});

	exchange.createOrder(outLossOrder.symbol, outLossOrder.orderType, outLossOrder.side, outLossOrder.amount, outLossOrder.price, outLossOrder.params)
	.then((res) => {
		console.log('outLossOrder');
		console.log(res);
	});
};

/*
(async function () {
	const res = await exchange.createOrder(symbol, orderType, side, amount, price);
	console.log(res);
}) ();
*/



/*
exchange.createOrder(inCancelOrder.symbol, inCancelOrder.orderType, inCancelOrder.side, inCancelOrder.amount, inCancelOrder.price, inCancelOrder.params)
.then((res) => {
	console.log('inCancelOrder');
	console.log(res);
});
*/

