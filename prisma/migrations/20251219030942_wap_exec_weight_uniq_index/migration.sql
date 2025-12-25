/*
  Warnings:

  - You are about to drop the column `createdAt` on the `WapExecWeight` table. All the data in the column will be lost.
  - You are about to drop the column `exec_date` on the `WapExecWeight` table. All the data in the column will be lost.
  - You are about to drop the column `target_weight` on the `WapExecWeight` table. All the data in the column will be lost.
  - You are about to drop the column `ticker` on the `WapExecWeight` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `WapExecWeight` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[trade_dt,code,symbol]` on the table `WapExecWeight` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `WapExecWeight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `WapExecWeight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `i_weight` to the `WapExecWeight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `symbol` to the `WapExecWeight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trade_dt` to the `WapExecWeight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatetime` to the `WapExecWeight` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "WapExecWeight_ticker_exec_date_key";

-- AlterTable
ALTER TABLE "WapExecWeight" DROP COLUMN "createdAt",
DROP COLUMN "exec_date",
DROP COLUMN "target_weight",
DROP COLUMN "ticker",
DROP COLUMN "updatedAt",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "i_weight" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "symbol" TEXT NOT NULL,
ADD COLUMN     "trade_dt" TEXT NOT NULL,
ADD COLUMN     "updatetime" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "WapExecWeight_trade_dt_code_symbol_key" ON "WapExecWeight"("trade_dt", "code", "symbol");
