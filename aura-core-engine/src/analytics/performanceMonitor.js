/**
 * @file performanceMonitor.js
 * Measures core latencies (init, decision time) and provides lightweight stats.
 */

function nowMs() {
  try {
    return globalThis.performance?.now?.() ?? Date.now();
  } catch {
    return Date.now();
  }
}

export class PerformanceMonitor {
  constructor() {
    this._marks = new Map();
    this._samples = {
      initMs: [],
      decisionMs: []
    };
  }

  /**
   * Mark the start of a named timer.
   * @param {string} name
   */
  start(name) {
    this._marks.set(name, nowMs());
  }

  /**
   * Mark the end of a named timer and record sample.
   * @param {'init'|'decision'} bucket
   * @param {string} name
   * @returns {number} elapsed ms
   */
  end(bucket, name) {
    const s = this._marks.get(name);
    const e = nowMs();
    const dt = typeof s === 'number' ? Math.max(0, e - s) : 0;
    this._marks.delete(name);
    const list = this._samples[`${bucket}Ms`];
    if (Array.isArray(list)) list.push(dt);
    return dt;
  }

  /**
   * Get summary stats.
   */
  summary() {
    return {
      init: summarize(this._samples.initMs),
      decision: summarize(this._samples.decisionMs)
    };
  }
}

function summarize(samples) {
  const arr = samples.slice(-50); // keep last 50
  if (!arr.length) return { count: 0, avgMs: 0, p95Ms: 0, maxMs: 0 };
  const sorted = [...arr].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const p95 = sorted[Math.floor(0.95 * (sorted.length - 1))];
  return {
    count: sorted.length,
    avgMs: sum / sorted.length,
    p95Ms: p95,
    maxMs: sorted[sorted.length - 1]
  };
}

