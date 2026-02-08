# AURA / PersonaWeb — Deployment & Hosting Guide

This document explains how to host the demo, what is needed for production‑ready hosting, and what changes (if any) should be made before deployment.

---

## 1) What you’re hosting

This project is **static** for demo:

- `frontend/` → static HTML/CSS/JS  
- `aura-core-engine/dist/` → bundled JS (AuraCore)

No server is required for the hackathon demo.  
You can host it on **GitHub Pages**, **Vercel**, **Netlify**, or **Cloudflare Pages**.

---

## 2) Build steps (one time)

```bash
cd aura-core-engine
npm i
npm run build
```

This generates:

- `aura-core-engine/dist/aura-core.js`
- `aura-core-engine/dist/aura-core.min.js`

---

## 3) Hosting (simple static)

### Option A — GitHub Pages (fastest for hackathon)

1. Create a repo with the project contents  
2. Build AuraCore locally (or via Actions)  
3. Set Pages → deploy from `/` or `/docs`  
4. Open URL and navigate to:

```
/frontend/demo/store.html
```

### Option B — Netlify / Vercel / Cloudflare Pages

1. Connect repo  
2. Build command: `cd aura-core-engine && npm i && npm run build`  
3. Publish directory: project root (or `frontend/` if you copy dist assets)  

---

## 4) Making the snippet portable

Currently, `frontend/personaweb.js` auto‑loads:

```
../aura-core-engine/dist/aura-core.min.js
```

For production hosting, set a fixed CDN URL instead:

```js
PersonaWeb.init({
  engineSrc: "https://your-domain.com/aura-core.min.js"
});
```

This makes the snippet truly drop‑in on any website.

---

## 5) Deployment readiness assessment

**✅ Good enough for hackathon demo**

- All static, no backend dependency  
- Fast load, simple install  
- Explainable decisions  
- Safe fallback

**⚠️ Not production‑grade yet**

- No content security policy / SRI
- No real analytics ingestion endpoint
- Limited cross‑site isolation for CSS (depends on page)
- No caching/CDN versioning strategy

---

## 6) Recommended production hardening

If you want to move beyond demo, consider:

1. **Versioned CDN build**
   - Host `aura-core.min.js` under versioned URL  
   - Add cache‑control headers  

2. **Subresource Integrity (SRI)**
   - Generate SHA256 and provide integrity attribute  

3. **Safe CSS isolation**
   - Shadow DOM or strict prefixing for injected components  

4. **Telemetry pipeline**
   - Replace console analytics with real event ingestion  

5. **Consent and privacy**
   - Add opt‑in / consent handling for tracking  

---

## 7) How to go live quickly (hackathon‑friendly)

**Fastest path:**

1. Build AuraCore  
2. Push repo to GitHub  
3. Enable GitHub Pages  
4. Share demo link:  
   `https://<user>.github.io/<repo>/frontend/demo/store.html`

This is judge‑friendly and requires no server.

---

## 8) How a real customer would install it

**Customer snippet:**

```html
<script src="https://cdn.yourdomain.com/personaweb.js"></script>
```

Optional config:

```html
<script>
  PersonaWeb.init({
    engineSrc: "https://cdn.yourdomain.com/aura-core.min.js",
    debug: false
  });
</script>
```

They would place it just before `</body>` on any page (Shopify, Webflow, static HTML).

