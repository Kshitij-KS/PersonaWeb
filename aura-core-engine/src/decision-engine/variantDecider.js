/**
 * @file variantDecider.js
 * Deterministic variant selection to support simple A/B testing.
 */

/**
 * Pick a variant from an array deterministically based on sessionId.
 * @param {string} sessionId
 * @param {string[]} variants
 * @returns {string}
 */
export function pickVariant(sessionId, variants) {
  const list = (variants || []).filter(Boolean);
  if (!list.length) return 'default';
  const h = hashString(sessionId || 'anon');
  return list[h % list.length];
}

/**
 * Simple non-crypto hash (fast, deterministic).
 * @param {string} s
 */
function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0);
}

