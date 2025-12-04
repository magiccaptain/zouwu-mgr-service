-- AlterTable
ALTER TABLE "ProcessMonitor" ADD COLUMN     "log_files" TEXT[] DEFAULT ARRAY[]::TEXT[];
