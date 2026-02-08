/**
 * @file ruleBasedEngine.js
 * Priority-based intent detection and template/CTA selection.
 */

import { INTENT_TYPES, INTENT_TO_IMAGE, INTENT_TO_TEMPLATE } from '../config/constants.js';

/**
 * @typedef {import('../intent-detection/signalsCollector.js').collectSignals extends (...args:any)=>infer R ? R : any} AuraSignals
 */

/**
 * @typedef {object} DecisionResult
 * @property {string} intent
 * @property {number} confidence
 * @property {string} templateId
 * @property {string} heroImageId
 * @property {{ctaText:string, ctaHref:string}} cta
 * @property {string} reason
 * @property {{reason:string, priority:number, debug:any}} debug
 */

/**
 * Decide personalization from signals using required priority order:
 * 1) URL explicit/inferred
 * 2) Referrer inferred
 * 3) Time/day patterns
 * 4) Device type
 * 5) Default fallback
 */
export class RuleBasedEngine {
  /**
   * @param {{defaultIntent?: string, defaultTemplateId?: string}=} opts
   */
  constructor(opts = {}) {
    this._defaultIntent = opts.defaultIntent || INTENT_TYPES.RESEARCH;
    this._defaultTemplateId = opts.defaultTemplateId || INTENT_TO_TEMPLATE[this._defaultIntent];
  }

  /**
   * @param {any} signals
   * @returns {DecisionResult}
   */
  decide(signals) {
    const debug = {};

    // Priority 0: persona override (demo)
    const personaIntent = normalizePersonaIntent(signals?.persona?.persona);
    if (personaIntent) {
      return finalize(personaIntent, 0.75, 0, 'persona_override', debug, { signals });
    }

    // Priority 1: URL query intent
    const urlIntent = normalizeIntent(signals?.url?.explicitIntent || signals?.url?.inferredIntent);
    if (urlIntent) {
      const confidence = clamp01(signals?.url?.confidence ?? 0.7);
      return finalize(urlIntent, confidence, 1, 'url_intent', debug, { signals });
    }

    // Priority 2: Referrer-based intent
    const refIntent = normalizeIntent(signals?.referrer?.inferredIntent);
    if (refIntent) {
      const confidence = clamp01(signals?.referrer?.confidence ?? 0.45);
      return finalize(refIntent, confidence, 2, 'referrer_intent', debug, { signals });
    }

    // Priority 3: Time/day patterns (demo heuristic)
    const timeIntent = inferFromTime(signals?.time);
    if (timeIntent) {
      return finalize(timeIntent.intent, timeIntent.confidence, 3, 'time_pattern', debug, { signals });
    }

    // Priority 4: Device type
    const deviceIntent = inferFromDevice(signals?.device?.device);
    if (deviceIntent) {
      return finalize(deviceIntent.intent, deviceIntent.confidence, 4, 'device_pattern', debug, { signals });
    }

    // Priority 5: Default fallback
    return finalize(this._defaultIntent, 0.3, 5, 'default_fallback', debug, { signals });
  }
}

/**
 * @param {string} intent
 * @param {number} confidence
 * @param {number} priority
 * @param {string} reason
 * @param {any} debug
 * @returns {DecisionResult}
 */
function finalize(intent, confidence, priority, reason, debug, ctx) {
  const templateId = INTENT_TO_TEMPLATE[intent] || INTENT_TO_TEMPLATE[INTENT_TYPES.RESEARCH];
  const heroImageId = INTENT_TO_IMAGE[intent] || INTENT_TO_IMAGE[INTENT_TYPES.RESEARCH];
  const cta = generateCTA(intent);
  debug.intent = intent;
  debug.templateId = templateId;
  debug.priority = priority;
  const explanation = reasonText(reason, ctx?.signals);
  return { intent, confidence, templateId, heroImageId, cta, reason: explanation, debug: { reason: explanation, priority, debug } };
}

/**
 * CTA generation based on intent.
 * @param {string} intent
 */
export function generateCTA(intent) {
  switch (intent) {
    case INTENT_TYPES.BUY_NOW:
      return { ctaText: 'Start now', ctaHref: '#get-started' };
    case INTENT_TYPES.IMPULSE:
      return { ctaText: 'Claim offer', ctaHref: '#offer' };
    case INTENT_TYPES.COMPARE:
      return { ctaText: 'Compare', ctaHref: '#compare' };
    case INTENT_TYPES.BUDGET:
      return { ctaText: 'See deals', ctaHref: '#deals' };
    case INTENT_TYPES.USE_CASE:
      return { ctaText: 'See use cases', ctaHref: '#use-cases' };
    case INTENT_TYPES.RESEARCH:
    default:
      return { ctaText: 'Learn more', ctaHref: '#learn' };
  }
}

/**
 * @param {any} time
 * @returns {{intent:string, confidence:number}|null}
 */
function inferFromTime(time) {
  if (!time || typeof time.hour !== 'number' || typeof time.day !== 'number') return null;
  // Demo heuristic:
  // - Weekdays 9–17 → research/compare
  // - Late evening → impulse
  // - Weekend midday → buy_now
  const hour = time.hour;
  const day = time.day; // 0 Sun .. 6 Sat
  const isWeekend = day === 0 || day === 6;

  if (!isWeekend && hour >= 9 && hour <= 17) return { intent: INTENT_TYPES.RESEARCH, confidence: 0.35 };
  if (hour >= 20 || hour <= 1) return { intent: INTENT_TYPES.IMPULSE, confidence: 0.33 };
  if (isWeekend && hour >= 11 && hour <= 16) return { intent: INTENT_TYPES.BUY_NOW, confidence: 0.32 };
  return null;
}

/**
 * @param {'mobile'|'desktop'|'unknown'|undefined} device
 * @returns {{intent:string, confidence:number}|null}
 */
function inferFromDevice(device) {
  if (!device || device === 'unknown') return null;
  // Demo heuristic: mobile → impulse, desktop → compare.
  if (device === 'mobile') return { intent: INTENT_TYPES.IMPULSE, confidence: 0.31 };
  if (device === 'desktop') return { intent: INTENT_TYPES.COMPARE, confidence: 0.3 };
  return null;
}

/**
 * @param {any} v
 * @returns {string|null}
 */
function normalizeIntent(v) {
  if (!v) return null;
  const s = String(v).toLowerCase().trim();
  return Object.values(INTENT_TYPES).includes(s) ? s : null;
}

function normalizePersonaIntent(persona) {
  if (!persona) return null;
  const s = String(persona).toLowerCase().trim();
  if (!s) return null;
  // Persona can map to intent or use-case keywords.
  if (Object.values(INTENT_TYPES).includes(s)) return s;
  if (/\b(gaming|coding|programming|design|creative|office|work|productivity|streaming)\b/.test(s)) {
    return INTENT_TYPES.USE_CASE;
  }
  if (/\b(buy|purchase|order)\b/.test(s)) return INTENT_TYPES.BUY_NOW;
  if (/\b(compare|vs|best|alternative)\b/.test(s)) return INTENT_TYPES.COMPARE;
  if (/\b(budget|cheap|deal|discount)\b/.test(s)) return INTENT_TYPES.BUDGET;
  if (/\b(research|review|guide|features)\b/.test(s)) return INTENT_TYPES.RESEARCH;
  return null;
}

function clamp01(n) {
  return Math.max(0, Math.min(1, Number(n) || 0));
}

function reasonText(reasonKey, signals) {
  switch (reasonKey) {
    case 'persona_override': {
      const p = signals?.persona?.persona || 'custom persona';
      return `Persona override set to "${p}", using matching intent.`;
    }
    case 'url_intent': {
      const patterns = (signals?.url?.matchedPatterns || []).join(', ');
      return patterns
        ? `Query/UTM matched patterns (${patterns}), indicating intent.`
        : 'Query/UTM parameters indicate intent.';
    }
    case 'referrer_intent': {
      const cat = signals?.referrer?.category || 'unknown';
      return `Referrer category "${cat}" suggests intent.`;
    }
    case 'time_pattern':
      return 'Time-of-day pattern suggests intent.';
    case 'device_pattern':
      return 'Device type suggests intent.';
    case 'default_fallback':
    default:
      return 'No strong signals; using default intent.';
  }
}

