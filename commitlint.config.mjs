/**
 * Commit message 规范：Conventional Commits
 * 格式: <type>(<scope>?): <subject>
 * 例如: feat(web): 新增 Three.js 演示页
 *
 * 合并 cz.config.mjs（cz-git 交互式提示与校验规则保持一致，含 DeepSeek AI 配置）。
 */
import czConfig from './cz.config.mjs';

export default {
  ...czConfig,
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'subject-max-length': [2, 'always', 100],
  },
};
