/*
  Warnings:

  - You are about to drop the column `fundAccountId` on the `ProcessMonitor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[hostServerId,name]` on the table `ProcessMonitor` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ProcessMonitor" DROP CONSTRAINT "ProcessMonitor_fundAccountId_fkey";

-- DropIndex
DROP INDEX "ProcessMonitor_fundAccountId_idx";

-- DropIndex
DROP INDEX "ProcessMonitor_hostServerId_fundAccountId_process_type_key";

-- AlterTable
ALTER TABLE "ProcessMonitor" DROP COLUMN "fundAccountId",
ADD COLUMN     "fund_account" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ProcessMonitor_hostServerId_name_key" ON "ProcessMonitor"("hostServerId", "name");

-- AddForeignKey
ALTER TABLE "ProcessMonitor" ADD CONSTRAINT "ProcessMonitor_fund_account_fkey" FOREIGN KEY ("fund_account") REFERENCES "FundAccount"("account") ON DELETE SET NULL ON UPDATE CASCADE;
