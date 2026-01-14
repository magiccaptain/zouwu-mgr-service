-- CreateTable
CREATE TABLE "public"."FuturesContractParameter" (
    "id" SERIAL NOT NULL,
    "order_book_id" TEXT NOT NULL,
    "underlying_symbol" TEXT NOT NULL,
    "market_tplus" TEXT,
    "symbol" TEXT NOT NULL,
    "margin_rate" DOUBLE PRECISION NOT NULL,
    "maturity_date" DATE,
    "type" TEXT NOT NULL,
    "trading_code" TEXT NOT NULL,
    "exchange" "public"."Market" NOT NULL,
    "product" TEXT NOT NULL,
    "contract_mult" INTEGER NOT NULL,
    "round_lot" INTEGER NOT NULL,
    "trading_hours" TEXT,
    "listed_date" DATE,
    "industry_name" TEXT,
    "de_listed_date" DATE,
    "underlying_order_book_id" TEXT,
    "start_delivery_date" DATE,
    "end_delivery_date" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FuturesContractParameter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FuturesContractParameter_order_book_id_key" ON "public"."FuturesContractParameter"("order_book_id");

-- CreateIndex
CREATE INDEX "FuturesContractParameter_order_book_id_idx" ON "public"."FuturesContractParameter"("order_book_id");

-- CreateIndex
CREATE INDEX "FuturesContractParameter_underlying_symbol_idx" ON "public"."FuturesContractParameter"("underlying_symbol");

-- CreateIndex
CREATE INDEX "FuturesContractParameter_exchange_idx" ON "public"."FuturesContractParameter"("exchange");

-- CreateIndex
CREATE INDEX "FuturesContractParameter_maturity_date_idx" ON "public"."FuturesContractParameter"("maturity_date");

-- CreateIndex
CREATE INDEX "FuturesContractParameter_listed_date_idx" ON "public"."FuturesContractParameter"("listed_date");

-- CreateIndex
CREATE INDEX "FuturesContractParameter_de_listed_date_idx" ON "public"."FuturesContractParameter"("de_listed_date");
