/*
  Warnings:

  - You are about to drop the column `opsWarningId` on the `RemoteCommand` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "RemoteCommand" DROP CONSTRAINT "RemoteCommand_opsWarningId_fkey";

-- AlterTable
ALTER TABLE "OpsWarning" ADD COLUMN     "remoteCommandId" INTEGER;

-- AlterTable
ALTER TABLE "RemoteCommand" DROP COLUMN "opsWarningId",
ADD COLUMN     "fund_account" TEXT;

-- AddForeignKey
ALTER TABLE "OpsWarning" ADD CONSTRAINT "OpsWarning_remoteCommandId_fkey" FOREIGN KEY ("remoteCommandId") REFERENCES "RemoteCommand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemoteCommand" ADD CONSTRAINT "RemoteCommand_fund_account_fkey" FOREIGN KEY ("fund_account") REFERENCES "FundAccount"("account") ON DELETE SET NULL ON UPDATE CASCADE;
