import { analyzeUrl } from '../src/intent-detection/urlAnalyzer.js';
import { analyzeReferrer } from '../src/intent-detection/referrerAnalyzer.js';
import { collectSignals } from '../src/intent-detection/signalsCollector.js';

const { assert, eq } = globalThis.__AURA_TEST__;

export async function run() {
  {
    const r = analyzeUrl('https://example.com/?intent=buy_now&utm_source=google&utm_term=best+pricing');
    eq(r.explicitIntent, 'buy_now');
    assert(r.confidence >= 0.9);
  }

  {
    const r = analyzeUrl('https://example.com/?q=compare+best+alternatives');
    eq(r.explicitIntent, null);
    eq(r.inferredIntent, 'compare');
    assert(r.confidence >= 0.6);
  }

  {
    const r = analyzeUrl('https://example.com/?q=gaming+monitor+for+design');
    eq(r.inferredIntent, 'use_case');
  }

  {
    const r = analyzeReferrer('https://www.google.com/search?q=aura');
    eq(r.category, 'search');
    eq(r.inferredIntent, 'research');
  }

  {
    const s = collectSignals({
      url: 'https://example.com/?q=cheap+deal',
      referrer: null,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      now: new Date('2026-02-08T12:00:00Z'),
      simulateBehavior: { timeOnPageMs: 12000, scrollDepth: 0.4, clickCount: 1 }
    });
    assert(!!s.url);
    assert(!!s.behavior);
    assert(s.device.device === 'desktop');
  }
}

