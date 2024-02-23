import { env } from './env';

export const settings = env({
  port: 9527,
  prefix: '',
  mqtt: {
    url: 'mqtt://localhost:1883',
    username: 'admin',
    password: 'admin',
    group: 'haivivi',
  },
  mongo: {
    url: 'mongodb://localhost:27017/haivivi-core-dev',
  },
  memcached: {
    url: 'localhost:11211',
  },
  redis: {
    host: 'localhost',
    port: 6379,
    password: 'zhisui',
  },
  init: {
    namespace: {
      name: 'zouwufund',
      ns: 'zouwufund.com',
    },
    user: {
      username: 'admin',
      password: 'zouwu1234',
      name: '管理员',
      ns: 'zouwufund.com',
      super: true,
    },
  },
});
