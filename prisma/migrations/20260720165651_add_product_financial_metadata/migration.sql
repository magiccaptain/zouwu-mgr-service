-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "classificationBasis" TEXT,
ADD COLUMN     "dealingSchedule" TEXT,
ADD COLUMN     "managementFeeRate" DECIMAL(10,6),
ADD COLUMN     "minimumSubscriptionAmount" DECIMAL(18,2),
ADD COLUMN     "performanceFeeBasis" TEXT,
ADD COLUMN     "performanceFeeRate" DECIMAL(10,6),
ADD COLUMN     "portfolioManager" TEXT,
ADD COLUMN     "redemptionFeePolicy" TEXT,
ADD COLUMN     "strategyCapacity" DECIMAL(20,2),
ADD COLUMN     "strategyInceptionDate" DATE,
ADD COLUMN     "subscriptionFeeRate" DECIMAL(10,6);
