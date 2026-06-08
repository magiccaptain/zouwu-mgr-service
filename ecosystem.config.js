require('dotenv').config({ path: './.env.product' });

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
        DATABASE_URL: process.env.DATABASE_URL,
        DATABASE_CUSTOM_REPORT_URL: process.env.DATABASE_CUSTOM_REPORT_URL,
        FEISHU_MAINTENANCE_WEBHOOK: process.env.FEISHU_MAINTENANCE_WEBHOOK,
      },
    },
    {
      name: 'trade-cal-service',
      script: './.venv/bin/uvicorn',
      args: 'main:app --host 0.0.0.0 --port 8001',
      interpreter: 'none',
      cwd: './python',
      env: {
        PYTHON_SERVICE_PORT: 8001,
      },
    },
  ],
};
