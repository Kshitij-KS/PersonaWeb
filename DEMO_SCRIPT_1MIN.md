# WebPersona — Demo Walkthrough Script

**Use this as a spoken walkthrough while you go through the website.** Read the lines as you reach each section. [Actions] tell you what to do on screen.

---

## Part 1: Landing page (index.html)

**[Open the site. Let the loader finish.]**

"This is WebPersona. We built it so that every visitor can see a different website — without a backend, without months of setup."

**[Stay on the hero.]**

"The headline says it: intent-driven hero personalization. We detect who’s coming in — are they ready to buy, comparing options, or hunting for a deal? — and we swap the hero: headline, image, and CTA. One script tag, finite templates, safe by default."

**[Point to the three persona cards in the browser mockup — Gamer, Research, Deal.]**

"These aren’t just pretty buttons. Each one takes you to the same store page with different signals. So you’ll see the same page change its hero when we click through in a second."

---

**[Scroll down to "The problem with one-size-fits-all."]**

"The problem we’re solving: most sites show one hero to everyone. Your Google visitor and your email subscriber get the same thing. Gamers want specs and performance; researchers want comparisons. One-size-fits-all doesn’t work. And usually personalization means ten tools and a big dev team. We wanted to change that."

---

**[Scroll to "The solution: one script tag."]**

"The solution is this. You add one script tag before closing body, and one init call. Our engine — we call it AuraCore — looks at URL params, UTM, referrer, optional persona, and behavior. It picks an intent, picks a template, and returns a clear decision: intent, template, image, CTA, and a reason. So it’s explainable."

**[Optionally point to the bullet list: signals, 4 variants, structured output, explainable, safe fallback.]**

---

**[Scroll to "How it works."]**

"Three steps. One: we detect signals — URL, UTM, referrer, persona. No cookies required. Two: the decision engine does weighted scoring and outputs intent, template, and that reason string. Three: we inject the right hero into the page. If we’re not sure, we fall back to a default. Safe by default."

---

**[Scroll to "Four variants. One engine."]**

"We ship four variants for the demo: Direct Buyer — add to cart, conversion-focused; Researcher — specs, compare models; Gamer — dark, 240Hz, 1ms; Deal Hunter — urgency, countdown. Same engine, different intent, different look and CTA."

---

**[Scroll to "Install in 30 seconds."]**

"Install is copy-paste. Two lines: the script source and WebPersona.init. You can turn debug on to see the decision in the panel. Below that we show what the engine actually returns — intent, template, hero image, CTA, and the reason. So site owners always know why a variant was chosen."

**[Click "Try Live Demo" to open the store.]**

"Now let’s see it live. I’ll open our demo store."

---

## Part 2: Live demo (store.html)

**[Store page loads. You’re on the default or one variant.]**

"This is a normal-looking product page. The hero at the top is the part we personalize. Same HTML, same products — only the hero block changes by intent."

**[Change URL to add: ?intent=buy_now — or open a new tab with that URL.]**

"First: someone ready to buy. I’ll add intent equals buy_now. Watch the hero. It switches to a direct, conversion-focused message — Add to Cart, trust badges. That’s the Direct Buyer variant."

**[Change to: ?q=best+monitor+vs+2026]**

"Second: a researcher. I’ll simulate a search like ‘best monitor vs’ in the query. Now the hero is about specs and comparison — ‘Compare All Models.’ Same page, different intent."

**[Change to: ?persona=gaming]**

"Third: a gamer. Persona equals gaming. The hero goes dark, neon, performance-focused — 240Hz, 1ms, game-over style. So we’re not changing the site structure; we’re swapping the hero content by intent."

**[Press D to open the debug panel.]**

"Every decision is explainable. I’ll press D to open the debug panel. You see the detected intent, confidence, and the reason — for example, ‘Query contains best and vs’ or ‘Persona set to gaming.’ That’s important for trust and for you to understand why a variant was chosen."

**[Optional: press 1, 2, 3, 4 to cycle variants, or R to reset.]**

"You can also use keys 1 through 4 to preview each variant, and R to reset. All of this runs in the browser with one script tag."

---

## Part 3: Closing (back to landing or on store)

**[Either scroll back up on the landing or stay on the store.]**

"So that’s WebPersona: one script tag, intent-driven hero personalization, explainable decisions, and a safe fallback. It works on any site — Shopify, Webflow, or your own stack. We built it for MIT HackNation 2026. Thanks."

---

## Quick reference

| Where        | You say (short) |
|-------------|------------------|
| Hero        | Intent-driven hero, one script, safe by default; personas = different signals. |
| Problem     | One hero for everyone doesn’t work; personalization is usually complex. |
| Solution    | One script + init; AuraCore uses signals and returns intent + reason. |
| How it works| Signals → decision engine → safe DOM injection; fallback if unsure. |
| Four variants| Direct Buyer, Researcher, Gamer, Deal Hunter — one engine. |
| Install     | Copy-paste two lines; debug shows decision; output is explainable. |
| Store       | Same page, hero changes by intent; show buy_now, compare query, gaming; then D = debug. |
| Close       | One script, explainable, safe; works anywhere; built for HackNation. |

**URLs for store:**  
`store.html` · `store.html?intent=buy_now` · `store.html?q=best+monitor+vs+2026` · `store.html?persona=gaming`  
**Keys:** D = debug · 1–4 = variant preview · R = reset
