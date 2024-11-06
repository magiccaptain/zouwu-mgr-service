/*
  Warnings:

  - You are about to drop the column `status` on the `OpsTask` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "OpsTaskType" ADD VALUE 'AFTER_CHECK_HOST_SERVER_DISK';

-- AlterTable
ALTER TABLE "OpsTask" DROP COLUMN "status";

-- DropEnum
DROP TYPE "OpsTaskStatus";
