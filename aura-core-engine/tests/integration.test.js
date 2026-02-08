import { AuraCore } from '../src/core.js';

const { assert, eq } = globalThis.__AURA_TEST__;

export async function run() {
  const aura = new AuraCore({ debug: true, analytics: { enabled: false } });
  aura.init();
  const decision = await aura.personalize({
    url: 'https://example.com/?q=compare+pricing',
    referrer: 'https://www.google.com/search?q=aura',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    simulateBehavior: { timeOnPageMs: 5000, scrollDepth: 0.2, clickCount: 0 }
  });

  assert(!!decision.intent);
  assert(!!decision.templateId);
  assert(!!decision.heroImageId);
  assert(!!decision.reason);
  assert(typeof decision.content.headline === 'string');
  assert(typeof decision.content.ctaText === 'string');
  eq(typeof decision.confidence, 'number');

  aura.destroy();
}

