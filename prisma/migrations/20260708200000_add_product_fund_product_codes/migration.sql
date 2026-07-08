-- AlterTable
ALTER TABLE "Product" ADD COLUMN "fundProductCodes" TEXT[] DEFAULT ARRAY[]::TEXT[];
