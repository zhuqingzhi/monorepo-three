/**
 * PM2 进程配置。
 * 两种运行位置均可工作:
 *
 * 1. 服务器部署（由 scripts/deploy-server.sh 调用，仓库 clone 在
 *    /home/nginx/html/server/repo，pm2 日志集中到 /home/nginx/html/server/logs）:
 *      DEPLOY_DIR=/home/nginx/html/server pm2 startOrRestart ecosystem.config.js
 *    （部署脚本会 export DEPLOY_DIR，无需手动传）
 *
 * 2. 本地/其他目录: pm2 startOrRestart ecosystem.config.js（日志写在 apps/server/logs）
 */
const path = require('node:path');

const deployDir = process.env.DEPLOY_DIR;
const logDir = deployDir ? path.join(deployDir, 'logs') : './logs';

module.exports = {
  apps: [
    {
      name: 'monorepo-three-server',
      // 服务器上构建产物位于 repo/apps/server/dist/main.js
      script: 'dist/main.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
      out_file: path.join(logDir, 'pm2-out.log'),
      error_file: path.join(logDir, 'pm2-error.log'),
      time: true,
    },
  ],
};
