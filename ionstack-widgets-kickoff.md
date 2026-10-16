# Kickoff: ionstack widgets platform (my own Elfsight-style tool)

Build my own Elfsight-style widget platform, served from https://widgets.ionstack.dev (hosted on my Dokploy).
Lean approach: architecture and infrastructure are only a means to a working, demonstrable tool. Ship the smallest thing that works, show it, then iterate.
Copy how Elfsight works from the outside only (a loader script + placeholder div + settings stored per widget id + an editor with live preview). Do not copy Elfsight's code or branding.

## Embed pattern (target)
<script src="https://widgets.ionstack.dev/platform.js" async></script>
<div class="ion-widget" data-id="WIDGET_ID"></div>

## Phase 1 (do this now): static platform, no database
- platform.js: finds every .ion-widget, fetches /w/<id>.json (widget settings + type), loads /types/<type>.js once, renders the widget inside a Shadow DOM. Keep watching for placeholders that page builders (Simvoly) insert later. Handle reduced motion.
- Widget type #1 = "coming-soon": convert the existing widget (source below) so its text, colours and signup URL come from the settings JSON. With the Zenotica settings it must look identical to today.
- /w/zenotica-coming-soon.json = the current Zenotica content.
- Keep https://widgets.ionstack.dev/zenotica-coming-soon.js working (old embeds may use it): make it a tiny shim that loads platform.js and renders that widget.
- demo.html with deliberately clashing theme CSS to check isolation; test headlessly in Playwright before calling it done.
- Deploy: static files on nginx:1.27-alpine on Dokploy (repo + Dockerfile). Short cache (5 min) on JSON and JS.
- Done when: I can create a second Coming Soon widget with different settings by adding one JSON file, no code changes.

## Phase 2 (after I've seen Phase 1): editor
One page: settings form on the left (generated from each widget type's settings schema), live preview on the right, "Copy embed code" button. A tiny Node server saves settings (files or SQLite). Only me as user at first, behind one admin password. Done when I can create and edit widgets myself without Claude.

## Later, only when needed
Client accounts / white-label branding, more widget types, templates, analytics.

## Open questions (assume the defaults until I answer)
- Who uses the editor? Default: only me for now; clients later.
- Next widget types? Default: none yet; design the settings format so adding types is easy.

## Existing widget source (zenotica-coming-soon.js, tested and working)
```js
/*! Zenotica Coming Soon widget
 * Embed:
 *   <script src="https://YOUR-HOST/zenotica-coming-soon.js" async></script>
 *   <div class="zenotica-coming-soon"></div>
 * Renders inside a Shadow DOM so the host site's theme CSS can't affect it.
 */
(function () {
  "use strict";
  if (window.__zenoticaComingSoon) return;
  window.__zenoticaComingSoon = true;

  var SELECTOR = ".zenotica-coming-soon";
  var FONTS = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Lora:wght@400&display=swap";
  var SIGNUP = "https://eepurl.com/c-yhkD";

  var CSS =
    ":host{all:initial;display:block;width:100%}" +
    "*{box-sizing:border-box}" +
    ".zn{--gold:#b68235;--gold-h:#c28d41;--gold-d:#7d5411;--ink:#201f1d;--mute:#605d5d;width:100%;max-width:640px;margin:0 auto;padding:24px 16px;display:flex;flex-direction:column;align-items:center;text-align:center;color:var(--ink);font:400 16px/1.6 'Lora',Georgia,serif;background:transparent}" +
    ".art{position:relative;width:100%;max-width:550px;aspect-ratio:1;display:flex;align-items:center;justify-content:center;container-type:inline-size}" +
    ".svg{position:absolute;inset:0;display:block;width:100%;height:100%;overflow:visible;transform-origin:50% 50%;animation:breathe 9s ease-in-out infinite}" +
    ".txt{position:relative;display:flex;flex-direction:column;align-items:center;gap:10px;padding:0 15%}" +
    ".kick{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold-d)}" +
    "h2{margin:0;font-family:'Cormorant Garamond',Georgia,serif;font-weight:400;font-size:clamp(40px,9vw,60px);font-size:clamp(28px,10.9cqi,60px);line-height:1.05;letter-spacing:.01em}" +
    "h2 em{font-style:italic}" +
    ".p{max-width:520px;margin:40px 0 0;font-size:18px;line-height:1.6;text-wrap:pretty}" +
    ".rule{width:64px;height:1px;background:var(--gold);margin:40px 0}" +
    ".sub{max-width:520px;font-size:16px;line-height:1.6;color:var(--mute);text-wrap:pretty}" +
    "form{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin:20px 0 0;width:min(480px,100%)}" +
    "input{flex:1 1 220px;min-width:0;padding:11px 14px;font:400 14px/1.4 'Lora',Georgia,serif;color:var(--ink);background:#fff;border:1px solid rgba(32,31,29,.25);border-radius:2px;-webkit-appearance:none;appearance:none}" +
    "input:focus{outline:2px solid var(--gold);outline-offset:1px}" +
    "button{padding:11px 22px;font:600 15px/1.4 'Cormorant Garamond',Georgia,serif;color:var(--ink);background:var(--gold);border:1px solid var(--gold);border-radius:2px;cursor:pointer;-webkit-appearance:none;appearance:none}" +
    "button:hover{background:var(--gold-h);border-color:var(--gold-h)}" +
    "button:focus-visible{outline:2px solid var(--gold-d);outline-offset:2px}" +
    "@keyframes breathe{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.03);opacity:1}}" +
    "@media (prefers-reduced-motion:reduce){.svg{animation:none}}";

  // Rotations are SMIL animateTransforms around the exact viewBox centre (200,200),
  // so nothing outside the SVG can shift the pivot.
  function spin(to, dur) {
    return '<animateTransform attributeName="transform" type="rotate" from="0 200 200" to="' + to + ' 200 200" dur="' + dur + '" repeatCount="indefinite"></animateTransform>';
  }
  // Trigram lines (top to bottom, at radius ~164-184): 1 = solid, 0 = broken.
  var TRIGRAMS = ["111", "110", "010", "100", "000", "001", "101", "011"];
  function trigram(bits, i) {
    var d = "";
    for (var r = 0; r < 3; r++) {
      var y = 16 + r * 10;
      d += bits[r] === "1" ? "M190 " + y + "H210" : "M190 " + y + "H197M203 " + y + "H210";
    }
    return '<g transform="rotate(' + i * 45 + ' 200 200)"><path d="' + d + '"></path></g>';
  }

  var HTML =
    '<div class="zn">' +
      '<div class="art">' +
        '<svg class="svg" viewBox="-50 -50 500 500" fill="none" stroke="#b68235" stroke-width="1" aria-hidden="true" focusable="false">' +
          '<circle cx="200" cy="200" r="196"></circle>' +
          '<circle cx="200" cy="200" r="150" stroke-opacity=".6"></circle>' +
          '<g stroke-opacity=".55">' + spin(360, "240s") +
            '<polygon points="200,-40 369.7,30.3 440,200 369.7,369.7 200,440 30.3,369.7 -40,200 30.3,30.3"></polygon>' +
            '<polygon points="200,-18 354,46 418,200 354,354 200,418 46,354 -18,200 46,46" stroke-opacity=".5"></polygon>' +
          '</g>' +
          '<g stroke-width="2" stroke-opacity=".7">' + spin(-360, "120s") + TRIGRAMS.map(trigram).join("") + '</g>' +
          '<g>' + spin(360, "60s") + '<circle cx="200" cy="50" r="3" fill="#b68235" stroke="none"></circle></g>' +
          '<circle cx="200" cy="4" r="3" fill="#b68235" stroke="none"></circle>' +
          '<circle cx="200" cy="396" r="3" fill="#b68235" stroke="none"></circle>' +
        '</svg>' +
        '<div class="txt"><div class="kick">A new space is opening</div><h2>Coming<br><em>Soon</em></h2></div>' +
      '</div>' +
      '<p class="p">Dynamic visual brands and harmonious spaces. The new Zenotica® website is being prepared with the same care we give every brand.</p>' +
      '<div class="rule"></div>' +
      '<div class="sub">Receive practical Good Shui tips and the opening announcement.</div>' +
      '<form action="' + SIGNUP + '" method="get" target="_blank">' +
        '<input type="email" name="EMAIL" placeholder="Your email address" aria-label="Email address" autocomplete="email" required>' +
        '<button type="submit">Notify me</button>' +
      '</form>' +
    '</div>';

  // @font-face doesn't apply from inside a shadow root, so fonts load in the page.
  function loadFonts() {
    if (document.querySelector('link[href="' + FONTS + '"]')) return;
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = FONTS;
    (document.head || document.documentElement).appendChild(l);
  }

  // CSS can't stop SMIL rotations, so reduced motion pauses them here.
  var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var svgs = [];
  function applyMotion(svg) {
    if (!mq || !svg.pauseAnimations) return;
    if (mq.matches) { svg.pauseAnimations(); svg.setCurrentTime(0); }
    else svg.unpauseAnimations();
  }
  if (mq) {
    var onChange = function () { svgs.forEach(applyMotion); };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  function mount(el) {
    if (el.shadowRoot || el.__zn) return;
    el.__zn = true;
    var root = el.attachShadow ? el.attachShadow({ mode: "open" }) : el;
    root.innerHTML = "<style>" + CSS + "</style>" + HTML;
    var svg = root.querySelector(".svg");
    svgs.push(svg);
    applyMotion(svg);
  }

  function scan() {
    var els = document.querySelectorAll(SELECTOR);
    for (var i = 0; i < els.length; i++) mount(els[i]);
  }

  function init() {
    loadFonts();
    scan();
    // Page builders (like the Simvoly editor) may insert the placeholder after this script runs.
    if (window.MutationObserver) new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
```
