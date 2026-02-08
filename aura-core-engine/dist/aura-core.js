/*! AURA Core Engine v0.1.0 | MIT License */
var AuraCore = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/core.js
  var core_exports = {};
  __export(core_exports, {
    ANALYTICS_EVENTS: () => ANALYTICS_EVENTS,
    AuraCore: () => AuraCore
  });

  // src/config/constants.js
  var INTENT_TYPES = {
    BUY_NOW: "buy_now",
    COMPARE: "compare",
    BUDGET: "budget",
    RESEARCH: "research",
    IMPULSE: "impulse",
    USE_CASE: "use_case"
  };
  var REFERRER_CATEGORIES = {
    SEARCH: "search",
    SOCIAL: "social",
    EMAIL: "email",
    PAID: "paid",
    REFERRAL: "referral",
    DIRECT: "direct",
    UNKNOWN: "unknown"
  };
  var TEMPLATE_IDS = {
    HERO_A: "hero-a",
    HERO_B: "hero-b",
    HERO_C: "hero-c",
    HERO_D: "hero-d",
    HERO_E: "hero-e"
  };
  var ANALYTICS_EVENTS = {
    CORE_INIT: "core_init",
    PERSONALIZATION: "personalization",
    IMPRESSION: "impression",
    CLICK: "click",
    CONVERSION: "conversion",
    ERROR: "error"
  };
  var ERROR_CODES = {
    INVALID_CONFIG: "INVALID_CONFIG",
    INVALID_TEMPLATE: "INVALID_TEMPLATE",
    DECISION_FAILED: "DECISION_FAILED",
    ANALYTICS_FAILED: "ANALYTICS_FAILED"
  };
  var DEFAULT_ENV = "production";
  var DEFAULT_CONFIG = Object.freeze({
    env: DEFAULT_ENV,
    debug: false,
    decision: {
      maxDecisionMs: 100,
      enableLLM: false
    },
    analytics: {
      enabled: true,
      batchSize: 10,
      flushIntervalMs: 5e3,
      googleAnalytics: {
        enabled: true,
        // If gtag is present, events are forwarded; otherwise no-op.
        measurementId: null
      }
    },
    templates: {
      defaultTemplateId: TEMPLATE_IDS.HERO_B
    }
  });
  var INTENT_TO_TEMPLATE = Object.freeze({
    [INTENT_TYPES.BUY_NOW]: TEMPLATE_IDS.HERO_A,
    [INTENT_TYPES.IMPULSE]: TEMPLATE_IDS.HERO_A,
    [INTENT_TYPES.COMPARE]: TEMPLATE_IDS.HERO_B,
    [INTENT_TYPES.RESEARCH]: TEMPLATE_IDS.HERO_B,
    [INTENT_TYPES.USE_CASE]: TEMPLATE_IDS.HERO_D,
    [INTENT_TYPES.BUDGET]: TEMPLATE_IDS.HERO_C
  });
  var INTENT_TO_IMAGE = Object.freeze({
    [INTENT_TYPES.BUY_NOW]: "img-1",
    [INTENT_TYPES.IMPULSE]: "img-8",
    [INTENT_TYPES.COMPARE]: "img-2",
    [INTENT_TYPES.RESEARCH]: "img-3",
    [INTENT_TYPES.USE_CASE]: "img-4",
    [INTENT_TYPES.BUDGET]: "img-5"
  });

  // src/config/configManager.js
  function isPlainObject(v) {
    return !!v && typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype;
  }
  function deepMerge(target, source) {
    const out = { ...target };
    for (const [k, v] of Object.entries(source || {})) {
      if (isPlainObject(v) && isPlainObject(out[k])) out[k] = deepMerge(out[k], v);
      else out[k] = v;
    }
    return out;
  }
  function detectEnv(envOverride) {
    var _a;
    if (envOverride === "development" || envOverride === "production") return envOverride;
    try {
      const h = (_a = globalThis == null ? void 0 : globalThis.location) == null ? void 0 : _a.hostname;
      if (h === "localhost" || h === "127.0.0.1") return "development";
    } catch (e) {
    }
    return DEFAULT_ENV;
  }
  var ConfigManager = class {
    /**
     * @param {Partial<AuraConfig>=} initial
     */
    constructor(initial = {}) {
      this._config = deepMerge(DEFAULT_CONFIG, { ...initial, env: detectEnv(initial.env) });
      this.validate();
    }
    /**
     * Get config value by dot notation path (e.g. "analytics.enabled").
     * @param {string} path
     * @param {any=} fallback
     * @returns {any}
     */
    get(path, fallback = void 0) {
      if (!path) return this._config;
      const parts = String(path).split(".");
      let cur = this._config;
      for (const p of parts) {
        if (!cur || typeof cur !== "object" || !(p in cur)) return fallback;
        cur = cur[p];
      }
      return cur;
    }
    /**
     * Set config value by dot notation path.
     * @param {string} path
     * @param {any} value
     */
    set(path, value) {
      if (!path) return;
      const parts = String(path).split(".");
      const next = structuredCloneSafe(this._config);
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        if (!isPlainObject(cur[p])) cur[p] = {};
        cur = cur[p];
      }
      cur[parts[parts.length - 1]] = value;
      this._config = next;
      this.validate();
    }
    /**
     * Update config using deep merge.
     * @param {Partial<AuraConfig>} partial
     */
    update(partial) {
      if (!partial || typeof partial !== "object") return;
      const normalized = { ...partial };
      if ("env" in normalized) normalized.env = detectEnv(normalized.env);
      this._config = deepMerge(this._config, normalized);
      this.validate();
    }
    /**
     * Return a safe clone of config (so callers can't mutate internals).
     * @returns {AuraConfig}
     */
    snapshot() {
      return structuredCloneSafe(this._config);
    }
    /**
     * Validate key config invariants and throw errors early.
     */
    validate() {
      var _a, _b, _c, _d;
      const c = this._config;
      if (c.env !== "development" && c.env !== "production") {
        throw auraConfigError(`Invalid env: ${String(c.env)}`);
      }
      if (typeof ((_a = c.analytics) == null ? void 0 : _a.enabled) !== "boolean") {
        throw auraConfigError("analytics.enabled must be boolean");
      }
      if (!Number.isFinite((_b = c.analytics) == null ? void 0 : _b.batchSize) || c.analytics.batchSize <= 0) {
        throw auraConfigError("analytics.batchSize must be a positive number");
      }
      if (!Number.isFinite((_c = c.analytics) == null ? void 0 : _c.flushIntervalMs) || c.analytics.flushIntervalMs <= 0) {
        throw auraConfigError("analytics.flushIntervalMs must be a positive number");
      }
      if (!Number.isFinite((_d = c.decision) == null ? void 0 : _d.maxDecisionMs) || c.decision.maxDecisionMs <= 0) {
        throw auraConfigError("decision.maxDecisionMs must be a positive number");
      }
    }
  };
  function auraConfigError(message) {
    const err = new Error(message);
    err.code = ERROR_CODES.INVALID_CONFIG;
    return err;
  }
  function structuredCloneSafe(v) {
    if (typeof globalThis.structuredClone === "function") return globalThis.structuredClone(v);
    return (
      /** @type {T} */
      JSON.parse(JSON.stringify(v))
    );
  }

  // src/intent-detection/urlAnalyzer.js
  var INTENT_PARAM_KEYS = ["intent", "aura_intent", "utm_intent"];
  var SEARCH_TERM_KEYS = ["q", "query", "s", "search", "term", "utm_term"];
  function analyzeUrl(inputUrl = void 0) {
    const url = toUrl(inputUrl);
    const query = Object.fromEntries(url.searchParams.entries());
    const utm = {};
    for (const [k, v] of Object.entries(query)) {
      if (k.toLowerCase().startsWith("utm_")) utm[k.toLowerCase()] = v;
    }
    const explicitIntent = readFirstMatch(query, INTENT_PARAM_KEYS);
    const term = readFirstMatch(query, SEARCH_TERM_KEYS) || utm.utm_term || "";
    const { intent: inferredIntent, confidence, matchedPatterns } = inferIntentFromText(
      [term, query.keyword, query.keywords, query.searchTerm].filter(Boolean).join(" ")
    );
    const normalizedExplicit = normalizeIntent(explicitIntent);
    if (normalizedExplicit) {
      return {
        href: url.href,
        query,
        utm,
        explicitIntent: normalizedExplicit,
        inferredIntent,
        confidence: Math.max(0.9, confidence),
        matchedPatterns: matchedPatterns.length ? matchedPatterns : ["explicit_intent_param"]
      };
    }
    return {
      href: url.href,
      query,
      utm,
      explicitIntent: null,
      inferredIntent,
      confidence,
      matchedPatterns
    };
  }
  function inferIntentFromText(text) {
    const t = String(text || "").toLowerCase();
    if (!t.trim()) return { intent: null, confidence: 0, matchedPatterns: [] };
    const rules = [
      { id: "buy_now", re: /\b(buy|purchase|order|checkout|pricing|subscribe|book now|ship today|in stock|add to cart)\b/g, intent: INTENT_TYPES.BUY_NOW, weight: 3 },
      { id: "compare", re: /\b(compare|vs|versus|alternative|alternatives|best|benchmark|ranked|top)\b/g, intent: INTENT_TYPES.COMPARE, weight: 2.5 },
      { id: "budget", re: /\b(cheap|budget|affordable|discount|deal|coupon|promo|low price|under \$?\d+)\b/g, intent: INTENT_TYPES.BUDGET, weight: 2.5 },
      { id: "research", re: /\b(review|reviews|how to|guide|what is|features|specs|documentation|ratings|test)\b/g, intent: INTENT_TYPES.RESEARCH, weight: 2 },
      { id: "use_case", re: /\b(gaming|coding|programming|design|creative|office|work|productivity|streaming|editing|creator|esports)\b/g, intent: INTENT_TYPES.USE_CASE, weight: 2.2 },
      { id: "impulse", re: /\b(limited time|today only|last chance|flash sale|ends soon|only \d+ left|drop)\b/g, intent: INTENT_TYPES.IMPULSE, weight: 2.1 }
    ];
    const scores = {};
    const matchedPatterns = [];
    for (const rule of rules) {
      const matches = t.match(rule.re);
      if (!matches) continue;
      const count = matches.length || 1;
      scores[rule.intent] = (scores[rule.intent] || 0) + rule.weight * count;
      matchedPatterns.push(`${rule.id}(${count})`);
    }
    const entries = Object.entries(scores);
    if (!entries.length) return { intent: null, confidence: 0.2, matchedPatterns: [] };
    entries.sort((a, b) => b[1] - a[1]);
    const [topIntent, topScore] = entries[0];
    const confidence = clamp01(0.4 + Math.min(0.55, topScore / 10));
    return { intent: topIntent, confidence, matchedPatterns };
  }
  function normalizeIntent(v) {
    if (!v) return null;
    const s = String(v).toLowerCase().trim();
    const all = Object.values(INTENT_TYPES);
    return all.includes(s) ? s : null;
  }
  function readFirstMatch(query, keys) {
    for (const k of keys) {
      const v = query[k];
      if (v != null && String(v).trim() !== "") return String(v);
    }
    const lower = Object.fromEntries(Object.entries(query).map(([k, v]) => [k.toLowerCase(), v]));
    for (const k of keys) {
      const v = lower[k.toLowerCase()];
      if (v != null && String(v).trim() !== "") return String(v);
    }
    return null;
  }
  function toUrl(inputUrl) {
    var _a;
    if (inputUrl instanceof URL) return inputUrl;
    if (typeof inputUrl === "string" && inputUrl) return new URL(inputUrl, baseForRelative());
    try {
      if ((_a = globalThis == null ? void 0 : globalThis.location) == null ? void 0 : _a.href) return new URL(globalThis.location.href);
    } catch (e) {
    }
    return new URL("https://example.test/");
  }
  function baseForRelative() {
    var _a;
    try {
      if ((_a = globalThis == null ? void 0 : globalThis.location) == null ? void 0 : _a.origin) return globalThis.location.origin;
    } catch (e) {
    }
    return "https://example.test";
  }
  function clamp01(v) {
    return Math.max(0, Math.min(1, Number(v) || 0));
  }

  // src/intent-detection/referrerAnalyzer.js
  var SEARCH_ENGINES = ["google.", "bing.", "duckduckgo.", "yahoo.", "baidu.", "yandex."];
  var SOCIAL_SITES = ["twitter.com", "t.co", "facebook.com", "instagram.com", "linkedin.com", "reddit.com", "tiktok.com", "youtube.com"];
  var EMAIL_HINTS = ["mail.", "gmail.", "outlook.", "protection.outlook.", "mailchi.mp"];
  function analyzeReferrer(referrer = void 0) {
    const r = normalizeReferrer(referrer);
    if (!r) {
      return { referrer: null, category: REFERRER_CATEGORIES.DIRECT, inferredIntent: null, confidence: 0.2 };
    }
    const host = safeHost(r);
    if (matchesAny(host, SEARCH_ENGINES)) {
      return { referrer: r, category: REFERRER_CATEGORIES.SEARCH, inferredIntent: INTENT_TYPES.RESEARCH, confidence: 0.45 };
    }
    if (matchesAny(host, SOCIAL_SITES)) {
      return { referrer: r, category: REFERRER_CATEGORIES.SOCIAL, inferredIntent: INTENT_TYPES.IMPULSE, confidence: 0.4 };
    }
    if (matchesAny(host, EMAIL_HINTS) || r.includes("utm_medium=email")) {
      return { referrer: r, category: REFERRER_CATEGORIES.EMAIL, inferredIntent: INTENT_TYPES.BUY_NOW, confidence: 0.5 };
    }
    if (r.includes("utm_medium=cpc") || r.includes("gclid=") || r.includes("fbclid=")) {
      return { referrer: r, category: REFERRER_CATEGORIES.PAID, inferredIntent: INTENT_TYPES.BUY_NOW, confidence: 0.55 };
    }
    return { referrer: r, category: REFERRER_CATEGORIES.REFERRAL, inferredIntent: null, confidence: 0.3 };
  }
  function normalizeReferrer(ref) {
    var _a;
    if (typeof ref === "string" && ref.trim()) return ref.trim();
    try {
      const dr = (_a = globalThis == null ? void 0 : globalThis.document) == null ? void 0 : _a.referrer;
      if (typeof dr === "string" && dr.trim()) return dr.trim();
    } catch (e) {
    }
    return null;
  }
  function safeHost(referrer) {
    try {
      return new URL(referrer).host.toLowerCase();
    } catch (e) {
      return referrer.toLowerCase();
    }
  }
  function matchesAny(hay, needles) {
    return needles.some((n) => hay.includes(n));
  }

  // src/intent-detection/behaviorAnalyzer.js
  var BehaviorAnalyzer = class {
    /**
     * @param {{now?: ()=>number, enableListeners?: boolean}=} opts
     */
    constructor(opts = {}) {
      this._now = opts.now || (() => Date.now());
      this._enableListeners = !!opts.enableListeners;
      this._startTs = this._now();
      this._clickCount = 0;
      this._maxScrollY = 0;
      this._onScroll = () => {
        try {
          this._maxScrollY = Math.max(this._maxScrollY, globalThis.scrollY || 0);
        } catch (e) {
        }
      };
      this._onClick = () => {
        this._clickCount++;
      };
    }
    /**
     * Start listening (optional).
     */
    start() {
      if (!this._enableListeners) return;
      try {
        globalThis.addEventListener("scroll", this._onScroll, { passive: true });
        globalThis.addEventListener("click", this._onClick, { passive: true });
      } catch (e) {
      }
    }
    /**
     * Stop listening.
     */
    stop() {
      if (!this._enableListeners) return;
      try {
        globalThis.removeEventListener("scroll", this._onScroll);
        globalThis.removeEventListener("click", this._onClick);
      } catch (e) {
      }
    }
    /**
     * Simulate behavior for demos/tests.
     * @param {{timeOnPageMs?: number, scrollDepth?: number, clickCount?: number}} sim
     */
    simulate(sim = {}) {
      if (Number.isFinite(sim.timeOnPageMs)) this._startTs = this._now() - Math.max(0, sim.timeOnPageMs);
      if (Number.isFinite(sim.clickCount)) this._clickCount = Math.max(0, sim.clickCount);
      if (Number.isFinite(sim.scrollDepth)) {
        const depth = clamp012(sim.scrollDepth);
        const docH = safeDocHeight();
        this._maxScrollY = depth * docH;
      }
    }
    /**
     * Current snapshot.
     * @returns {BehaviorSnapshot}
     */
    snapshot() {
      const timeOnPageMs = Math.max(0, this._now() - this._startTs);
      const scrollDepth = estimateScrollDepth(this._maxScrollY);
      const clickCount = this._clickCount;
      const engagementScore = clamp012(
        0.45 * normalizeTime(timeOnPageMs) + 0.35 * scrollDepth + 0.2 * normalizeClicks(clickCount)
      );
      return { timeOnPageMs, scrollDepth, clickCount, engagementScore };
    }
  };
  function normalizeTime(ms) {
    return clamp012(ms / 3e4);
  }
  function normalizeClicks(n) {
    return clamp012(n / 5);
  }
  function estimateScrollDepth(maxScrollY) {
    const docH = safeDocHeight();
    const vh = safeViewportHeight();
    const denom = Math.max(1, docH - vh);
    return clamp012(maxScrollY / denom);
  }
  function safeDocHeight() {
    try {
      const d = globalThis.document;
      const el = d == null ? void 0 : d.documentElement;
      return Math.max((el == null ? void 0 : el.scrollHeight) || 0, (el == null ? void 0 : el.offsetHeight) || 0, 1e3);
    } catch (e) {
      return 1e3;
    }
  }
  function safeViewportHeight() {
    try {
      return Math.max(1, globalThis.innerHeight || 1);
    } catch (e) {
      return 1;
    }
  }
  function clamp012(v) {
    return Math.max(0, Math.min(1, Number(v) || 0));
  }

  // src/intent-detection/signalsCollector.js
  function collectSignals(ctx = {}) {
    const url = analyzeUrl(ctx.url);
    const referrer = analyzeReferrer(ctx.referrer);
    let behavior;
    if (ctx.behavior) behavior = ctx.behavior;
    else {
      const ba = new BehaviorAnalyzer({ enableListeners: false });
      if (ctx.simulateBehavior) ba.simulate(ctx.simulateBehavior);
      behavior = ba.snapshot();
    }
    const ua = ctx.userAgent || safeUserAgent();
    const device = detectDevice(ua);
    const d = toDate(ctx.now);
    const time = { iso: d.toISOString(), hour: d.getHours(), day: d.getDay() };
    const persona = normalizePersona(ctx.persona);
    return { url, referrer, behavior, device: { userAgent: ua, device }, time, persona: { persona } };
  }
  function detectDevice(userAgent) {
    if (!userAgent) return "unknown";
    const ua = userAgent.toLowerCase();
    if (/\b(mobile|android|iphone|ipod)\b/.test(ua)) return "mobile";
    if (/\b(ipad|tablet)\b/.test(ua)) return "mobile";
    if (/\b(macintosh|windows|linux)\b/.test(ua)) return "desktop";
    return "unknown";
  }
  function safeUserAgent() {
    var _a;
    try {
      return ((_a = globalThis.navigator) == null ? void 0 : _a.userAgent) || null;
    } catch (e) {
      return null;
    }
  }
  function toDate(now) {
    if (now instanceof Date) return now;
    if (typeof now === "number") return new Date(now);
    return /* @__PURE__ */ new Date();
  }
  function normalizePersona(p) {
    if (!p) return null;
    const s = String(p).toLowerCase().trim();
    return s || null;
  }

  // src/decision-engine/ruleBasedEngine.js
  var RuleBasedEngine = class {
    /**
     * @param {{defaultIntent?: string, defaultTemplateId?: string}=} opts
     */
    constructor(opts = {}) {
      this._defaultIntent = opts.defaultIntent || INTENT_TYPES.RESEARCH;
      this._defaultTemplateId = opts.defaultTemplateId || INTENT_TO_TEMPLATE[this._defaultIntent];
    }
    /**
     * @param {any} signals
     * @returns {DecisionResult}
     */
    decide(signals) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i;
      const debug = {};
      const personaIntent = normalizePersonaIntent((_a = signals == null ? void 0 : signals.persona) == null ? void 0 : _a.persona);
      if (personaIntent) {
        return finalize(personaIntent, 0.75, 0, "persona_override", debug, { signals });
      }
      const urlIntent = normalizeIntent2(((_b = signals == null ? void 0 : signals.url) == null ? void 0 : _b.explicitIntent) || ((_c = signals == null ? void 0 : signals.url) == null ? void 0 : _c.inferredIntent));
      if (urlIntent) {
        const confidence = clamp013((_e = (_d = signals == null ? void 0 : signals.url) == null ? void 0 : _d.confidence) != null ? _e : 0.7);
        return finalize(urlIntent, confidence, 1, "url_intent", debug, { signals });
      }
      const refIntent = normalizeIntent2((_f = signals == null ? void 0 : signals.referrer) == null ? void 0 : _f.inferredIntent);
      if (refIntent) {
        const confidence = clamp013((_h = (_g = signals == null ? void 0 : signals.referrer) == null ? void 0 : _g.confidence) != null ? _h : 0.45);
        return finalize(refIntent, confidence, 2, "referrer_intent", debug, { signals });
      }
      const timeIntent = inferFromTime(signals == null ? void 0 : signals.time);
      if (timeIntent) {
        return finalize(timeIntent.intent, timeIntent.confidence, 3, "time_pattern", debug, { signals });
      }
      const deviceIntent = inferFromDevice((_i = signals == null ? void 0 : signals.device) == null ? void 0 : _i.device);
      if (deviceIntent) {
        return finalize(deviceIntent.intent, deviceIntent.confidence, 4, "device_pattern", debug, { signals });
      }
      return finalize(this._defaultIntent, 0.3, 5, "default_fallback", debug, { signals });
    }
  };
  function finalize(intent, confidence, priority, reason, debug, ctx) {
    const templateId = INTENT_TO_TEMPLATE[intent] || INTENT_TO_TEMPLATE[INTENT_TYPES.RESEARCH];
    const heroImageId = INTENT_TO_IMAGE[intent] || INTENT_TO_IMAGE[INTENT_TYPES.RESEARCH];
    const cta = generateCTA(intent);
    debug.intent = intent;
    debug.templateId = templateId;
    debug.priority = priority;
    const explanation = reasonText(reason, ctx == null ? void 0 : ctx.signals);
    return { intent, confidence, templateId, heroImageId, cta, reason: explanation, debug: { reason: explanation, priority, debug } };
  }
  function generateCTA(intent) {
    switch (intent) {
      case INTENT_TYPES.BUY_NOW:
        return { ctaText: "Start now", ctaHref: "#get-started" };
      case INTENT_TYPES.IMPULSE:
        return { ctaText: "Claim offer", ctaHref: "#offer" };
      case INTENT_TYPES.COMPARE:
        return { ctaText: "Compare", ctaHref: "#compare" };
      case INTENT_TYPES.BUDGET:
        return { ctaText: "See deals", ctaHref: "#deals" };
      case INTENT_TYPES.USE_CASE:
        return { ctaText: "See use cases", ctaHref: "#use-cases" };
      case INTENT_TYPES.RESEARCH:
      default:
        return { ctaText: "Learn more", ctaHref: "#learn" };
    }
  }
  function inferFromTime(time) {
    if (!time || typeof time.hour !== "number" || typeof time.day !== "number") return null;
    const hour = time.hour;
    const day = time.day;
    const isWeekend = day === 0 || day === 6;
    if (!isWeekend && hour >= 9 && hour <= 17) return { intent: INTENT_TYPES.RESEARCH, confidence: 0.35 };
    if (hour >= 20 || hour <= 1) return { intent: INTENT_TYPES.IMPULSE, confidence: 0.33 };
    if (isWeekend && hour >= 11 && hour <= 16) return { intent: INTENT_TYPES.BUY_NOW, confidence: 0.32 };
    return null;
  }
  function inferFromDevice(device) {
    if (!device || device === "unknown") return null;
    if (device === "mobile") return { intent: INTENT_TYPES.IMPULSE, confidence: 0.31 };
    if (device === "desktop") return { intent: INTENT_TYPES.COMPARE, confidence: 0.3 };
    return null;
  }
  function normalizeIntent2(v) {
    if (!v) return null;
    const s = String(v).toLowerCase().trim();
    return Object.values(INTENT_TYPES).includes(s) ? s : null;
  }
  function normalizePersonaIntent(persona) {
    if (!persona) return null;
    const s = String(persona).toLowerCase().trim();
    if (!s) return null;
    if (Object.values(INTENT_TYPES).includes(s)) return s;
    if (/\b(gaming|coding|programming|design|creative|office|work|productivity|streaming)\b/.test(s)) {
      return INTENT_TYPES.USE_CASE;
    }
    if (/\b(buy|purchase|order)\b/.test(s)) return INTENT_TYPES.BUY_NOW;
    if (/\b(compare|vs|best|alternative)\b/.test(s)) return INTENT_TYPES.COMPARE;
    if (/\b(budget|cheap|deal|discount)\b/.test(s)) return INTENT_TYPES.BUDGET;
    if (/\b(research|review|guide|features)\b/.test(s)) return INTENT_TYPES.RESEARCH;
    return null;
  }
  function clamp013(n) {
    return Math.max(0, Math.min(1, Number(n) || 0));
  }
  function reasonText(reasonKey, signals) {
    var _a, _b, _c;
    switch (reasonKey) {
      case "persona_override": {
        const p = ((_a = signals == null ? void 0 : signals.persona) == null ? void 0 : _a.persona) || "custom persona";
        return `Persona override set to "${p}", using matching intent.`;
      }
      case "url_intent": {
        const patterns = (((_b = signals == null ? void 0 : signals.url) == null ? void 0 : _b.matchedPatterns) || []).join(", ");
        return patterns ? `Query/UTM matched patterns (${patterns}), indicating intent.` : "Query/UTM parameters indicate intent.";
      }
      case "referrer_intent": {
        const cat = ((_c = signals == null ? void 0 : signals.referrer) == null ? void 0 : _c.category) || "unknown";
        return `Referrer category "${cat}" suggests intent.`;
      }
      case "time_pattern":
        return "Time-of-day pattern suggests intent.";
      case "device_pattern":
        return "Device type suggests intent.";
      case "default_fallback":
      default:
        return "No strong signals; using default intent.";
    }
  }

  // src/templates/templateRegistry.js
  var BUILTIN_TEMPLATES = Object.freeze([
    {
      id: TEMPLATE_IDS.HERO_A,
      type: "hero",
      name: "Hero A (Action-focused)",
      slots: ["headline", "subheadline", "ctaText", "ctaHref", "badgeId", "imageId"],
      defaults: {
        headline: "Buy the monitor built to win",
        subheadline: "4K UHD, 240Hz, 1ms response. Ships today.",
        ctaText: "Add to cart",
        ctaHref: "#buy-now",
        badgeId: "badge-1",
        imageId: "img-1"
      },
      restrictions: { maxHeadlineChars: 60, allowedBadges: 1, allowedImages: 1 },
      layout: { layout: "split", emphasis: "cta" }
    },
    {
      id: TEMPLATE_IDS.HERO_B,
      type: "hero",
      name: "Hero B (Comparison/Info)",
      slots: ["headline", "subheadline", "ctaText", "ctaHref", "badgeId", "imageId"],
      defaults: {
        headline: "Compare top monitors side-by-side",
        subheadline: "Specs, benchmarks, and pricing in one view.",
        ctaText: "Compare models",
        ctaHref: "#compare",
        badgeId: "badge-3",
        imageId: "img-2"
      },
      restrictions: { maxHeadlineChars: 70, allowedBadges: 1, allowedImages: 1 },
      layout: { layout: "center", emphasis: "info" }
    },
    {
      id: TEMPLATE_IDS.HERO_C,
      type: "hero",
      name: "Hero C (Value/Budget)",
      slots: ["headline", "subheadline", "ctaText", "ctaHref", "badgeId", "imageId"],
      defaults: {
        headline: "Premium display, smart price",
        subheadline: "Limited-time savings without cutting quality.",
        ctaText: "See deals",
        ctaHref: "#deals",
        badgeId: "badge-2",
        imageId: "img-3"
      },
      restrictions: { maxHeadlineChars: 60, allowedBadges: 1, allowedImages: 1 },
      layout: { layout: "stack", emphasis: "value" }
    },
    {
      id: TEMPLATE_IDS.HERO_D,
      type: "hero",
      name: "Hero D (Use Case)",
      slots: ["headline", "subheadline", "ctaText", "ctaHref", "badgeId", "imageId"],
      defaults: {
        headline: "Built for gaming, design, and coding",
        subheadline: "Pick a monitor that matches your workflow.",
        ctaText: "See use cases",
        ctaHref: "#use-cases",
        badgeId: "badge-7",
        imageId: "img-4"
      },
      restrictions: { maxHeadlineChars: 70, allowedBadges: 1, allowedImages: 1 },
      layout: { layout: "split", emphasis: "info" }
    },
    {
      id: TEMPLATE_IDS.HERO_E,
      type: "hero",
      name: "Hero E (Impulse/Promo)",
      slots: ["headline", "subheadline", "ctaText", "ctaHref", "badgeId", "imageId"],
      defaults: {
        headline: "Flash drop ends tonight",
        subheadline: "Grab a limited run with bonus accessories.",
        ctaText: "Claim offer",
        ctaHref: "#offer",
        badgeId: "badge-4",
        imageId: "img-8"
      },
      restrictions: { maxHeadlineChars: 60, allowedBadges: 1, allowedImages: 1 },
      layout: { layout: "center", emphasis: "cta" }
    }
  ]);
  function getTemplate(id) {
    return BUILTIN_TEMPLATES.find((t) => t.id === id) || null;
  }

  // src/templates/assetLibrary.js
  var IMAGES = Object.freeze([
    { id: "img-1", url: "https://picsum.photos/seed/aura1/1200/700", alt: "Product hero 1" },
    { id: "img-2", url: "https://picsum.photos/seed/aura2/1200/700", alt: "Product hero 2" },
    { id: "img-3", url: "https://picsum.photos/seed/aura3/1200/700", alt: "Product hero 3" },
    { id: "img-4", url: "https://picsum.photos/seed/aura4/1200/700", alt: "Product hero 4" },
    { id: "img-5", url: "https://picsum.photos/seed/aura5/1200/700", alt: "Product hero 5" },
    { id: "img-6", url: "https://picsum.photos/seed/aura6/1200/700", alt: "Product hero 6" },
    { id: "img-7", url: "https://picsum.photos/seed/aura7/1200/700", alt: "Product hero 7" },
    { id: "img-8", url: "https://picsum.photos/seed/aura8/1200/700", alt: "Product hero 8" },
    { id: "img-9", url: "https://picsum.photos/seed/aura9/1200/700", alt: "Product hero 9" },
    { id: "img-10", url: "https://picsum.photos/seed/aura10/1200/700", alt: "Product hero 10" }
  ]);
  var BADGES = Object.freeze([
    { id: "badge-1", label: "Fast setup" },
    { id: "badge-2", label: "Best value" },
    { id: "badge-3", label: "Top rated" },
    { id: "badge-4", label: "Limited time" },
    { id: "badge-5", label: "Secure" },
    { id: "badge-6", label: "Free trial" },
    { id: "badge-7", label: "New arrival" },
    { id: "badge-8", label: "Editor\u2019s pick" }
  ]);
  function getAsset(type, id) {
    const list = type === "image" ? IMAGES : BADGES;
    return list.find((a) => a.id === id) || null;
  }

  // src/templates/templateValidator.js
  function normalizeTemplatePayload(templateId, content = {}, meta = {}) {
    var _a;
    const tpl = getTemplate(templateId);
    if (!tpl) throw templateError(`Unknown templateId: ${String(templateId)}`);
    const out = { ...tpl.defaults, ...content || {} };
    if (typeof out.headline === "string") {
      out.headline = out.headline.trim().slice(0, tpl.restrictions.maxHeadlineChars);
    }
    for (const slot of tpl.slots) {
      if (!(slot in out)) out[slot] = (_a = tpl.defaults[slot]) != null ? _a : null;
    }
    if (out.imageId && !getAsset("image", out.imageId)) out.imageId = tpl.defaults.imageId;
    if (out.badgeId && !getAsset("badge", out.badgeId)) out.badgeId = tpl.defaults.badgeId;
    return {
      templateId: tpl.id,
      content: out,
      meta: {
        type: tpl.type,
        name: tpl.name,
        layout: tpl.layout,
        ...meta
      }
    };
  }
  function templateError(message) {
    const err = new Error(message);
    err.code = ERROR_CODES.INVALID_TEMPLATE;
    return err;
  }

  // src/analytics/eventTracker.js
  function safeStorageGet(key) {
    var _a;
    try {
      return ((_a = globalThis.localStorage) == null ? void 0 : _a.getItem(key)) || null;
    } catch (e) {
      return null;
    }
  }
  function safeStorageSet(key, value) {
    var _a;
    try {
      (_a = globalThis.localStorage) == null ? void 0 : _a.setItem(key, value);
    } catch (e) {
    }
  }
  function uuid() {
    return `s_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  }
  var EventTracker = class {
    /**
     * @param {{
     *  enabled?: boolean,
     *  batchSize?: number,
     *  flushIntervalMs?: number,
     *  googleAnalytics?: {enabled?: boolean, measurementId?: string|null},
     *  onFlush?: (events: AuraEvent[])=>void
     * }=} opts
     */
    constructor(opts = {}) {
      var _a, _b;
      this.enabled = opts.enabled !== false;
      this.batchSize = Number(opts.batchSize || 10);
      this.flushIntervalMs = Number(opts.flushIntervalMs || 5e3);
      this.ga = {
        enabled: ((_a = opts.googleAnalytics) == null ? void 0 : _a.enabled) !== false,
        measurementId: ((_b = opts.googleAnalytics) == null ? void 0 : _b.measurementId) || null
      };
      this.onFlush = typeof opts.onFlush === "function" ? opts.onFlush : null;
      this._queue = [];
      this._timer = null;
      this._sessionId = getOrCreateSessionId();
    }
    /**
     * @returns {string}
     */
    sessionId() {
      return this._sessionId;
    }
    /**
     * Start periodic flushing.
     */
    start() {
      if (!this.enabled) return;
      if (this._timer) return;
      this._timer = setInterval(() => this.flush(), this.flushIntervalMs);
      try {
        globalThis.addEventListener("beforeunload", () => this.flush({ sync: true }));
      } catch (e) {
      }
    }
    /**
     * Stop periodic flushing.
     */
    stop() {
      if (this._timer) clearInterval(this._timer);
      this._timer = null;
    }
    /**
     * Track an event (batched).
     * @param {string} event
     * @param {any=} data
     */
    track(event, data = {}) {
      if (!this.enabled) return;
      const evt = (
        /** @type {AuraEvent} */
        {
          event,
          data,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          sessionId: this._sessionId
        }
      );
      this._queue.push(evt);
      forwardToGA(this.ga, evt);
      if (this._queue.length >= this.batchSize) this.flush();
    }
    /**
     * Flush queued events.
     * @param {{sync?: boolean}=} opts
     * @returns {AuraEvent[]}
     */
    flush(opts = {}) {
      if (!this.enabled) return [];
      if (!this._queue.length) return [];
      const batch = this._queue.splice(0, this._queue.length);
      if (this.onFlush) {
        try {
          this.onFlush(batch);
        } catch (e) {
          if (!opts.sync) console.warn("AURA onFlush failed", analyticsError(e));
        }
      }
      return batch;
    }
  };
  function getOrCreateSessionId() {
    const key = "aura_session_id";
    const existing = safeStorageGet(key);
    if (existing) return existing;
    const id = uuid();
    safeStorageSet(key, id);
    return id;
  }
  function forwardToGA(ga, evt) {
    if (!ga.enabled) return;
    const gtag = globalThis.gtag;
    if (typeof gtag !== "function") return;
    try {
      gtag("event", evt.event, { ...evt.data, session_id: evt.sessionId });
    } catch (e) {
    }
  }
  function analyticsError(cause) {
    const err = new Error("Analytics failed");
    err.code = ERROR_CODES.ANALYTICS_FAILED;
    err.cause = cause;
    return err;
  }

  // src/analytics/performanceMonitor.js
  function nowMs() {
    var _a, _b, _c;
    try {
      return (_c = (_b = (_a = globalThis.performance) == null ? void 0 : _a.now) == null ? void 0 : _b.call(_a)) != null ? _c : Date.now();
    } catch (e) {
      return Date.now();
    }
  }
  var PerformanceMonitor = class {
    constructor() {
      this._marks = /* @__PURE__ */ new Map();
      this._samples = {
        initMs: [],
        decisionMs: []
      };
    }
    /**
     * Mark the start of a named timer.
     * @param {string} name
     */
    start(name) {
      this._marks.set(name, nowMs());
    }
    /**
     * Mark the end of a named timer and record sample.
     * @param {'init'|'decision'} bucket
     * @param {string} name
     * @returns {number} elapsed ms
     */
    end(bucket, name) {
      const s = this._marks.get(name);
      const e = nowMs();
      const dt = typeof s === "number" ? Math.max(0, e - s) : 0;
      this._marks.delete(name);
      const list = this._samples[`${bucket}Ms`];
      if (Array.isArray(list)) list.push(dt);
      return dt;
    }
    /**
     * Get summary stats.
     */
    summary() {
      return {
        init: summarize(this._samples.initMs),
        decision: summarize(this._samples.decisionMs)
      };
    }
  };
  function summarize(samples) {
    const arr = samples.slice(-50);
    if (!arr.length) return { count: 0, avgMs: 0, p95Ms: 0, maxMs: 0 };
    const sorted = [...arr].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    const p95 = sorted[Math.floor(0.95 * (sorted.length - 1))];
    return {
      count: sorted.length,
      avgMs: sum / sorted.length,
      p95Ms: p95,
      maxMs: sorted[sorted.length - 1]
    };
  }

  // src/core.js
  var AuraCore = class {
    /**
     * @param {import('./config/configManager.js').ConfigManager extends {snapshot:()=>infer C} ? Partial<C> : any=} config
     */
    constructor(config = {}) {
      this.version = true ? "0.1.0" : "dev";
      this.config = new ConfigManager(config);
      this.perf = new PerformanceMonitor();
      const c = this.config.snapshot();
      this.analytics = new EventTracker({
        enabled: c.analytics.enabled,
        batchSize: c.analytics.batchSize,
        flushIntervalMs: c.analytics.flushIntervalMs,
        googleAnalytics: c.analytics.googleAnalytics,
        onFlush: c.debug ? (events) => console.log("[AURA flush]", events) : null
      });
      this.engine = new RuleBasedEngine({
        defaultTemplateId: c.templates.defaultTemplateId
      });
      this._initialized = false;
      this.onError = null;
    }
    /**
     * Initialize core engine (starts analytics timer).
     */
    init() {
      if (this._initialized) return;
      this.perf.start("init");
      this.analytics.start();
      this.analytics.track(ANALYTICS_EVENTS.CORE_INIT, { version: this.version });
      this.perf.end("init", "init");
      this._initialized = true;
    }
    /**
     * Update configuration at runtime.
     * @param {any} partialConfig
     */
    updateConfig(partialConfig) {
      this.config.update(partialConfig);
      const c = this.config.snapshot();
      this.analytics.enabled = c.analytics.enabled;
      this.analytics.batchSize = c.analytics.batchSize;
      this.analytics.flushIntervalMs = c.analytics.flushIntervalMs;
      this.analytics.ga = { ...this.analytics.ga, ...c.analytics.googleAnalytics };
    }
    /**
     * Collect signals (optionally provided context overrides).
     * @param {Parameters<typeof collectSignals>[0]=} ctx
     */
    collectSignals(ctx = {}) {
      return collectSignals(ctx);
    }
    /**
     * Decide on an experience for a given signal set.
     * @param {any=} signals
     * @returns {AuraDecision}
     */
    decide(signals = void 0) {
      this.perf.start("decision");
      const s = signals || this.collectSignals();
      const d = this.engine.decide(s);
      const payload = normalizeTemplatePayload(d.templateId, {
        headline: headlineForIntent(d.intent),
        subheadline: subheadlineForIntent(d.intent),
        ctaText: d.cta.ctaText,
        ctaHref: d.cta.ctaHref,
        imageId: d.heroImageId
      }, { confidence: d.confidence });
      const ms = this.perf.end("decision", "decision");
      const decision = (
        /** @type {AuraDecision} */
        {
          intent: d.intent,
          templateId: payload.templateId,
          heroImageId: payload.content.imageId,
          hero_image: payload.content.imageId,
          cta: d.cta,
          content: payload.content,
          confidence: d.confidence,
          reason: d.reason,
          debug: { ...d.debug, decisionMs: ms, signals: this.config.get("debug") ? s : void 0 }
        }
      );
      this.analytics.track(ANALYTICS_EVENTS.PERSONALIZATION, {
        intent: decision.intent,
        template: decision.templateId,
        confidence: decision.confidence,
        decisionMs: ms
      });
      return decision;
    }
    /**
     * Convenience: collect signals + decide.
     * @param {Parameters<typeof collectSignals>[0]=} ctx
     * @returns {Promise<AuraDecision>}
     */
    async personalize(ctx = {}) {
      try {
        if (!this._initialized) this.init();
        const signals = this.collectSignals(ctx);
        return this.decide(signals);
      } catch (err) {
        this._handleError(err, { stage: "personalize" });
        throw err;
      }
    }
    /**
     * Track analytics event in standard format.
     * @param {string} event
     * @param {any=} data
     */
    track(event, data = {}) {
      try {
        this.analytics.track(event, data);
      } catch (err) {
        this._handleError(err, { stage: "track" });
      }
    }
    /**
     * Flush analytics batch.
     */
    flush() {
      try {
        return this.analytics.flush();
      } catch (err) {
        this._handleError(err, { stage: "flush" });
        return [];
      }
    }
    /**
     * Cleanup.
     */
    destroy() {
      try {
        this.analytics.stop();
      } catch (e) {
      }
      this._initialized = false;
    }
    /**
     * @param {any} err
     * @param {any} ctx
     */
    _handleError(err, ctx) {
      const e = err instanceof Error ? err : new Error(String(err));
      if (!e.code) e.code = ERROR_CODES.DECISION_FAILED;
      try {
        this.analytics.track(ANALYTICS_EVENTS.ERROR, { message: e.message, code: e.code, ctx });
      } catch (e2) {
      }
      if (typeof this.onError === "function") {
        try {
          this.onError(e);
        } catch (e2) {
        }
      }
    }
  };
  function headlineForIntent(intent) {
    switch (intent) {
      case "buy_now":
        return "Start personalizing today";
      case "compare":
        return "Compare options in seconds";
      case "budget":
        return "Best value personalization";
      case "impulse":
        return "Limited-time boost for your site";
      case "research":
      default:
        return "Learn what AURA can do";
    }
  }
  function subheadlineForIntent(intent) {
    switch (intent) {
      case "buy_now":
        return "Launch tailored experiences with a single script tag.";
      case "compare":
        return "See features and outcomes side-by-side for your visitors.";
      case "budget":
        return "Ship personalization without heavy engineering effort.";
      case "impulse":
        return "Make your hero section match visitor intent instantly.";
      case "research":
      default:
        return "A lightweight core that detects intent and picks the best hero.";
    }
  }
  return __toCommonJS(core_exports);
})();
//# sourceMappingURL=aura-core.js.map
