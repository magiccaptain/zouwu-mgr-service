-- AlterTable
ALTER TABLE "ProcessMonitor" ADD COLUMN     "config_files" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "ProcessStatus" ADD COLUMN     "cmd" TEXT,
ADD COLUMN     "ppid" INTEGER;
