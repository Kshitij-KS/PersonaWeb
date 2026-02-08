/**
 * @file llmEngine.js
 * Optional LLM-driven decisioning stub (disabled by default).
 *
 * NOTE: For hackathon stability, Aura defaults to rule-based decisions.
 * This file exists as an extension point.
 */

/**
 * @typedef {object} LLMDecision
 * @property {string} intent
 * @property {number} confidence
 * @property {string} rationale
 */

export class LLMEngine {
  /**
   * @param {{enabled?: boolean, provider?: 'openai'|'anthropic'|'custom', endpoint?: string}=} opts
   */
  constructor(opts = {}) {
    this.enabled = !!opts.enabled;
    this.provider = opts.provider || 'custom';
    this.endpoint = opts.endpoint || null;
  }

  /**
   * Produce a decision from signals.
   * @param {any} _signals
   * @returns {Promise<LLMDecision|null>}
   */
  async decide(_signals) {
    if (!this.enabled) return null;
    // Intentionally not implemented to avoid adding runtime dependencies.
    // In a full product, call your backend/edge function here.
    return null;
  }
}

