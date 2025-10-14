/*
  Warnings:

  - You are about to drop the column `buy_order_amount` on the `MarketValue` table. All the data in the column will be lost.
  - You are about to drop the column `buy_order_count` on the `MarketValue` table. All the data in the column will be lost.
  - You are about to drop the column `buy_order_qty` on the `MarketValue` table. All the data in the column will be lost.
  - You are about to drop the column `buy_trade_amount` on the `MarketValue` table. All the data in the column will be lost.
  - You are about to drop the column `buy_trade_count` on the `MarketValue` table. All the data in the column will be lost.
  - You are about to drop the column `buy_trade_qty` on the `MarketValue` table. All the data in the column will be lost.
  - You are about to drop the column `sell_order_amount` on the `MarketValue` table. All the data in the column will be lost.
  - You are about to drop the column `sell_order_count` on the `MarketValue` table. All the data in the column will be lost.
  - You are about to drop the column `sell_order_qty` on the `MarketValue` table. All the data in the column will be lost.
  - You are about to drop the column `sell_trade_amount` on the `MarketValue` table. All the data in the column will be lost.
  - You are about to drop the column `sell_trade_count` on the `MarketValue` table. All the data in the column will be lost.
  - You are about to drop the column `sell_trade_qty` on the `MarketValue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MarketValue" DROP COLUMN "buy_order_amount",
DROP COLUMN "buy_order_count",
DROP COLUMN "buy_order_qty",
DROP COLUMN "buy_trade_amount",
DROP COLUMN "buy_trade_count",
DROP COLUMN "buy_trade_qty",
DROP COLUMN "sell_order_amount",
DROP COLUMN "sell_order_count",
DROP COLUMN "sell_order_qty",
DROP COLUMN "sell_trade_amount",
DROP COLUMN "sell_trade_count",
DROP COLUMN "sell_trade_qty";
