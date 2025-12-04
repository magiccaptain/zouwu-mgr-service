-- CreateEnum
CREATE TYPE "ProcessType" AS ENUM ('TRADER', 'QUOTE', 'COMMUNICATION', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ProcessStatusType" AS ENUM ('RUNNING', 'STOPPED', 'ERROR', 'NOT_FOUND');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OpsWarningType" ADD VALUE 'PROCESS_NOT_RUNNING';
ALTER TYPE "OpsWarningType" ADD VALUE 'PROCESS_CRASHED';
ALTER TYPE "OpsWarningType" ADD VALUE 'PROCESS_HIGH_CPU';
ALTER TYPE "OpsWarningType" ADD VALUE 'PROCESS_HIGH_MEMORY';
ALTER TYPE "OpsWarningType" ADD VALUE 'PROCESS_CHECK_FAILED';

-- CreateTable
CREATE TABLE "ProcessMonitor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "process_type" "ProcessType" NOT NULL,
    "hostServerId" INTEGER NOT NULL,
    "fundAccountId" TEXT,
    "process_name" TEXT,
    "command_pattern" TEXT,
    "pid_file" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "check_interval" INTEGER NOT NULL DEFAULT 60,
    "monitor_start_time" TIMESTAMP(3),
    "monitor_end_time" TIMESTAMP(3),
    "cpu_threshold" DOUBLE PRECISION,
    "memory_threshold" DOUBLE PRECISION,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessMonitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessStatus" (
    "id" SERIAL NOT NULL,
    "processMonitorId" INTEGER NOT NULL,
    "status" "ProcessStatusType" NOT NULL,
    "pid" INTEGER,
    "cpu_percent" DOUBLE PRECISION,
    "memory_percent" DOUBLE PRECISION,
    "memory_used_mb" DOUBLE PRECISION,
    "uptime_seconds" INTEGER,
    "start_time" TIMESTAMP(3),
    "trade_day" TEXT NOT NULL,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "check_duration_ms" INTEGER,
    "error_message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProcessMonitor_hostServerId_active_idx" ON "ProcessMonitor"("hostServerId", "active");

-- CreateIndex
CREATE INDEX "ProcessMonitor_fundAccountId_idx" ON "ProcessMonitor"("fundAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessMonitor_hostServerId_fundAccountId_process_type_key" ON "ProcessMonitor"("hostServerId", "fundAccountId", "process_type");

-- CreateIndex
CREATE INDEX "ProcessStatus_processMonitorId_checked_at_idx" ON "ProcessStatus"("processMonitorId", "checked_at" DESC);

-- CreateIndex
CREATE INDEX "ProcessStatus_checked_at_idx" ON "ProcessStatus"("checked_at" DESC);

-- CreateIndex
CREATE INDEX "ProcessStatus_trade_day_checked_at_idx" ON "ProcessStatus"("trade_day", "checked_at" DESC);

-- AddForeignKey
ALTER TABLE "ProcessMonitor" ADD CONSTRAINT "ProcessMonitor_hostServerId_fkey" FOREIGN KEY ("hostServerId") REFERENCES "HostServer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessMonitor" ADD CONSTRAINT "ProcessMonitor_fundAccountId_fkey" FOREIGN KEY ("fundAccountId") REFERENCES "FundAccount"("account") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessStatus" ADD CONSTRAINT "ProcessStatus_processMonitorId_fkey" FOREIGN KEY ("processMonitorId") REFERENCES "ProcessMonitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
