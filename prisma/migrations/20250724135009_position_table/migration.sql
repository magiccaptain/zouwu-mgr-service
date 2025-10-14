-- CreateTable
CREATE TABLE "Position" (
    "id" SERIAL NOT NULL,
    "tradeDay" TEXT NOT NULL,
    "fundAccount" TEXT NOT NULL,
    "market" "Market" NOT NULL,
    "symbol" TEXT NOT NULL,
    "brokerKey" TEXT NOT NULL,
    "totalQty" INTEGER NOT NULL,
    "sellableQty" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);
