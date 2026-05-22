-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "operational";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "StrategyLevel" AS ENUM ('PRODUCT', 'FUND_ACCOUNT');

-- CreateEnum
CREATE TYPE "TradeApiType" AS ENUM ('XTP', 'ATP', 'CTP', 'KFClient');

-- CreateEnum
CREATE TYPE "Market" AS ENUM ('SH', 'SZ', 'SHFE', 'CZCE', 'DCE', 'CFFEX', 'GFEX', 'STOCK_ALL', 'INE', 'CSI', 'CNI', 'BJ');

-- CreateEnum
CREATE TYPE "FundAccountType" AS ENUM ('STOCK', 'FUTURES');

-- CreateEnum
CREATE TYPE "InnerFundSnapshotReason" AS ENUM ('BEFORE_TRADING_DAY', 'AFTER_TRADING_DAY', 'MIDDLE_TRADING_DAY', 'SYNC', 'BEFORE_TRANSFER', 'AFTER_TRANSFER');

-- CreateEnum
CREATE TYPE "TransferDirection" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "TransferType" AS ENUM ('INNER', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "SubscriptionRedemptionDirection" AS ENUM ('SUBSCRIPTION', 'REDEMPTION');

-- CreateEnum
CREATE TYPE "OpsTaskType" AS ENUM ('BEFORE_CHECK_HOST_SERVER_DISK', 'BEFORE_CHECK_HOST_SERVER_TIME', 'BEFORE_SYNC_FUND_ACCOUNT', 'AFTER_ARCHIVE_TRADE_LOG', 'AFTER_SYNC_FUND_ACCOUNT', 'AFTER_SYNC_POSITIONS', 'AFTER_SYNC_ORDER', 'AFTER_SYNC_TRADE', 'AFTER_SYNC_LAST_PRICE', 'AFTER_PULL_OP_VALUE', 'AFTER_PULL_QUOTE_SNAPSHOT', 'AFTER_CHECK_HOST_SERVER_DISK', 'AFTER_CHECK_OP_VALUE', 'BEFORE_SYNC_POSITIONS', 'AFTER_CLEAR_PROCESSES', 'AFTER_CALC_MARKET_VALUE', 'BEFORE_SYNC_INDEX_WEIGHT', 'AFTER_CALC_PNL', 'BEFORE_WRITE_FUND_DATA', 'AFTER_WRITE_SUBSCRIPTION_REDEMPTION_RECORD');

-- CreateEnum
CREATE TYPE "OpsWarningStatus" AS ENUM ('PENDING', 'MANUAL_DONE', 'AUTO_DONE', 'AUTO_ERROR');

-- CreateEnum
CREATE TYPE "OpsWarningType" AS ENUM ('DISK_CHECK_FAILED', 'DISK_FULL', 'TIME_CHECK_FAILED', 'TIME_ERROR', 'OP_VALUE_ERROR', 'PROCESS_NOT_RUNNING', 'PROCESS_CRASHED', 'PROCESS_HIGH_CPU', 'PROCESS_HIGH_MEMORY', 'PROCESS_CHECK_FAILED');

-- CreateEnum
CREATE TYPE "RemoteCommandStatus" AS ENUM ('PENDING', 'DONE', 'ERROR');

-- CreateEnum
CREATE TYPE "RemoteCommandType" AS ENUM ('DISK_CHECK', 'TIME_CHECK', 'FREE_DISK', 'QUERY_ACCOUNT', 'QUERY_POSITION', 'QUERY_ORDER', 'QUERY_TRADE', 'QUERY_LAST_PRICE', 'PULL_OP_VALUE', 'PULL_QUOTE_SNAPSHOT', 'INNER_TRANSFER', 'EXTERNAL_TRANSFER', 'ARCHIVE_TRADE_LOG', 'PKILL_TRADER_TOOL', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "Side" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "PositionDirection" AS ENUM ('N', 'L', 'S');

-- CreateEnum
CREATE TYPE "HedgeFlag" AS ENUM ('S', 'A', 'H');

-- CreateEnum
CREATE TYPE "OffsetFlag" AS ENUM ('O', 'C', 'T', 'F');

-- CreateEnum
CREATE TYPE "ProcessType" AS ENUM ('TRADER', 'QUOTE', 'COMMUNICATION', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ProcessStatusType" AS ENUM ('RUNNING', 'STOPPED', 'ERROR', 'NOT_FOUND');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "needResetPwd" BOOLEAN DEFAULT true,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "homePage" TEXT DEFAULT '/',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expireAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Broker" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Broker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Custodian" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Custodian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostServer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "market" "Market" NOT NULL,
    "host_ip" TEXT,
    "ssh_host" TEXT,
    "ssh_user" TEXT,
    "ssh_port" INTEGER,
    "home_dir" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "is_master" BOOLEAN NOT NULL DEFAULT false,
    "last_check_at" TIMESTAMP(3),
    "brokerKey" TEXT,
    "companyKey" TEXT,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disk_total" INTEGER,
    "disk_used" INTEGER,
    "cpu_cores" INTEGER,
    "cpu_model" TEXT,
    "hostname" TEXT,
    "memory_size" INTEGER,
    "os" TEXT,
    "os_version" TEXT,

    CONSTRAINT "HostServer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyConstant" (
    "id" SERIAL NOT NULL,
    "level" "StrategyLevel" NOT NULL,
    "val" TEXT NOT NULL,
    "standardized" TEXT NOT NULL,
    "desc" TEXT,

    CONSTRAINT "StrategyConstant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT,
    "type" TEXT NOT NULL,
    "companyKey" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isTradeAnalysisEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isValuationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "bizLine" TEXT,
    "nominalBenchmarket" TEXT,
    "custodianKey" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundAccount" (
    "id" SERIAL NOT NULL,
    "account" TEXT NOT NULL,
    "brokerKey" TEXT NOT NULL,
    "productKey" TEXT NOT NULL,
    "companyKey" TEXT NOT NULL,
    "type" "FundAccountType" NOT NULL DEFAULT 'STOCK',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "remark" TEXT,
    "branch" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isTransferEnabled" BOOLEAN NOT NULL DEFAULT true,
    "executionBenchmark" TEXT,
    "executionStrategy" TEXT,
    "tradeApiType" "TradeApiType",
    "isTradeAnalysisEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FundAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "XTPConfig" (
    "id" SERIAL NOT NULL,
    "fund_account" TEXT NOT NULL,
    "market" "Market" NOT NULL,
    "ip" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "user" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "local_ip" TEXT DEFAULT '',
    "log_level" INTEGER DEFAULT 4,
    "account_key" TEXT NOT NULL,
    "save_file_path" TEXT DEFAULT '.',
    "software_version" TEXT DEFAULT '0.0.1',
    "heat_beat_interval" INTEGER DEFAULT 3,

    CONSTRAINT "XTPConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ATPConfig" (
    "id" SERIAL NOT NULL,
    "fund_account" TEXT NOT NULL,
    "market" "Market" NOT NULL,
    "ip" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "spare_ip" TEXT,
    "spare_port" INTEGER,
    "user" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "cust_id" TEXT NOT NULL,
    "cust_password" TEXT NOT NULL,
    "sh_account_id" TEXT NOT NULL,
    "sz_account_id" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "client_version" TEXT NOT NULL,
    "client_feature_code" TEXT NOT NULL,
    "account_mode" INTEGER NOT NULL,
    "login_mode" INTEGER NOT NULL,
    "order_way" TEXT NOT NULL,
    "reconnect_time" INTEGER DEFAULT 10,
    "heartbeat_interval_milli" INTEGER DEFAULT 5000,
    "connect_timeout_milli" INTEGER DEFAULT 5000,
    "encrypt_password_lib_path" TEXT,
    "rsa_public_key_path" TEXT,

    CONSTRAINT "ATPConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InnerFundSnapshot" (
    "id" SERIAL NOT NULL,
    "market" "Market" NOT NULL,
    "fund_account" TEXT NOT NULL,
    "trade_day" TEXT NOT NULL,
    "reason" "InnerFundSnapshotReason" NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "buying_power" DOUBLE PRECISION NOT NULL,
    "frozen" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xtp_account" JSONB,
    "atp_account" JSONB,
    "recordId" INTEGER,
    "ctpData" JSONB,

    CONSTRAINT "InnerFundSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferRecord" (
    "id" SERIAL NOT NULL,
    "fund_account" TEXT NOT NULL,
    "trade_day" TEXT NOT NULL,
    "market" "Market" NOT NULL,
    "direction" "TransferDirection" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "TransferType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "TransferRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalFundDatail" (
    "id" SERIAL NOT NULL,
    "fund_account" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ExternalFundDatail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlphaIndexWeight" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "code" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "trade_dt" TEXT NOT NULL,
    "i_weight" DOUBLE PRECISION NOT NULL,
    "updatetime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlphaIndexWeight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsTask" (
    "id" SERIAL NOT NULL,
    "type" "OpsTaskType" NOT NULL,
    "name" TEXT NOT NULL,
    "trade_day" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpsTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsWarning" (
    "id" SERIAL NOT NULL,
    "trade_day" TEXT NOT NULL,
    "status" "OpsWarningStatus" NOT NULL DEFAULT 'PENDING',
    "opsTaskId" INTEGER,
    "hostServerId" INTEGER,
    "fund_account" TEXT,
    "text" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remoteCommandId" INTEGER,
    "type" "OpsWarningType",

    CONSTRAINT "OpsWarning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RemoteCommand" (
    "id" SERIAL NOT NULL,
    "trade_day" TEXT NOT NULL,
    "cmd" TEXT NOT NULL,
    "cwd" TEXT,
    "code" INTEGER DEFAULT -999,
    "stdout" TEXT,
    "stderr" TEXT,
    "hostServerId" INTEGER NOT NULL,
    "opsTaskId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RemoteCommandStatus" NOT NULL DEFAULT 'PENDING',
    "type" "RemoteCommandType",
    "fund_account" TEXT,

    CONSTRAINT "RemoteCommand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" SERIAL NOT NULL,
    "tradeDay" TEXT NOT NULL,
    "fundAccount" TEXT NOT NULL,
    "market" "Market" NOT NULL,
    "brokerKey" TEXT NOT NULL,
    "totalQty" INTEGER NOT NULL,
    "sellableQty" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyKey" TEXT NOT NULL,
    "productKey" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "ctpData" JSONB,
    "hedgeFlag" "HedgeFlag",
    "posiDirection" "PositionDirection",

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "tradeDay" TEXT NOT NULL,
    "fundAccount" TEXT NOT NULL,
    "market" "Market" NOT NULL,
    "ticker" TEXT NOT NULL,
    "orderApiId" BIGINT NOT NULL,
    "orderRef" BIGINT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceType" INTEGER NOT NULL,
    "side" "Side" NOT NULL,
    "qtyTraded" INTEGER NOT NULL,
    "qtyLeft" INTEGER NOT NULL,
    "insertTime" BIGINT NOT NULL,
    "updateTime" BIGINT NOT NULL,
    "cancelTime" BIGINT NOT NULL,
    "status" INTEGER NOT NULL,
    "brokerKey" TEXT NOT NULL,
    "productKey" TEXT NOT NULL,
    "companyKey" TEXT NOT NULL,
    "ctpData" JSONB,
    "hedgeFlag" "HedgeFlag",
    "offsetFlag" "OffsetFlag",

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" SERIAL NOT NULL,
    "tradeDay" TEXT NOT NULL,
    "fundAccount" TEXT NOT NULL,
    "market" "Market" NOT NULL,
    "ticker" TEXT NOT NULL,
    "orderApiId" BIGINT NOT NULL,
    "orderRef" BIGINT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "tradeTime" BIGINT NOT NULL,
    "tradeAmount" DOUBLE PRECISION NOT NULL,
    "side" "Side" NOT NULL,
    "brokerKey" TEXT NOT NULL,
    "companyKey" TEXT NOT NULL,
    "productKey" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "ctpData" JSONB,
    "offsetFlag" "OffsetFlag",

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteBrief" (
    "id" SERIAL NOT NULL,
    "tradeDay" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "market" "Market" NOT NULL,
    "pre_close_price" DOUBLE PRECISION NOT NULL,
    "close_price" DOUBLE PRECISION NOT NULL,
    "upper_limit_price" DOUBLE PRECISION NOT NULL,
    "lower_limit_price" DOUBLE PRECISION NOT NULL,
    "security_type" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actual_close_price" DOUBLE PRECISION,
    "actual_close_price_date" TEXT,

    CONSTRAINT "QuoteBrief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndexBrief" (
    "id" SERIAL NOT NULL,
    "tradeDay" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "market" "Market" NOT NULL,
    "pre_close_price" DOUBLE PRECISION NOT NULL,
    "close_price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IndexBrief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketValue" (
    "id" SERIAL NOT NULL,
    "trade_day" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "market" "Market" NOT NULL,
    "position" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "close_price" DOUBLE PRECISION,
    "close_price_date" TEXT,
    "fund_account" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "market_value_ratio" DOUBLE PRECISION,

    CONSTRAINT "MarketValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndexWeight" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "code" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "trade_dt" TEXT NOT NULL,
    "i_weight" DOUBLE PRECISION NOT NULL,
    "updatetime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndexWeight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPnl" (
    "id" SERIAL NOT NULL,
    "trade_day" TEXT NOT NULL,
    "fund_account" TEXT NOT NULL,
    "rebalance_return" DOUBLE PRECISION NOT NULL,
    "rebalance_pnl" DOUBLE PRECISION NOT NULL,
    "rebalance_buy_commission" DOUBLE PRECISION NOT NULL,
    "rebalance_sell_commission" DOUBLE PRECISION NOT NULL,
    "t0_return" DOUBLE PRECISION NOT NULL,
    "t0_pnl" DOUBLE PRECISION NOT NULL,
    "t0_buy_commission" DOUBLE PRECISION NOT NULL,
    "t0_sell_commission" DOUBLE PRECISION NOT NULL,
    "hold_return" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "brokerKey" TEXT NOT NULL,
    "productKey" TEXT NOT NULL,
    "companyKey" TEXT NOT NULL,

    CONSTRAINT "DailyPnl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessMonitor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "process_type" "ProcessType" NOT NULL,
    "hostServerId" INTEGER NOT NULL,
    "process_name" TEXT,
    "command_pattern" TEXT,
    "pid_file" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "check_interval" INTEGER NOT NULL DEFAULT 60,
    "monitor_start_time" TIMESTAMP(3),
    "monitor_end_time" TIMESTAMP(3),
    "cpu_threshold" DOUBLE PRECISION,
    "memory_threshold" DOUBLE PRECISION,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "start_command" TEXT,
    "config_files" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "log_files" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "fund_account" TEXT,
    "configs" JSONB[],

    CONSTRAINT "ProcessMonitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessStatus" (
    "id" SERIAL NOT NULL,
    "processMonitorId" INTEGER NOT NULL,
    "status" "ProcessStatusType" NOT NULL,
    "pid" INTEGER,
    "cpu_percent" DOUBLE PRECISION,
    "memory_percent" DOUBLE PRECISION,
    "memory_used_mb" DOUBLE PRECISION,
    "uptime_seconds" INTEGER,
    "start_time" TIMESTAMP(3),
    "trade_day" TEXT NOT NULL,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "check_duration_ms" INTEGER,
    "error_message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cmd" TEXT,
    "ppid" INTEGER,

    CONSTRAINT "ProcessStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nav_custodian" (
    "id" SERIAL NOT NULL,
    "fund_abbr" VARCHAR(8) NOT NULL,
    "nav_date" DATE NOT NULL,
    "nav" DECIMAL(10,4) NOT NULL,
    "cum_nav" DECIMAL(10,4) NOT NULL,
    "con_capital" DECIMAL(18,2),
    "net_capital" DECIMAL(18,2),
    "cash" DECIMAL(18,2),
    "cash_interest" DECIMAL(18,2),
    "future_margin" DECIMAL(18,2),
    "future_usable" DECIMAL(18,2),
    "stock_usable" DECIMAL(18,2),
    "stock_usable_interest" DECIMAL(18,2),
    "stock_mv" DECIMAL(18,2),
    "stock_mv_delisted" DECIMAL(18,2),
    "swap_net_asset" DECIMAL(18,2),
    "other_fund" DECIMAL(18,2),
    "redeem" DECIMAL(18,2),
    "expense" DECIMAL(18,2),
    "tax" DECIMAL(18,2),
    "tax_base" DECIMAL(18,2),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nav_custodian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nav_est" (
    "id" SERIAL NOT NULL,
    "fund_abbr" VARCHAR(8) NOT NULL,
    "estimate_date" DATE NOT NULL,
    "nav" DECIMAL(10,4) NOT NULL,
    "cum_nav" DECIMAL(10,4) NOT NULL,
    "con_capital" DECIMAL(18,2),
    "net_capital" DECIMAL(18,2),
    "cash" DECIMAL(18,2),
    "cash_interest" DECIMAL(18,2),
    "future_margin" DECIMAL(18,2),
    "future_usable" DECIMAL(18,2),
    "stock_usable" DECIMAL(18,2),
    "stock_usable_interest" DECIMAL(18,2),
    "stock_mv" DECIMAL(18,2),
    "stock_mv_delisted" DECIMAL(18,2),
    "swap_net_asset" DECIMAL(18,2),
    "other_fund" DECIMAL(18,2),
    "redeem" DECIMAL(18,2),
    "expense" DECIMAL(18,2),
    "tax" DECIMAL(18,2),
    "tax_base" DECIMAL(18,2),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nav_est_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "margin_custodian" (
    "id" SERIAL NOT NULL,
    "fund_abbr" VARCHAR(8) NOT NULL,
    "margin_date" DATE NOT NULL,
    "margin" DECIMAL(18,2) NOT NULL,
    "net_asset" DECIMAL(18,2) NOT NULL,
    "margin_change" DECIMAL(18,2),
    "nextday_margin" DECIMAL(18,2),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "margin_custodian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "margin_est" (
    "id" SERIAL NOT NULL,
    "fund_abbr" VARCHAR(8) NOT NULL,
    "estimate_date" DATE NOT NULL,
    "margin" DECIMAL(18,2) NOT NULL,
    "net_asset" DECIMAL(18,2) NOT NULL,
    "short_mv" DECIMAL(18,2),
    "usable" DECIMAL(18,2),
    "add_margin" DECIMAL(18,2),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "margin_est_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option_custodian" (
    "id" SERIAL NOT NULL,
    "fund_abbr" VARCHAR(8) NOT NULL,
    "settle_date" DATE NOT NULL,
    "account_id" VARCHAR(32) NOT NULL,
    "balance" DECIMAL(18,2),
    "usable" DECIMAL(18,2),
    "deposit" DECIMAL(18,2),
    "withdraw" DECIMAL(18,2),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "option_custodian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "position_verify" (
    "id" SERIAL NOT NULL,
    "fund_abbr" VARCHAR(8) NOT NULL,
    "verify_date" DATE NOT NULL,
    "call_mv" DECIMAL(18,2),
    "put_mv" DECIMAL(18,2),
    "ptc_pct" DECIMAL(10,6),
    "call_adjust" DECIMAL(18,2),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "position_verify_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionRedemptionRecord" (
    "id" SERIAL NOT NULL,
    "fund_account" TEXT NOT NULL,
    "direction" "SubscriptionRedemptionDirection" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "operator" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remark" TEXT,
    "reduce_day" TEXT,

    CONSTRAINT "SubscriptionRedemptionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuturesAccountInfo" (
    "id" SERIAL NOT NULL,
    "fund_account" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "investorID" TEXT NOT NULL,
    "preMortgage" DECIMAL(18,2) NOT NULL,
    "preCredit" DECIMAL(18,2) NOT NULL,
    "preBalance" DECIMAL(18,2) NOT NULL,
    "deposit" DECIMAL(18,2) NOT NULL,
    "withdraw" DECIMAL(18,2) NOT NULL,
    "frozenMargin" DECIMAL(18,2) NOT NULL,
    "frozenFee" DECIMAL(18,2) NOT NULL,
    "currMargin" DECIMAL(18,2) NOT NULL,
    "fee" DECIMAL(18,2) NOT NULL,
    "closeProfit" DECIMAL(18,2) NOT NULL,
    "positionProfit" DECIMAL(18,2) NOT NULL,
    "balance" DECIMAL(18,2) NOT NULL,
    "available" DECIMAL(18,2) NOT NULL,
    "tradingDay" TEXT NOT NULL,
    "updateTime" TEXT NOT NULL,
    "currencyID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FuturesAccountInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuturesPosition" (
    "id" SERIAL NOT NULL,
    "tradeDay" TEXT NOT NULL,
    "fundAccount" TEXT NOT NULL,
    "market" "Market" NOT NULL,
    "brokerKey" TEXT NOT NULL,
    "totalQty" INTEGER NOT NULL,
    "sellableQty" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyKey" TEXT NOT NULL,
    "productKey" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "ctpData" JSONB,
    "hedgeFlag" "HedgeFlag",
    "posiDirection" "PositionDirection",
    "closePrice" DOUBLE PRECISION,
    "notionalValue" DOUBLE PRECISION,

    CONSTRAINT "FuturesPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operational"."AccountDailyStats" (
    "id" SERIAL NOT NULL,
    "tradeDay" TEXT NOT NULL,
    "fundAccount" TEXT NOT NULL,
    "market" "Market" NOT NULL,
    "netAsset" DOUBLE PRECISION NOT NULL,
    "turnoverRate" DOUBLE PRECISION NOT NULL,
    "dailyReturn" DOUBLE PRECISION NOT NULL,
    "weeklyReturn" DOUBLE PRECISION NOT NULL,
    "weeklyExcess" DOUBLE PRECISION NOT NULL,
    "shRatio" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountDailyStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuturesContractParameter" (
    "id" SERIAL NOT NULL,
    "order_book_id" TEXT NOT NULL,
    "underlying_symbol" TEXT NOT NULL,
    "market_tplus" TEXT,
    "symbol" TEXT NOT NULL,
    "margin_rate" DOUBLE PRECISION NOT NULL,
    "maturity_date" DATE,
    "type" TEXT NOT NULL,
    "trading_code" TEXT NOT NULL,
    "exchange" "Market" NOT NULL,
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
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Broker_key_key" ON "Broker"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Company_key_key" ON "Company"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Custodian_key_key" ON "Custodian"("key");

-- CreateIndex
CREATE UNIQUE INDEX "HostServer_market_brokerKey_companyKey_ssh_host_ssh_port_key" ON "HostServer"("market", "brokerKey", "companyKey", "ssh_host", "ssh_port");

-- CreateIndex
CREATE UNIQUE INDEX "StrategyConstant_level_standardized_val_key" ON "StrategyConstant"("level", "standardized", "val");

-- CreateIndex
CREATE UNIQUE INDEX "Product_key_key" ON "Product"("key");

-- CreateIndex
CREATE UNIQUE INDEX "FundAccount_account_key" ON "FundAccount"("account");

-- CreateIndex
CREATE UNIQUE INDEX "XTPConfig_fund_account_market_key" ON "XTPConfig"("fund_account", "market");

-- CreateIndex
CREATE UNIQUE INDEX "ATPConfig_fund_account_market_key" ON "ATPConfig"("fund_account", "market");

-- CreateIndex
CREATE INDEX "InnerFundSnapshot_fund_account_market_trade_day_idx" ON "InnerFundSnapshot"("fund_account", "market", "trade_day" DESC);

-- CreateIndex
CREATE INDEX "TransferRecord_fund_account_market_trade_day_idx" ON "TransferRecord"("fund_account", "market", "trade_day" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ExternalFundDatail_fund_account_key" ON "ExternalFundDatail"("fund_account");

-- CreateIndex
CREATE UNIQUE INDEX "AlphaIndexWeight_trade_dt_code_symbol_key" ON "AlphaIndexWeight"("trade_dt", "code", "symbol");

-- CreateIndex
CREATE INDEX "OpsTask_trade_day_idx" ON "OpsTask"("trade_day" DESC);

-- CreateIndex
CREATE INDEX "OpsWarning_trade_day_idx" ON "OpsWarning"("trade_day" DESC);

-- CreateIndex
CREATE INDEX "RemoteCommand_hostServerId_trade_day_idx" ON "RemoteCommand"("hostServerId", "trade_day" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Position_tradeDay_fundAccount_market_ticker_key" ON "Position"("tradeDay", "fundAccount", "market", "ticker");

-- CreateIndex
CREATE INDEX "Order_tradeDay_fundAccount_orderApiId_idx" ON "Order"("tradeDay", "fundAccount", "orderApiId");

-- CreateIndex
CREATE INDEX "Order_tradeDay_fundAccount_orderRef_idx" ON "Order"("tradeDay", "fundAccount", "orderRef");

-- CreateIndex
CREATE UNIQUE INDEX "Order_tradeDay_fundAccount_market_ticker_orderRef_key" ON "Order"("tradeDay", "fundAccount", "market", "ticker", "orderRef");

-- CreateIndex
CREATE INDEX "Trade_tradeDay_fundAccount_orderApiId_idx" ON "Trade"("tradeDay", "fundAccount", "orderApiId");

-- CreateIndex
CREATE INDEX "Trade_tradeDay_fundAccount_orderRef_idx" ON "Trade"("tradeDay", "fundAccount", "orderRef");

-- CreateIndex
CREATE INDEX "Trade_tradeDay_fundAccount_tradeId_idx" ON "Trade"("tradeDay", "fundAccount", "tradeId");

-- CreateIndex
CREATE UNIQUE INDEX "Trade_tradeDay_fundAccount_market_ticker_tradeId_key" ON "Trade"("tradeDay", "fundAccount", "market", "ticker", "tradeId");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteBrief_tradeDay_ticker_market_key" ON "QuoteBrief"("tradeDay", "ticker", "market");

-- CreateIndex
CREATE INDEX "IndexBrief_tradeDay_idx" ON "IndexBrief"("tradeDay");

-- CreateIndex
CREATE INDEX "IndexBrief_ticker_market_idx" ON "IndexBrief"("ticker", "market");

-- CreateIndex
CREATE UNIQUE INDEX "IndexBrief_tradeDay_ticker_market_key" ON "IndexBrief"("tradeDay", "ticker", "market");

-- CreateIndex
CREATE UNIQUE INDEX "MarketValue_trade_day_fund_account_ticker_market_key" ON "MarketValue"("trade_day", "fund_account", "ticker", "market");

-- CreateIndex
CREATE UNIQUE INDEX "IndexWeight_trade_dt_code_symbol_key" ON "IndexWeight"("trade_dt", "code", "symbol");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPnl_trade_day_fund_account_key" ON "DailyPnl"("trade_day", "fund_account");

-- CreateIndex
CREATE INDEX "ProcessMonitor_hostServerId_active_idx" ON "ProcessMonitor"("hostServerId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessMonitor_hostServerId_name_key" ON "ProcessMonitor"("hostServerId", "name");

-- CreateIndex
CREATE INDEX "ProcessStatus_processMonitorId_checked_at_idx" ON "ProcessStatus"("processMonitorId", "checked_at" DESC);

-- CreateIndex
CREATE INDEX "ProcessStatus_checked_at_idx" ON "ProcessStatus"("checked_at" DESC);

-- CreateIndex
CREATE INDEX "ProcessStatus_trade_day_checked_at_idx" ON "ProcessStatus"("trade_day", "checked_at" DESC);

-- CreateIndex
CREATE INDEX "idx_nav_custodian_abbr" ON "nav_custodian"("fund_abbr");

-- CreateIndex
CREATE INDEX "idx_nav_custodian_date" ON "nav_custodian"("nav_date");

-- CreateIndex
CREATE UNIQUE INDEX "nav_custodian_fund_abbr_nav_date_key" ON "nav_custodian"("fund_abbr", "nav_date");

-- CreateIndex
CREATE INDEX "idx_nav_est_abbr" ON "nav_est"("fund_abbr");

-- CreateIndex
CREATE INDEX "idx_nav_est_date" ON "nav_est"("estimate_date");

-- CreateIndex
CREATE UNIQUE INDEX "nav_est_fund_abbr_estimate_date_key" ON "nav_est"("fund_abbr", "estimate_date");

-- CreateIndex
CREATE INDEX "idx_margin_custodian_abbr" ON "margin_custodian"("fund_abbr");

-- CreateIndex
CREATE INDEX "idx_margin_custodian_date" ON "margin_custodian"("margin_date");

-- CreateIndex
CREATE UNIQUE INDEX "margin_custodian_fund_abbr_margin_date_key" ON "margin_custodian"("fund_abbr", "margin_date");

-- CreateIndex
CREATE INDEX "idx_margin_est_abbr" ON "margin_est"("fund_abbr");

-- CreateIndex
CREATE INDEX "idx_margin_est_date" ON "margin_est"("estimate_date");

-- CreateIndex
CREATE UNIQUE INDEX "margin_est_fund_abbr_estimate_date_key" ON "margin_est"("fund_abbr", "estimate_date");

-- CreateIndex
CREATE INDEX "idx_option_custodian_abbr" ON "option_custodian"("fund_abbr");

-- CreateIndex
CREATE INDEX "idx_option_custodian_date" ON "option_custodian"("settle_date");

-- CreateIndex
CREATE UNIQUE INDEX "option_custodian_fund_abbr_settle_date_account_id_key" ON "option_custodian"("fund_abbr", "settle_date", "account_id");

-- CreateIndex
CREATE INDEX "idx_position_verify_abbr" ON "position_verify"("fund_abbr");

-- CreateIndex
CREATE INDEX "idx_position_verify_date" ON "position_verify"("verify_date");

-- CreateIndex
CREATE UNIQUE INDEX "position_verify_fund_abbr_verify_date_key" ON "position_verify"("fund_abbr", "verify_date");

-- CreateIndex
CREATE INDEX "SubscriptionRedemptionRecord_fund_account_createdAt_idx" ON "SubscriptionRedemptionRecord"("fund_account", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_futures_account_info_fund" ON "FuturesAccountInfo"("fund_account");

-- CreateIndex
CREATE INDEX "idx_futures_account_info_day" ON "FuturesAccountInfo"("tradingDay");

-- CreateIndex
CREATE UNIQUE INDEX "FuturesAccountInfo_fund_account_tradingDay_key" ON "FuturesAccountInfo"("fund_account", "tradingDay");

-- CreateIndex
CREATE UNIQUE INDEX "FuturesPosition_tradeDay_fundAccount_market_ticker_posiDire_key" ON "FuturesPosition"("tradeDay", "fundAccount", "market", "ticker", "posiDirection");

-- CreateIndex
CREATE INDEX "AccountDailyStats_tradeDay_idx" ON "operational"."AccountDailyStats"("tradeDay");

-- CreateIndex
CREATE INDEX "AccountDailyStats_fundAccount_idx" ON "operational"."AccountDailyStats"("fundAccount");

-- CreateIndex
CREATE UNIQUE INDEX "AccountDailyStats_tradeDay_fundAccount_key" ON "operational"."AccountDailyStats"("tradeDay", "fundAccount");

-- CreateIndex
CREATE UNIQUE INDEX "FuturesContractParameter_order_book_id_key" ON "FuturesContractParameter"("order_book_id");

-- CreateIndex
CREATE INDEX "FuturesContractParameter_order_book_id_idx" ON "FuturesContractParameter"("order_book_id");

-- CreateIndex
CREATE INDEX "FuturesContractParameter_underlying_symbol_idx" ON "FuturesContractParameter"("underlying_symbol");

-- CreateIndex
CREATE INDEX "FuturesContractParameter_exchange_idx" ON "FuturesContractParameter"("exchange");

-- CreateIndex
CREATE INDEX "FuturesContractParameter_maturity_date_idx" ON "FuturesContractParameter"("maturity_date");

-- CreateIndex
CREATE INDEX "FuturesContractParameter_listed_date_idx" ON "FuturesContractParameter"("listed_date");

-- CreateIndex
CREATE INDEX "FuturesContractParameter_de_listed_date_idx" ON "FuturesContractParameter"("de_listed_date");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostServer" ADD CONSTRAINT "HostServer_brokerKey_fkey" FOREIGN KEY ("brokerKey") REFERENCES "Broker"("key") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostServer" ADD CONSTRAINT "HostServer_companyKey_fkey" FOREIGN KEY ("companyKey") REFERENCES "Company"("key") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_companyKey_fkey" FOREIGN KEY ("companyKey") REFERENCES "Company"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_custodianKey_fkey" FOREIGN KEY ("custodianKey") REFERENCES "Custodian"("key") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundAccount" ADD CONSTRAINT "FundAccount_brokerKey_fkey" FOREIGN KEY ("brokerKey") REFERENCES "Broker"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundAccount" ADD CONSTRAINT "FundAccount_companyKey_fkey" FOREIGN KEY ("companyKey") REFERENCES "Company"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundAccount" ADD CONSTRAINT "FundAccount_productKey_fkey" FOREIGN KEY ("productKey") REFERENCES "Product"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XTPConfig" ADD CONSTRAINT "XTPConfig_fund_account_fkey" FOREIGN KEY ("fund_account") REFERENCES "FundAccount"("account") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ATPConfig" ADD CONSTRAINT "ATPConfig_fund_account_fkey" FOREIGN KEY ("fund_account") REFERENCES "FundAccount"("account") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InnerFundSnapshot" ADD CONSTRAINT "InnerFundSnapshot_fund_account_fkey" FOREIGN KEY ("fund_account") REFERENCES "FundAccount"("account") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InnerFundSnapshot" ADD CONSTRAINT "InnerFundSnapshot_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "TransferRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRecord" ADD CONSTRAINT "TransferRecord_fund_account_fkey" FOREIGN KEY ("fund_account") REFERENCES "FundAccount"("account") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalFundDatail" ADD CONSTRAINT "ExternalFundDatail_fund_account_fkey" FOREIGN KEY ("fund_account") REFERENCES "FundAccount"("account") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsWarning" ADD CONSTRAINT "OpsWarning_fund_account_fkey" FOREIGN KEY ("fund_account") REFERENCES "FundAccount"("account") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsWarning" ADD CONSTRAINT "OpsWarning_hostServerId_fkey" FOREIGN KEY ("hostServerId") REFERENCES "HostServer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsWarning" ADD CONSTRAINT "OpsWarning_opsTaskId_fkey" FOREIGN KEY ("opsTaskId") REFERENCES "OpsTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsWarning" ADD CONSTRAINT "OpsWarning_remoteCommandId_fkey" FOREIGN KEY ("remoteCommandId") REFERENCES "RemoteCommand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemoteCommand" ADD CONSTRAINT "RemoteCommand_fund_account_fkey" FOREIGN KEY ("fund_account") REFERENCES "FundAccount"("account") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemoteCommand" ADD CONSTRAINT "RemoteCommand_hostServerId_fkey" FOREIGN KEY ("hostServerId") REFERENCES "HostServer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemoteCommand" ADD CONSTRAINT "RemoteCommand_opsTaskId_fkey" FOREIGN KEY ("opsTaskId") REFERENCES "OpsTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketValue" ADD CONSTRAINT "MarketValue_fund_account_fkey" FOREIGN KEY ("fund_account") REFERENCES "FundAccount"("account") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessMonitor" ADD CONSTRAINT "ProcessMonitor_fund_account_fkey" FOREIGN KEY ("fund_account") REFERENCES "FundAccount"("account") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessMonitor" ADD CONSTRAINT "ProcessMonitor_hostServerId_fkey" FOREIGN KEY ("hostServerId") REFERENCES "HostServer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessStatus" ADD CONSTRAINT "ProcessStatus_processMonitorId_fkey" FOREIGN KEY ("processMonitorId") REFERENCES "ProcessMonitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nav_custodian" ADD CONSTRAINT "nav_custodian_fund_abbr_fkey" FOREIGN KEY ("fund_abbr") REFERENCES "Product"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nav_est" ADD CONSTRAINT "nav_est_fund_abbr_fkey" FOREIGN KEY ("fund_abbr") REFERENCES "Product"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "margin_custodian" ADD CONSTRAINT "margin_custodian_fund_abbr_fkey" FOREIGN KEY ("fund_abbr") REFERENCES "Product"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "margin_est" ADD CONSTRAINT "margin_est_fund_abbr_fkey" FOREIGN KEY ("fund_abbr") REFERENCES "Product"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "option_custodian" ADD CONSTRAINT "option_custodian_fund_abbr_fkey" FOREIGN KEY ("fund_abbr") REFERENCES "Product"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position_verify" ADD CONSTRAINT "position_verify_fund_abbr_fkey" FOREIGN KEY ("fund_abbr") REFERENCES "Product"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionRedemptionRecord" ADD CONSTRAINT "SubscriptionRedemptionRecord_fund_account_fkey" FOREIGN KEY ("fund_account") REFERENCES "FundAccount"("account") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionRedemptionRecord" ADD CONSTRAINT "SubscriptionRedemptionRecord_operator_fkey" FOREIGN KEY ("operator") REFERENCES "User"("username") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuturesAccountInfo" ADD CONSTRAINT "FuturesAccountInfo_fund_account_fkey" FOREIGN KEY ("fund_account") REFERENCES "FundAccount"("account") ON DELETE RESTRICT ON UPDATE CASCADE;

