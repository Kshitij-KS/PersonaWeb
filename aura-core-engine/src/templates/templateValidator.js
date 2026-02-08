/**
 * @file templateValidator.js
 * Validates and normalizes template content for safe rendering.
 */

import { ERROR_CODES } from '../config/constants.js';
import { getTemplate } from './templateRegistry.js';
import { getAsset } from './assetLibrary.js';

/**
 * @typedef {object} NormalizedTemplatePayload
 * @property {string} templateId
 * @property {Record<string, any>} content
 * @property {Record<string, any>} meta
 */

/**
 * Normalize content against a template:
 * - fills missing slots from defaults
 * - enforces restrictions
 * - validates asset IDs
 * @param {string} templateId
 * @param {Record<string, any>=} content
 * @param {Record<string, any>=} meta
 * @returns {NormalizedTemplatePayload}
 */
export function normalizeTemplatePayload(templateId, content = {}, meta = {}) {
  const tpl = getTemplate(templateId);
  if (!tpl) throw templateError(`Unknown templateId: ${String(templateId)}`);

  const out = { ...tpl.defaults, ...(content || {}) };

  // Enforce headline length
  if (typeof out.headline === 'string') {
    out.headline = out.headline.trim().slice(0, tpl.restrictions.maxHeadlineChars);
  }

  // Ensure slot presence
  for (const slot of tpl.slots) {
    if (!(slot in out)) out[slot] = tpl.defaults[slot] ?? null;
  }

  // Validate assets
  if (out.imageId && !getAsset('image', out.imageId)) out.imageId = tpl.defaults.imageId;
  if (out.badgeId && !getAsset('badge', out.badgeId)) out.badgeId = tpl.defaults.badgeId;

  return {
    templateId: tpl.id,
    content: out,
    meta: {
      type: tpl.type,
      name: tpl.name,
      layout: tpl.layout,
      ...meta
    }
  };
}

/**
 * Validate a template definition (for future custom templates).
 * @param {any} template
 * @returns {boolean}
 */
export function validateTemplateDefinition(template) {
  if (!template || typeof template !== 'object') return false;
  if (!template.id || typeof template.id !== 'string') return false;
  if (!Array.isArray(template.slots) || !template.slots.length) return false;
  if (!template.defaults || typeof template.defaults !== 'object') return false;
  return true;
}

function templateError(message) {
  const err = new Error(message);
  err.code = ERROR_CODES.INVALID_TEMPLATE;
  return err;
}

