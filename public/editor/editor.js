/* Widget editor: list widgets, edit settings with a form generated from the type's schema, live preview, save. */
(function () {
  "use strict";

  // Widget types offered in "New widget". Add a type here after adding public/types/<id>.js.
  var TYPES = [{ id: "coming-soon", name: "Coming Soon" }];

  var API = location.origin + "/api/";
  var BASE = location.origin + "/";
  var TOKEN_KEY = "ionw.token";

  var token = null;
  try { token = localStorage.getItem(TOKEN_KEY); } catch (e) {}

  var state = { widgets: [], current: null, def: null, settings: null, dirty: false };

  function $(s) { return document.querySelector(s); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // ---------- API ----------
  function api(method, path, body) {
    var headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = token;
    return fetch(API + path, { method: method, headers: headers, body: body ? JSON.stringify(body) : undefined })
      .then(function (r) {
        if (r.status === 204) return null;
        return r.json().catch(function () { return {}; }).then(function (j) {
          if ((r.status === 401 || r.status === 403) && path.indexOf("auth-with-password") < 0) {
            logout();
            throw new Error("Please log in again.");
          }
          if (!r.ok) {
            var msg = (j && j.message) || "Request failed (" + r.status + ").";
            var keys = j && j.data ? Object.keys(j.data) : [];
            if (keys.length && j.data[keys[0]].message) msg = keys[0] + ": " + j.data[keys[0]].message;
            throw new Error(msg);
          }
          return j;
        });
      });
  }

  // ---------- auth ----------
  function showLogin() { $("#app").hidden = true; $("#login").hidden = false; }
  function logout() {
    token = null;
    try { localStorage.removeItem(TOKEN_KEY); } catch (e) {}
    state.dirty = false;
    showLogin();
  }
  $("#login-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var f = ev.target;
    $("#login-error").textContent = "";
    api("POST", "collections/_superusers/auth-with-password", { identity: f.identity.value, password: f.password.value })
      .then(function (j) {
        token = j.token;
        try { localStorage.setItem(TOKEN_KEY, token); } catch (e) {}
        f.password.value = "";
        start();
      })
      .catch(function (e) { $("#login-error").textContent = e.message; });
  });
  $("#logout").addEventListener("click", function () { if (confirmDiscard()) logout(); });

  // ---------- list ----------
  function start() {
    return api("GET", "collections/widgets/records?perPage=500&sort=name").then(function (j) {
      $("#login").hidden = true;
      $("#app").hidden = false;
      state.widgets = j.items;
      renderList();
    });
  }

  function renderList() {
    var ul = $("#widgets");
    ul.innerHTML = "";
    state.widgets.forEach(function (w) {
      var li = el("li"), b = el("button");
      b.type = "button";
      b.appendChild(document.createTextNode(w.name || w.slug));
      b.appendChild(el("small", null, w.slug));
      b.setAttribute("aria-current", state.current && state.current.id === w.id ? "true" : "false");
      b.addEventListener("click", function () { select(w); });
      li.appendChild(b);
      ul.appendChild(li);
    });
  }

  function confirmDiscard() {
    return !state.dirty || confirm("You have unsaved changes. Discard them?");
  }

  // ---------- editing ----------
  function select(w) {
    if (state.current && state.current.id === w.id) return;
    if (!confirmDiscard()) return;
    IonWidgets.loadType(w.type).then(function (def) {
      state.current = w;
      state.def = def;
      state.settings = IonWidgets.resolve(def, w.settings);
      setDirty(false);
      $("#status").textContent = "";
      $("#empty").hidden = true;
      $("#panel").hidden = false;
      $("#w-name").value = w.name || "";
      $("#w-meta").textContent = w.slug + " · " + (def.name || w.type);
      $("#embed").value = embedCode(w.slug);
      buildForm(def, state.settings);
      renderList();
      preview();
    }).catch(function (e) { alert(e.message); });
  }

  function embedCode(slug) {
    return '<script src="' + BASE + 'platform.js" async></script>\n<div class="ion-widget" data-id="' + slug + '"></div>';
  }

  function buildForm(def, s) {
    var root = $("#fields"), groups = {};
    root.innerHTML = "";
    def.schema.forEach(function (f) {
      var g = f.group || "Settings";
      if (!groups[g]) {
        groups[g] = el("fieldset");
        groups[g].appendChild(el("legend", null, g));
        root.appendChild(groups[g]);
      }
      groups[g].appendChild(field(f, s[f.key]));
    });
  }

  // One form control per schema field type.
  function field(f, value) {
    var id = "f-" + f.key;
    var wrap = el("div", "field");
    var label = el("label", null, f.label);
    label.htmlFor = id;
    wrap.appendChild(label);
    var input;

    switch (f.type) {
      case "textarea":
        input = el("textarea");
        input.rows = 3;
        input.value = value;
        break;
      case "toggle":
        wrap.classList.add("inline");
        input = el("input");
        input.type = "checkbox";
        input.checked = value;
        break;
      case "select":
      case "font":
        input = el("select");
        var opts = f.type === "font" ? IonWidgets.fonts.map(function (n) { return [n, n]; }) : f.options;
        opts.forEach(function (o) { var op = el("option", null, o[1]); op.value = o[0]; input.appendChild(op); });
        input.value = value;
        break;
      case "number":
        input = el("input");
        input.type = "number";
        if (f.min != null) input.min = f.min;
        if (f.max != null) input.max = f.max;
        input.value = value;
        break;
      case "datetime":
        input = el("input");
        input.type = "datetime-local";
        input.value = toLocalInput(value);
        break;
      case "color":
        return colorField(f, value, wrap, label, id);
      default:
        input = el("input");
        input.type = f.type === "url" ? "url" : "text";
        if (f.type === "url") input.placeholder = "https://…";
        input.value = value;
    }

    input.id = id;
    input.addEventListener(f.type === "toggle" || f.type === "select" || f.type === "font" ? "change" : "input", function () {
      var v = read(f, input);
      input.classList.toggle("invalid", v === undefined);
      if (v !== undefined) update(f.key, v);
    });
    wrap.appendChild(input);
    return wrap;
  }

  function colorField(f, value, wrap, label, id) {
    var row = el("div", "color");
    var pick = el("input"), txt = el("input");
    pick.type = "color";
    pick.setAttribute("aria-label", f.label + " picker");
    txt.type = "text";
    txt.id = id;
    txt.value = value;
    if (/^#[0-9a-f]{6}$/i.test(value)) pick.value = value;
    pick.addEventListener("input", function () { txt.value = pick.value; txt.classList.remove("invalid"); update(f.key, pick.value); });
    txt.addEventListener("input", function () {
      var ok = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(txt.value);
      txt.classList.toggle("invalid", !ok);
      if (!ok) return;
      if (/^#[0-9a-f]{6}$/i.test(txt.value)) pick.value = txt.value;
      update(f.key, txt.value);
    });
    row.appendChild(pick);
    row.appendChild(txt);
    wrap.appendChild(row);
    return wrap;
  }

  // Returns the control's value in the setting's type, or undefined while it's invalid.
  function read(f, input) {
    switch (f.type) {
      case "toggle": return input.checked;
      case "number": {
        var n = parseFloat(input.value);
        return isFinite(n) ? n : undefined;
      }
      case "datetime": return input.value ? new Date(input.value).toISOString() : undefined;
      case "url": return input.value === "" || /^https?:\/\/[^\s"'<>]+$/i.test(input.value) ? input.value : undefined;
      default: return input.value;
    }
  }

  function toLocalInput(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d)) return "";
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + "T" + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  function update(key, v) {
    state.settings[key] = v;
    setDirty(true);
    schedulePreview();
  }

  $("#w-name").addEventListener("input", function () { setDirty(true); });

  function setDirty(d) {
    state.dirty = d;
    $("#save").disabled = !d;
    if (d) $("#status").textContent = "Unsaved changes";
  }

  // ---------- preview ----------
  var previewTimer = null;
  function schedulePreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(preview, 120);
  }
  function preview() {
    if (!state.current) return;
    IonWidgets.render($("#preview"), state.current.type, state.settings);
  }

  function segmented(sel, apply) {
    var seg = $(sel);
    seg.addEventListener("click", function (ev) {
      var b = ev.target.closest("button");
      if (!b) return;
      Array.prototype.forEach.call(seg.children, function (c) { c.classList.toggle("on", c === b); });
      apply(b);
    });
  }
  segmented("#width-seg", function (b) { $("#frame").style.width = b.dataset.w; });
  segmented("#bg-seg", function (b) { $("#frame").style.background = b.dataset.bg; });

  // ---------- save / copy / delete ----------
  function save() {
    if (!state.current || !state.dirty) return;
    var w = state.current;
    var body = { name: $("#w-name").value.trim(), settings: IonWidgets.resolve(state.def, state.settings) };
    $("#save").disabled = true;
    $("#status").textContent = "Saving…";
    api("PATCH", "collections/widgets/records/" + w.id, body)
      .then(function (rec) {
        state.widgets = state.widgets.map(function (x) { return x.id === rec.id ? rec : x; });
        state.current = rec;
        setDirty(false);
        $("#status").textContent = "Saved. Live on refresh.";
        renderList();
      })
      .catch(function (e) { $("#status").textContent = e.message; $("#save").disabled = false; });
  }
  $("#save").addEventListener("click", save);
  document.addEventListener("keydown", function (ev) {
    if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "s") { ev.preventDefault(); save(); }
  });

  $("#copy").addEventListener("click", function () {
    var t = $("#embed");
    var done = function () { $("#copy").textContent = "Copied"; setTimeout(function () { $("#copy").textContent = "Copy embed code"; }, 1500); };
    if (navigator.clipboard) navigator.clipboard.writeText(t.value).then(done, function () { t.select(); });
    else { t.select(); document.execCommand("copy"); done(); }
  });

  $("#delete").addEventListener("click", function () {
    var w = state.current;
    if (!w || !confirm('Delete "' + (w.name || w.slug) + '"? Pages that embed it will show nothing.')) return;
    api("DELETE", "collections/widgets/records/" + w.id).then(function () {
      state.widgets = state.widgets.filter(function (x) { return x.id !== w.id; });
      state.current = null;
      setDirty(false);
      $("#status").textContent = "";
      $("#panel").hidden = true;
      $("#empty").hidden = false;
      $("#preview").innerHTML = "";
      if ($("#preview").shadowRoot) $("#preview").shadowRoot.innerHTML = "";
      renderList();
    }).catch(function (e) { alert(e.message); });
  });

  // ---------- new / duplicate ----------
  var dialog = $("#new-dialog"), newForm = $("#new-form"), copyFrom = null;
  TYPES.forEach(function (t) { var o = el("option", null, t.name); o.value = t.id; $("#new-type").appendChild(o); });

  function slugify(s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64); }
  var slugEdited = false;
  newForm.name.addEventListener("input", function () { if (!slugEdited) newForm.slug.value = slugify(newForm.name.value); });
  newForm.slug.addEventListener("input", function () { slugEdited = true; });

  function openNew(source) {
    if (!confirmDiscard()) return;
    copyFrom = source || null;
    slugEdited = false;
    newForm.reset();
    $("#new-error").textContent = "";
    $("#new-title").textContent = source ? "Duplicate widget" : "New widget";
    $("#new-type").disabled = !!source;
    if (source) {
      $("#new-type").value = source.type;
      newForm.name.value = (source.name || source.slug) + " (copy)";
      newForm.slug.value = slugify(source.slug + "-copy");
    }
    dialog.showModal();
    newForm.name.focus();
  }
  $("#new").addEventListener("click", function () { openNew(null); });
  $("#duplicate").addEventListener("click", function () { openNew(state.current); });

  newForm.addEventListener("submit", function (ev) {
    if (ev.submitter && ev.submitter.value === "cancel") return; // closes the dialog
    ev.preventDefault();
    var body = {
      name: newForm.name.value.trim(),
      slug: newForm.slug.value.trim(),
      type: copyFrom ? copyFrom.type : newForm.type.value,
      settings: copyFrom ? IonWidgets.resolve(state.def, state.settings) : {}
    };
    api("POST", "collections/widgets/records", body).then(function (rec) {
      dialog.close();
      state.widgets.push(rec);
      state.widgets.sort(function (a, b) { return (a.name || a.slug).localeCompare(b.name || b.slug); });
      state.dirty = false;
      select(rec);
    }).catch(function (e) {
      $("#new-error").textContent = /slug/.test(e.message) && /unique|exists/i.test(e.message) ? "That ID is already used." : e.message;
    });
  });

  window.addEventListener("beforeunload", function (ev) {
    if (state.dirty) { ev.preventDefault(); ev.returnValue = ""; }
  });

  // ---------- boot ----------
  if (token) start().catch(showLogin);
  else showLogin();
})();
