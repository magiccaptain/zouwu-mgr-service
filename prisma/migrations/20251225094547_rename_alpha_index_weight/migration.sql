/*
  Warnings:

  - You are about to drop the `WapExecWeight` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "WapExecWeight";

-- CreateTable
CREATE TABLE "AlphaIndexWeight" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "code" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "trade_dt" TEXT NOT NULL,
    "i_weight" DOUBLE PRECISION NOT NULL,
    "updatetime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlphaIndexWeight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlphaIndexWeight_trade_dt_code_symbol_key" ON "AlphaIndexWeight"("trade_dt", "code", "symbol");
