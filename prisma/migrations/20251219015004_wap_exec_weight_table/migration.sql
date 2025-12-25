-- CreateTable
CREATE TABLE "WapExecWeight" (
    "id" SERIAL NOT NULL,
    "ticker" TEXT NOT NULL,
    "target_weight" DOUBLE PRECISION NOT NULL,
    "exec_date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WapExecWeight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WapExecWeight_ticker_exec_date_key" ON "WapExecWeight"("ticker", "exec_date");
