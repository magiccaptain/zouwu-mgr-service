# ops-core CONTEXT

`ops-core` 是系统的执行与集成上下文。它负责对接托管机、资金账户与后台任务系统，并且是数据库模型设计的源头上下文。

## 核心职责

- 提供 NestJS 后端服务与业务模块
- 对接托管机 `HostServer` 并通过 SSH 执行远程命令
- 通过托管机上的工具与资金账户、交易环境交互
- 提供进程监控、告警、批处理、定时任务能力
- 暴露 HTTP API 给 `ops-admin` 调用
- 维护数据库 schema、迁移和核心执行模型

## 关键术语

- HostServer：托管机抽象，保存 SSH 与宿主机相关配置
- RemoteCommand：远程命令记录与执行载体
- FundAccount：资金账户实体，是多条执行链路的中心业务对象
- ProcessMonitor：进程监控配置与状态采集能力
- OpsTask：后台任务、批处理、执行编排的任务实体
- Prisma schema 源头：数据库模型设计首先发生在 `ops-core/prisma/schema.prisma`
- 申赎记录：资金账户的一次申购或赎回业务事实。记录创建时状态为 OPEN；用户确认出入金完成后手动将状态置为 CLOSE，流程彻底结束。无中间状态。一笔申赎可关联多笔 CustodianTransfer。申购的 `position_change_day` 在用户确认完成时，以该笔 CustodianTransfer 的 transfer_date + 1 交易日计算并回填。赎回的 `position_change_day` 在创建申赎记录时即以 reduce_day + 1 交易日自动计算并填好。
- CustodianTransfer：托管出入金记录。由托管平台执行出入金操作后，运维人员在运维平台手动登记的人工确认记录。与 `TransferRecord`（系统自动执行的转账记录）是不同实体。

## 关键能力边界

### 托管机与远程执行

- 建立 SSH 连接
- 生成和执行远程命令
- 拉取或下发托管机文件
- 读取交易、持仓、订单、账户相关结果

### 后台执行与调度

- 通过 NestJS 模块组织执行链路
- 通过 `@nestjs/schedule` 承载定时任务
- 运行进程监控、告警、批量同步与后台任务

### 数据模型演进

- 新模型、新字段、新关系优先在这里设计
- 迁移、部署、生成 Prisma Client 以这里为起点
- 变更稳定后，再同步 schema 到 `ops-admin`

## 不应在本上下文中做的事

- 不把 `ops-core` 退化成仅供 `ops-admin` 透传调用的薄接口层
- 不把纯页面展示和页面局部交互逻辑放进 `ops-core`
- 不把 schema 变更职责下放到 `ops-admin`

## 与其他上下文的关系

- `ops-core` 为 `ops-admin` 提供执行能力与后端 API
- `ops-admin` 负责人机交互和页面编排
- 两边共享同一数据库，但 schema 权威来源始终是 `ops-core`

## 相关系统文档

- 主仓 `docs/architecture.md`
- 主仓 `docs/ops-task-workflow.md`
- 主仓 `docs/process-monitor-design.md`
- 主仓 `docs/postgresql.md`