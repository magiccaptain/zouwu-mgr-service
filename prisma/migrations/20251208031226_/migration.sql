-- CreateEnum
CREATE TYPE "StrategyLevel" AS ENUM ('PRODUCT', 'FUND_ACCOUNT');

-- AlterTable
ALTER TABLE "FundAccount" ADD COLUMN     "executionBenchmark" TEXT,
ADD COLUMN     "executionStrategy" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "bizLine" TEXT,
ADD COLUMN     "nominalBenchmarket" TEXT;

-- CreateTable
CREATE TABLE "StrategyConstant" (
    "id" SERIAL NOT NULL,
    "level" "StrategyLevel" NOT NULL,
    "val" TEXT NOT NULL,
    "standardized" TEXT NOT NULL,
    "desc" TEXT,

    CONSTRAINT "StrategyConstant_pkey" PRIMARY KEY ("id")
);
