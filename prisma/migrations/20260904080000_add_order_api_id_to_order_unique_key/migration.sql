DROP INDEX "Order_tradeDay_fundAccount_market_ticker_orderRef_key";

CREATE UNIQUE INDEX "Order_tradeDay_fundAccount_market_ticker_orderRef_orderApiId_key"
ON "Order"("tradeDay", "fundAccount", "market", "ticker", "orderRef", "orderApiId");
