# ZouWu Mgr Service

[![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)

## Description

ZouWu 管理服务是一个基于 [Nest](https://github.com/nestjs/nest) 框架的量化交易管理系统，提供资金账户管理、交易数据同步、行情数据管理、运维任务调度、告警通知等核心功能。系统支持股票和期货交易，对接 XTP、ATP、CTP 等多种交易接口。

## 核心功能

### 资金账户管理 (FundAccount)
- 支持股票账户和期货账户管理
- 账户资金查询和快照保存
- 内部资金划转（沪深市场间）
- 外部资金划转
- 账户配置管理（XTP、ATP 配置）

### 交易数据同步
- **持仓数据同步**: 查询并同步各账户持仓信息
- **订单数据同步**: 查询并同步委托订单信息
- **交易数据同步**: 查询并同步成交记录
- 数据持久化到 PostgreSQL 数据库

### 行情数据管理 (Quote)
- **行情简要**: 包含昨收价、收盘价、涨跌停价等基础行情数据
- **指数权重**: 沪深300、中证500、中证1000等指数成分股权重数据
- **实际收盘价计算**: 当日收盘价为0时，自动使用历史最新收盘价

### 市值计算 (MarketValue)
- 基于持仓和行情数据计算账户市值
- 支持批量计算多个账户市值
- 市值占比统计

### 运维任务调度 (OpsTask)
系统通过定时任务自动执行盘前、盘中、盘后运维操作：

#### 盘前任务
- **磁盘检查**: 检查服务器磁盘空间，自动清理过期日志
- **时间检查**: 验证服务器时间同步状态
- **资金账户同步**: 同步各账户资金快照
- **指数权重同步**: 同步当日指数成分股权重数据

#### 盘中任务
- **资金数据写入**: 写入账户资金数据

#### 盘后任务
- **持仓数据同步**: 同步各账户持仓信息
- **订单数据同步**: 同步委托订单数据
- **交易数据同步**: 同步成交记录
- **行情数据同步**: 同步当日行情简要数据
- **市值计算**: 计算各账户市值
- **盈亏计算**: 计算账户日盈亏
- **磁盘检查**: 盘后磁盘空间检查

### 主机服务器管理 (HostServer)
- 服务器信息管理（IP、端口、SSH配置）
- 远程命令执行（基于 SSH）
- 磁盘空间监控和自动清理
- 服务器时间同步检查

### 远程命令管理 (RemoteCommand)
- 支持多种命令类型：磁盘检查、时间检查、账户查询、持仓查询、订单查询、交易查询等
- 命令执行状态跟踪
- 批量命令执行
- 命令超时控制

### 告警服务 (Warning)
- 磁盘空间不足告警
- 时间同步异常告警
- 进程状态告警（未运行、崩溃、CPU/内存过高）
- 数据同步失败告警
- 告警自动处理和人工处理

### 进程监控 (ProcessMonitor)
- 交易程序、行情程序、通信程序监控
- 进程状态检测（运行中、已停止、错误、未找到）
- 支持多种进程识别方式（进程名、命令模式）

### 飞书通知 (Feishu)
- 运维任务完成通知
- 告警信息推送
- 维护操作通知

### 会话管理 (Session)
- 用户登录会话管理
- Token 验证
- 会话过期管理

## 技术架构

### 后端框架
- **NestJS**: 企业级 Node.js 框架
- **TypeScript**: 类型安全的 JavaScript 超集

### 数据库
- **PostgreSQL**: 主数据库，存储业务数据
- **Prisma**: ORM 框架，提供类型安全的数据库访问
- **MongoDB**: 文档数据库，用于特定场景数据存储

### 缓存
- **Memcached**: 分布式内存缓存系统

### 消息队列
- **MQTT**: 消息传输协议，用于微服务通信

### 其他技术
- **Bull**: 基于 Redis 的任务队列
- **SSH2**: 远程命令执行
- **Swagger**: API 文档自动生成
- **Day.js**: 日期时间处理
- **Decimal.js**: 精确数值计算

## 支持的交易接口

- **XTP**: 中泰证券 XTP 接口
- **ATP**: 恒生 ATP 接口
- **CTP**: 上期技术 CTP 接口（期货）
- **KFClient**: 自定义交易客户端

## 支持的市场

### 股票市场
- **SH**: 上海证券交易所
- **SZ**: 深圳证券交易所

### 期货市场
- **SHFE**: 上海期货交易所
- **CZCE**: 郑州商品交易所
- **DCE**: 大连商品交易所
- **CFFEX**: 中国金融期货交易所
- **GFEX**: 广州期货交易所
- **INE**: 上海国际能源交易中心

## 数据模型

### 核心实体
- **User**: 用户信息
- **Session**: 会话信息
- **Broker**: 券商信息
- **Company**: 公司信息
- **Custodian**: 托管方信息
- **Product**: 产品信息
- **FundAccount**: 资金账户
- **HostServer**: 主机服务器
- **Position**: 持仓信息
- **Order**: 订单信息
- **Trade**: 交易信息
- **QuoteBrief**: 行情简要
- **IndexWeight**: 指数权重
- **MarketValue**: 市值信息
- **DailyPnl**: 日盈亏信息
- **OpsTask**: 运维任务
- **OpsWarning**: 运维告警
- **RemoteCommand**: 远程命令
- **ProcessMonitor**: 进程监控配置

## 安装

```bash
pnpm install
```

## Running the app

```bash
# development
$ pnpm start


# debug mode
$ pnpm start:debug

# production mode
$ pnpm start:prod

# build dist
$ pnpm build
```

## Test

```bash
# unit tests
$ pnpm test

# e2e tests
$ pnpm test:e2e

# test coverage
$ pnpm test:cov
```

## 环境配置

根目录下创建 `.env` 文件，配置以下环境变量：

```shell
# 服务端口
PORT=9527

# MQTT 配置
MQTT_URL=mqtt://localhost:1883

# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# SSH 配置
SSH_PRIVATE_KEY_PATH=/path/to/private/key

# Memcached 配置
MEMCACHED_URL=localhost:11211

# 飞书通知配置（可选）
FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/xxx
```

## 项目结构

```
zouwu-mgr-service/
├── bin/                    # 命令行工具脚本
│   ├── sync-fund-account.ts    # 同步资金账户
│   ├── sync-position.ts        # 同步持仓数据
│   ├── sync-order.ts           # 同步订单数据
│   ├── sync-trade.ts           # 同步交易数据
│   ├── sync-quote.ts           # 同步行情数据
│   ├── calc-market-value.ts    # 计算市值
│   ├── calc-fund-account-pnl.ts # 计算账户盈亏
│   └── ...
├── prisma/                 # 数据库模型和迁移
│   ├── schema.prisma           # 数据库模型定义
│   └── seed.ts                 # 数据库种子数据
├── scripts/                # 工具脚本
│   └── gen-sdk.ts              # 生成 SDK
├── src/                    # 源代码
│   ├── common/                 # 公共模块
│   ├── config/                 # 配置文件
│   ├── fund_account/           # 资金账户模块
│   ├── host_server/            # 主机服务器模块
│   ├── ops-task/               # 运维任务模块
│   ├── quote/                  # 行情数据模块
│   ├── market-value/           # 市值计算模块
│   ├── remote-command/         # 远程命令模块
│   ├── warning/                # 告警服务模块
│   ├── process-monitor/        # 进程监控模块
│   ├── feishu/                 # 飞书通知模块
│   ├── session/                # 会话管理模块
│   ├── val-calc/               # 估值计算模块
│   ├── lib/                    # 工具库
│   ├── mongo/                  # MongoDB 相关
│   └── prisma/                 # Prisma 服务
├── test/                   # 测试文件
├── package.json            # 项目依赖
└── tsconfig.json           # TypeScript 配置
```

## 开发指南

### 数据库操作

```bash
# 同步数据库结构
pnpm syncdb

# 拉取数据库结构
pnpm pulldb

# 运行数据库迁移
pnpm migrate

# 生成 Prisma Client
pnpm generate

# 部署数据库迁移
pnpm deploydb

# 填充种子数据
pnpm seed
```

### 命令行工具

项目提供了多个命令行工具用于数据同步和计算：

```bash
# 同步资金账户
ts-node bin/sync-fund-account.ts

# 同步持仓数据
ts-node bin/sync-position.ts

# 同步订单数据
ts-node bin/sync-order.ts

# 同步交易数据
ts-node bin/sync-trade.ts

# 同步行情数据
ts-node bin/sync-quote.ts

# 计算市值
ts-node bin/calc-market-value.ts

# 计算账户盈亏
ts-node bin/calc-fund-account-pnl.ts
```

## Token for development

Admin token

```text
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTcwMzQwMDIzMCwiZXhwIjoxNzA5NDQ4MjMwfQ.MZDQN-_OTiwPK4iwPQRMBMWzKLcOZrjgczOGQHoDbpaFXU4oo4CDZP0Uij5_GwQ4dJg5Ww2JSlXe1MaecYOkvsY0t_M_vPUIZP2g2ppT5U8fOEzL_lnU_HPYQ0T7_GzBM7VciN0bPEgK-gXb8Xn5It1OpMVZ5irfxkr_LYsMB_g
```

生成秘钥对的方法:

```
## 私钥
ssh-keygen -t rsa -b 2048 -m PEM -f private.key

## 公钥
ssh-keygen -f private.key -e -m PKCS8 > public.key
```

## 如何发布一个临时的 sdk 包

生成 openapi.json

```sh
## 启动一下工程就会自动生成 openapi.json 文件
NODE_ENV=development p start
```

生成 sdk

```sh
p gen:sdk
```

发布 sdk

```sh
## 进入 sdk 文件夹
cd sdk

## 安装依赖
pnpm install

## 编译
pnpm build

## 发布 一个 prerelease
npm version prerelease
npm publish
```

## API 文档

启动服务后，可以通过以下地址访问 Swagger API 文档：

```
http://localhost:9527/api/openapi
```

## 关于时间戳

本系统在没有特殊说明的情况下，所有时间戳均为 **毫秒时间戳**。

## 如何发布 SDK 包

### 生成 OpenAPI 规范

```bash
# 启动开发环境，会自动生成 openapi.json 文件
NODE_ENV=development pnpm start
```

### 生成 SDK

```bash
# 生成 SDK 到 ./sdk 目录
pnpm gen:sdk
```

### 发布 SDK

```bash
# 进入 SDK 目录
cd sdk

# 安装依赖
pnpm install

# 编译
pnpm build

# 发布 prerelease 版本
npm version prerelease
npm publish
```

## 运维任务时间表

系统通过定时任务自动执行运维操作，主要时间节点如下：

| 时间 | 任务 | 说明 |
|------|------|------|
| 08:35 | 同步指数权重 | 同步当日指数成分股权重数据 |
| 08:40 | 盘前资金账户同步 | 同步各账户资金快照 |
| 09:00 | 盘前磁盘检查 | 检查服务器磁盘空间 |
| 09:00 | 盘前时间检查 | 验证服务器时间同步状态 |
| 交易时段 | 资金数据写入 | 写入账户资金数据 |
| 15:15 | 盘后持仓数据同步 | 同步各账户持仓信息 |
| 15:20 | 盘后订单数据同步 | 同步委托订单数据 |
| 15:20 | 盘后行情数据同步 | 同步当日行情简要数据 |
| 15:25 | 盘后交易数据同步 | 同步成交记录 |
| 15:30 | 盘后资金账户同步 | 同步各账户资金快照 |
| 15:40 | 盘后市值计算 | 计算各账户市值 |
| 16:00 | 盘后盈亏计算 | 计算账户日盈亏 |
| 21:00 | 盘后磁盘检查 | 检查服务器磁盘空间 |

## 参考资料

- [使用 pnpm 的 patch 命令打补丁](https://www.cnblogs.com/wang--chao/p/16612248.html)
- [生成 JWT private 和 public key 的方法](https://docs.mia-platform.eu/docs/runtime_suite/client-credentials/jwt_keys)
- [NestJS 官方文档](https://docs.nestjs.com/)
- [Prisma 官方文档](https://www.prisma.io/docs/)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)

## 许可证

UNLICENSED
