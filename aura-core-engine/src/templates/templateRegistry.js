/**
 * @file templateRegistry.js
 * Built-in templates. Person 2 renders these using slots + layout metadata.
 */

import { TEMPLATE_IDS } from '../config/constants.js';

/**
 * @typedef {object} HeroTemplate
 * @property {string} id
 * @property {string} type
 * @property {string} name
 * @property {string[]} slots
 * @property {Record<string, any>} defaults
 * @property {{maxHeadlineChars:number, allowedBadges:number, allowedImages:number}} restrictions
 * @property {{layout:'split'|'center'|'stack', emphasis:'cta'|'info'|'value'}} layout
 */

/** @type {HeroTemplate[]} */
export const BUILTIN_TEMPLATES = Object.freeze([
  {
    id: TEMPLATE_IDS.HERO_A,
    type: 'hero',
    name: 'Hero A (Action-focused)',
    slots: ['headline', 'subheadline', 'ctaText', 'ctaHref', 'badgeId', 'imageId'],
    defaults: {
      headline: 'Buy the monitor built to win',
      subheadline: '4K UHD, 240Hz, 1ms response. Ships today.',
      ctaText: 'Add to cart',
      ctaHref: '#buy-now',
      badgeId: 'badge-1',
      imageId: 'img-1'
    },
    restrictions: { maxHeadlineChars: 60, allowedBadges: 1, allowedImages: 1 },
    layout: { layout: 'split', emphasis: 'cta' }
  },
  {
    id: TEMPLATE_IDS.HERO_B,
    type: 'hero',
    name: 'Hero B (Comparison/Info)',
    slots: ['headline', 'subheadline', 'ctaText', 'ctaHref', 'badgeId', 'imageId'],
    defaults: {
      headline: 'Compare top monitors side-by-side',
      subheadline: 'Specs, benchmarks, and pricing in one view.',
      ctaText: 'Compare models',
      ctaHref: '#compare',
      badgeId: 'badge-3',
      imageId: 'img-2'
    },
    restrictions: { maxHeadlineChars: 70, allowedBadges: 1, allowedImages: 1 },
    layout: { layout: 'center', emphasis: 'info' }
  },
  {
    id: TEMPLATE_IDS.HERO_C,
    type: 'hero',
    name: 'Hero C (Value/Budget)',
    slots: ['headline', 'subheadline', 'ctaText', 'ctaHref', 'badgeId', 'imageId'],
    defaults: {
      headline: 'Premium display, smart price',
      subheadline: 'Limited-time savings without cutting quality.',
      ctaText: 'See deals',
      ctaHref: '#deals',
      badgeId: 'badge-2',
      imageId: 'img-3'
    },
    restrictions: { maxHeadlineChars: 60, allowedBadges: 1, allowedImages: 1 },
    layout: { layout: 'stack', emphasis: 'value' }
  },
  {
    id: TEMPLATE_IDS.HERO_D,
    type: 'hero',
    name: 'Hero D (Use Case)',
    slots: ['headline', 'subheadline', 'ctaText', 'ctaHref', 'badgeId', 'imageId'],
    defaults: {
      headline: 'Built for gaming, design, and coding',
      subheadline: 'Pick a monitor that matches your workflow.',
      ctaText: 'See use cases',
      ctaHref: '#use-cases',
      badgeId: 'badge-7',
      imageId: 'img-4'
    },
    restrictions: { maxHeadlineChars: 70, allowedBadges: 1, allowedImages: 1 },
    layout: { layout: 'split', emphasis: 'info' }
  },
  {
    id: TEMPLATE_IDS.HERO_E,
    type: 'hero',
    name: 'Hero E (Impulse/Promo)',
    slots: ['headline', 'subheadline', 'ctaText', 'ctaHref', 'badgeId', 'imageId'],
    defaults: {
      headline: 'Flash drop ends tonight',
      subheadline: 'Grab a limited run with bonus accessories.',
      ctaText: 'Claim offer',
      ctaHref: '#offer',
      badgeId: 'badge-4',
      imageId: 'img-8'
    },
    restrictions: { maxHeadlineChars: 60, allowedBadges: 1, allowedImages: 1 },
    layout: { layout: 'center', emphasis: 'cta' }
  }
]);

/**
 * Get a template by id.
 * @param {string} id
 * @returns {HeroTemplate|null}
 */
export function getTemplate(id) {
  return BUILTIN_TEMPLATES.find((t) => t.id === id) || null;
}

