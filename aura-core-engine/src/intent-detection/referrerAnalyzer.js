/**
 * @file referrerAnalyzer.js
 * Categorize traffic source and infer intent hints from referrer.
 */

import { INTENT_TYPES, REFERRER_CATEGORIES } from '../config/constants.js';

const SEARCH_ENGINES = ['google.', 'bing.', 'duckduckgo.', 'yahoo.', 'baidu.', 'yandex.'];
const SOCIAL_SITES = ['twitter.com', 't.co', 'facebook.com', 'instagram.com', 'linkedin.com', 'reddit.com', 'tiktok.com', 'youtube.com'];
const EMAIL_HINTS = ['mail.', 'gmail.', 'outlook.', 'protection.outlook.', 'mailchi.mp'];

/**
 * @typedef {object} ReferrerAnalysis
 * @property {string|null} referrer
 * @property {string} category
 * @property {string|null} inferredIntent
 * @property {number} confidence
 */

/**
 * Analyze referrer and infer category + intent hint.
 * @param {string|null|undefined=} referrer - Defaults to `document.referrer` when available.
 * @returns {ReferrerAnalysis}
 */
export function analyzeReferrer(referrer = undefined) {
  const r = normalizeReferrer(referrer);
  if (!r) {
    return { referrer: null, category: REFERRER_CATEGORIES.DIRECT, inferredIntent: null, confidence: 0.2 };
  }

  const host = safeHost(r);

  if (matchesAny(host, SEARCH_ENGINES)) {
    // Search often implies research/compare.
    return { referrer: r, category: REFERRER_CATEGORIES.SEARCH, inferredIntent: INTENT_TYPES.RESEARCH, confidence: 0.45 };
  }
  if (matchesAny(host, SOCIAL_SITES)) {
    // Social tends to impulse or curiosity.
    return { referrer: r, category: REFERRER_CATEGORIES.SOCIAL, inferredIntent: INTENT_TYPES.IMPULSE, confidence: 0.4 };
  }
  if (matchesAny(host, EMAIL_HINTS) || r.includes('utm_medium=email')) {
    // Email often means returning users or campaigns → buy/impulse.
    return { referrer: r, category: REFERRER_CATEGORIES.EMAIL, inferredIntent: INTENT_TYPES.BUY_NOW, confidence: 0.5 };
  }
  if (r.includes('utm_medium=cpc') || r.includes('gclid=') || r.includes('fbclid=')) {
    return { referrer: r, category: REFERRER_CATEGORIES.PAID, inferredIntent: INTENT_TYPES.BUY_NOW, confidence: 0.55 };
  }

  return { referrer: r, category: REFERRER_CATEGORIES.REFERRAL, inferredIntent: null, confidence: 0.3 };
}

/**
 * @param {string|null|undefined} ref
 * @returns {string|null}
 */
function normalizeReferrer(ref) {
  if (typeof ref === 'string' && ref.trim()) return ref.trim();
  try {
    const dr = globalThis?.document?.referrer;
    if (typeof dr === 'string' && dr.trim()) return dr.trim();
  } catch {
    // ignore
  }
  return null;
}

/**
 * @param {string} referrer
 * @returns {string}
 */
function safeHost(referrer) {
  try {
    return new URL(referrer).host.toLowerCase();
  } catch {
    return referrer.toLowerCase();
  }
}

/**
 * @param {string} hay
 * @param {string[]} needles
 */
function matchesAny(hay, needles) {
  return needles.some((n) => hay.includes(n));
}

