/**
 * @file constants.js
 * Centralized constants/enums for AURA core.
 */

/** @type {{BUY_NOW:string,COMPARE:string,BUDGET:string,RESEARCH:string,IMPULSE:string,USE_CASE:string}} */
export const INTENT_TYPES = {
  BUY_NOW: 'buy_now',
  COMPARE: 'compare',
  BUDGET: 'budget',
  RESEARCH: 'research',
  IMPULSE: 'impulse',
  USE_CASE: 'use_case'
};

/** @type {{SEARCH:string,SOCIAL:string,EMAIL:string,PAID:string,REFERRAL:string,DIRECT:string,UNKNOWN:string}} */
export const REFERRER_CATEGORIES = {
  SEARCH: 'search',
  SOCIAL: 'social',
  EMAIL: 'email',
  PAID: 'paid',
  REFERRAL: 'referral',
  DIRECT: 'direct',
  UNKNOWN: 'unknown'
};

/** @type {{HERO_A:string,HERO_B:string,HERO_C:string,HERO_D:string,HERO_E:string}} */
export const TEMPLATE_IDS = {
  HERO_A: 'hero-a',
  HERO_B: 'hero-b',
  HERO_C: 'hero-c',
  HERO_D: 'hero-d',
  HERO_E: 'hero-e'
};

/** @type {{CORE_INIT:string,PERSONALIZATION:string,IMPRESSION:string,CLICK:string,CONVERSION:string,ERROR:string}} */
export const ANALYTICS_EVENTS = {
  CORE_INIT: 'core_init',
  PERSONALIZATION: 'personalization',
  IMPRESSION: 'impression',
  CLICK: 'click',
  CONVERSION: 'conversion',
  ERROR: 'error'
};

/** @type {{INVALID_CONFIG:string,INVALID_TEMPLATE:string,DECISION_FAILED:string,ANALYTICS_FAILED:string}} */
export const ERROR_CODES = {
  INVALID_CONFIG: 'INVALID_CONFIG',
  INVALID_TEMPLATE: 'INVALID_TEMPLATE',
  DECISION_FAILED: 'DECISION_FAILED',
  ANALYTICS_FAILED: 'ANALYTICS_FAILED'
};

export const DEFAULT_ENV = 'production';

export const DEFAULT_CONFIG = Object.freeze({
  env: DEFAULT_ENV,
  debug: false,
  decision: {
    maxDecisionMs: 100,
    enableLLM: false
  },
  analytics: {
    enabled: true,
    batchSize: 10,
    flushIntervalMs: 5000,
    googleAnalytics: {
      enabled: true,
      // If gtag is present, events are forwarded; otherwise no-op.
      measurementId: null
    }
  },
  templates: {
    defaultTemplateId: TEMPLATE_IDS.HERO_B
  }
});

export const INTENT_TO_TEMPLATE = Object.freeze({
  [INTENT_TYPES.BUY_NOW]: TEMPLATE_IDS.HERO_A,
  [INTENT_TYPES.IMPULSE]: TEMPLATE_IDS.HERO_A,
  [INTENT_TYPES.COMPARE]: TEMPLATE_IDS.HERO_B,
  [INTENT_TYPES.RESEARCH]: TEMPLATE_IDS.HERO_B,
  [INTENT_TYPES.USE_CASE]: TEMPLATE_IDS.HERO_D,
  [INTENT_TYPES.BUDGET]: TEMPLATE_IDS.HERO_C
});

export const INTENT_TO_IMAGE = Object.freeze({
  [INTENT_TYPES.BUY_NOW]: 'img-1',
  [INTENT_TYPES.IMPULSE]: 'img-8',
  [INTENT_TYPES.COMPARE]: 'img-2',
  [INTENT_TYPES.RESEARCH]: 'img-3',
  [INTENT_TYPES.USE_CASE]: 'img-4',
  [INTENT_TYPES.BUDGET]: 'img-5'
});

