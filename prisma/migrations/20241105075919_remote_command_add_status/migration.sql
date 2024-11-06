/*
  Warnings:

  - Added the required column `status` to the `RemoteCommand` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RemoteCommandStatus" AS ENUM ('PENDING', 'DONE');

-- AlterTable
ALTER TABLE "RemoteCommand" ADD COLUMN     "status" "RemoteCommandStatus" NOT NULL;
