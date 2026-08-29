/**
 * PM2 进程配置（服务器部署用）。
 * 部署目录: /home/nginx/html/monorepo-three/server
 * 由 GitHub Actions 上传 ecosystem.config.js + dist/* + package.json 后执行:
 *   pm2 startOrRestart ecosystem.config.js
 */
module.exports = {
  apps: [
    {
      name: 'monorepo-three-server',
      script: 'main.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      time: true,
    },
  ],
};
