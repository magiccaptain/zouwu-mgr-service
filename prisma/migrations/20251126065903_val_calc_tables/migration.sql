/*
  Warnings:

  - The values [FUTURES] on the enum `FundAccountType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FundAccountType_new" AS ENUM ('STOCK', 'O', 'O1', 'O2', 'W', 'T', 'E');
ALTER TABLE "FundAccount" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "FundAccount" ALTER COLUMN "type" TYPE "FundAccountType_new" USING ("type"::text::"FundAccountType_new");
ALTER TYPE "FundAccountType" RENAME TO "FundAccountType_old";
ALTER TYPE "FundAccountType_new" RENAME TO "FundAccountType";
DROP TYPE "FundAccountType_old";
ALTER TABLE "FundAccount" ALTER COLUMN "type" SET DEFAULT 'STOCK';
COMMIT;

-- CreateTable
CREATE TABLE "nav_custodian" (
    "id" SERIAL NOT NULL,
    "fund_abbr" VARCHAR(8) NOT NULL,
    "nav_date" DATE NOT NULL,
    "nav" DECIMAL(10,4) NOT NULL,
    "cum_nav" DECIMAL(10,4) NOT NULL,
    "con_capital" DECIMAL(18,2),
    "net_capital" DECIMAL(18,2),
    "cash" DECIMAL(18,2),
    "cash_interest" DECIMAL(18,2),
    "future_margin" DECIMAL(18,2),
    "future_usable" DECIMAL(18,2),
    "stock_usable" DECIMAL(18,2),
    "stock_usable_interest" DECIMAL(18,2),
    "stock_mv" DECIMAL(18,2),
    "stock_mv_delisted" DECIMAL(18,2),
    "swap_net_asset" DECIMAL(18,2),
    "other_fund" DECIMAL(18,2),
    "redeem" DECIMAL(18,2),
    "expense" DECIMAL(18,2),
    "tax" DECIMAL(18,2),
    "tax_base" DECIMAL(18,2),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nav_custodian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nav_est" (
    "id" SERIAL NOT NULL,
    "fund_abbr" VARCHAR(8) NOT NULL,
    "estimate_date" DATE NOT NULL,
    "nav" DECIMAL(10,4) NOT NULL,
    "cum_nav" DECIMAL(10,4) NOT NULL,
    "con_capital" DECIMAL(18,2),
    "net_capital" DECIMAL(18,2),
    "cash" DECIMAL(18,2),
    "cash_interest" DECIMAL(18,2),
    "future_margin" DECIMAL(18,2),
    "future_usable" DECIMAL(18,2),
    "stock_usable" DECIMAL(18,2),
    "stock_usable_interest" DECIMAL(18,2),
    "stock_mv" DECIMAL(18,2),
    "stock_mv_delisted" DECIMAL(18,2),
    "swap_net_asset" DECIMAL(18,2),
    "other_fund" DECIMAL(18,2),
    "redeem" DECIMAL(18,2),
    "expense" DECIMAL(18,2),
    "tax" DECIMAL(18,2),
    "tax_base" DECIMAL(18,2),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nav_est_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "margin_custodian" (
    "id" SERIAL NOT NULL,
    "fund_abbr" VARCHAR(8) NOT NULL,
    "margin_date" DATE NOT NULL,
    "margin" DECIMAL(18,2) NOT NULL,
    "net_asset" DECIMAL(18,2) NOT NULL,
    "margin_change" DECIMAL(18,2),
    "nextday_margin" DECIMAL(18,2),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "margin_custodian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "margin_est" (
    "id" SERIAL NOT NULL,
    "fund_abbr" VARCHAR(8) NOT NULL,
    "estimate_date" DATE NOT NULL,
    "margin" DECIMAL(18,2) NOT NULL,
    "net_asset" DECIMAL(18,2) NOT NULL,
    "short_mv" DECIMAL(18,2),
    "usable" DECIMAL(18,2),
    "add_margin" DECIMAL(18,2),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "margin_est_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option_custodian" (
    "id" SERIAL NOT NULL,
    "fund_abbr" VARCHAR(8) NOT NULL,
    "settle_date" DATE NOT NULL,
    "account_id" VARCHAR(32) NOT NULL,
    "balance" DECIMAL(18,2),
    "usable" DECIMAL(18,2),
    "deposit" DECIMAL(18,2),
    "withdraw" DECIMAL(18,2),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "option_custodian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "position_verify" (
    "id" SERIAL NOT NULL,
    "fund_abbr" VARCHAR(8) NOT NULL,
    "verify_date" DATE NOT NULL,
    "call_mv" DECIMAL(18,2),
    "put_mv" DECIMAL(18,2),
    "ptc_pct" DECIMAL(10,6),
    "call_adjust" DECIMAL(18,2),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "position_verify_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_nav_custodian_abbr" ON "nav_custodian"("fund_abbr");

-- CreateIndex
CREATE INDEX "idx_nav_custodian_date" ON "nav_custodian"("nav_date");

-- CreateIndex
CREATE UNIQUE INDEX "nav_custodian_fund_abbr_nav_date_key" ON "nav_custodian"("fund_abbr", "nav_date");

-- CreateIndex
CREATE INDEX "idx_nav_est_abbr" ON "nav_est"("fund_abbr");

-- CreateIndex
CREATE INDEX "idx_nav_est_date" ON "nav_est"("estimate_date");

-- CreateIndex
CREATE UNIQUE INDEX "nav_est_fund_abbr_estimate_date_key" ON "nav_est"("fund_abbr", "estimate_date");

-- CreateIndex
CREATE INDEX "idx_margin_custodian_abbr" ON "margin_custodian"("fund_abbr");

-- CreateIndex
CREATE INDEX "idx_margin_custodian_date" ON "margin_custodian"("margin_date");

-- CreateIndex
CREATE UNIQUE INDEX "margin_custodian_fund_abbr_margin_date_key" ON "margin_custodian"("fund_abbr", "margin_date");

-- CreateIndex
CREATE INDEX "idx_margin_est_abbr" ON "margin_est"("fund_abbr");

-- CreateIndex
CREATE INDEX "idx_margin_est_date" ON "margin_est"("estimate_date");

-- CreateIndex
CREATE UNIQUE INDEX "margin_est_fund_abbr_estimate_date_key" ON "margin_est"("fund_abbr", "estimate_date");

-- CreateIndex
CREATE INDEX "idx_option_custodian_abbr" ON "option_custodian"("fund_abbr");

-- CreateIndex
CREATE INDEX "idx_option_custodian_date" ON "option_custodian"("settle_date");

-- CreateIndex
CREATE UNIQUE INDEX "option_custodian_fund_abbr_settle_date_account_id_key" ON "option_custodian"("fund_abbr", "settle_date", "account_id");

-- CreateIndex
CREATE INDEX "idx_position_verify_abbr" ON "position_verify"("fund_abbr");

-- CreateIndex
CREATE INDEX "idx_position_verify_date" ON "position_verify"("verify_date");

-- CreateIndex
CREATE UNIQUE INDEX "position_verify_fund_abbr_verify_date_key" ON "position_verify"("fund_abbr", "verify_date");

-- AddForeignKey
ALTER TABLE "nav_custodian" ADD CONSTRAINT "nav_custodian_fund_abbr_fkey" FOREIGN KEY ("fund_abbr") REFERENCES "Product"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nav_est" ADD CONSTRAINT "nav_est_fund_abbr_fkey" FOREIGN KEY ("fund_abbr") REFERENCES "Product"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "margin_custodian" ADD CONSTRAINT "margin_custodian_fund_abbr_fkey" FOREIGN KEY ("fund_abbr") REFERENCES "Product"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "margin_est" ADD CONSTRAINT "margin_est_fund_abbr_fkey" FOREIGN KEY ("fund_abbr") REFERENCES "Product"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "option_custodian" ADD CONSTRAINT "option_custodian_fund_abbr_fkey" FOREIGN KEY ("fund_abbr") REFERENCES "Product"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position_verify" ADD CONSTRAINT "position_verify_fund_abbr_fkey" FOREIGN KEY ("fund_abbr") REFERENCES "Product"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
