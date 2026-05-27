# Changelog

All notable changes to this project are documented in this file.

## [0.1.3] - 2026-05-27

### 新增

- `CustodianTransfer` 模型及 CRUD API（`/custodian-transfer`），支持可选关联申赎记录
- 候选申赎列表接口（`GET /custodian-transfer/candidates`），按资金账户 + 方向过滤 OPEN 状态的申赎记录
- 方向约束校验：入金（IN）只能关联申购，出金（OUT）只能关联赎回
- 资金刷新接口（`POST :fund_account/@refresh-funds`），同时刷新沪深两市，返回合计余额、上次余额、差值及更新时间
- 申赎记录管理 API：创建（`POST /subscription-redemption`）、确认完成（`POST /subscription-redemption/@confirm`）、更新（`PATCH /subscription-redemption/:id`）
- `SubscriptionRedemptionStatus` 枚举（OPEN/CLOSE）

### 变更

- 赎回记录创建时自动计算 `position_change_day`（reduce_day + 1 交易日）
- 申购确认完成时自动回填 `position_change_day`（transfer_date + 1 交易日）
- OPEN 状态仅允许修改 remark，CLOSE 状态全部锁定

### 移除

- `TransferRecord.subscription_redemption_id` 字段及与申赎记录的关联
- `SubscriptionRedemptionRecord.cash_flow_date` 字段

### 迁移

- 历史申赎记录 `status` 默认回填为 CLOSE
