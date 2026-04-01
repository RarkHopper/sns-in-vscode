import { architectRole } from './architectRole.js';
import { codeDiveRole } from './codeDiveRole.js';
import { critiqueRole } from './critiqueRole.js';
import { onboardingRole } from './onboardingRole.js';

export type { PostRole } from './PostRole.js';

/** 全ロールのリスト。 */
export const ALL_ROLES = [architectRole, codeDiveRole, onboardingRole, critiqueRole] as const;

/**
 * ランダムにロールを選択する。
 * 直前に使われたロールを引数で渡すと、同じロールが連続するのを避ける。
 */
export function pickRole(exclude?: string): (typeof ALL_ROLES)[number] {
  const candidates = exclude ? ALL_ROLES.filter((r) => r.name !== exclude) : [...ALL_ROLES];
  const idx = Math.floor(Math.random() * candidates.length);
  const selected = candidates[idx];
  if (!selected) return ALL_ROLES[0];
  return selected;
}
