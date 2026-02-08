# WebPersona / AURA — Complete Architecture Guide

This document is a comprehensive technical reference explaining how WebPersona works end‑to‑end. Use it to understand the system, learn from the code, and explain it to judges or teammates.

---

## Table of Contents

1. [What This Product Is](#1-what-this-product-is)
2. [System Overview](#2-system-overview)
3. [Repository Structure](#3-repository-structure)
4. [AuraCore Engine (Backend Logic)](#4-auracore-engine-backend-logic)
5. [Frontend Snippet (WebPersona.js)](#5-frontend-snippet-webpersonajs)
6. [Intent Detection Deep Dive](#6-intent-detection-deep-dive)
7. [Decision Engine Logic](#7-decision-engine-logic)
8. [Templates & Assets](#8-templates--assets)
9. [Frontend ↔ AuraCore Integration](#9-frontend--auracore-integration)
10. [Data Flow (Step by Step)](#10-data-flow-step-by-step)
11. [The Decision Object](#11-the-decision-object)
12. [Debug Panel & Explainability](#12-debug-panel--explainability)
13. [Secondary Personalization](#13-secondary-personalization)
14. [Analytics & Event Tracking](#14-analytics--event-tracking)
15. [Error Handling & Fallbacks](#15-error-handling--fallbacks)
16. [Testing the System](#16-testing-the-system)
17. [Key Files Reference](#17-key-files-reference)
18. [Glossary](#18-glossary)

---

## 1) What This Product Is

### The Problem
Most websites show the same homepage to every visitor — a gamer from Reddit sees the same hero as a budget shopper from an email campaign. Enterprise companies solve this with expensive personalization tools. SMBs can't.

### The Solution
WebPersona is a **plug‑and‑play personalization layer** that:
- Installs via a single `<script>` tag
- Detects visitor intent from multiple signals
- Swaps hero content using finite, safe templates
- Explains every decision with a human‑readable reason

### What It Is NOT
- Not a website generator
- Not a chatbot
- Not an AI that creates arbitrary content

The system is **safe by design** — it only uses predefined templates and curated assets.

---

## 2) System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              frontend/webpersona.js                      │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │   │
│   │  │   Signal    │  │   Template  │  │    Renderer     │  │   │
│   │  │  Collector  │  │   Registry  │  │  (DOM Mutator)  │  │   │
│   │  └──────┬──────┘  └─────────────┘  └────────┬────────┘  │   │
│   │         │                                    │           │   │
│   │         ▼                                    ▲           │   │
│   │  ┌─────────────────────────────────────────────────────┐│   │
│   │  │              AuraCore Integration Layer             ││   │
│   │  └─────────────────────────┬───────────────────────────┘│   │
│   └─────────────────────────────┼───────────────────────────┘   │
│                                 │                               │
│   ┌─────────────────────────────▼───────────────────────────┐   │
│   │           aura-core-engine/dist/aura-core.min.js        │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │   │
│   │  │   Intent    │  │   Rule      │  │    Template     │  │   │
│   │  │  Detection  │  │   Engine    │  │    Validator    │  │   │
│   │  └─────────────┘  └─────────────┘  └─────────────────┘  │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Two main components:**

1. **AuraCore Engine** (`aura-core-engine/`) — The decision brain. Detects intent, scores signals, picks templates, generates explainable decisions.

2. **WebPersona Snippet** (`frontend/webpersona.js`) — The frontend widget. Collects signals, calls AuraCore, renders the personalized hero, shows debug panel.

---

## 3) Repository Structure

```
WebPersona/
├── aura-core-engine/           # Decision engine (Person 1's work)
│   ├── src/
│   │   ├── config/
│   │   │   ├── constants.js        # Intent types, template IDs, mappings
│   │   │   └── configManager.js    # Deep merge, dot-notation config
│   │   ├── intent-detection/
│   │   │   ├── urlAnalyzer.js      # URL/UTM parsing + weighted scoring
│   │   │   ├── referrerAnalyzer.js # Traffic source categorization
│   │   │   ├── behaviorAnalyzer.js # Scroll/click/time tracking
│   │   │   └── signalsCollector.js # Unified signal aggregation
│   │   ├── templates/
│   │   │   ├── templateRegistry.js # 5 hero template definitions
│   │   │   ├── assetLibrary.js     # 10 images, 8 badges
│   │   │   └── templateValidator.js# Slot validation + defaults
│   │   ├── decision-engine/
│   │   │   ├── ruleBasedEngine.js  # Priority rules + confidence
│   │   │   ├── variantDecider.js   # A/B variant selection
│   │   │   └── llmEngine.js        # Optional LLM stub (not used)
│   │   ├── analytics/
│   │   │   ├── eventTracker.js     # Batched event tracking
│   │   │   └── performanceMonitor.js # Latency measurement
│   │   └── core.js                 # Main AuraCore class
│   ├── tests/                      # Unit + integration tests
│   ├── dist/                       # Built bundles (after npm run build)
│   ├── build.js                    # esbuild bundler script
│   └── package.json
│
├── frontend/                   # Frontend snippet (Person 2's work)
│   ├── webpersona.js               # Main injectable snippet
│   ├── webpersona.css              # Isolated styles (.pw- prefix)
│   ├── index.html                  # Landing page
│   ├── demo/
│   │   └── store.html              # TechVault e-commerce demo
│   └── README.md
│
├── ARCHITECTURE.md             # This file
├── DEPLOYMENT.md               # Hosting guide
├── DEMO_README.md              # 1-minute judge demo script
├── FUTURE_SCOPE.md             # Post-MVP roadmap
└── README.md                   # Project overview
```

---

## 4) AuraCore Engine (Backend Logic)

AuraCore is the **decision engine** that runs entirely in the browser. It has no server dependency.

### 4.1) Entry Point: `core.js`

The `AuraCore` class is the main orchestrator:

```javascript
const aura = new AuraCore({
  debug: true,
  analytics: { enabled: true }
});

aura.init();                          // Start analytics, log init event
const decision = await aura.personalize({
  url: location.href,
  referrer: document.referrer,
  persona: 'gaming'                   // Optional override
});
```

**Public methods:**
- `init()` — Initialize engine, start analytics
- `personalize(context)` — Collect signals + decide + return decision
- `collectSignals(context)` — Just collect signals (no decision)
- `decide(signals)` — Just decide (signals already collected)
- `track(event, data)` — Track custom analytics event
- `flush()` — Flush analytics batch
- `destroy()` — Cleanup

### 4.2) Configuration: `configManager.js`

Handles configuration with:
- **Deep merge** — Nested objects merge correctly
- **Dot notation** — `config.get('analytics.enabled')`
- **Validation** — Throws early on invalid config
- **Environment detection** — `localhost` → development mode

```javascript
const config = new ConfigManager({
  env: 'development',
  analytics: { enabled: true, batchSize: 10 }
});

config.get('analytics.enabled');  // true
config.set('debug', true);
config.update({ analytics: { batchSize: 20 } });
```

### 4.3) Constants: `constants.js`

Defines all enums and mappings:

```javascript
// Intent types (what we detect)
INTENT_TYPES = {
  BUY_NOW: 'buy_now',
  COMPARE: 'compare',
  BUDGET: 'budget',
  RESEARCH: 'research',
  IMPULSE: 'impulse',
  USE_CASE: 'use_case'
}

// Template IDs (what we render)
TEMPLATE_IDS = {
  HERO_A: 'hero-a',  // Action-focused
  HERO_B: 'hero-b',  // Comparison/Info
  HERO_C: 'hero-c',  // Value/Budget
  HERO_D: 'hero-d',  // Use Case
  HERO_E: 'hero-e'   // Impulse/Promo
}

// Intent → Template mapping
INTENT_TO_TEMPLATE = {
  buy_now: 'hero-a',
  impulse: 'hero-a',
  compare: 'hero-b',
  research: 'hero-b',
  use_case: 'hero-d',
  budget: 'hero-c'
}

// Intent → Image mapping
INTENT_TO_IMAGE = {
  buy_now: 'img-1',
  impulse: 'img-8',
  compare: 'img-2',
  research: 'img-3',
  use_case: 'img-4',
  budget: 'img-5'
}
```

---

## 5) Frontend Snippet (WebPersona.js)

The frontend snippet is a **single JavaScript file** that:
1. Auto-loads AuraCore bundle
2. Collects browser signals
3. Calls AuraCore for decision
4. Renders personalized hero
5. Shows optional debug panel

### 5.1) Auto-loading AuraCore

```javascript
function loadAuraCore() {
  return new Promise((resolve, reject) => {
    if (window.AuraCore) return resolve(window.AuraCore);
    const script = document.createElement('script');
    script.src = '../aura-core-engine/dist/aura-core.min.js';
    script.onload = () => resolve(window.AuraCore);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
```

### 5.2) Template Registry (Frontend)

The frontend has its own visual templates with themes:

```javascript
const TEMPLATES = {
  buy_now: {
    theme: 'bold',
    badge: { text: 'BEST SELLER', icon: '🏆' },
    headline: 'The Monitor You\'ve Been Looking For',
    subheadline: '32″ 4K UHD · 240Hz · Free Shipping Today',
    cta: { text: 'Add to Cart — $1,599', icon: '🛒' },
    image_key: 'product_hero'
  },
  compare: { /* ... */ },
  gaming: { /* ... */ },
  budget: { /* ... */ }
};
```

### 5.3) Asset Library (Frontend)

```javascript
const ASSETS = {
  product_hero:  'https://images.unsplash.com/...',
  gaming_setup:  'https://images.unsplash.com/...',
  comparison:    'https://images.unsplash.com/...',
  sale_graphic:  'https://images.unsplash.com/...',
  // ... 6 total images
};
```

---

## 6) Intent Detection Deep Dive

Intent detection happens in `aura-core-engine/src/intent-detection/`.

### 6.1) URL Analyzer (`urlAnalyzer.js`)

Parses URL and query parameters to infer intent.

**Explicit intent:**
```
?intent=buy_now        → buy_now (confidence: 0.9+)
?utm_intent=compare    → compare
```

**Inferred intent via weighted scoring:**
```javascript
const rules = [
  { id: 'buy_now', re: /\b(buy|purchase|order|checkout|add to cart)\b/g, weight: 3 },
  { id: 'compare', re: /\b(compare|vs|versus|best|benchmark|ranked)\b/g, weight: 2.5 },
  { id: 'budget',  re: /\b(cheap|budget|affordable|discount|deal)\b/g, weight: 2.5 },
  { id: 'research', re: /\b(review|guide|features|specs|ratings)\b/g, weight: 2 },
  { id: 'use_case', re: /\b(gaming|coding|design|creative|streaming)\b/g, weight: 2.2 },
  { id: 'impulse', re: /\b(limited time|flash sale|ends soon)\b/g, weight: 2.1 }
];
```

**How scoring works:**
1. Each keyword match adds `weight × count` to that intent's score
2. All intents are scored
3. Highest score wins
4. Confidence = `0.4 + min(0.55, score / 10)`

**Example:**
```
?q=best+gaming+monitor+vs+2026

Matches:
- "best" → compare (+2.5)
- "gaming" → use_case (+2.2)
- "vs" → compare (+2.5)

Scores:
- compare: 5.0
- use_case: 2.2

Winner: compare (confidence: 0.9)
```

### 6.2) Referrer Analyzer (`referrerAnalyzer.js`)

Categorizes traffic source and infers intent:

```javascript
const SEARCH_ENGINES = ['google.', 'bing.', 'duckduckgo.'];
const SOCIAL_SITES = ['twitter.com', 'reddit.com', 'facebook.com'];
const EMAIL_HINTS = ['mail.', 'gmail.', 'mailchi.mp'];

// Referrer → Category → Intent
search → RESEARCH (confidence: 0.45)
social → IMPULSE (confidence: 0.4)
email  → BUY_NOW (confidence: 0.5)
paid   → BUY_NOW (confidence: 0.55)
```

### 6.3) Behavior Analyzer (`behaviorAnalyzer.js`)

Tracks user behavior (first 5 seconds):

```javascript
{
  timeOnPageMs: 3500,      // Time since page load
  scrollDepth: 0.35,       // 0-1, how far they scrolled
  clickCount: 2,           // Number of clicks
  engagementScore: 0.45    // Weighted composite (0-1)
}
```

Engagement score formula:
```
engagementScore = 0.45 × (time / 5000) + 0.35 × scrollDepth + 0.2 × min(1, clicks / 3)
```

### 6.4) Signals Collector (`signalsCollector.js`)

Aggregates all signals into a unified object:

```javascript
{
  url: { /* URL analysis */ },
  referrer: { /* Referrer analysis */ },
  behavior: { /* Behavior snapshot */ },
  device: { userAgent: '...', device: 'desktop' },
  time: { iso: '2026-02-08T...', hour: 14, day: 0 },
  persona: { persona: 'gaming' }  // Optional override
}
```

---

## 7) Decision Engine Logic

The rule-based engine in `ruleBasedEngine.js` uses **priority order**:

```
Priority 0: Persona override (explicit demo control)
Priority 1: URL query intent (explicit or inferred)
Priority 2: Referrer-based intent
Priority 3: Time/day patterns
Priority 4: Device type patterns
Priority 5: Default fallback
```

**Code flow:**
```javascript
decide(signals) {
  // Priority 0: Persona override
  if (signals.persona?.persona) {
    return finalize(mapPersonaToIntent(persona), 0.75, 'persona_override');
  }

  // Priority 1: URL intent
  const urlIntent = signals.url?.explicitIntent || signals.url?.inferredIntent;
  if (urlIntent) {
    return finalize(urlIntent, signals.url.confidence, 'url_intent');
  }

  // Priority 2: Referrer intent
  const refIntent = signals.referrer?.inferredIntent;
  if (refIntent) {
    return finalize(refIntent, 0.45, 'referrer_intent');
  }

  // Priority 3-4: Time/Device heuristics
  // ...

  // Priority 5: Fallback
  return finalize('research', 0.3, 'default_fallback');
}
```

**Reason generation:**
```javascript
function reasonText(reasonKey, signals) {
  switch (reasonKey) {
    case 'persona_override':
      return `Persona override set to "${signals.persona}", using matching intent.`;
    case 'url_intent':
      const patterns = signals.url.matchedPatterns.join(', ');
      return `Query/UTM matched patterns (${patterns}), indicating intent.`;
    case 'referrer_intent':
      return `Referrer category "${signals.referrer.category}" suggests intent.`;
    // ...
  }
}
```

---

## 8) Templates & Assets

### 8.1) Template Registry (`templateRegistry.js`)

Each template has:
- **id** — Unique identifier
- **slots** — Content fields (headline, subheadline, ctaText, etc.)
- **defaults** — Default content for each slot
- **restrictions** — Validation rules (maxHeadlineChars, etc.)
- **layout** — Rendering hints (split, center, stack)

```javascript
{
  id: 'hero-a',
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
}
```

### 8.2) Asset Library (`assetLibrary.js`)

```javascript
const IMAGES = [
  { id: 'img-1', url: 'https://...', alt: 'Product hero' },
  { id: 'img-2', url: 'https://...', alt: 'Comparison' },
  // ... 10 total
];

const BADGES = [
  { id: 'badge-1', label: 'Fast setup' },
  { id: 'badge-2', label: 'Best value' },
  // ... 8 total
];
```

### 8.3) Template Validator (`templateValidator.js`)

Ensures content is safe:
- Fills missing slots with defaults
- Enforces character limits
- Validates asset IDs exist
- Returns normalized payload

```javascript
normalizeTemplatePayload('hero-a', {
  headline: 'Custom headline here'
});
// Returns complete payload with all slots filled
```

---

## 9) Frontend ↔ AuraCore Integration

The frontend maps AuraCore's generic intents to its own visual templates.

### 9.1) Intent Mapping

```javascript
const CORE_INTENT_MAP = {
  buy_now: 'buy_now',
  compare: 'compare',
  research: 'compare',   // Same visual as compare
  budget: 'budget',
  impulse: 'buy_now',    // Same visual as buy_now
  use_case: 'gaming'     // Maps to gaming theme
};
```

### 9.2) Image Mapping

```javascript
const CORE_IMAGE_MAP = {
  'img-1': ASSETS.product_hero,
  'img-2': ASSETS.comparison,
  'img-3': ASSETS.office_desk,
  'img-4': ASSETS.gaming_setup,
  'img-5': ASSETS.sale_graphic,
  'img-6': ASSETS.design_studio,
  // ...
};
```

### 9.3) Decision Adapter

```javascript
async function decideWithCore(signals) {
  const aura = await getAuraInstance();
  const coreDecision = await aura.personalize({
    url: location.href,
    referrer: document.referrer,
    persona: Signals.getPersona(signals),
    behavior: BehaviorTracker.snapshot()
  });

  // Map to frontend format
  return {
    intent: coreDecision.intent.toUpperCase(),
    template: CORE_INTENT_MAP[coreDecision.intent],
    hero_image: CORE_IMAGE_MAP[coreDecision.heroImageId],
    headline: coreDecision.content.headline,
    ctaText: coreDecision.cta.ctaText,
    confidence: normalizeConfidence(coreDecision.confidence),
    reason: coreDecision.reason,
    // ...
  };
}
```

---

## 10) Data Flow (Step by Step)

```
1. Page loads
   └─> webpersona.js executes

2. Snippet initialization
   └─> Auto-loads webpersona.css
   └─> Finds hero section (or creates one)
   └─> Builds debug panel (if enabled)

3. Signal collection (frontend)
   └─> URL params (utm_*, q, intent, persona)
   └─> Referrer
   └─> Page context (title, H1, meta)
   └─> Session storage (previous persona)
   └─> Behavior (time, scroll, clicks)

4. AuraCore loading
   └─> Dynamically loads aura-core.min.js
   └─> Creates AuraCore instance
   └─> Calls aura.init()

5. Personalization request
   └─> aura.personalize({ url, referrer, persona, behavior })

6. AuraCore processing
   └─> collectSignals()
       └─> urlAnalyzer.analyzeUrl()
       └─> referrerAnalyzer.analyzeReferrer()
       └─> (behavior passed from frontend)
   └─> engine.decide(signals)
       └─> Check persona override
       └─> Check URL intent
       └─> Check referrer intent
       └─> Fallback
   └─> normalizeTemplatePayload()
   └─> Return decision object

7. Frontend receives decision
   └─> Map intent → template
   └─> Map heroImageId → image URL
   └─> Build hero HTML
   └─> Inject into DOM
   └─> Apply secondary personalization

8. Debug panel update
   └─> Show intent, confidence, reason
   └─> Show signals list
```

---

## 11) The Decision Object

AuraCore returns this structure:

```json
{
  "intent": "compare",
  "templateId": "hero-b",
  "heroImageId": "img-2",
  "hero_image": "img-2",
  "cta": {
    "ctaText": "Compare models",
    "ctaHref": "#compare"
  },
  "content": {
    "headline": "Compare top monitors side-by-side",
    "subheadline": "Specs, benchmarks, and pricing in one view.",
    "ctaText": "Compare models",
    "ctaHref": "#compare",
    "badgeId": "badge-3",
    "imageId": "img-2"
  },
  "confidence": 0.7,
  "reason": "Query/UTM matched patterns (compare, vs), indicating intent.",
  "debug": {
    "reason": "...",
    "priority": 1,
    "decisionMs": 2.3,
    "signals": { /* full signals object */ }
  }
}
```

**Key fields:**
- `intent` — Detected intent type
- `templateId` — Which template to use
- `heroImageId` — Which image to show
- `cta` — Call-to-action text and link
- `content` — All slot values
- `confidence` — 0-1 confidence score
- `reason` — Human-readable explanation

---

## 12) Debug Panel & Explainability

Press `D` to toggle the debug panel.

**Features:**
- Intent + confidence display
- Reason string (explainability)
- Signal inspector (all collected signals)
- Preview buttons (manually switch templates)
- A/B click tracking
- Event log

**Keyboard shortcuts:**
- `1` — Preview buy_now
- `2` — Preview compare
- `3` — Preview gaming
- `4` — Preview budget
- `D` — Toggle debug panel
- `R` — Reset (re-run detection)
- `C` — Auto-cycle templates

---

## 13) Secondary Personalization

Beyond the hero, we also personalize:

```javascript
const SECONDARY_COPY = {
  buy_now: {
    productsTitle: 'Popular picks ready to ship',
    productsSubtitle: 'Top‑rated monitors with fast delivery.',
    announce: 'Free Shipping · Ships Today · Limited stock'
  },
  compare: {
    productsTitle: 'Compare specs by category',
    productsSubtitle: 'Side‑by‑side comparisons for any use case.',
    announce: 'Compare models · Expert reviews · Benchmarks'
  },
  // ...
};
```

This updates:
- Product section title/subtitle
- Announcement bar copy

---

## 14) Analytics & Event Tracking

`eventTracker.js` provides batched analytics:

```javascript
// Events tracked
ANALYTICS_EVENTS = {
  CORE_INIT: 'core_init',
  PERSONALIZATION: 'personalization',
  IMPRESSION: 'impression',
  CLICK: 'click',
  CONVERSION: 'conversion',
  ERROR: 'error'
}

// Event format
{
  event: 'personalization',
  data: { intent, template, confidence, decisionMs },
  timestamp: '2026-02-08T14:30:00.000Z',
  sessionId: 's_abc123_def456'
}
```

**Features:**
- Batching (flushes every 5s or on batch size)
- Session ID persistence (localStorage)
- Google Analytics forwarding (if gtag present)
- Performance timing

---

## 15) Error Handling & Fallbacks

The system is designed to **never break the page**:

1. **AuraCore fails to load** → Frontend uses local `LocalEngine`
2. **Unknown intent** → Falls back to default template
3. **Invalid template ID** → Uses default template
4. **Missing asset** → Uses template default asset
5. **Decision throws** → Shows graceful error with retry button

```javascript
try {
  const coreDecision = await decideWithCore(signals);
  const decision = coreDecision || await LocalEngine.decide(signals);
  await Render.show(decision);
} catch (err) {
  // Graceful degradation
  Render.heroEl.innerHTML = `
    <div style="padding:3rem;text-align:center">
      <p>⚠️ Personalization temporarily unavailable.</p>
      <button onclick="location.reload()">Retry</button>
    </div>`;
}
```

---

## 16) Testing the System

### Build AuraCore
```bash
cd aura-core-engine
npm install
npm run test    # Run unit tests
npm run build   # Generate dist/
```

### Run locally
```bash
# From repo root
python -m http.server 8000
# Open http://localhost:8000/frontend/demo/store.html
```

### Test different intents
```
?intent=buy_now           → Buy Now hero
?q=best+monitor+vs+2026   → Compare hero
?persona=gaming           → Gaming hero
?q=cheap+144hz            → Budget hero
(no params)               → Fallback hero
```

### Unit tests
Tests are in `aura-core-engine/tests/`:
- `intentDetection.test.js` — URL/referrer analysis
- `decisionEngine.test.js` — Rule engine logic
- `integration.test.js` — End-to-end flow

---

## 17) Key Files Reference

| File | Purpose |
|------|---------|
| `frontend/webpersona.js` | Main injectable snippet |
| `frontend/demo/store.html` | TechVault demo store |
| `aura-core-engine/src/core.js` | AuraCore orchestrator |
| `aura-core-engine/src/config/constants.js` | All enums and mappings |
| `aura-core-engine/src/intent-detection/urlAnalyzer.js` | Weighted keyword scoring |
| `aura-core-engine/src/decision-engine/ruleBasedEngine.js` | Priority rules + reasons |
| `aura-core-engine/src/templates/templateRegistry.js` | Template definitions |
| `aura-core-engine/dist/aura-core.min.js` | Built bundle |

---

## 18) Glossary

| Term | Definition |
|------|------------|
| **Intent** | The visitor's goal (buy_now, compare, budget, etc.) |
| **Signal** | A piece of context used to infer intent (URL param, referrer, etc.) |
| **Template** | A predefined hero layout with content slots |
| **Slot** | A content field in a template (headline, ctaText, imageId) |
| **Decision** | The engine's output: intent + template + content + reason |
| **Confidence** | 0-1 score indicating how sure we are about the intent |
| **Reason** | Human-readable explanation of why this decision was made |
| **Fallback** | Default behavior when signals are missing or ambiguous |
| **Persona** | An explicit intent override for demos (`?persona=gaming`) |

---

## Summary

WebPersona is a **safe, explainable, plug-and-play personalization system**:

1. **Signals** are collected from URL, referrer, behavior, and optional overrides
2. **AuraCore** scores signals using weighted rules and picks the best intent
3. **Templates** define finite, safe content variations
4. **Frontend** maps decisions to visual themes and renders the hero
5. **Every decision is explainable** with a human-readable reason string

The system is designed for **SMBs** who want enterprise-level personalization without the complexity or cost.
