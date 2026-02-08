# SmartHero Demo — Member B (Frontend)

> PersonaWeb.ai dynamic hero personalization engine — frontend demo

## Quick Start

1. Open `index.html` in your browser
2. That's it. No build step. No dependencies.

## Controls

| Action | Method |
|--------|--------|
| Switch to Gamer | Press `1` or click 🎮 in debug panel |
| Switch to Researcher | Press `2` or click 🔍 in debug panel |
| Switch to Budget | Press `3` or click 💰 in debug panel |
| Auto-cycle templates | Press `C` or click ▶ Auto-Cycle |
| Reset demo | Press `R` or click 🔄 Reset |
| Drag debug panel | Click and drag the header bar |
| Minimize debug panel | Click the − button |

## URL Parameters

| Parameter | Example | Effect |
|-----------|---------|--------|
| `persona` | `?persona=gamer` | Force a specific template |
| `query` | `?query=rtx+4090+buy` | Simulate search query (AI picks) |

**Full examples:**
- `index.html?persona=researcher` — Opens with researcher template
- `index.html?query=cheap+monitor+deal` — AI selects budget template
- `index.html?query=rtx+4090+fps` — AI selects gamer template

## File Structure

```
member-b/
├── index.html             # Fake TechVault store page
├── smarthero-demo.js      # SmartHero engine (~250 lines)
├── smarthero-demo.css     # Isolated, namespaced styles
└── README.md              # You are here
```

## Templates

| # | Template | Theme | Key Visual |
|---|----------|-------|------------|
| 1 | 🎮 Gamer | Dark/neon green | Matrix grid, glowing CTA, parallax image, FPS badge |
| 2 | 🔍 Researcher | Clean white/blue | Spec cards, data-driven layout, comparison CTA |
| 3 | 💰 Budget | Urgent red/yellow | Countdown timer, strikethrough pricing, scarcity alert |

## Demo Script (2 minutes)

1. **Open `index.html`** — Gamer hero loads with pulsing brain + shimmer + progress bar
2. **"Watch the AI decide..."** — Add `?query=rtx+4090+review` to URL → researcher template
3. **Open debug panel** — Switch between personas manually, see toast notification + smooth transitions
4. **"Notice the completely different designs"** — Gamer (dark/neon) vs Budget (red/urgent)
5. **Turn on Auto-Cycle** — Press `C`, watch smooth transitions every 4 seconds
6. **Open DevTools** — Show `smarthero-demo.js` — "Under 250 lines of clean JavaScript"
7. **"Reset and replay"** — Press `R` to start fresh

## Integration with Member A

The frontend expects a decision object from the AI engine:

```javascript
// Member A provides:
{ template: 'gamer', confidence: 92 }

// Member B renders it beautifully.
```

To integrate: replace the `decide()` function in `smarthero-demo.js` with a real API call.

## Technical Notes

- **Zero dependencies** — Pure HTML/CSS/JS
- **Race-condition safe** — Rapid switching is guarded; no overlapping transitions
- **Auto-cycle uses setTimeout recursion** — No setInterval overlap
- **CSS isolation** — All classes prefixed with `smarthero-` for safe injection
- **Container reset** — `all: initial` available for real-site injection
- **No build process** — Just open the HTML file
- **Image fallback** — Graceful gradient placeholder if Unsplash fails
- **Toast notifications** — Visual feedback on every persona switch and CTA click
- **Smooth parallax** — requestAnimationFrame with lerped interpolation
