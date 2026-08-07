-- CTP 期货户交易配置表：单条连接（fund_account 唯一，无市场维度）。
CREATE TABLE "CTPConfig" (
    "id" SERIAL NOT NULL,
    "fund_account" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "investor_id" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "broker_id" TEXT NOT NULL,
    "app_id" TEXT NOT NULL,
    "auth_code" TEXT NOT NULL,
    "trade_front" TEXT NOT NULL,
    "market_front" TEXT NOT NULL,

    CONSTRAINT "CTPConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CTPConfig_fund_account_key" ON "CTPConfig"("fund_account");

ALTER TABLE "CTPConfig" ADD CONSTRAINT "CTPConfig_fund_account_fkey" FOREIGN KEY ("fund_account") REFERENCES "FundAccount"("account") ON DELETE RESTRICT ON UPDATE CASCADE;
