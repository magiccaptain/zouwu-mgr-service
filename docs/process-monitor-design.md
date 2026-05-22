# 进程监控功能设计与实现方案

## 一、功能概述

实现对 hostserver 中各类进程的监控，包括：
- 交易程序（一个交易程序关联一个 FundAccount）
- 行情程序
- 通信程序
- 其他自定义进程

通过 SSH 定时获取进程状态，并将状态信息存储到数据库中。

## 二、数据库设计

### 2.1 进程监控配置表 (ProcessMonitor)

用于配置需要监控的进程信息。

```prisma
model ProcessMonitor {
  id            Int       @id @default(autoincrement())
  name          String    // 进程名称/标识
  process_type  ProcessType  // 进程类型
  hostServerId  Int       // 关联的 HostServer
  fundAccountId String?   // 如果是交易程序，关联 FundAccount
  // 进程识别方式（支持多种方式）
  process_name  String?   // 进程名称（用于 ps 命令匹配）
  command_pattern String? // 命令模式（用于更精确匹配）
  pid_file      String?   // PID 文件路径
  // 监控配置
  active        Boolean   @default(true)  // 是否启用监控
  check_interval Int      @default(60)    // 检查间隔（秒）
  monitor_start_time DateTime?  // 监控开始时间（可选，用于限制监控时间范围）
  monitor_end_time   DateTime?  // 监控结束时间（可选，用于限制监控时间范围）
  // 元数据
  remark        String?   // 备注
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @default(now()) @updatedAt
  
  hostServer    HostServer   @relation(fields: [hostServerId], references: [id])
  fundAccount   FundAccount? @relation(fields: [fundAccountId], references: [account])
  ProcessStatus ProcessStatus[]
  
  @@unique([hostServerId, fundAccountId, process_type])
  @@index([hostServerId, active])
}

enum ProcessType {
  TRADER      // 交易程序
  QUOTE       // 行情程序
  COMMUNICATION // 通信程序
  CUSTOM      // 自定义进程
}
```

### 2.2 进程状态表 (ProcessStatus)

存储进程的实时状态和历史记录。

```prisma
model ProcessStatus {
  id                Int       @id @default(autoincrement())
  processMonitorId  Int       // 关联的进程监控配置
  // 进程状态信息
  status            ProcessStatusType  // 进程状态
  pid               Int?      // 进程 ID
  cpu_percent       Float?    // CPU 使用率
  memory_percent    Float?    // 内存使用率
  memory_used_mb    Float?    // 内存使用量（MB）
  uptime_seconds    Int?      // 运行时长（秒）
  start_time        DateTime?  // 进程启动时间
  // 检查信息
  trade_day         String            // 交易日
  checked_at        DateTime  @default(now())  // 检查时间
  check_duration_ms Int?     // 检查耗时（毫秒）
  error_message     String?   // 错误信息（如果检查失败）
  // 元数据
  createdAt         DateTime  @default(now())
  
  processMonitor    ProcessMonitor @relation(fields: [processMonitorId], references: [id])
  
  @@index([processMonitorId, checked_at(sort: Desc)])
  @@index([checked_at(sort: Desc)])
  @@index([trade_day, checked_at(sort: Desc)])
}

enum ProcessStatusType {
  RUNNING     // 运行中
  STOPPED     // 已停止
  ERROR       // 检查错误
  NOT_FOUND   // 未找到进程
}
```

### 2.3 扩展 OpsWarning 支持进程警告

在现有的 `OpsWarningType` 枚举中添加进程相关警告类型：

```prisma
enum OpsWarningType {
  // ... 现有类型
  PROCESS_NOT_RUNNING  // 进程未运行
  PROCESS_CRASHED      // 进程崩溃
  PROCESS_HIGH_CPU     // 进程 CPU 使用率过高
  PROCESS_HIGH_MEMORY  // 进程内存使用率过高
  PROCESS_CHECK_FAILED // 进程检查失败
}
```

## 三、实现方案

### 3.1 模块结构

```
src/process-monitor/
├── process-monitor.module.ts
├── process-monitor.service.ts
├── process-monitor.controller.ts
├── dto/
│   ├── create-process-monitor.dto.ts
│   └── update-process-monitor.dto.ts
└── types.ts
```

### 3.2 核心服务实现

#### 3.2.1 ProcessMonitorService

主要功能：
1. **进程状态检查**：通过 SSH 执行命令获取进程状态
2. **状态存储**：将检查结果写入 ProcessStatus 表
3. **异常检测**：检测进程异常并生成警告
4. **定时任务**：定期执行进程检查

关键方法：
- `checkProcessStatus(processMonitor: ProcessMonitor)`: 检查单个进程状态
- `checkAllProcesses()`: 检查所有启用的进程
- `findProcessByPattern(ssh: NodeSSH, pattern: string)`: 通过模式查找进程
- `parseProcessInfo(stdout: string)`: 解析进程信息

#### 3.2.2 进程检查命令

使用 `ps` 命令获取进程信息：

```bash
# 基本检查命令
ps aux | grep -E "process_pattern" | grep -v grep

# 获取详细信息的命令（包含 PID, CPU, MEM, 启动时间等）
ps -p <pid> -o pid,pcpu,pmem,etime,start,cmd --no-headers

# 或者使用更详细的命令
ps aux | grep -E "pattern" | awk '{print $2,$3,$4,$9,$10,$11}'
```

#### 3.2.3 定时任务

使用 `@nestjs/schedule` 的 `@Cron` 装饰器：

```typescript
// 每 60 秒检查一次（可配置）
@Cron('*/60 * * * * *')
async checkAllProcessesTask() {
  // 检查所有启用的进程监控
}
```

### 3.3 数据库迁移

1. 更新 `prisma/schema.prisma` 添加新模型
2. 运行 `pnpm migrate` 生成迁移文件
3. 运行 `pnpm deploydb` 部署到数据库

### 3.4 集成到现有系统

1. **扩展 HostServer 关系**：在 HostServer 模型中添加 ProcessMonitor 关系
2. **扩展 FundAccount 关系**：在 FundAccount 模型中添加 ProcessMonitor 关系
3. **集成到 OpsTask**：可以创建进程检查相关的 OpsTask 类型

## 四、实现步骤

### 步骤 1: 更新数据库 Schema
- 添加 ProcessMonitor 和 ProcessStatus 模型
- 扩展 OpsWarningType 枚举
- 添加必要的关系和索引

### 步骤 2: 创建 ProcessMonitor 模块
- 创建 module, service, controller
- 实现 CRUD 操作
- 实现进程检查逻辑

### 步骤 3: 实现定时任务
- 在 ProcessMonitorService 中添加定时检查方法
- 配置检查间隔

### 步骤 4: 实现警告机制
- 检测进程异常状态
- 创建 OpsWarning 记录

### 步骤 5: 添加 API 接口
- 查询进程监控配置
- 查询进程状态历史
- 手动触发检查

## 五、使用示例

### 5.1 创建进程监控配置

```typescript
// 监控交易程序
await prisma.processMonitor.create({
  data: {
    name: 'XTP交易程序-账户001',
    process_type: ProcessType.TRADER,
    hostServerId: 1,
    fundAccountId: 'account001',
    process_name: 'trader_tools',
    command_pattern: 'trader_tools.*account001',
    active: true,
    check_interval: 60,
  },
});

// 监控行情程序
await prisma.processMonitor.create({
  data: {
    name: '行情程序',
    process_type: ProcessType.QUOTE,
    hostServerId: 1,
    process_name: 'quote_server',
    active: true,
    check_interval: 60,
  },
});
```

### 5.2 查询进程状态

```typescript
// 查询最新的进程状态
const status = await prisma.processStatus.findFirst({
  where: { processMonitorId: 1 },
  orderBy: { checked_at: 'desc' },
  include: { processMonitor: true },
});
```

## 六、注意事项

1. **SSH 连接管理**：复用现有的 HostServerService 的 SSH 连接管理
2. **性能考虑**：批量检查时使用连接池，避免频繁建立 SSH 连接
3. **错误处理**：SSH 连接失败、命令执行失败等情况需要妥善处理
4. **数据清理**：定期清理过期的 ProcessStatus 历史记录（可保留最近 N 天）
5. **进程识别**：确保进程匹配模式准确，避免误匹配

## 七、扩展功能（可选）

1. **进程自动重启**：检测到进程停止时自动重启
2. **性能指标告警**：CPU/内存使用率超过阈值时告警
3. **进程日志收集**：收集进程日志用于问题排查
4. **进程依赖关系**：定义进程之间的依赖关系
5. **进程健康检查**：除了检查进程是否存在，还可以检查进程是否正常响应


