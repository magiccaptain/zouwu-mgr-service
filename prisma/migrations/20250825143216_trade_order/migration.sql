/*
  Warnings:

  - You are about to drop the column `symbol` on the `Position` table. All the data in the column will be lost.
  - Added the required column `ticker` to the `Position` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Side" AS ENUM ('BUY', 'SELL');

-- AlterTable
ALTER TABLE "Position" DROP COLUMN "symbol",
ADD COLUMN     "ticker" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "tradeDay" TEXT NOT NULL,
    "fundAccount" TEXT NOT NULL,
    "market" "Market" NOT NULL,
    "ticker" TEXT NOT NULL,
    "orderApiId" BIGINT NOT NULL,
    "orderRef" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceType" INTEGER NOT NULL,
    "side" "Side" NOT NULL,
    "qtyTraded" INTEGER NOT NULL,
    "qtyLeft" INTEGER NOT NULL,
    "insertTime" BIGINT NOT NULL,
    "updateTime" BIGINT NOT NULL,
    "cancelTime" BIGINT NOT NULL,
    "status" INTEGER NOT NULL,
    "brokerKey" TEXT NOT NULL,
    "productKey" TEXT NOT NULL,
    "companyKey" TEXT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" SERIAL NOT NULL,
    "tradeDay" TEXT NOT NULL,
    "fundAccount" TEXT NOT NULL,
    "market" "Market" NOT NULL,
    "ticker" TEXT NOT NULL,
    "orderApiId" BIGINT NOT NULL,
    "orderRef" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "tradeTime" BIGINT NOT NULL,
    "tradeAmount" DOUBLE PRECISION NOT NULL,
    "side" "Side" NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);
