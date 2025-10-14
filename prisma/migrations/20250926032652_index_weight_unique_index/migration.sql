/*
  Warnings:

  - A unique constraint covering the columns `[trade_dt,code,symbol]` on the table `IndexWeight` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "IndexWeight_trade_dt_code_symbol_idx";

-- CreateIndex
CREATE UNIQUE INDEX "IndexWeight_trade_dt_code_symbol_key" ON "IndexWeight"("trade_dt", "code", "symbol");
