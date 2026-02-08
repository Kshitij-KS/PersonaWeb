/**
 * @file core.js
 * Main orchestrator class exposed to the frontend (Person 2).
 */

import { ConfigManager } from './config/configManager.js';
import { ANALYTICS_EVENTS, ERROR_CODES } from './config/constants.js';
import { collectSignals } from './intent-detection/signalsCollector.js';
import { RuleBasedEngine } from './decision-engine/ruleBasedEngine.js';
import { normalizeTemplatePayload } from './templates/templateValidator.js';
import { EventTracker } from './analytics/eventTracker.js';
import { PerformanceMonitor } from './analytics/performanceMonitor.js';

/**
 * @typedef {object} AuraDecision
 * @property {string} intent
 * @property {string} templateId
 * @property {string} heroImageId
 * @property {string} hero_image
 * @property {{ctaText:string, ctaHref:string}} cta
 * @property {Record<string, any>} content
 * @property {number} confidence
 * @property {string} reason
 * @property {any} debug
 */

export class AuraCore {
  /**
   * @param {import('./config/configManager.js').ConfigManager extends {snapshot:()=>infer C} ? Partial<C> : any=} config
   */
  constructor(config = {}) {
    this.version = typeof __AURA_VERSION__ !== 'undefined' ? __AURA_VERSION__ : 'dev';

    this.config = new ConfigManager(config);
    this.perf = new PerformanceMonitor();

    const c = this.config.snapshot();
    this.analytics = new EventTracker({
      enabled: c.analytics.enabled,
      batchSize: c.analytics.batchSize,
      flushIntervalMs: c.analytics.flushIntervalMs,
      googleAnalytics: c.analytics.googleAnalytics,
      onFlush: c.debug ? (events) => console.log('[AURA flush]', events) : null
    });

    this.engine = new RuleBasedEngine({
      defaultTemplateId: c.templates.defaultTemplateId
    });

    /** @type {boolean} */
    this._initialized = false;

    /** @type {((err: any)=>void)|null} */
    this.onError = null;
  }

  /**
   * Initialize core engine (starts analytics timer).
   */
  init() {
    if (this._initialized) return;
    this.perf.start('init');
    this.analytics.start();
    this.analytics.track(ANALYTICS_EVENTS.CORE_INIT, { version: this.version });
    this.perf.end('init', 'init');
    this._initialized = true;
  }

  /**
   * Update configuration at runtime.
   * @param {any} partialConfig
   */
  updateConfig(partialConfig) {
    this.config.update(partialConfig);
    const c = this.config.snapshot();
    // Propagate to analytics
    this.analytics.enabled = c.analytics.enabled;
    this.analytics.batchSize = c.analytics.batchSize;
    this.analytics.flushIntervalMs = c.analytics.flushIntervalMs;
    this.analytics.ga = { ...this.analytics.ga, ...c.analytics.googleAnalytics };
  }

  /**
   * Collect signals (optionally provided context overrides).
   * @param {Parameters<typeof collectSignals>[0]=} ctx
   */
  collectSignals(ctx = {}) {
    return collectSignals(ctx);
  }

  /**
   * Decide on an experience for a given signal set.
   * @param {any=} signals
   * @returns {AuraDecision}
   */
  decide(signals = undefined) {
    this.perf.start('decision');
    const s = signals || this.collectSignals();
    const d = this.engine.decide(s);
    const payload = normalizeTemplatePayload(d.templateId, {
      headline: headlineForIntent(d.intent),
      subheadline: subheadlineForIntent(d.intent),
      ctaText: d.cta.ctaText,
      ctaHref: d.cta.ctaHref,
      imageId: d.heroImageId
    }, { confidence: d.confidence });
    const ms = this.perf.end('decision', 'decision');

    const decision = /** @type {AuraDecision} */ ({
      intent: d.intent,
      templateId: payload.templateId,
      heroImageId: payload.content.imageId,
      hero_image: payload.content.imageId,
      cta: d.cta,
      content: payload.content,
      confidence: d.confidence,
      reason: d.reason,
      debug: { ...d.debug, decisionMs: ms, signals: this.config.get('debug') ? s : undefined }
    });

    this.analytics.track(ANALYTICS_EVENTS.PERSONALIZATION, {
      intent: decision.intent,
      template: decision.templateId,
      confidence: decision.confidence,
      decisionMs: ms
    });

    return decision;
  }

  /**
   * Convenience: collect signals + decide.
   * @param {Parameters<typeof collectSignals>[0]=} ctx
   * @returns {Promise<AuraDecision>}
   */
  async personalize(ctx = {}) {
    try {
      if (!this._initialized) this.init();
      const signals = this.collectSignals(ctx);
      return this.decide(signals);
    } catch (err) {
      this._handleError(err, { stage: 'personalize' });
      throw err;
    }
  }

  /**
   * Track analytics event in standard format.
   * @param {string} event
   * @param {any=} data
   */
  track(event, data = {}) {
    try {
      this.analytics.track(event, data);
    } catch (err) {
      this._handleError(err, { stage: 'track' });
    }
  }

  /**
   * Flush analytics batch.
   */
  flush() {
    try {
      return this.analytics.flush();
    } catch (err) {
      this._handleError(err, { stage: 'flush' });
      return [];
    }
  }

  /**
   * Cleanup.
   */
  destroy() {
    try {
      this.analytics.stop();
    } catch {
      // ignore
    }
    this._initialized = false;
  }

  /**
   * @param {any} err
   * @param {any} ctx
   */
  _handleError(err, ctx) {
    const e = err instanceof Error ? err : new Error(String(err));
    if (!e.code) e.code = ERROR_CODES.DECISION_FAILED;
    try {
      this.analytics.track(ANALYTICS_EVENTS.ERROR, { message: e.message, code: e.code, ctx });
    } catch {
      // ignore
    }
    if (typeof this.onError === 'function') {
      try {
        this.onError(e);
      } catch {
        // ignore
      }
    }
  }
}

function headlineForIntent(intent) {
  switch (intent) {
    case 'buy_now':
      return 'Start personalizing today';
    case 'compare':
      return 'Compare options in seconds';
    case 'budget':
      return 'Best value personalization';
    case 'impulse':
      return 'Limited-time boost for your site';
    case 'research':
    default:
      return 'Learn what AURA can do';
  }
}

function subheadlineForIntent(intent) {
  switch (intent) {
    case 'buy_now':
      return 'Launch tailored experiences with a single script tag.';
    case 'compare':
      return 'See features and outcomes side-by-side for your visitors.';
    case 'budget':
      return 'Ship personalization without heavy engineering effort.';
    case 'impulse':
      return 'Make your hero section match visitor intent instantly.';
    case 'research':
    default:
      return 'A lightweight core that detects intent and picks the best hero.';
  }
}

export { ANALYTICS_EVENTS };

