-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "operational";

-- AlterEnum
ALTER TYPE "public"."Market" ADD VALUE 'STOCK_ALL';

-- CreateTable
CREATE TABLE "operational"."AccountDailyStats" (
    "id" SERIAL NOT NULL,
    "tradeDay" TEXT NOT NULL,
    "fundAccount" TEXT NOT NULL,
    "market" "public"."Market" NOT NULL,
    "netAsset" DOUBLE PRECISION NOT NULL,
    "turnoverRate" DOUBLE PRECISION NOT NULL,
    "dailyReturn" DOUBLE PRECISION NOT NULL,
    "weeklyReturn" DOUBLE PRECISION NOT NULL,
    "weeklyExcess" DOUBLE PRECISION NOT NULL,
    "shRatio" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountDailyStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountDailyStats_tradeDay_idx" ON "operational"."AccountDailyStats"("tradeDay");

-- CreateIndex
CREATE INDEX "AccountDailyStats_fundAccount_idx" ON "operational"."AccountDailyStats"("fundAccount");

-- CreateIndex
CREATE UNIQUE INDEX "AccountDailyStats_tradeDay_fundAccount_key" ON "operational"."AccountDailyStats"("tradeDay", "fundAccount");
