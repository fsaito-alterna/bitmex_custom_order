module.exports = class BitmexClient {
    static async createInOrder (exchange, inOrder) {
      return exchange.createOrder(inOrder.symbol, inOrder.orderType, inOrder.side, inOrder.amount, inOrder.price, inOrder.params);
    }
      
    static async createOutOrder (exchange, outProfitOrder, outLossOrder) {
        await exchange.createOrder(outProfitOrder.symbol, outProfitOrder.orderType, outProfitOrder.side, outProfitOrder.amount, outProfitOrder.price, outProfitOrder.params);
        return await exchange.createOrder(outLossOrder.symbol, outLossOrder.orderType, outLossOrder.side, outLossOrder.amount, outLossOrder.price, outLossOrder.params);
    }
}
