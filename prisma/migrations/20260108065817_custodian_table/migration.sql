-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "custodianKey" TEXT;

-- CreateTable
CREATE TABLE "Custodian" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Custodian_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Custodian_key_key" ON "Custodian"("key");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_custodianKey_fkey" FOREIGN KEY ("custodianKey") REFERENCES "Custodian"("key") ON DELETE SET NULL ON UPDATE CASCADE;
