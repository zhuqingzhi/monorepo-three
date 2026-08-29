#!/usr/bin/env bash
# =============================================================================
# 后端部署脚本（在腾讯云服务器上执行，由 CI 通过 SSH 触发，也可手动运行）
#
# 流程: 拉取 GitHub 最新代码 -> 安装依赖 -> 构建 NestJS -> 回写生产配置
#       -> pm2 重启 -> 健康检查 -> (可选)QQ 邮箱通知
#
# 部署目录结构（/home/nginx/html/server，可通过 DEPLOY_DIR 覆盖）:
#   /home/nginx/html/server/
#   ├── repo/                    # git clone 的仓库（只取 main 分支）
#   ├── config.production.yml    # 生产配置（真实密码，只存服务器，不进 git）
#   ├── .mail.env                # 邮件通知凭据（可选，格式见 README）
#   ├── logs/                    # pm2 日志 + 部署日志
#   └── deploy-server.sh         # 本脚本（CI 每次部署前会推送最新版）
#
# 私有仓库注意: 若仓库为 private，请在服务器上配置 GitHub Deploy Key，
# 并在 /home/nginx/html/server/.deploy.env 中覆盖:
#   REPO_URL="git@github.com:zhuqingzhi/monorepo-three.git"
# =============================================================================
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/home/nginx/html/server}"
REPO_URL="${REPO_URL:-https://github.com/zhuqingzhi/monorepo-three.git}"
BRANCH="${BRANCH:-main}"
SERVER_PKG="@demo/server"
APP_PORT="${APP_PORT:-1024}"
HEALTH_PATH="/health"

log() { echo "[deploy-server][$(date '+%F %T')] $*"; }

# 可选的服务器本地覆盖文件（REPO_URL / BRANCH 等），不进 git
# shellcheck disable=SC1091
[ -f "$DEPLOY_DIR/.deploy.env" ] && . "$DEPLOY_DIR/.deploy.env"
DEPLOY_DIR="${DEPLOY_DIR:-/home/nginx/html/server}"

# ---------- 0. 工具自检（缺什么装什么） ----------
command -v git >/dev/null 2>&1 || { log "错误: 服务器缺少 git"; exit 1; }
command -v pnpm >/dev/null 2>&1 || npm install -g pnpm@11
command -v pm2  >/dev/null 2>&1 || npm install -g pm2

mkdir -p "$DEPLOY_DIR/logs"

# ---------- 1. 拉取最新代码 ----------
if [ ! -d "$DEPLOY_DIR/repo/.git" ]; then
  log "首次部署: git clone $REPO_URL (分支 $BRANCH)"
  git clone --depth 1 -b "$BRANCH" "$REPO_URL" "$DEPLOY_DIR/repo"
else
  log "拉取最新代码: origin/$BRANCH"
  git -C "$DEPLOY_DIR/repo" fetch origin "$BRANCH"
  git -C "$DEPLOY_DIR/repo" reset --hard "origin/$BRANCH"
  git -C "$DEPLOY_DIR/repo" clean -fd apps/server
fi
COMMIT=$(git -C "$DEPLOY_DIR/repo" rev-parse --short HEAD)
log "当前版本: $COMMIT"

# ---------- 2. 安装依赖并构建（仅后端子包） ----------
cd "$DEPLOY_DIR/repo"
pnpm install --filter "$SERVER_PKG" --frozen-lockfile
pnpm --filter "$SERVER_PKG" run build

# ---------- 3. 生产配置保护（真实密码只存服务器） ----------
DIST_CONFIG="$DEPLOY_DIR/repo/apps/server/dist/config/config.yml"
if [ ! -f "$DEPLOY_DIR/config.production.yml" ]; then
  cp "$DIST_CONFIG" "$DEPLOY_DIR/config.production.yml"
  log "首次部署: 已生成 $DEPLOY_DIR/config.production.yml，请填入真实密码后重新部署"
fi
cp "$DEPLOY_DIR/config.production.yml" "$DIST_CONFIG"

# ---------- 4. pm2 重启（日志集中到 $DEPLOY_DIR/logs） ----------
export DEPLOY_DIR
pm2 startOrRestart "$DEPLOY_DIR/repo/apps/server/ecosystem.config.js" --update-env
pm2 save

# ---------- 5. 健康检查（最多等 60s） ----------
log "健康检查: http://127.0.0.1:$APP_PORT$HEALTH_PATH"
HEALTH="FAILED"
for _ in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:$APP_PORT$HEALTH_PATH" >/dev/null 2>&1; then
    HEALTH="SUCCESS"
    break
  fi
  sleep 2
done
log "部署结果: $HEALTH (commit $COMMIT)"

# ---------- 6. QQ 邮箱通知（配置了 .mail.env 才发送） ----------
# .mail.env 格式（不进 git，只存服务器）:
#   MAIL_FROM="xxxxx@qq.com"   # 发件 QQ 邮箱
#   MAIL_AUTH="SMTP 授权码"     # 邮箱设置 -> 账户 -> 开启 SMTP 服务获取
#   MAIL_TO="xxxxx@qq.com"     # 收件邮箱
MAIL_ENV="$DEPLOY_DIR/.mail.env"
if [ -f "$MAIL_ENV" ]; then
  # shellcheck disable=SC1091
  . "$MAIL_ENV"
  SUBJECT=$(printf 'monorepo-three 后端部署 %s' "$HEALTH" | base64 -w0)
  {
    printf 'From: %s\r\nTo: %s\r\n' "$MAIL_FROM" "$MAIL_TO"
    printf 'Subject: =?UTF-8?B?%s?=\r\n' "$SUBJECT"
    printf 'MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n'
    printf '部署结果: %s\n当前版本: %s\n时间: %s\n日志目录: %s/logs\n' \
      "$HEALTH" "$COMMIT" "$(date '+%F %T')" "$DEPLOY_DIR"
  } > "$DEPLOY_DIR/logs/notify.eml"
  curl -s --url "smtps://smtp.qq.com:465" \
    --mail-from "$MAIL_FROM" --mail-rcpt "$MAIL_TO" \
    --user "$MAIL_FROM:$MAIL_AUTH" \
    --upload-file "$DEPLOY_DIR/logs/notify.eml" \
    && log "邮件通知已发送" \
    || log "警告: 邮件发送失败（检查 .mail.env 授权码）"
else
  log "未配置 $MAIL_ENV，跳过邮件通知"
fi

[ "$HEALTH" = "SUCCESS" ] || { log "部署失败，退出码 1"; exit 1; }
log "部署完成"
