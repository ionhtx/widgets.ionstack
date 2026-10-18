/*! ionstack widgets platform
 * Embed:
 *   <script src="https://widgets.ionstack.dev/platform.js" async></script>
 *   <div class="ion-widget" data-id="WIDGET_ID"></div>
 *
 * Each placeholder's settings are fetched from w/<id>.json ({ "type": "...", "settings": {...} }).
 * The widget type's code is loaded once from types/<type>.js, which calls IonWidgets.define().
 * Widgets render inside a Shadow DOM so the host site's theme CSS can't touch them.
 */
(function () {
  "use strict";
  if (window.IonWidgets) return;

  var VERSION = "1";
  var script = document.currentScript;
  var BASE = script && script.src ? script.src.replace(/[^\/?#]*([?#].*)?$/, "") : "https://widgets.ionstack.dev/";

  // Fonts a "font" setting can pick. Loaded from Google Fonts on demand, one request per family.
  var FONTS = {
    "Cormorant Garamond": "ital,wght@0,400;0,600;1,400",
    "Lora": "ital,wght@0,400;0,600;1,400",
    "Playfair Display": "ital,wght@0,400;0,600;1,400",
    "DM Sans": "ital,wght@0,400;0,600;1,400",
    "Montserrat": "ital,wght@0,400;0,600;1,400",
    "Inter": "ital,wght@0,400;0,600;1,400"
  };

  var BASE_CSS = ":host{all:initial;display:block;width:100%}*{box-sizing:border-box}";

  var types = {};
  var typeLoads = {};
  var mounted = [];
  var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  // ---------- helpers given to widget types ----------
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  // Escaped text with line breaks kept.
  function text(v) { return esc(v).replace(/\r?\n/g, "<br>"); }
  function font(name, fallback) { return "'" + name + "'," + (fallback || "Georgia,serif"); }
  var ui = { esc: esc, text: text, font: font };

  // ---------- settings ----------
  // Takes raw settings and returns a clean object with exactly the schema's keys:
  // invalid or missing values fall back to the field's default.
  function resolve(def, raw) {
    raw = raw || {};
    var out = {};
    (def.schema || []).forEach(function (f) {
      var v = raw[f.key];
      out[f.key] = valid(f, v) ? normalize(f, v) : f["default"];
    });
    return out;
  }
  function valid(f, v) {
    if (v === undefined || v === null) return false;
    switch (f.type) {
      case "text": case "textarea": return typeof v === "string";
      case "toggle": return typeof v === "boolean";
      case "color": return typeof v === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v);
      case "url": return typeof v === "string" && (v === "" || /^https?:\/\/[^\s"'<>]+$/i.test(v));
      case "number": return typeof v === "number" && isFinite(v);
      case "select": return (f.options || []).some(function (o) { return o[0] === v; });
      case "font": return Object.prototype.hasOwnProperty.call(FONTS, v);
      case "datetime": return typeof v === "string" && !isNaN(Date.parse(v));
      default: return false;
    }
  }
  function normalize(f, v) {
    if (f.type === "number") {
      if (f.min != null) v = Math.max(f.min, v);
      if (f.max != null) v = Math.min(f.max, v);
    }
    return v;
  }

  // ---------- loading ----------
  function loadType(name) {
    if (types[name]) return Promise.resolve(types[name]);
    if (!/^[a-z0-9-]+$/.test(name)) return Promise.reject(new Error("invalid widget type '" + name + "'"));
    if (!typeLoads[name]) {
      typeLoads[name] = new Promise(function (res, rej) {
        var s = document.createElement("script");
        s.src = BASE + "types/" + name + ".js?v=" + VERSION;
        s.async = true;
        s.onload = function () { types[name] ? res(types[name]) : rej(new Error("type '" + name + "' did not register")); };
        s.onerror = function () { delete typeLoads[name]; rej(new Error("could not load type '" + name + "'")); };
        (document.head || document.documentElement).appendChild(s);
      });
    }
    return typeLoads[name];
  }

  // The one place that knows where settings live (static JSON now, PocketBase in step 2).
  function loadConfig(id) {
    return fetch(BASE + "w/" + encodeURIComponent(id) + ".json", { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("widget '" + id + "' not found (" + r.status + ")");
      return r.json();
    });
  }

  // @font-face doesn't apply from inside a shadow root, so fonts load in the page.
  function loadFonts(def, s) {
    (def.schema || []).forEach(function (f) {
      if (f.type !== "font") return;
      var name = s[f.key];
      var href = "https://fonts.googleapis.com/css2?family=" + name.replace(/ /g, "+") + ":" + FONTS[name] + "&display=swap";
      if (document.querySelector('link[href="' + href + '"]')) return;
      var l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = href;
      (document.head || document.documentElement).appendChild(l);
    });
  }

  // ---------- rendering ----------
  // CSS can't pause SMIL (SVG) animations, so reduced motion is applied here for every widget.
  function applyMotion(root) {
    if (!mq) return;
    var svgs = root.querySelectorAll("svg");
    for (var i = 0; i < svgs.length; i++) {
      if (!svgs[i].pauseAnimations) continue;
      if (mq.matches) { svgs[i].pauseAnimations(); svgs[i].setCurrentTime(0); }
      else svgs[i].unpauseAnimations();
    }
  }
  if (mq) {
    var onMotion = function () { mounted.forEach(function (m) { applyMotion(m.root); }); };
    if (mq.addEventListener) mq.addEventListener("change", onMotion);
    else if (mq.addListener) mq.addListener(onMotion);
  }

  function entry(el) {
    for (var i = 0; i < mounted.length; i++) if (mounted[i].el === el) return mounted[i];
    var root = el.shadowRoot || (el.attachShadow ? el.attachShadow({ mode: "open" }) : el);
    var m = { el: el, root: root, destroy: null };
    mounted.push(m);
    return m;
  }

  // Renders (or re-renders) a widget into an element. Used by the embed and by the editor preview.
  function render(el, type, rawSettings) {
    return loadType(type).then(function (def) {
      var s = resolve(def, rawSettings);
      var m = entry(el);
      if (m.destroy) { try { m.destroy(); } catch (e) {} m.destroy = null; }
      loadFonts(def, s);
      var out = def.render(s, ui);
      m.root.innerHTML = "<style>" + BASE_CSS + (out.css || "") + "</style>" + out.html;
      if (def.mount) m.destroy = def.mount(m.root, s, ui) || null;
      applyMotion(m.root);
      return s;
    });
  }

  function mountPlaceholder(el) {
    if (el.__ion) return;
    var id = el.getAttribute("data-id");
    if (!id) return;
    el.__ion = true;
    loadConfig(id)
      .then(function (cfg) { return render(el, cfg.type, cfg.settings); })
      .catch(function (err) { el.__ion = false; if (window.console) console.warn("[ionstack widgets] " + err.message); });
  }

  function scan() {
    var els = document.querySelectorAll(".ion-widget[data-id]");
    for (var i = 0; i < els.length; i++) mountPlaceholder(els[i]);
  }

  window.IonWidgets = {
    version: VERSION,
    base: BASE,
    fonts: Object.keys(FONTS),
    define: function (name, def) { types[name] = def; },
    loadType: loadType,
    resolve: resolve,
    render: render
  };

  function init() {
    scan();
    // Page builders (Simvoly's editor, etc.) may insert or tag placeholders after this runs.
    if (window.MutationObserver) {
      new MutationObserver(scan).observe(document.documentElement, {
        childList: true, subtree: true, attributes: true, attributeFilter: ["class", "data-id"]
      });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
