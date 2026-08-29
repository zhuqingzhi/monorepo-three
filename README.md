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
  例如 `feat(web): 新增 Three.js 演示页`。
- 任何不合规的提交信息都会被拒绝；暂存区中存在 ESLint 无法修复的错误时提交同样会被拦截，
  而未暂存（只在工作区）的文件不会校验。

## 环境要求

- Node.js >= 20，pnpm >= 9
- 后端完整运行需要：MySQL 5.7+、Redis 5+、MinIO（本地或远端均可）
