module.exports = {
  apps: [
    {
      name: 'mgr-service',
      script: 'bun dist/main.js',
      watch: 'dist',
      cwd: './',
      env: {
        NODE_ENV: 'production',
        PORT: 9000,
        DATABASE_URL: "postgresql://postgres:zhisui123@zeus-ops-acs:5432/zeus?schema=public",
        DATABASE_CUSTOM_REPORT_URL: 'postgresql://postgres:zhisui123@zeus-ops-acs:5432/zeus?schema=customer_reporting',
        FEISHU_MAINTENANCE_WEBHOOK: 'https://open.feishu.cn/open-apis/bot/v2/hook/53315122-106b-4b2a-b8fb-38c7c8c4ca08'
      },
    },
  ],
};
