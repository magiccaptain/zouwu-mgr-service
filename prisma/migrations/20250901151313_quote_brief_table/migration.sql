-- CreateTable
CREATE TABLE "QuoteBrief" (
    "id" SERIAL NOT NULL,
    "tradeDay" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "market" "Market" NOT NULL,
    "pre_close_price" DOUBLE PRECISION NOT NULL,
    "close_price" DOUBLE PRECISION NOT NULL,
    "upper_limit_price" DOUBLE PRECISION NOT NULL,
    "lower_limit_price" DOUBLE PRECISION NOT NULL,
    "security_type" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteBrief_pkey" PRIMARY KEY ("id")
);
