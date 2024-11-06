/*
  Warnings:

  - Made the column `market` on table `HostServer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "HostServer" ALTER COLUMN "market" SET NOT NULL;
