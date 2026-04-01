import { architectRole } from './architectRole.js';
import { codeDiveRole } from './codeDiveRole.js';
import { critiqueRole } from './critiqueRole.js';
import { onboardingRole } from './onboardingRole.js';
import { reactionRole } from './reactionRole.js';

export type { PostRole } from './PostRole.js';

/** 全ロールのリスト（reaction 以外）。reaction は別扱いでコンテキストが必要。 */
export const ALL_ROLES = [architectRole, codeDiveRole, onboardingRole, critiqueRole] as const;

export { reactionRole };

/**
 * ランダムにロールを選択する。
 * 直前に使われたロールを引数で渡すと、同じロールが連続するのを避ける。
 * reaction は target_post が必要なため、ここでは除外する。
 */
export function pickRole(exclude?: string): (typeof ALL_ROLES)[number] {
  const candidates = exclude ? ALL_ROLES.filter((r) => r.name !== exclude) : [...ALL_ROLES];
  const idx = Math.floor(Math.random() * candidates.length);
  const selected = candidates[idx];
  if (!selected) return ALL_ROLES[0];
  return selected;
}
