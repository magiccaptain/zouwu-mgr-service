/*
  Warnings:

  - A unique constraint covering the columns `[tradeDay,fundAccount,market,ticker,tradeId]` on the table `Trade` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tradeId` to the `Trade` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Trade_tradeDay_fundAccount_market_ticker_orderRef_key";

-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "tradeId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Trade_tradeDay_fundAccount_tradeId_idx" ON "Trade"("tradeDay", "fundAccount", "tradeId");

-- CreateIndex
CREATE UNIQUE INDEX "Trade_tradeDay_fundAccount_market_ticker_tradeId_key" ON "Trade"("tradeDay", "fundAccount", "market", "ticker", "tradeId");
