/**
 * @file signalsCollector.js
 * Orchestrates signal collection into a unified object for decisioning.
 */

import { analyzeUrl } from './urlAnalyzer.js';
import { analyzeReferrer } from './referrerAnalyzer.js';
import { BehaviorAnalyzer } from './behaviorAnalyzer.js';

/**
 * @typedef {object} AuraSignals
 * @property {ReturnType<typeof analyzeUrl>} url
 * @property {ReturnType<typeof analyzeReferrer>} referrer
 * @property {import('./behaviorAnalyzer.js').BehaviorSnapshot} behavior
 * @property {{userAgent: string|null, device: 'mobile'|'desktop'|'unknown'}} device
 * @property {{iso: string, hour: number, day: number}} time
 * @property {{persona: string|null}} persona
 */

/**
 * Collect all signals (URL, referrer, behavior, device, time).
 * @param {{
 *  url?: string|URL,
 *  referrer?: string|null,
 *  userAgent?: string,
 *  now?: Date|number,
 *  behavior?: import('./behaviorAnalyzer.js').BehaviorSnapshot,
 *  simulateBehavior?: {timeOnPageMs?: number, scrollDepth?: number, clickCount?: number},
 *  persona?: string|null
 * }=} ctx
 * @returns {AuraSignals}
 */
export function collectSignals(ctx = {}) {
  const url = analyzeUrl(ctx.url);
  const referrer = analyzeReferrer(ctx.referrer);

  let behavior;
  if (ctx.behavior) behavior = ctx.behavior;
  else {
    const ba = new BehaviorAnalyzer({ enableListeners: false });
    if (ctx.simulateBehavior) ba.simulate(ctx.simulateBehavior);
    behavior = ba.snapshot();
  }

  const ua = ctx.userAgent || safeUserAgent();
  const device = detectDevice(ua);

  const d = toDate(ctx.now);
  const time = { iso: d.toISOString(), hour: d.getHours(), day: d.getDay() };

  const persona = normalizePersona(ctx.persona);

  return { url, referrer, behavior, device: { userAgent: ua, device }, time, persona: { persona } };
}

/**
 * @param {string|null} userAgent
 * @returns {'mobile'|'desktop'|'unknown'}
 */
export function detectDevice(userAgent) {
  if (!userAgent) return 'unknown';
  const ua = userAgent.toLowerCase();
  if (/\b(mobile|android|iphone|ipod)\b/.test(ua)) return 'mobile';
  if (/\b(ipad|tablet)\b/.test(ua)) return 'mobile';
  if (/\b(macintosh|windows|linux)\b/.test(ua)) return 'desktop';
  return 'unknown';
}

function safeUserAgent() {
  try {
    return globalThis.navigator?.userAgent || null;
  } catch {
    return null;
  }
}

function toDate(now) {
  if (now instanceof Date) return now;
  if (typeof now === 'number') return new Date(now);
  return new Date();
}

function normalizePersona(p) {
  if (!p) return null;
  const s = String(p).toLowerCase().trim();
  return s || null;
}

