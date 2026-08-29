# threejs-monorepo

基于 **pnpm workspace** 的 monorepo 全栈项目：

| 模块 | 路径          | 技术栈                                                                   | 端口 |
| ---- | ------------- | ------------------------------------------------------------------------ | ---- |
| 前端 | `apps/web`    | Vue 3 + TypeScript + Vite + Pinia + Vue Router + Element Plus + Three.js | 8080 |
| 后端 | `apps/server` | NestJS + MySQL + Redis + MinIO（YAML 配置驱动）                          | 1024 |

## 目录结构

```
threejs-monorepo/
├── apps/
│   ├── web/                    # 前端 Vue3 + Three.js
│   │   ├── vite.config.ts      # @ 短路径别名 + 8080 端口 + /api 代理
│   │   ├── tsconfig.json       # paths: @/* -> src/*（含类型导入）
│   │   └── src/
│   │       ├── views/DemoView.vue   # /demo 路由：Three.js 旋转方块
│   │       ├── router/ pinia stores/ types/
│   └── server/                 # 后端 NestJS
│       ├── nest-cli.json       # 构建时拷贝 config/*.yml 到 dist
│       └── src/
│           ├── config/config.yml    # 配置文件（密码位置已标注 TODO）
│           ├── config/configuration.ts  # js-yaml 读入
│           ├── database/            # MySQL (mysql2 连接池)
│           ├── redis/               # Redis (ioredis)
│           └── storage/             # MinIO (minio sdk)
├── .husky/                     # pre-commit / commit-msg 钩子
├── eslint.config.mjs           # ESLint 9 Flat Config（TS + Vue）
├── .prettierrc / .prettierignore
├── commitlint.config.mjs       # Conventional Commits 校验
└── pnpm-workspace.yaml
```

## 快速开始

```bash
pnpm install          # 安装依赖（自动执行 husky 挂载 git 钩子）

pnpm dev:web          # 单独启动前端（http://localhost:8080）
pnpm dev:server       # 单独启动后端（http://localhost:1024）
pnpm dev              # 前后端同时启动（concurrently）

pnpm build            # 构建所有子包
pnpm lint / lint:fix  # ESLint 检查 / 修复
pnpm format           # Prettier 格式化
```

> 在**项目根目录**即可启动任一子项目，无需进入 `apps/web`、`apps/server` 目录。

## 前端说明

- 短路径别名：`vite.config.ts` 中 `@ -> ./src`，`tsconfig.json` 中 `paths: { "@/*": ["src/*"] }`，
  运行时与类型导入均生效（示例：`import type { AnimationHandle } from '@/types/demo'`）。
- 访问 `http://localhost:8080/demo` 查看 Three.js 旋转方块演示，右侧面板可实时调节
  旋转速度与方块颜色（Element Plus 控件）。
- `vite.config.ts` 已配置 `/api` 代理到后端 `http://127.0.0.1:1024`。

## 后端说明

- 所有配置集中在 `apps/server/src/config/config.yml`，通过 `js-yaml` 解析、
  `@nestjs/config` 的 `ConfigModule` 注入，各服务统一从 `ConfigService` 读取。
- **密码位置已在 yml 中用 `TODO` 标注**，填入真实凭据即可：

```yaml
mysql:
  password: '' # TODO: <== 在此填写 MySQL 密码
redis:
  password: '' # TODO: <== 在此填写 Redis 密码（无密码可留空）
minio:
  accessKey: minioadmin # TODO: <== 在此填写 MinIO AccessKey
  secretKey: '' # TODO: <== 在此填写 MinIO SecretKey
```

- 三个基础设施客户端均为**懒连接**：MySQL/Redis/MinIO 未启动时应用仍可正常启动，
  `GET /health` 会逐项返回 `up / down` 状态。

## 工程化链路（husky + commitlint + eslint + prettier + lint-staged）

```
git commit
  ├─ pre-commit  → lint-staged：只校验暂存区(staged)文件
  │                 *.ts/.vue  → eslint --fix + prettier --write
  │                 *.json/.md/.yml 等 → prettier --write
  └─ commit-msg  → commitlint：校验提交信息符合 Conventional Commits
```

- 提交信息格式：`feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert[(scope)]: <subject>`，
  例如 `feat(web): 新增 Three.js 演示页`。推荐用 `pnpm cz` 交互式生成（见下节）。
- 任何不合规的提交信息都会被拒绝；暂存区中存在 ESLint 无法修复的错误时提交同样会被拦截，
  而未暂存（只在工作区）的文件不会校验。

## 提交规范工具（cz-git + DeepSeek AI）

使用 `cz-git` 交互式生成符合 Conventional Commits 的提交信息，配置在 `cz.config.mjs`
（`commitlint.config.mjs` 会合并它，保证提示与校验规则一致）：

```bash
pnpm cz        # 交互式选择类型/范围 -> 自动拼装合规提交信息
pnpm cz:ai     # AI 模式：调用 DeepSeek 根据 git diff 生成提交信息
```

DeepSeek 配置位置在 `cz.config.mjs` 的 `openAI` 段：

```js
const openAI = {
  token: process.env.DEEPSEEK_API_KEY ?? ..., // TODO: <== 在此填入 DeepSeek API Key
  endpoint: 'https://api.deepseek.com',        // OpenAI 兼容协议
  model: 'deepseek-chat',
};
```

> 也可以不改文件，直接设置环境变量 `DEEPSEEK_API_KEY=sk-xxx` 后运行 `pnpm cz:ai`。

## CI/CD（GitHub Actions -> 腾讯云）

流水线定义在 `.github/workflows/deploy.yml`，仓库地址
<https://github.com/zhuqingzhi/monorepo-three>（remote origin 已配置）。
推送到 `main` 或手动触发，三个 Job：

1. **build**：pnpm 安装依赖 -> lint -> 构建前后端 -> 上传 artifacts
2. **deploy**：scp 上传到腾讯云并重启服务
   - 前端 `apps/web/dist` -> `/home/nginx/html/monorepo-three/web`（nginx 静态目录）
   - 后端 `dist + package.json + ecosystem.config.js` -> `/home/nginx/html/monorepo-three/server`
     服务器上执行 `npm install --omit=dev` 并 `pm2 startOrRestart`（进程名 `monorepo-three-server`）
   - **生产配置保护**：首次部署会在服务器生成 `config.production.yml`（真实密码只填在这一份，
     不进 git），之后每次部署自动回写、不会被覆盖。
3. **notify**：构建/部署结束后通过 QQ 邮箱 SMTP 发送结果邮件（成功失败都发）。

### 需要在 GitHub 仓库 Settings -> Secrets and variables -> Actions 中配置

| Secret            | 说明                                                                | 示例                    |
| ----------------- | ------------------------------------------------------------------- | ----------------------- |
| `SERVER_HOST`     | 腾讯云服务器 IP                                                     | `1.2.3.4`               |
| `SERVER_PORT`     | SSH 端口（可省略，默认 22）                                         | `22`                    |
| `SERVER_USER`     | SSH 用户                                                            | `root` 或 `nginx`       |
| `SSH_PRIVATE_KEY` | SSH 私钥（对应服务器 `authorized_keys`）                            | `-----BEGIN OPENSSH...` |
| `QQ_MAIL_ACCOUNT` | 发件 QQ 邮箱                                                        | `xxxxx@qq.com`          |
| `QQ_MAIL_AUTH`    | QQ 邮箱 SMTP 授权码（**TODO 待填**：邮箱设置 -> 账户 -> 开启 SMTP） | 16 位授权码             |
| `QQ_MAIL_TO`      | 收件邮箱                                                            | `xxxxx@qq.com`          |

> 服务器需预装：Node.js >= 20、pm2（`npm i -g pm2`）、nginx。首次部署完成后
> SSH 登录编辑 `/home/nginx/html/monorepo-three/server/config.production.yml` 填入真实密码。

## 环境要求

- Node.js >= 20，pnpm >= 9
- 后端完整运行需要：MySQL 5.7+、Redis 5+、MinIO（本地或远端均可）
