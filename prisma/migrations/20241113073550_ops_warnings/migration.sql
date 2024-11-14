-- CreateEnum
CREATE TYPE "OpsWarningType" AS ENUM ('DISK_CHECK_FAILED', 'DISK_FULL', 'TIME_CHECK_FAILED', 'TIME_ERROR', 'OP_VALUE_ERROR');

-- AlterTable
ALTER TABLE "HostServer" ADD COLUMN     "cpu_cores" INTEGER,
ADD COLUMN     "cpu_model" TEXT,
ADD COLUMN     "hostname" TEXT,
ADD COLUMN     "memory_size" INTEGER,
ADD COLUMN     "os" TEXT,
ADD COLUMN     "os_version" TEXT;

-- AlterTable
ALTER TABLE "OpsWarning" ADD COLUMN     "type" "OpsWarningType",
ALTER COLUMN "status" SET DEFAULT 'PENDING',
ALTER COLUMN "text" DROP NOT NULL;
