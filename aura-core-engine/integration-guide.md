# AURA Core Engine – Integration Guide (Person 2)

This core engine is designed to be integrated via a single `<script>` tag and a global `AuraCore` class.

## 1) Install (Script Tag)

```html
<script src="./dist/aura-core.min.js"></script>
<script>
  const aura = new AuraCore({
    env: "development",
    debug: true,
    analytics: { enabled: true }
  });
  aura.init();
  const decision = await aura.personalize({
    url: location.href,
    referrer: document.referrer
  });
  applyHero(decision);
</script>
```

## 2) Decision Payload Contract

The engine returns a structured decision object:

```json
{
  "intent": "compare",
  "templateId": "hero-b",
  "heroImageId": "img-2",
  "hero_image": "img-2",
  "cta": { "ctaText": "Compare", "ctaHref": "#compare" },
  "content": {
    "headline": "Compare options in seconds",
    "subheadline": "...",
    "ctaText": "Compare",
    "ctaHref": "#compare",
    "badgeId": "badge-3",
    "imageId": "img-2"
  },
  "confidence": 0.7,
  "reason": "Query/UTM matched patterns (compare), indicating intent."
}
```

Use `templateId` to pick layout, and `content` for slot values.

## 3) DOM Swap Example (safe)

```html
<section id="hero">
  <img id="hero-img" alt="">
  <h1 id="hero-title"></h1>
  <p id="hero-sub"></p>
  <a id="hero-cta" href="#"></a>
</section>
```

```js
function applyHero(decision) {
  document.getElementById("hero-img").src = resolveImageUrl(decision.heroImageId);
  document.getElementById("hero-title").textContent = decision.content.headline;
  document.getElementById("hero-sub").textContent = decision.content.subheadline;
  const cta = document.getElementById("hero-cta");
  cta.textContent = decision.content.ctaText;
  cta.href = decision.content.ctaHref;
}
```

## 4) Demo Persona Toggle (optional)

Use `persona` to force an intent for demo:

```js
const decision = await aura.personalize({
  persona: "gaming", // maps to USE_CASE intent
});
```

Supported examples: `gaming`, `coding`, `design`, `buy`, `compare`, `budget`, `research`.

## 5) Demo Scenarios (5)

1. **Buy Now**: `?intent=buy_now` → `hero-a`, CTA `Start now`
2. **Compare**: `?q=best+monitor+vs+2026` → `hero-b`, CTA `Compare`
3. **Use Case**: `persona=gaming` → `hero-b`, use-case image
4. **Budget**: `?q=cheap+144hz` → `hero-c`, CTA `See pricing`
5. **Research**: referrer from Google search → `hero-b`, CTA `Learn more`

## 6) Error Handling / Debug

If `debug` is enabled in config, decisions include `decision.debug` with signal data and timing. Use this for demo overlays.

