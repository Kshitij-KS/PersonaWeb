/**
 * @file urlAnalyzer.js
 * Extract explicit and implicit intent from URL/query/UTM params.
 */

import { INTENT_TYPES } from '../config/constants.js';

const INTENT_PARAM_KEYS = ['intent', 'aura_intent', 'utm_intent'];
const SEARCH_TERM_KEYS = ['q', 'query', 's', 'search', 'term', 'utm_term'];

/**
 * @typedef {object} UrlAnalysis
 * @property {string} href
 * @property {Record<string, string>} query
 * @property {Record<string, string>} utm
 * @property {string|null} explicitIntent
 * @property {string|null} inferredIntent
 * @property {number} confidence
 * @property {string[]} matchedPatterns
 */

/**
 * Parse a URL and analyze intent signals.
 * @param {string|URL=} inputUrl - Defaults to `window.location.href` when available.
 * @returns {UrlAnalysis}
 */
export function analyzeUrl(inputUrl = undefined) {
  const url = toUrl(inputUrl);
  const query = Object.fromEntries(url.searchParams.entries());

  const utm = {};
  for (const [k, v] of Object.entries(query)) {
    if (k.toLowerCase().startsWith('utm_')) utm[k.toLowerCase()] = v;
  }

  const explicitIntent = readFirstMatch(query, INTENT_PARAM_KEYS);
  const term = readFirstMatch(query, SEARCH_TERM_KEYS) || utm.utm_term || '';

  const { intent: inferredIntent, confidence, matchedPatterns } = inferIntentFromText(
    [term, query.keyword, query.keywords, query.searchTerm].filter(Boolean).join(' ')
  );

  // If explicit intent is a known value, prefer it and boost confidence.
  const normalizedExplicit = normalizeIntent(explicitIntent);
  if (normalizedExplicit) {
    return {
      href: url.href,
      query,
      utm,
      explicitIntent: normalizedExplicit,
      inferredIntent,
      confidence: Math.max(0.9, confidence),
      matchedPatterns: matchedPatterns.length ? matchedPatterns : ['explicit_intent_param']
    };
  }

  return {
    href: url.href,
    query,
    utm,
    explicitIntent: null,
    inferredIntent,
    confidence,
    matchedPatterns
  };
}

/**
 * Infer intent from search-like text using lightweight pattern matching.
 * @param {string} text
 * @returns {{intent: string|null, confidence: number, matchedPatterns: string[]}}
 */
export function inferIntentFromText(text) {
  const t = String(text || '').toLowerCase();
  if (!t.trim()) return { intent: null, confidence: 0, matchedPatterns: [] };

  /**
   * Weighted keyword scoring.
   * Each pattern contributes a weight; scores are summed per intent.
   * @type {{id:string, re:RegExp, intent:string, weight:number}[]}
   */
  const rules = [
    { id: 'buy_now', re: /\b(buy|purchase|order|checkout|pricing|subscribe|book now|ship today|in stock|add to cart)\b/g, intent: INTENT_TYPES.BUY_NOW, weight: 3 },
    { id: 'compare', re: /\b(compare|vs|versus|alternative|alternatives|best|benchmark|ranked|top)\b/g, intent: INTENT_TYPES.COMPARE, weight: 2.5 },
    { id: 'budget', re: /\b(cheap|budget|affordable|discount|deal|coupon|promo|low price|under \$?\d+)\b/g, intent: INTENT_TYPES.BUDGET, weight: 2.5 },
    { id: 'research', re: /\b(review|reviews|how to|guide|what is|features|specs|documentation|ratings|test)\b/g, intent: INTENT_TYPES.RESEARCH, weight: 2 },
    { id: 'use_case', re: /\b(gaming|coding|programming|design|creative|office|work|productivity|streaming|editing|creator|esports)\b/g, intent: INTENT_TYPES.USE_CASE, weight: 2.2 },
    { id: 'impulse', re: /\b(limited time|today only|last chance|flash sale|ends soon|only \d+ left|drop)\b/g, intent: INTENT_TYPES.IMPULSE, weight: 2.1 }
  ];

  const scores = {};
  const matchedPatterns = [];

  for (const rule of rules) {
    const matches = t.match(rule.re);
    if (!matches) continue;
    const count = matches.length || 1;
    scores[rule.intent] = (scores[rule.intent] || 0) + rule.weight * count;
    matchedPatterns.push(`${rule.id}(${count})`);
  }

  const entries = Object.entries(scores);
  if (!entries.length) return { intent: null, confidence: 0.2, matchedPatterns: [] };

  entries.sort((a, b) => b[1] - a[1]);
  const [topIntent, topScore] = entries[0];
  const confidence = clamp01(0.4 + Math.min(0.55, topScore / 10));

  return { intent: topIntent, confidence, matchedPatterns };
}

/**
 * Normalize known intent strings.
 * @param {string|null|undefined} v
 * @returns {string|null}
 */
export function normalizeIntent(v) {
  if (!v) return null;
  const s = String(v).toLowerCase().trim();
  const all = Object.values(INTENT_TYPES);
  return all.includes(s) ? s : null;
}

/**
 * @param {Record<string,string>} query
 * @param {string[]} keys
 * @returns {string|null}
 */
function readFirstMatch(query, keys) {
  for (const k of keys) {
    const v = query[k];
    if (v != null && String(v).trim() !== '') return String(v);
  }
  // Try case-insensitive keys too
  const lower = Object.fromEntries(Object.entries(query).map(([k, v]) => [k.toLowerCase(), v]));
  for (const k of keys) {
    const v = lower[k.toLowerCase()];
    if (v != null && String(v).trim() !== '') return String(v);
  }
  return null;
}

/**
 * @param {string|URL|undefined} inputUrl
 * @returns {URL}
 */
function toUrl(inputUrl) {
  if (inputUrl instanceof URL) return inputUrl;
  if (typeof inputUrl === 'string' && inputUrl) return new URL(inputUrl, baseForRelative());
  // Browser default
  try {
    if (globalThis?.location?.href) return new URL(globalThis.location.href);
  } catch {
    // ignore
  }
  // Node/test fallback
  return new URL('https://example.test/');
}

function baseForRelative() {
  try {
    if (globalThis?.location?.origin) return globalThis.location.origin;
  } catch {
    // ignore
  }
  return 'https://example.test';
}

function clamp01(v) {
  return Math.max(0, Math.min(1, Number(v) || 0));
}

