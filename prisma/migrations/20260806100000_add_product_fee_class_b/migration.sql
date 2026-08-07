-- 费用信息按份额类别 A/B 拆分：A 类沿用原无后缀字段，新增 B 类字段（均可空）。
ALTER TABLE "Product" ADD COLUMN "subscriptionFeeRateB" TEXT;
ALTER TABLE "Product" ADD COLUMN "redemptionFeePolicyB" TEXT;
ALTER TABLE "Product" ADD COLUMN "managementFeeRateB" TEXT;
ALTER TABLE "Product" ADD COLUMN "performanceFeeRateB" TEXT;
ALTER TABLE "Product" ADD COLUMN "performanceFeeBasisB" TEXT;
ALTER TABLE "Product" ADD COLUMN "minimumSubscriptionAmountB" DECIMAL(18,2);
