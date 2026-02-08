/* ═══════════════════════════════════════════════════════
   SmartHero Demo — smarthero-demo.js
   PersonaWeb.ai | Frontend Personalization Engine

   Controls: 1/2/3 = Switch persona | C = Auto-cycle | R = Reset
   URL Params: ?persona=gamer | ?query=rtx+4090+buy
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Config ─── */
  const CFG = {
    shimmerMs:  900,
    cycleMs:    4000,
    fadeOutMs:  300,
    toastMs:    1600,
    personas:   ['gamer', 'researcher', 'budget'],
    default:    'gamer',
  };

  const PRODUCT = {
    name:     'VoltEdge XG32 Ultra',
    tag:      '32″ 4K Gaming Monitor',
    price:    '1,599.99',
    priceNum: 1599.99,
    sale:     '1,199.99',
    saleNum:  1199.99,
    img:      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80',
  };

  /* ─── State ─── */
  let hero, current, cycling = false, cycleTimer, countdownTimer;
  let transitioning = false;   // ← FIX: race-condition guard

  /* ─── Analytics ─── */
  const Log = {
    entries: [],
    push(ev, data) {
      const e = { event: ev, data, time: new Date() };
      this.entries.push(e);
      console.log(`🎯 ${ev}:`, data);
      writeEvent(e);
    },
    clear() { this.entries = []; },
  };

  /* ─── Mock AI Engine ─── */
  async function decide() {
    const p = new URLSearchParams(location.search);
    if (p.has('persona') && CFG.personas.includes(p.get('persona')))
      return { template: p.get('persona'), confidence: 98 };

    const q = (p.get('query') || '').toLowerCase();
    // FIX: removed redundant /i flag since q is already lowercase
    if (/game|fps|rgb|esport|rtx/.test(q))          return { template: 'gamer',      confidence: 92 };
    if (/review|spec|compar|bench|test/.test(q))     return { template: 'researcher', confidence: 87 };
    if (/deal|cheap|sale|buy|discount|save/.test(q)) return { template: 'budget',     confidence: 94 };

    return { template: CFG.default, confidence: 85 };
  }

  /* ─── Template HTML ─── */
  // FIX: image onerror now shows a styled fallback instead of hiding
  const imgErr = "onerror=\"this.parentElement.classList.add('smarthero-img-fallback');this.remove()\"";

  const T = {
    gamer: () => `
      <div class="smarthero-template smarthero-gamer">
        <div class="smarthero-content">
          <div class="smarthero-badge">🎮 GAMER'S CHOICE</div>
          <h1 class="smarthero-title">${PRODUCT.name}</h1>
          <p class="smarthero-subtitle">240Hz · 4K UHD · 1ms Response</p>
          <div class="smarthero-price">$${PRODUCT.price}</div>
          <div style="display:flex;align-items:flex-end;gap:14px;flex-wrap:wrap">
            <button class="smarthero-cta smarthero-cta-gamer" onclick="SmartHero.cta('buy_now')">⚡ BUY NOW</button>
            <div class="smarthero-fps-badge">
              <span class="smarthero-fps-number">240</span>
              <span class="smarthero-fps-label">FPS READY</span>
            </div>
          </div>
        </div>
        <div class="smarthero-image-container">
          <img src="${PRODUCT.img}" alt="${PRODUCT.name}"
               class="smarthero-product-img smarthero-parallax" ${imgErr}>
        </div>
      </div>`,

    researcher: () => `
      <div class="smarthero-template smarthero-researcher">
        <div class="smarthero-content">
          <div class="smarthero-badge smarthero-badge-research">📊 TOP RATED 2026</div>
          <h1 class="smarthero-title">${PRODUCT.name}</h1>
          <p class="smarthero-subtitle">${PRODUCT.tag}</p>
          <div class="smarthero-specs-grid">
            <div class="smarthero-spec-card"><div class="smarthero-spec-value">32″</div><div class="smarthero-spec-label">Display</div></div>
            <div class="smarthero-spec-card"><div class="smarthero-spec-value">4K</div><div class="smarthero-spec-label">Resolution</div></div>
            <div class="smarthero-spec-card"><div class="smarthero-spec-value">1ms</div><div class="smarthero-spec-label">Response</div></div>
            <div class="smarthero-spec-card"><div class="smarthero-spec-value">HDR</div><div class="smarthero-spec-label">1400 nits</div></div>
          </div>
          <button class="smarthero-cta smarthero-cta-research" onclick="SmartHero.cta('compare')">🔍 COMPARE SPECS</button>
        </div>
        <div class="smarthero-image-container">
          <img src="${PRODUCT.img}" alt="${PRODUCT.name}"
               class="smarthero-product-img" ${imgErr}>
        </div>
      </div>`,

    budget: () => `
      <div class="smarthero-template smarthero-budget">
        <div class="smarthero-sale-banner">🔥 FLASH SALE — ENDS IN <span class="smarthero-countdown" id="sh-countdown">23:59:42</span></div>
        <div class="smarthero-content">
          <h1 class="smarthero-title">${PRODUCT.name}</h1>
          <div class="smarthero-price-block">
            <span class="smarthero-price-old">$${PRODUCT.price}</span>
            <span class="smarthero-price-new">$${PRODUCT.sale}</span>
            <span class="smarthero-savings">Save $${(PRODUCT.priceNum - PRODUCT.saleNum).toFixed(2)}!</span>
          </div>
          <div class="smarthero-scarcity">⚠️ Only <strong>3 left</strong> at this price</div>
          <button class="smarthero-cta smarthero-cta-budget" onclick="SmartHero.cta('grab_deal')">🛒 GRAB THIS DEAL</button>
        </div>
        <div class="smarthero-image-container">
          <img src="${PRODUCT.img}" alt="${PRODUCT.name}"
               class="smarthero-product-img" ${imgErr}>
        </div>
      </div>`,
  };

  /* ─── Core Engine ─── */

  async function init() {
    hero = findHero();
    buildDebugPanel();
    Log.push('demo_initialized', {});   // FIX: log BEFORE refresh so it appears first
    await refresh();
    bindKeys();
    bindParallax();
    welcome();
  }

  function findHero() {
    for (const s of ['.hero-section', '.hero', '#hero', '.banner', '[class*="hero"]']) {
      const el = document.querySelector(s);
      if (el && el.offsetWidth > 200) return el;
    }
    const d = document.createElement('div');
    d.className = 'hero-section';
    document.body.prepend(d);
    return d;
  }

  async function refresh() {
    if (transitioning) return;          // FIX: guard against concurrent calls
    transitioning = true;
    try {
      showShimmer();
      await sleep(CFG.shimmerMs);
      const d = await decide();
      await render(d.template);
      setDebugState(d.template, d.confidence);
      Log.push('template_shown', d);
    } finally {
      transitioning = false;            // FIX: always unlock
    }
  }

  async function render(name) {
    if (!T[name]) name = 'gamer';

    // FIX: always clear previous countdown timer
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }

    const old = hero.querySelector('.smarthero-template');
    if (old) { old.classList.add('smarthero-fade-out'); await sleep(CFG.fadeOutMs); }

    hero.innerHTML = T[name]();
    const fresh = hero.querySelector('.smarthero-template');
    if (fresh) fresh.classList.add('smarthero-fade-in');
    current = name;
    if (name === 'budget') startCountdown();
  }

  function showShimmer() {
    hero.innerHTML = `
      <div class="smarthero-shimmer">
        <div class="smarthero-shimmer-brain">🧠</div>
        <div class="smarthero-shimmer-text">AI analyzing visitor signals…</div>
        <div class="smarthero-shimmer-bar"></div>
        <div class="smarthero-shimmer-bar smarthero-shimmer-bar-short"></div>
        <div class="smarthero-shimmer-progress">
          <div class="smarthero-shimmer-progress-fill"></div>
        </div>
      </div>`;
  }

  async function switchTo(persona, manual) {
    if (transitioning) return;           // FIX: prevent concurrent transitions
    if (persona === current) return;     // FIX: skip if already showing this
    if (manual && cycling) toggleCycle();// FIX: manual switch stops auto-cycle
    transitioning = true;
    try {
      Log.push('persona_changed', { from: current, to: persona });
      showShimmer();
      await sleep(CFG.shimmerMs);
      await render(persona);
      const conf = 90 + Math.floor(Math.random() * 9);
      setDebugState(persona, conf);
      Log.push('template_shown', { template: persona, confidence: conf, manual: !!manual });
      if (manual) toast(persona);
    } finally {
      transitioning = false;
    }
  }

  /* ─── Auto-Cycle ─── */
  // FIX: use setTimeout recursion instead of setInterval (prevents overlap)

  function toggleCycle() {
    if (cycling) {
      clearTimeout(cycleTimer);
      cycling = false;
      setText('sh-cycle-icon', '▶');
      Log.push('auto_cycle_stopped', {});
    } else {
      cycling = true;
      setText('sh-cycle-icon', '⏸');
      Log.push('auto_cycle_started', {});
      scheduleCycle();
    }
  }

  function scheduleCycle() {
    if (!cycling) return;
    cycleTimer = setTimeout(async () => {
      if (!cycling) return;
      if (transitioning) { scheduleCycle(); return; }   // wait if busy
      const i = (CFG.personas.indexOf(current) + 1) % CFG.personas.length;
      await switchTo(CFG.personas[i], false);
      if (cycling) scheduleCycle();                      // schedule next only after done
    }, CFG.cycleMs);
  }

  /* ─── Reset ─── */
  async function resetDemo() {
    if (cycling) toggleCycle();
    console.log('🎯 demo_reset');
    Log.clear();
    const el = document.getElementById('sh-event-log');
    if (el) el.innerHTML = '';
    transitioning = false;          // FIX: force-unlock for clean restart
    await refresh();                // FIX: properly await
    toast('reset');
  }

  /* ─── Countdown (Budget) ─── */
  function startCountdown() {
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
    let s = 23 * 3600 + 59 * 60 + 42;
    countdownTimer = setInterval(() => {
      s--;
      const el = document.getElementById('sh-countdown');
      if (!el || s < 0) { clearInterval(countdownTimer); countdownTimer = null; return; }
      el.textContent = [
        String(Math.floor(s / 3600)).padStart(2, '0'),
        String(Math.floor((s % 3600) / 60)).padStart(2, '0'),
        String(s % 60).padStart(2, '0'),
      ].join(':');
    }, 1000);
  }

  /* ─── Toast Notification ─── */
  function toast(key) {
    const msgs = {
      gamer:      '🎮 Switched to Gamer',
      researcher: '🔍 Switched to Researcher',
      budget:     '💰 Switched to Budget Shopper',
      reset:      '🔄 Demo Reset',
    };
    const text = msgs[key] || key;
    let el = document.getElementById('sh-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'sh-toast';
      el.className = 'smarthero-toast';
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.classList.remove('smarthero-toast-show');
    void el.offsetWidth;                     // force reflow to restart animation
    el.classList.add('smarthero-toast-show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('smarthero-toast-show'), CFG.toastMs);
  }

  /* ─── Debug Panel ─── */

  function buildDebugPanel() {
    const d = document.createElement('div');
    d.className = 'smarthero-debug';
    d.innerHTML = `
      <div class="smarthero-debug-header" id="sh-drag">
        <span>🧠 SmartHero Debug</span>
        <button class="smarthero-debug-minimize" onclick="SmartHero.togglePanel()">−</button>
      </div>
      <div class="smarthero-debug-body" id="sh-debug-body">
        <div class="smarthero-debug-section">
          <div class="smarthero-debug-label">Current Template</div>
          <div class="smarthero-debug-value" id="sh-tpl">—</div>
        </div>
        <div class="smarthero-debug-section">
          <div class="smarthero-debug-label">AI Confidence</div>
          <div class="smarthero-debug-meter"><div class="smarthero-debug-meter-fill" id="sh-conf-bar"></div></div>
          <div class="smarthero-debug-value" id="sh-conf">—</div>
        </div>
        <div class="smarthero-debug-section">
          <div class="smarthero-debug-label">Switch Persona</div>
          <div class="smarthero-debug-personas">
            <button class="smarthero-persona-btn" data-p="gamer"      onclick="SmartHero.switchPersona('gamer')">🎮 Gamer</button>
            <button class="smarthero-persona-btn" data-p="researcher" onclick="SmartHero.switchPersona('researcher')">🔍 Researcher</button>
            <button class="smarthero-persona-btn" data-p="budget"     onclick="SmartHero.switchPersona('budget')">💰 Budget</button>
          </div>
        </div>
        <div class="smarthero-debug-section">
          <div class="smarthero-debug-controls">
            <button class="smarthero-ctrl-btn" onclick="SmartHero.toggleCycle()"><span id="sh-cycle-icon">▶</span> Auto-Cycle</button>
            <button class="smarthero-ctrl-btn smarthero-ctrl-reset" onclick="SmartHero.reset()">🔄 Reset</button>
          </div>
        </div>
        <div class="smarthero-debug-section">
          <div class="smarthero-debug-label">Event Log</div>
          <div class="smarthero-event-log" id="sh-event-log"></div>
        </div>
        <div class="smarthero-debug-shortcuts">
          <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> Switch · <kbd>C</kbd> Cycle · <kbd>R</kbd> Reset
        </div>
      </div>`;
    document.body.appendChild(d);
    makeDraggable(d);
  }

  function setDebugState(tpl, conf) {
    const icons = { gamer: '🎮', researcher: '🔍', budget: '💰' };
    setText('sh-tpl', `${icons[tpl] || ''} ${tpl}`);
    setText('sh-conf', `${conf}%`);
    const bar = document.getElementById('sh-conf-bar');
    if (bar) bar.style.width = `${conf}%`;
    document.querySelectorAll('.smarthero-persona-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.p === tpl)
    );
  }

  function writeEvent(entry) {
    const log = document.getElementById('sh-event-log');
    if (!log) return;
    const t = entry.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const ic = {
      template_shown: '📊', cta_click: '🖱️', persona_changed: '🔄',
      demo_initialized: '🚀', auto_cycle_started: '▶️', auto_cycle_stopped: '⏸️',
    };
    const div = document.createElement('div');
    div.className = 'smarthero-event-entry';
    div.textContent = `${ic[entry.event] || '📌'} ${t} ${entry.event}`;
    log.prepend(div);
    while (log.children.length > 20) log.removeChild(log.lastChild);
  }

  /* ─── Draggable Panel ─── */

  function makeDraggable(el) {
    const grip = document.getElementById('sh-drag');
    let on = false, sx, sy, sl, st;
    grip.addEventListener('mousedown', e => {
      if (e.target.tagName === 'BUTTON') return;
      on = true; sx = e.clientX; sy = e.clientY;
      const r = el.getBoundingClientRect(); sl = r.left; st = r.top;
      e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
      if (!on) return;
      el.style.right = 'auto';
      el.style.left = (sl + e.clientX - sx) + 'px';
      el.style.top  = (st + e.clientY - sy) + 'px';
    });
    document.addEventListener('mouseup', () => { on = false; });
  }

  /* ─── Keyboard Shortcuts ─── */

  function bindKeys() {
    const map = { '1': 'gamer', '2': 'researcher', '3': 'budget' };
    document.addEventListener('keydown', e => {
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (map[e.key])                  return switchTo(map[e.key], true);
      if (e.key.toLowerCase() === 'c') return toggleCycle();
      if (e.key.toLowerCase() === 'r') return resetDemo();
    });
  }

  /* ─── Smooth Parallax (rAF + lerp) ─── */
  // FIX: smooth interpolation instead of jerky direct assignment

  function bindParallax() {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    document.addEventListener('mousemove', e => {
      tx = (e.clientX / innerWidth  - 0.5) * 24;
      ty = (e.clientY / innerHeight - 0.5) * 24;
      if (!raf) tick();
    });
    function tick() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      document.querySelectorAll('.smarthero-parallax').forEach(img => {
        img.style.transform = `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px)`;
      });
      if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    }
  }

  /* ─── Console Welcome ─── */

  function welcome() {
    console.log(
      '%c🧠 SmartHero Demo Active',
      'font-size:16px;color:#00ff41;background:#0a0a0a;padding:8px 16px;border-radius:6px;font-weight:bold;'
    );
    console.log(
      '%c  Keys: 1/2/3 Switch · C Cycle · R Reset\n  URL:  ?persona=gamer · ?query=rtx+4090',
      'color:#94a3b8;font-size:11px;'
    );
  }

  /* ─── Utilities ─── */

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
  function setText(id, t) { const el = document.getElementById(id); if (el) el.textContent = t; }

  /* ─── Public API ─── */

  window.SmartHero = {
    switchPersona: p => switchTo(p, true),
    toggleCycle,
    reset: resetDemo,
    cta(action) {
      Log.push('cta_click', { action, template: current });
      toast(`✅ ${action.replace(/_/g, ' ')} clicked`);
    },
    togglePanel() {
      const b = document.getElementById('sh-debug-body');
      const btn = document.querySelector('.smarthero-debug-minimize');
      b.classList.toggle('smarthero-collapsed');
      btn.textContent = b.classList.contains('smarthero-collapsed') ? '+' : '−';
    },
  };

  /* ─── Boot ─── */

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
