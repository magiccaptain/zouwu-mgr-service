/*
  Warnings:

  - Added the required column `type` to the `RemoteCommand` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RemoteCommandType" AS ENUM ('DISK_CHECK', 'TIME_CHECK', 'FREE_DISK', 'QUERY_ACCOUNT', 'QUERY_POSITION', 'QUERY_ORDER', 'QUERY_TRADE', 'QUERY_LAST_PRICE', 'PULL_OP_VALUE', 'PULL_QUOTE_SNAPSHOT');

-- AlterEnum
ALTER TYPE "OpsTaskType" ADD VALUE 'AFTER_CHECK_OP_VALUE';

-- AlterTable
ALTER TABLE "RemoteCommand" ADD COLUMN     "type" "RemoteCommandType" NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';
