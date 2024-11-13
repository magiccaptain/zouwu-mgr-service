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
    url: 'localhost:11211',
  },
  redis: {
    host: 'localhost',
    port: 6379,
    password: 'zhisui',
  },
  ssh: {
    local_private_key_path: '/root/.ssh/id_rsa',
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
  warning: {
    disk_usage: 0.9,
    // 托管机和本机时间相差 秒数
    time_diff: 3,
  },
});
