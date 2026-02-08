# AURA / PersonaWeb — Architecture & Demo Guide

This document explains how the system works end‑to‑end, how the frontend and core engine integrate, and how to demo it to judges.

---

## 1) What this product is (and is not)

**Is:** A plug‑and‑play personalization snippet that swaps hero content based on visitor intent using finite templates and assets.  
**Is not:** A full website generator or chatbot.

The system is safe by design:

- Finite **templates** (hero variants with defined slots)
- Finite **asset library** (curated images + badges)
- **Explainable** decisions (reason string + debug output)
- **Fallback** to safe default if signals are missing

---

## 2) High‑level architecture

```
frontend/personaweb.js  (snippet / widget)
  ├─ Collects signals (URL, referrer, persona)
  ├─ Loads AuraCore bundle (aura-core-engine/dist)
  ├─ Gets decision (intent, template, image, CTA, reason)
  ├─ Mutates DOM safely (hero update)
  └─ Shows debug panel (explainability + signals)

aura-core-engine/       (decision engine)
  ├─ Config manager (deep merge, validation)
  ├─ Intent detection (URL, referrer, behavior, device, persona)
  ├─ Template registry (3 hero templates)
  ├─ Asset library (6 images + 6 badges)
  ├─ Rule‑based engine (priority rules + confidence)
  └─ Analytics (batched event tracking)
```

---

## 3) Core flow (runtime)

1) **Snippet loads** (`frontend/personaweb.js`)  
2) **Signals collected**  
   - URL/UTM params, referrer, page context  
   - Optional `persona` parameter for demos  
3) **AuraCore decision**  
   - Priority rules (explicit URL intent → referrer → time/device → fallback)  
   - Returns explainable decision object  
4) **Frontend maps decision → templates**  
   - Intent mapped to template & asset IDs  
   - CTA/headline/subheadline applied  
5) **DOM mutation**  
   - Hero section updated safely  
6) **Debug panel** (optional)  
   - Shows intent, confidence, reason, signals  

---

## 4) Decision object (what the frontend receives)

Example decision from AuraCore:

```json
{
  "intent": "compare",
  "templateId": "hero-b",
  "heroImageId": "img-2",
  "hero_image": "img-2",
  "cta": { "ctaText": "Compare", "ctaHref": "#compare" },
  "content": {
    "headline": "Compare options in seconds",
    "subheadline": "Explore features, pricing, and what makes AURA different.",
    "ctaText": "Compare",
    "ctaHref": "#compare",
    "badgeId": "badge-3",
    "imageId": "img-2"
  },
  "confidence": 0.7,
  "reason": "Query/UTM matched patterns (compare), indicating intent."
}
```

The frontend maps `intent` and `heroImageId` into its own hero templates and image URLs.

---

## 5) Signals used (intent detection)

The core engine uses multiple signals (minimum 2 required by spec):

- **URL / UTM** (strongest signal)  
  Example: `?intent=buy_now` or `?utm_term=best+monitor+vs`  
- **Referrer type**  
  Search → research, Social → impulse, Email → buy_now  
- **Persona override** (demo)
  Example: `?persona=gaming`  
- **Device / Time** (fallback signals)

---

## 6) Templates & assets (finite, safe)

**Templates:** 3 hero templates  
`hero-a` (action‑focused), `hero-b` (comparison/info), `hero-c` (value/budget)

**Assets:** 6 images, 6 badges  
Image selection is **intent‑driven** (not random).

---

## 7) Frontend integration mapping (AuraCore → PersonaWeb)

The demo frontend has its own hero themes (`buy_now`, `compare`, `gaming`, `budget`).
AuraCore intents are mapped into those demo themes for visual clarity:

- `buy_now` → `buy_now`  
- `compare` / `research` → `compare`  
- `use_case` → `gaming`  
- `budget` → `budget`  
- `impulse` → `buy_now`

AuraCore image IDs are mapped to the frontend image library:

```
img-1 → product_hero
img-2 → comparison
img-3 → office_desk
img-4 → gaming_setup
img-5 → sale_graphic
img-6 → design_studio
```

---

## 8) How to test (local)

### Step 1: Build AuraCore
```bash
cd aura-core-engine
npm i
npm run build
```

### Step 2: Open the demo page
Open: `frontend/demo/store.html`

### Step 3: Try demo intents

- **Buy Now**  
  `store.html?intent=buy_now`
- **Compare**  
  `store.html?q=best+monitor+vs+2026`
- **Use Case**  
  `store.html?persona=gaming`
- **Budget**  
  `store.html?q=cheap+144hz`
- **Fallback**  
  `store.html`

### Step 4: Show explainability

Press `D` to show the debug panel and highlight:

- intent  
- confidence  
- reason  
- signals  

---

## 9) Judge demo script (2–3 minutes)

1. **“One script tag installs it.”**  
   Show the snippet in `frontend/README.md`.
2. **“Different intents, different hero.”**  
   Open 2–3 URLs with different query params.
3. **“Explainable AI.”**  
   Toggle the debug panel and show the `reason`.
4. **“Safe fallback.”**  
   Open the page without signals → default hero.
5. **“No backend required.”**  
   Explain AuraCore is local rules engine (API‑ready later).

---

## 10) Files of interest

- `frontend/personaweb.js` — snippet / widget  
- `frontend/demo/store.html` — e‑commerce demo  
- `aura-core-engine/src/core.js` — AuraCore orchestration  
- `aura-core-engine/src/decision-engine/ruleBasedEngine.js` — priority rules + reasons  
- `aura-core-engine/dist/aura-core.min.js` — bundle used by frontend

