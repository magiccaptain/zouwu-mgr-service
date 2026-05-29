-- AlterEnum
ALTER TYPE "Market" ADD VALUE 'SSE';

-- CreateTable
CREATE TABLE "TradingCalendar" (
    "id" SERIAL NOT NULL,
    "market" "Market" NOT NULL,
    "cal_date" TEXT NOT NULL,
    "is_open" BOOLEAN NOT NULL,

    CONSTRAINT "TradingCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TradingCalendar_market_cal_date_idx" ON "TradingCalendar"("market", "cal_date");

-- CreateIndex
CREATE UNIQUE INDEX "TradingCalendar_market_cal_date_key" ON "TradingCalendar"("market", "cal_date");
