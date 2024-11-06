-- CreateEnum
CREATE TYPE "OpsTaskType" AS ENUM ('BEFORE_CHECK_HOST_SERVER_DISK', 'BEFORE_CHECK_HOST_SERVER_TIME', 'BEFORE_SYNC_FUND_ACCOUNT', 'AFTER_ARCHIVE_TRADE_LOG', 'AFTER_SYNC_FUND_ACCOUNT', 'AFTER_SYNC_POSITIONS', 'AFTER_SYNC_ORDER', 'AFTER_SYNC_TRADE', 'AFTER_SYNC_LAST_PRICE', 'AFTER_PULL_OP_VALUE', 'AFTER_PULL_QUOTE_SNAPSHOT');

-- CreateEnum
CREATE TYPE "OpsTaskStatus" AS ENUM ('PENDING', 'RUNNING', 'DONE');

-- CreateEnum
CREATE TYPE "OpsWarningStatus" AS ENUM ('PENDING', 'MANUAL_DONE', 'AUTO_DONE', 'AUTO_ERROR');

-- DropForeignKey
ALTER TABLE "HostServer" DROP CONSTRAINT "HostServer_brokerKey_fkey";

-- DropForeignKey
ALTER TABLE "HostServer" DROP CONSTRAINT "HostServer_companyKey_fkey";

-- AlterTable
ALTER TABLE "HostServer" ALTER COLUMN "market" DROP NOT NULL,
ALTER COLUMN "brokerKey" DROP NOT NULL,
ALTER COLUMN "companyKey" DROP NOT NULL;

-- CreateTable
CREATE TABLE "OpsTask" (
    "id" SERIAL NOT NULL,
    "type" "OpsTaskType" NOT NULL,
    "name" TEXT NOT NULL,
    "status" "OpsTaskStatus" NOT NULL,
    "trade_day" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpsTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsWarning" (
    "id" SERIAL NOT NULL,
    "trade_day" TEXT NOT NULL,
    "status" "OpsWarningStatus" NOT NULL,
    "opsTaskId" INTEGER,
    "hostServerId" INTEGER,
    "fund_account" TEXT,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpsWarning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RemoteCommand" (
    "id" SERIAL NOT NULL,
    "trade_day" TEXT NOT NULL,
    "cmd" TEXT NOT NULL,
    "cwd" TEXT,
    "code" INTEGER,
    "stdout" TEXT,
    "stderr" TEXT,
    "hostServerId" INTEGER NOT NULL,
    "opsTaskId" INTEGER,
    "opsWarningId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RemoteCommand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OpsTask_trade_day_idx" ON "OpsTask"("trade_day" DESC);

-- CreateIndex
CREATE INDEX "OpsWarning_trade_day_idx" ON "OpsWarning"("trade_day" DESC);

-- CreateIndex
CREATE INDEX "RemoteCommand_hostServerId_trade_day_idx" ON "RemoteCommand"("hostServerId", "trade_day" DESC);

-- AddForeignKey
ALTER TABLE "HostServer" ADD CONSTRAINT "HostServer_brokerKey_fkey" FOREIGN KEY ("brokerKey") REFERENCES "Broker"("key") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostServer" ADD CONSTRAINT "HostServer_companyKey_fkey" FOREIGN KEY ("companyKey") REFERENCES "Company"("key") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsWarning" ADD CONSTRAINT "OpsWarning_opsTaskId_fkey" FOREIGN KEY ("opsTaskId") REFERENCES "OpsTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsWarning" ADD CONSTRAINT "OpsWarning_hostServerId_fkey" FOREIGN KEY ("hostServerId") REFERENCES "HostServer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsWarning" ADD CONSTRAINT "OpsWarning_fund_account_fkey" FOREIGN KEY ("fund_account") REFERENCES "FundAccount"("account") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemoteCommand" ADD CONSTRAINT "RemoteCommand_hostServerId_fkey" FOREIGN KEY ("hostServerId") REFERENCES "HostServer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemoteCommand" ADD CONSTRAINT "RemoteCommand_opsTaskId_fkey" FOREIGN KEY ("opsTaskId") REFERENCES "OpsTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemoteCommand" ADD CONSTRAINT "RemoteCommand_opsWarningId_fkey" FOREIGN KEY ("opsWarningId") REFERENCES "OpsWarning"("id") ON DELETE SET NULL ON UPDATE CASCADE;
