/*
  Warnings:

  - Added the required column `companyKey` to the `Position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productKey` to the `Position` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Position" ADD COLUMN     "companyKey" TEXT NOT NULL,
ADD COLUMN     "productKey" TEXT NOT NULL;
