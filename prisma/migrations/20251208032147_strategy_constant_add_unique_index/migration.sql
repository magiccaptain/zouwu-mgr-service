/*
  Warnings:

  - A unique constraint covering the columns `[level,standardized,val]` on the table `StrategyConstant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StrategyConstant_level_standardized_val_key" ON "StrategyConstant"("level", "standardized", "val");
