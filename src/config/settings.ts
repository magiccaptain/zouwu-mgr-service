import { env } from './env';

export const settings = env({
  port: 9527,
  prefix: '',
  mqtt: {
    url: 'mqtt://localhost:1883',
    username: 'admin',
    password: 'admin',
    group: 'zouwu',
  },
  mongo: {
    url: 'mongodb://localhost:27017/zouwu-core-dev',
  },
  memcached: {
    url: '10.242.0.18:11211',
  },
  redis: {
    host: 'localhost',
    port: 6379,
    password: 'zhisui',
  },
  ssh: {
    local_private_key_path: '/root/.ssh/id_rsa',
    command_timeout: 10000, // 远程命令执行超时时间（毫秒），默认 10 秒
  },
  clickhouse: {
    url: 'http://172.16.2.65',
    port: 8123,
    basicAuth: {
      username: 'zouwu',
      password: 'zouwu@stocker2024!',
    },
  },
  trade_data_dir: '/data/trade_data',
  trader: {
    start_time: '09:18',
    end_time: '15:00',
  },
  process_monitor: {
    start_time: '09:00',
    end_time: '17:00',
  },
  quote_brief_source: {
    host_server_port: 12706,
    remote_dir: '/home/admin/quote_data',
    local_dir: '/data/quote_data',
  },
  quote_index_weight_source: {
    host_server_port: 12722,
    remote_dir: '/root/common_v6/run',
    local_dir: '/data/index_weight_data',
  },
  warning: {
    disk_usage: 0.9,
    // 托管机和本机时间相差 秒数
    time_diff: 3,
  },
  val_calc: {
    endpoint: 'http://10.242.0.16:8000/api/v1/pnl/calculate',
  },
  cron: {
    // 每日早8点执行盘前磁盘检查
    before_check_host_server_disk: '0 8 * * *',
    // 每日下午15:30执行盘后磁盘检查
    after_check_host_server_disk: '30 15 * * *',
    // 周一到周五下午15:40执行计算市值
    after_calc_market_value: '40 15 * * 1-5',
    // 周一到周五早上8:40执行盘前资金账户同步
    before_sync_fund_account: '40 8 * * 1-5',
    // 周一到周五下午15:5执行盘后资金账户同步
    after_sync_fund_account: '5 15 * * 1-5',
    // 周一到周五下午15:20执行同步行情数据
    after_sync_last_price: '20 15 * * 1-5',
    // 周一到周五下午15:15执行查询持仓数据
    after_sync_positions: '15 15 * * 1-5',
    // 周一到周五下午15:20执行查询订单数据
    after_sync_order: '20 15 * * 1-5',
    // 周一到周五下午15:30执行查询交易数据
    after_sync_trade: '30 15 * * 1-5',
    // 周一到周五下午16:00执行计算盈亏
    after_calc_pnl: '0 16 * * 1-5',
    // 周一到周五早上8:35执行盘前权重指数同步
    before_sync_index_weight: '35 8 * * 1-5',
    // 周一到周五晚上23:30执行盘后进程清理
    after_clear_processes: '30 23 * * 1-5',
  },
});
