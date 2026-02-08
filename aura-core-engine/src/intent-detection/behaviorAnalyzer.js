/**
 * @file behaviorAnalyzer.js
 * Lightweight behavior tracking (scroll/click/time). For hackathon demo we support simulation.
 */

/**
 * @typedef {object} BehaviorSnapshot
 * @property {number} timeOnPageMs
 * @property {number} scrollDepth - 0..1
 * @property {number} clickCount
 * @property {number} engagementScore - 0..1
 */

export class BehaviorAnalyzer {
  /**
   * @param {{now?: ()=>number, enableListeners?: boolean}=} opts
   */
  constructor(opts = {}) {
    this._now = opts.now || (() => Date.now());
    this._enableListeners = !!opts.enableListeners;

    this._startTs = this._now();
    this._clickCount = 0;
    this._maxScrollY = 0;

    this._onScroll = () => {
      try {
        this._maxScrollY = Math.max(this._maxScrollY, globalThis.scrollY || 0);
      } catch {
        // ignore
      }
    };

    this._onClick = () => {
      this._clickCount++;
    };
  }

  /**
   * Start listening (optional).
   */
  start() {
    if (!this._enableListeners) return;
    try {
      globalThis.addEventListener('scroll', this._onScroll, { passive: true });
      globalThis.addEventListener('click', this._onClick, { passive: true });
    } catch {
      // ignore
    }
  }

  /**
   * Stop listening.
   */
  stop() {
    if (!this._enableListeners) return;
    try {
      globalThis.removeEventListener('scroll', this._onScroll);
      globalThis.removeEventListener('click', this._onClick);
    } catch {
      // ignore
    }
  }

  /**
   * Simulate behavior for demos/tests.
   * @param {{timeOnPageMs?: number, scrollDepth?: number, clickCount?: number}} sim
   */
  simulate(sim = {}) {
    if (Number.isFinite(sim.timeOnPageMs)) this._startTs = this._now() - Math.max(0, sim.timeOnPageMs);
    if (Number.isFinite(sim.clickCount)) this._clickCount = Math.max(0, sim.clickCount);
    if (Number.isFinite(sim.scrollDepth)) {
      const depth = clamp01(sim.scrollDepth);
      // Store as maxScrollY proxy using document height when available.
      const docH = safeDocHeight();
      this._maxScrollY = depth * docH;
    }
  }

  /**
   * Current snapshot.
   * @returns {BehaviorSnapshot}
   */
  snapshot() {
    const timeOnPageMs = Math.max(0, this._now() - this._startTs);
    const scrollDepth = estimateScrollDepth(this._maxScrollY);
    const clickCount = this._clickCount;
    const engagementScore = clamp01(
      0.45 * normalizeTime(timeOnPageMs) + 0.35 * scrollDepth + 0.2 * normalizeClicks(clickCount)
    );
    return { timeOnPageMs, scrollDepth, clickCount, engagementScore };
  }
}

function normalizeTime(ms) {
  // 0..1 where 30s is "fully engaged" for demo purposes
  return clamp01(ms / 30000);
}

function normalizeClicks(n) {
  // 0..1 where 5 clicks saturates
  return clamp01(n / 5);
}

function estimateScrollDepth(maxScrollY) {
  const docH = safeDocHeight();
  const vh = safeViewportHeight();
  const denom = Math.max(1, docH - vh);
  return clamp01(maxScrollY / denom);
}

function safeDocHeight() {
  try {
    const d = globalThis.document;
    const el = d?.documentElement;
    return Math.max(el?.scrollHeight || 0, el?.offsetHeight || 0, 1000);
  } catch {
    return 1000;
  }
}

function safeViewportHeight() {
  try {
    return Math.max(1, globalThis.innerHeight || 1);
  } catch {
    return 1;
  }
}

function clamp01(v) {
  return Math.max(0, Math.min(1, Number(v) || 0));
}

