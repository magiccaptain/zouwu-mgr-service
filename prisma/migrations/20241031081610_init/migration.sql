-- CreateEnum
CREATE TYPE "Market" AS ENUM ('SH', 'SZ');

-- CreateEnum
CREATE TYPE "FundAccountType" AS ENUM ('STOCK', 'FUTURES');

-- CreateEnum
CREATE TYPE "InnerFundSnapshotReason" AS ENUM ('BEFORE_TRADING_DAY', 'AFTER_TRADING_DAY', 'MIDDLE_TRADING_DAY', 'SYNC', 'BEFORE_TRANSFER', 'AFTER_TRANSFER');

-- CreateEnum
CREATE TYPE "TransferDirection" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "TransferType" AS ENUM ('INNER', 'EXTERNAL');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "roles" TEXT[] DEFAULT ARRAY['USER']::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "needResetPwd" BOOLEAN DEFAULT true,

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
    "brokerKey" TEXT NOT NULL,
    "companyKey" TEXT NOT NULL,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HostServer_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "HostServer_market_brokerKey_companyKey_ssh_host_ssh_port_key" ON "HostServer"("market", "brokerKey", "companyKey", "ssh_host", "ssh_port");

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

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostServer" ADD CONSTRAINT "HostServer_brokerKey_fkey" FOREIGN KEY ("brokerKey") REFERENCES "Broker"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostServer" ADD CONSTRAINT "HostServer_companyKey_fkey" FOREIGN KEY ("companyKey") REFERENCES "Company"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_companyKey_fkey" FOREIGN KEY ("companyKey") REFERENCES "Company"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

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
