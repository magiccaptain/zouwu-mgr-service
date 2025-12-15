/*
  Warnings:

  - The values [O1,O2,W,T,E] on the enum `FundAccountType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FundAccountType_new" AS ENUM ('STOCK', 'FUTURES', 'O');
ALTER TABLE "FundAccount" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "FundAccount" ALTER COLUMN "type" TYPE "FundAccountType_new" USING ("type"::text::"FundAccountType_new");
ALTER TYPE "FundAccountType" RENAME TO "FundAccountType_old";
ALTER TYPE "FundAccountType_new" RENAME TO "FundAccountType";
DROP TYPE "FundAccountType_old";
ALTER TABLE "FundAccount" ALTER COLUMN "type" SET DEFAULT 'STOCK';
COMMIT;
