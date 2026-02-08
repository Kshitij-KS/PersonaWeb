# AURA Core Engine

Dependency-free browser personalization engine for the MIT Hackathon demo.

## Quick start (script tag)

1. Build:

```bash
cd aura-core-engine
npm i
npm run build
```

2. Include:

```html
<script src="./dist/aura-core.min.js"></script>
<script>
  const aura = new AuraCore({
    env: "development",
    analytics: { enabled: true }
  });
  aura.init();
  aura.personalize().then((decision) => console.log(decision));
</script>
```

## Public API (stable)

- `new AuraCore(config?)`
- `init()`
- `updateConfig(partialConfig)`
- `collectSignals(context?)`
- `decide(signals?)`
- `personalize(context?)` → returns `{ intent, templateId, content, confidence, debug }`
- `track(event, data?)`
- `flush()`
- `destroy()`

See `integration-guide.md` for Person 2 integration details.

