# PersonaWeb.ai — 1‑Minute Demo Guide

This is a quick, judge‑friendly walkthrough you can use live.

---

## 0) One‑time setup (local)

```bash
cd aura-core-engine
npm i
npm run build
```

Open: `frontend/demo/store.html`

---

## 1) 1‑Minute Demo Script (talk track)

**0:00–0:10 — Install**

“It’s a single script tag. No backend. No setup.”

**0:10–0:30 — Different intents, different hero**

Open these URLs and show the hero changes:

- **Buy Now**  
  `store.html?intent=buy_now`
- **Compare**  
  `store.html?q=best+monitor+vs+2026`
- **Use Case**  
  `store.html?persona=gaming`
- **Budget**  
  `store.html?q=cheap+144hz`

**0:30–0:45 — Explainability**

Press **D** to open the debug panel.

“Every decision is explainable — intent, confidence, reason, and signals.”

**0:45–1:00 — Safety**

Open `store.html` with no parameters.

“No signals? We fall back safely to a default hero.”

---

## 2) If judges want the “why”

Show the `reason` string in the debug panel:

- “Query/UTM matched patterns (compare), indicating intent.”
- “Referrer category ‘search’ suggests intent.”
- “Persona override set to ‘gaming’, using matching intent.”

---

## 3) If judges ask about plug‑and‑play

Show the install snippet in `frontend/README.md`:

```html
<script src="personaweb.js"></script>
```

Mention:  
- Snippet auto‑loads AuraCore decision engine  
- Only templates + finite assets are used (safe)  
- Runs on any static page

---

## 4) Optional 2‑minute extended demo

1. Toggle **D** for debug  
2. Use keyboard: `1`, `2`, `3`, `4` for variant previews  
3. Press `C` for auto‑cycle  
4. Show console logs with the decision object

