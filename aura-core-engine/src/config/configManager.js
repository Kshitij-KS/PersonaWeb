/**
 * @file configManager.js
 * Centralized configuration with deep merge, dot-notation get/set, env defaults, and validation.
 */

import { DEFAULT_CONFIG, DEFAULT_ENV, ERROR_CODES } from './constants.js';

/**
 * Check for plain object (not Array, not null, not Date).
 * @param {any} v
 * @returns {v is Record<string, any>}
 */
function isPlainObject(v) {
  return !!v && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype;
}

/**
 * Deep merge `source` into `target` without mutating inputs.
 * Arrays are replaced (not concatenated).
 * @param {Record<string, any>} target
 * @param {Record<string, any>} source
 * @returns {Record<string, any>}
 */
export function deepMerge(target, source) {
  const out = { ...target };
  for (const [k, v] of Object.entries(source || {})) {
    if (isPlainObject(v) && isPlainObject(out[k])) out[k] = deepMerge(out[k], v);
    else out[k] = v;
  }
  return out;
}

/**
 * Resolve environment using config override, or heuristics.
 * @param {any} envOverride
 * @returns {'development'|'production'}
 */
export function detectEnv(envOverride) {
  if (envOverride === 'development' || envOverride === 'production') return envOverride;
  // Browser heuristic: localhost → development
  try {
    const h = globalThis?.location?.hostname;
    if (h === 'localhost' || h === '127.0.0.1') return 'development';
  } catch {
    // ignore
  }
  return DEFAULT_ENV;
}

/**
 * @typedef {Record<string, any>} AuraConfig
 */

export class ConfigManager {
  /**
   * @param {Partial<AuraConfig>=} initial
   */
  constructor(initial = {}) {
    /** @type {AuraConfig} */
    this._config = deepMerge(DEFAULT_CONFIG, { ...initial, env: detectEnv(initial.env) });
    this.validate();
  }

  /**
   * Get config value by dot notation path (e.g. "analytics.enabled").
   * @param {string} path
   * @param {any=} fallback
   * @returns {any}
   */
  get(path, fallback = undefined) {
    if (!path) return this._config;
    const parts = String(path).split('.');
    let cur = this._config;
    for (const p of parts) {
      if (!cur || typeof cur !== 'object' || !(p in cur)) return fallback;
      cur = cur[p];
    }
    return cur;
  }

  /**
   * Set config value by dot notation path.
   * @param {string} path
   * @param {any} value
   */
  set(path, value) {
    if (!path) return;
    const parts = String(path).split('.');
    const next = structuredCloneSafe(this._config);
    let cur = next;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!isPlainObject(cur[p])) cur[p] = {};
      cur = cur[p];
    }
    cur[parts[parts.length - 1]] = value;
    this._config = next;
    this.validate();
  }

  /**
   * Update config using deep merge.
   * @param {Partial<AuraConfig>} partial
   */
  update(partial) {
    if (!partial || typeof partial !== 'object') return;
    const normalized = { ...partial };
    if ('env' in normalized) normalized.env = detectEnv(normalized.env);
    this._config = deepMerge(this._config, normalized);
    this.validate();
  }

  /**
   * Return a safe clone of config (so callers can't mutate internals).
   * @returns {AuraConfig}
   */
  snapshot() {
    return structuredCloneSafe(this._config);
  }

  /**
   * Validate key config invariants and throw errors early.
   */
  validate() {
    const c = this._config;
    if (c.env !== 'development' && c.env !== 'production') {
      throw auraConfigError(`Invalid env: ${String(c.env)}`);
    }
    if (typeof c.analytics?.enabled !== 'boolean') {
      throw auraConfigError('analytics.enabled must be boolean');
    }
    if (!Number.isFinite(c.analytics?.batchSize) || c.analytics.batchSize <= 0) {
      throw auraConfigError('analytics.batchSize must be a positive number');
    }
    if (!Number.isFinite(c.analytics?.flushIntervalMs) || c.analytics.flushIntervalMs <= 0) {
      throw auraConfigError('analytics.flushIntervalMs must be a positive number');
    }
    if (!Number.isFinite(c.decision?.maxDecisionMs) || c.decision.maxDecisionMs <= 0) {
      throw auraConfigError('decision.maxDecisionMs must be a positive number');
    }
  }
}

/**
 * @param {string} message
 */
function auraConfigError(message) {
  const err = new Error(message);
  err.code = ERROR_CODES.INVALID_CONFIG;
  return err;
}

/**
 * structuredClone fallback for environments without it.
 * @template T
 * @param {T} v
 * @returns {T}
 */
function structuredCloneSafe(v) {
  // Modern browsers + Node 18+ have structuredClone.
  if (typeof globalThis.structuredClone === 'function') return globalThis.structuredClone(v);
  return /** @type {T} */ (JSON.parse(JSON.stringify(v)));
}

