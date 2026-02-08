import { RuleBasedEngine } from '../src/decision-engine/ruleBasedEngine.js';
import { collectSignals } from '../src/intent-detection/signalsCollector.js';

const { assert, eq } = globalThis.__AURA_TEST__;

export async function run() {
  const engine = new RuleBasedEngine();

  {
    const s = collectSignals({ url: 'https://example.com/?intent=buy_now' });
    const d = engine.decide(s);
    eq(d.intent, 'buy_now');
    eq(d.templateId, 'hero-a');
    assert(d.confidence >= 0.8);
    assert(!!d.heroImageId);
    assert(!!d.reason);
  }

  {
    const s = collectSignals({ url: 'https://example.com/', referrer: 'https://www.google.com/search?q=aura' });
    const d = engine.decide(s);
    eq(d.intent, 'research');
    eq(d.templateId, 'hero-b');
    assert(!!d.heroImageId);
  }

  {
    // No url/referrer → use time/device or fallback
    const s = collectSignals({
      url: 'https://example.com/',
      referrer: null,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      now: new Date('2026-02-08T02:00:00Z')
    });
    const d = engine.decide(s);
    assert(['impulse', 'buy_now', 'compare', 'research'].includes(d.intent));
    assert(d.confidence >= 0.3);
  }

  {
    const s = collectSignals({ persona: 'gaming' });
    const d = engine.decide(s);
    eq(d.intent, 'use_case');
    eq(d.templateId, 'hero-d');
  }
}

