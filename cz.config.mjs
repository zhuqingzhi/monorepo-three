/**
 * cz-git 交互式提交配置（czg / commitizen 共用）。
 * - pnpm cz      交互式生成符合 Conventional Commits 的提交信息
 * - pnpm cz:ai   使用 DeepSeek 生成提交信息（AI 模式，需先填入 API Key）
 *
 * commitlint.config.mjs 会合并本文件，保证 commitizen 提示与校验规则一致。
 */

// AI 提交信息生成配置（DeepSeek，OpenAI 兼容协议）
const openAI = {
  // TODO: <== 在此填入 DeepSeek API Key（或在 shell 中设置环境变量 DEEPSEEK_API_KEY）
  token: process.env.DOUBAO_API_KEY ?? '',
  // DeepSeek 官方 endpoint，无需修改；如走代理/自建网关可改环境变量 DEEPSEEK_ENDPOINT
  endpoint: process.env.DEEPSEEK_ENDPOINT ?? 'https://api.deepseek.com',
  model: process.env.DEEPSEEK_MODEL ?? 'doubao-pro-4k',
  locale: 'zh-CN',
};

export default {
  extends: ['@commitlint/config-conventional'],

  messages: {
    type: '选择你要提交的类型 :',
    scope: '选择一个提交范围（可选）:',
    customScope: '请输入自定义的提交范围 :',
    subject: '填写简短精炼的变更描述 :\n',
    body: '填写更加详细的变更描述（可选）。使用 "|" 换行 :\n',
    breaking: '列举非兼容性重大的变更（可选）。使用 "|" 换行 :\n',
    footerPrefixesSelect: '选择关联 issue 前缀（可选）:',
    customFooterPrefix: '输入自定义 issue 前缀 :',
    footer: '列举关联 issue (可选) 例如: #31, #34 :\n',
    generatingByAI: '正在通过 DeepSeek 生成提交概述...',
    generatedByAI: '选择 AI 生成的 commit message :',
    confirmCommit: '是否提交或修改 commit ?',
  },

  types: [
    { value: 'feat', name: 'feat:     ✨ 新增功能', emoji: 'sparkles' },
    { value: 'fix', name: 'fix:      🐛 修复缺陷', emoji: 'bug' },
    { value: 'docs', name: 'docs:     📝 文档变更', emoji: 'memo' },
    { value: 'style', name: 'style:    💄 代码格式（不影响逻辑）', emoji: 'lipstick' },
    { value: 'refactor', name: 'refactor: ♻️  代码重构（无新功能/修复）', emoji: 'recycle' },
    { value: 'perf', name: 'perf:     ⚡ 性能优化', emoji: 'zap' },
    { value: 'test', name: 'test:     ✅ 测试相关', emoji: 'white_check_mark' },
    { value: 'build', name: 'build:    📦 构建/依赖变更', emoji: 'package' },
    { value: 'ci', name: 'ci:       🎡 CI/CD 流水线', emoji: 'ferris_wheel' },
    { value: 'chore', name: 'chore:    🔧 其他杂项', emoji: 'wrench' },
    { value: 'revert', name: 'revert:   ⏪ 回退变更', emoji: 'rewind' },
  ],

  useEmoji: false,
  emojiAlign: 'center',

  scopes: [
    { value: 'web', name: 'web:      前端应用 (apps/web)' },
    { value: 'server', name: 'server:   后端应用 (apps/server)' },
    { value: 'repo', name: 'repo:     仓库/工程化配置（根目录）' },
    { value: 'deps', name: 'deps:     依赖变更' },
    { value: 'ci', name: 'ci:       CI/CD 配置' },
  ],
  customScopesAlign: 'bottom',
  customScopesAlias: '以上都不是？我要自定义',
  allowCustomScopes: true,
  allowEmptyScopes: false,

  upperCaseSubject: false,
  markBreakingChangeMode: false,
  allowBreakingChanges: ['feat', 'fix'],

  breaklineNumber: 100,
  breaklineChar: '|',

  skipQuestions: [],

  issuePrefixes: [
    { value: 'closed', name: 'closed:   ISSUES 已完成' },
    { value: 'link', name: 'link:     ISSUES 相关' },
  ],
  customIssuePrefixAlign: 'top',
  customIssuePrefixAlias: '我要自定义',
  allowCustomIssuePrefix: true,
  allowEmptyIssuePrefix: true,

  confirmColorize: true,
  minSubjectLength: 0,
  defaultBody: '',
  defaultIssues: '',
  defaultScope: '',
  defaultSubject: '',

  openAI,
};
