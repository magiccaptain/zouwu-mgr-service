-- CreateTable
CREATE TABLE "FuturesAccountInfo" (
    "id" SERIAL NOT NULL,
    "fund_account" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "investorID" TEXT NOT NULL,
    "preMortgage" DECIMAL(18,2) NOT NULL,
    "preCredit" DECIMAL(18,2) NOT NULL,
    "preBalance" DECIMAL(18,2) NOT NULL,
    "deposit" DECIMAL(18,2) NOT NULL,
    "withdraw" DECIMAL(18,2) NOT NULL,
    "frozenMargin" DECIMAL(18,2) NOT NULL,
    "frozenFee" DECIMAL(18,2) NOT NULL,
    "currMargin" DECIMAL(18,2) NOT NULL,
    "fee" DECIMAL(18,2) NOT NULL,
    "closeProfit" DECIMAL(18,2) NOT NULL,
    "positionProfit" DECIMAL(18,2) NOT NULL,
    "balance" DECIMAL(18,2) NOT NULL,
    "available" DECIMAL(18,2) NOT NULL,
    "tradingDay" TEXT NOT NULL,
    "updateTime" TEXT NOT NULL,
    "currencyID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FuturesAccountInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_futures_account_info_fund" ON "FuturesAccountInfo"("fund_account");

-- CreateIndex
CREATE INDEX "idx_futures_account_info_day" ON "FuturesAccountInfo"("tradingDay");

-- CreateIndex
CREATE UNIQUE INDEX "FuturesAccountInfo_fund_account_tradingDay_key" ON "FuturesAccountInfo"("fund_account", "tradingDay");

-- AddForeignKey
ALTER TABLE "FuturesAccountInfo" ADD CONSTRAINT "FuturesAccountInfo_fund_account_fkey" FOREIGN KEY ("fund_account") REFERENCES "FundAccount"("account") ON DELETE RESTRICT ON UPDATE CASCADE;
