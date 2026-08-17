ALTER TYPE "OpsTaskType" ADD VALUE IF NOT EXISTS 'AFTER_SYNC_TRADE_DATA';

CREATE TYPE "TradeDataType" AS ENUM ('FUND', 'POSITION', 'ORDER', 'TRADE');

CREATE TYPE "TradeDataStepStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

CREATE TABLE "TradeDataSyncStep" (
    "id" SERIAL NOT NULL,
    "trade_day" TEXT NOT NULL,
    "taskType" "OpsTaskType" NOT NULL,
    "fund_account" TEXT NOT NULL,
    "market" "Market" NOT NULL,
    "dataType" "TradeDataType" NOT NULL,
    "pullStatus" "TradeDataStepStatus" NOT NULL DEFAULT 'PENDING',
    "writeStatus" "TradeDataStepStatus" NOT NULL DEFAULT 'PENDING',
    "localFilePath" TEXT,
    "pullError" TEXT,
    "writeError" TEXT,
    "opsTaskId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TradeDataSyncStep_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TradeDataSyncStep_trade_day_taskType_fund_account_market_dataType_key"
ON "TradeDataSyncStep"("trade_day", "taskType", "fund_account", "market", "dataType");

CREATE INDEX "TradeDataSyncStep_trade_day_taskType_idx"
ON "TradeDataSyncStep"("trade_day", "taskType");

ALTER TABLE "TradeDataSyncStep"
ADD CONSTRAINT "TradeDataSyncStep_fund_account_fkey"
FOREIGN KEY ("fund_account") REFERENCES "FundAccount"("account")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TradeDataSyncStep"
ADD CONSTRAINT "TradeDataSyncStep_opsTaskId_fkey"
FOREIGN KEY ("opsTaskId") REFERENCES "OpsTask"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
