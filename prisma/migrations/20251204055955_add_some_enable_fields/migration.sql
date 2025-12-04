-- AlterTable
ALTER TABLE "FundAccount" ADD COLUMN     "isTransferEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isTradeAnalysisEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isTransferEnabled" BOOLEAN NOT NULL DEFAULT true;
