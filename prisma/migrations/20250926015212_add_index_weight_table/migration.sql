-- CreateTable
CREATE TABLE "IndexWeight" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "code" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "trade_dt" TEXT NOT NULL,
    "i_weight" DOUBLE PRECISION NOT NULL,
    "updatetime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndexWeight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IndexWeight_trade_dt_code_symbol_idx" ON "IndexWeight"("trade_dt", "code", "symbol");
