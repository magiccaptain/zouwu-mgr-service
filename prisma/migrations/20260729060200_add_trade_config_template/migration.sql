-- 券商级交易配置模板：存一份"部分配置"(JSON)，新建账户交易配置时预填共通字段。
CREATE TABLE "TradeConfigTemplate" (
    "id" SERIAL NOT NULL,
    "brokerKey" TEXT NOT NULL,
    "apiType" "TradeApiType" NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradeConfigTemplate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TradeConfigTemplate_brokerKey_apiType_key" ON "TradeConfigTemplate"("brokerKey", "apiType");

ALTER TABLE "TradeConfigTemplate" ADD CONSTRAINT "TradeConfigTemplate_brokerKey_fkey" FOREIGN KEY ("brokerKey") REFERENCES "Broker"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
