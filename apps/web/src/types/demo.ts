/**
 * 演示通过 @ 短路径进行类型导入：
 *   import type { AnimationHandle } from '@/types/demo';
 */

/** requestAnimationFrame 句柄封装 */
export interface AnimationHandle {
  frameId: number | null;
}

/** 立方体可调参数 */
export interface CubeOptions {
  /** 十六进制颜色，如 '#409eff' */
  color?: string;
  /** 边长 */
  size?: number;
}
