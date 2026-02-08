/**
 * @file eventTracker.js
 * Analytics batching + session management + optional GA forwarding.
 */

import { ANALYTICS_EVENTS, ERROR_CODES } from '../config/constants.js';

/**
 * @typedef {object} AuraEvent
 * @property {string} event
 * @property {any} data
 * @property {string} timestamp - ISO string
 * @property {string} sessionId
 */

/**
 * @param {string} key
 * @returns {string|null}
 */
function safeStorageGet(key) {
  try {
    return globalThis.localStorage?.getItem(key) || null;
  } catch {
    return null;
  }
}

/**
 * @param {string} key
 * @param {string} value
 */
function safeStorageSet(key, value) {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    // ignore
  }
}

function uuid() {
  // Small UUID-ish for demo (not crypto).
  return `s_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export class EventTracker {
  /**
   * @param {{
   *  enabled?: boolean,
   *  batchSize?: number,
   *  flushIntervalMs?: number,
   *  googleAnalytics?: {enabled?: boolean, measurementId?: string|null},
   *  onFlush?: (events: AuraEvent[])=>void
   * }=} opts
   */
  constructor(opts = {}) {
    this.enabled = opts.enabled !== false;
    this.batchSize = Number(opts.batchSize || 10);
    this.flushIntervalMs = Number(opts.flushIntervalMs || 5000);
    this.ga = {
      enabled: opts.googleAnalytics?.enabled !== false,
      measurementId: opts.googleAnalytics?.measurementId || null
    };
    this.onFlush = typeof opts.onFlush === 'function' ? opts.onFlush : null;

    this._queue = [];
    this._timer = null;
    this._sessionId = getOrCreateSessionId();
  }

  /**
   * @returns {string}
   */
  sessionId() {
    return this._sessionId;
  }

  /**
   * Start periodic flushing.
   */
  start() {
    if (!this.enabled) return;
    if (this._timer) return;
    this._timer = setInterval(() => this.flush(), this.flushIntervalMs);
    // Flush on unload best-effort
    try {
      globalThis.addEventListener('beforeunload', () => this.flush({ sync: true }));
    } catch {
      // ignore
    }
  }

  /**
   * Stop periodic flushing.
   */
  stop() {
    if (this._timer) clearInterval(this._timer);
    this._timer = null;
  }

  /**
   * Track an event (batched).
   * @param {string} event
   * @param {any=} data
   */
  track(event, data = {}) {
    if (!this.enabled) return;
    const evt = /** @type {AuraEvent} */ ({
      event,
      data,
      timestamp: new Date().toISOString(),
      sessionId: this._sessionId
    });
    this._queue.push(evt);
    forwardToGA(this.ga, evt);
    if (this._queue.length >= this.batchSize) this.flush();
  }

  /**
   * Flush queued events.
   * @param {{sync?: boolean}=} opts
   * @returns {AuraEvent[]}
   */
  flush(opts = {}) {
    if (!this.enabled) return [];
    if (!this._queue.length) return [];
    const batch = this._queue.splice(0, this._queue.length);
    if (this.onFlush) {
      try {
        this.onFlush(batch);
      } catch (e) {
        // eslint-disable-next-line no-console
        if (!opts.sync) console.warn('AURA onFlush failed', analyticsError(e));
      }
    }
    return batch;
  }
}

function getOrCreateSessionId() {
  const key = 'aura_session_id';
  const existing = safeStorageGet(key);
  if (existing) return existing;
  const id = uuid();
  safeStorageSet(key, id);
  return id;
}

/**
 * Forward to GA if gtag is present.
 * @param {{enabled:boolean, measurementId:string|null}} ga
 * @param {AuraEvent} evt
 */
function forwardToGA(ga, evt) {
  if (!ga.enabled) return;
  const gtag = globalThis.gtag;
  if (typeof gtag !== 'function') return;
  try {
    // Map event name and include sessionId for correlation.
    gtag('event', evt.event, { ...evt.data, session_id: evt.sessionId });
  } catch {
    // ignore
  }
}

function analyticsError(cause) {
  const err = new Error('Analytics failed');
  err.code = ERROR_CODES.ANALYTICS_FAILED;
  err.cause = cause;
  return err;
}

export { ANALYTICS_EVENTS };

