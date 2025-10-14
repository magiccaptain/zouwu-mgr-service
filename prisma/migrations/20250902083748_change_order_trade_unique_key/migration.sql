/*
  Warnings:

  - A unique constraint covering the columns `[tradeDay,fundAccount,market,ticker,orderRef]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tradeDay,fundAccount,market,ticker,orderRef]` on the table `Trade` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `brokerKey` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyKey` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productKey` to the `Trade` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Order_tradeDay_fundAccount_market_ticker_key";

-- DropIndex
DROP INDEX "Trade_tradeDay_fundAccount_market_ticker_key";

-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "brokerKey" TEXT NOT NULL,
ADD COLUMN     "companyKey" TEXT NOT NULL,
ADD COLUMN     "productKey" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_tradeDay_fundAccount_market_ticker_orderRef_key" ON "Order"("tradeDay", "fundAccount", "market", "ticker", "orderRef");

-- CreateIndex
CREATE UNIQUE INDEX "Trade_tradeDay_fundAccount_market_ticker_orderRef_key" ON "Trade"("tradeDay", "fundAccount", "market", "ticker", "orderRef");
