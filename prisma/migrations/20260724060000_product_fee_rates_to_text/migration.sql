-- 申购费率 / 管理费率 / 业绩报酬费率 改为自由文本（字符形式）。
-- Decimal → TEXT 为赋值级转换，Postgres 可直接沿用现有数值的文本表示。
ALTER TABLE "Product" ALTER COLUMN "subscriptionFeeRate" SET DATA TYPE TEXT;
ALTER TABLE "Product" ALTER COLUMN "managementFeeRate" SET DATA TYPE TEXT;
ALTER TABLE "Product" ALTER COLUMN "performanceFeeRate" SET DATA TYPE TEXT;
