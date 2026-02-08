# PersonaWeb.ai

**Every visitor gets a different website. Automatically.**

> AI-powered plug-and-play website personalization. One script tag. Zero dependencies. Instant results.

Built for **MIT HackNation 2026** — VC Track

---

## What It Does

PersonaWeb.ai is a single JavaScript snippet that transforms any website's hero section based on visitor intent. A gamer from Reddit sees a gaming-themed hero. A deal hunter from an email campaign sees a flash sale. A researcher from Google sees specs and comparisons.

**No backend needed. No config needed. Just paste one script tag.**

## Quick Start

```html
<!-- Add before </body> on any page -->
<script src="personaweb.js"></script>
```

That's it. PersonaWeb auto-detects the hero section and personalizes it.

### Local demo (with AURA Core Engine)

From repo root:

```bash
cd aura-core-engine
npm i
npm run build
```

Then open `frontend/demo/store.html` in your browser. The snippet will load
`aura-core-engine/dist/aura-core.min.js` automatically and use the core
decision engine.

## Live Demo

| Visitor Type | Demo URL |
|---|---|
| Direct Buyer | `demo/store.html?utm_source=google&utm_term=buy+4k+monitor` |
| Researcher | `demo/store.html?utm_source=google&utm_term=best+monitor+2026+comparison` |
| Gamer | `demo/store.html?utm_source=reddit&utm_campaign=gaming+fps+rgb` |
| Deal Hunter | `demo/store.html?utm_source=email&utm_campaign=flash+sale+discount` |
| Default | `demo/store.html` |

## Architecture

```
personaweb.js (single injectable file)
│
├── TEMPLATE_REGISTRY    4 hero templates with content slots (JSON data)
├── ASSET_LIBRARY        6 curated images mapped to intents
├── SignalCollector       UTM params + referrer + page context (3 signals)
├── DecisionEngine       AuraCore (local rules) with explainable reason
├── Renderer             Safe DOM injection + cross-fade transitions
├── DebugPanel           Preview mode + signal inspector + decision viewer
├── Analytics            CTA click tracking + template view logging
├── BackendHook          Optional API swap (future)
└── PublicAPI            PersonaWeb.init() / .preview() / .getDecision()
```

## Decision Object

Every personalization decision is fully explainable:

```json
{
  "intent": "GAMING",
  "template": "gaming",
  "hero_image": "https://images.unsplash.com/...",
  "headline": "240Hz. 1ms. Game Over.",
  "cta": "Buy Now",
  "confidence": 92,
  "reason": "utm_campaign contains 'gaming' (+3); referrer is social (+2)",
  "signals": [...],
  "scores": { "buy_now": 1, "compare": 0, "gaming": 6, "budget": 0 }
}
```

## Features

- **Multi-Signal Detection** — Reads UTM params, referrer source, and page context
- **4 Hero Variants** — Buyer, Researcher, Gamer, Deal Hunter
- **Explainable AI** — Every decision includes a human-readable reason
- **Zero Dependencies** — Pure JavaScript, no frameworks, no build step
- **CSS Isolated** — All classes prefixed with `.pw-` for safe injection
- **Backend-Ready** — One-line config switches from local rules to API mode
- **Debug Panel** — Preview all variants, inspect signals, see decision reasoning
- **Safe Fallback** — Defaults to base content if detection fails
- **Bookmarklet** — Inject PersonaWeb onto any live website via DevTools

## Backend Integration

```javascript
// Default: AuraCore local rules engine (works offline)
// No config needed. AuraCore is loaded automatically.

// When backend is ready: one-line swap
PersonaWeb.init({
  // Optional: override AuraCore bundle location
  engineSrc: 'https://your-cdn.com/aura-core.min.js'
});
```

The API receives the collected signals and returns the same decision object format.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` | Preview: Direct Buyer |
| `2` | Preview: Researcher |
| `3` | Preview: Gamer |
| `4` | Preview: Deal Hunter |
| `D` | Toggle debug panel |
| `C` | Auto-cycle variants |
| `R` | Reset (re-run AI) |

## File Structure

```
personaweb.ai/
├── index.html          Landing page (the product)
├── personaweb.js       The engine (single injectable snippet)
├── personaweb.css      Widget + template styles
├── demo/
│   └── store.html      TechVault demo store (snippet installed)
└── README.md           This file
```

## Tech Stack

- **Frontend:** Pure HTML/CSS/JS — zero dependencies
- **Decision Engine:** Rule-based weighted scoring (API-ready)
- **Templates:** JSON-driven registry with themed CSS variants
- **Assets:** 6 curated Unsplash images mapped to intent categories
- **Injection:** Safe DOM mutation with CSS namespace isolation

## Team

**PersonaWeb.ai** — MIT HackNation 2026, VC Track

---

*"Personalization for the long tail — not just enterprises."*
