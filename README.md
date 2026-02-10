# WebPersona

WebPersona is a plug‑and‑play, safe, templatized website personalization layer built for SMBs. It uses a lightweight decision engine to detect intent and personalize hero content with finite templates and assets.

## Key capabilities

- Single script tag installation
- Multi‑signal intent detection (URL/UTM, referrer, persona, behavior)
- Finite templates and assets for safe personalization
- Explainable decisions (intent, template, image, CTA, reason)
- No backend required for the demo

## Quick start (local demo)

1) Build AuraCore:

```bash
cd aura-core-engine
npm i
npm run build
```

2) Open the demo page:

```
frontend/demo/store.html
```

## Repository structure

```
frontend/           # Plug-and-play snippet + demo pages
aura-core-engine/   # Decision engine + intent logic + build dist
```

## Documentation

- `frontend/README.md` — demo details and usage
- `ARCHITECTURE.md` — system architecture and flow
- `DEPLOYMENT.md` — hosting and deployment guide
- `DEMO_README.md` — 1‑minute judge demo script
- `FUTURE_SCOPE.md` — post‑MVP roadmap
