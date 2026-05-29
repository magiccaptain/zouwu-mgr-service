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
- TradingCalendar：交易日历。按市场维度记录每日是否开市，以 SSE（上交所）为 A 股唯一数据源，SH/SZ 共用同一份日历。存储全量日期（含 `is_open` 标记），覆盖周末与法定节假日。数据通过内嵌 Python 服务从 AKShare 获取，运维人员在管理页面触发同步。
- TradingCalendarService：交易日历的独立查询服务。提供"是否交易日""下一交易日"等基础能力，供 OpsTask 调度、申赎计算、前端日期选择器等各模块消费，不隶属于任何业务模块。
- 交易日历同步策略：初始化拉取过去 5 年 + 当年数据。之后每年 12 月 20 日由 OpsTask 定时任务自动拉取下一年日历（cron 每日触发，代码内判断日期）。同步结果（成功/失败）均通过飞书通知运维人员。
- 交易日历管理页面：ops-admin 提供按年份查看日历、手动同步、以及对个别日期调整 `is_open` 状态的能力。不开放完整 CRUD。
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