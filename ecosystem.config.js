module.exports = {
  apps: [
    {
      name: 'zhisui_mgr_core',
      script: 'NODE_ENV=production node dist/main.js',
      watch: 'dist',
      cwd: './',
    },
  ],
};
