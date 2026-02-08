/**
 * @file aura-interface.js
 * Thin integration layer for Person 2 (frontend) with stable types and usage helpers.
 *
 * Person 2 should NOT import from src/. Use dist bundles for browser usage.
 */

/**
 * @typedef {object} AuraInitConfig
 * @property {'development'|'production'=} env
 * @property {boolean=} debug
 * @property {{enabled?: boolean, batchSize?: number, flushIntervalMs?: number, googleAnalytics?: {enabled?: boolean, measurementId?: string|null}}=} analytics
 * @property {{defaultTemplateId?: string}=} templates
 */

/**
 * The decision payload returned to the frontend renderer.
 * @typedef {object} AuraDecisionPayload
 * @property {string} intent
 * @property {string} templateId
 * @property {string} heroImageId
 * @property {string} hero_image
 * @property {{ctaText:string, ctaHref:string}} cta
 * @property {{headline:string, subheadline:string, ctaText:string, ctaHref:string, badgeId?:string, imageId?:string}} content
 * @property {number} confidence
 * @property {string} reason
 * @property {any} debug
 */

/**
 * Minimal contract Person 2 relies on.
 * @typedef {object} AuraCorePublic
 * @property {string} version
 * @property {()=>void} init
 * @property {(partialConfig:any)=>void} updateConfig
 * @property {(ctx?:any)=>Promise<AuraDecisionPayload>} personalize
 * @property {(event:string, data?:any)=>void} track
 * @property {()=>any[]} flush
 * @property {()=>void} destroy
 */

/**
 * Example usage (script tag):
 *
 * ```html
 * <script src="./dist/aura-core.min.js"></script>
 * <script>
 *   const aura = new AuraCore({ debug: true });
 *   aura.init();
 *   const decision = await aura.personalize({ url: location.href, referrer: document.referrer });
 *   renderHero(decision.templateId, decision.content);
 * </script>
 * ```
 */

export const AURA_INTERFACE_VERSION = '1.0';

