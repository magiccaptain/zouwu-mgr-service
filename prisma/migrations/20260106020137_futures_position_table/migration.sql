-- CreateTable
CREATE TABLE "FuturesPosition" (
    "id" SERIAL NOT NULL,
    "tradeDay" TEXT NOT NULL,
    "fundAccount" TEXT NOT NULL,
    "market" "Market" NOT NULL,
    "brokerKey" TEXT NOT NULL,
    "totalQty" INTEGER NOT NULL,
    "sellableQty" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyKey" TEXT NOT NULL,
    "productKey" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "ctpData" JSONB,
    "hedgeFlag" "HedgeFlag",
    "posiDirection" "PositionDirection",

    CONSTRAINT "FuturesPosition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FuturesPosition_tradeDay_fundAccount_market_ticker_posiDire_key" ON "FuturesPosition"("tradeDay", "fundAccount", "market", "ticker", "posiDirection");
