-- 产品「产品规模」字段（数值·以元存储，前端按万元换算）。
ALTER TABLE "Product" ADD COLUMN "productScale" DECIMAL(20,2);
