-- CreateEnum
CREATE TYPE "TradeApiType" AS ENUM ('XTP', 'ATP', 'CTP');

-- CreateEnum
CREATE TYPE "PositionDirection" AS ENUM ('N', 'L', 'S');

-- CreateEnum
CREATE TYPE "HedgeFlag" AS ENUM ('S', 'A', 'H');

-- CreateEnum
CREATE TYPE "OffsetFlag" AS ENUM ('O', 'C', 'T', 'F');

-- AlterTable
ALTER TABLE "FundAccount" ADD COLUMN     "tradeApiType" "TradeApiType";

-- AlterTable
ALTER TABLE "InnerFundSnapshot" ADD COLUMN     "ctpData" JSONB;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "ctpData" JSONB,
ADD COLUMN     "hedgeFlag" "HedgeFlag",
ADD COLUMN     "offsetFlag" "OffsetFlag";

-- AlterTable
ALTER TABLE "Position" ADD COLUMN     "ctpData" JSONB,
ADD COLUMN     "hedgeFlag" "HedgeFlag",
ADD COLUMN     "posiDirection" "PositionDirection";

-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "ctpData" JSONB,
ADD COLUMN     "offsetFlag" "OffsetFlag";
