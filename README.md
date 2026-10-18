# ionstack widgets

My own Elfsight-style embeddable widgets, served from https://widgets.ionstack.dev.

## Embed

```html
<script src="https://widgets.ionstack.dev/platform.js" async></script>
<div class="ion-widget" data-id="WIDGET_ID"></div>
```

Several widgets on one page share one `platform.js`. Old Zenotica embeds (`zenotica-coming-soon.js` + `<div class="zenotica-coming-soon">`) keep working through a shim.

## How it works

| Path | What it is |
|---|---|
| `public/platform.js` | Loader. Finds `.ion-widget` placeholders, fetches `w/<id>.json`, loads `types/<type>.js` once and renders inside a Shadow DOM (host theme CSS can't leak in). Validates settings against the type's schema, loads Google Fonts, pauses SVG animation for reduced-motion visitors, and picks up placeholders inserted later by page builders. |
| `public/types/<type>.js` | A widget type: `IonWidgets.define(name, { schema, render(settings, ui), mount? })`. The `schema` lists each setting (`text`, `textarea`, `toggle`, `color`, `url`, `number`, `select`, `font`, `datetime`) with its default. The step 2 editor builds its form from it. |
| `public/w/<id>.json` | One widget: `{ "type": "...", "settings": { ... } }`. Missing or invalid settings fall back to defaults. |
| `public/demo.html` | Test page with deliberately clashing theme CSS. |
| `Dockerfile`, `nginx.conf` | Static hosting on Dokploy. Settings are served `no-cache`, so edits show on the next page load. |
| `design/` | The original Claude Design export (Zenotica Coming Soon). |
| `docs/` | Kickoff brief and earlier deploy notes. |

### Add a widget
Add `public/w/<new-id>.json` with a `type` and the settings you want to change. No code changes needed.

### Run locally
```bash
cd public && python3 -m http.server 8765   # open http://localhost:8765/demo.html
```

## Roadmap (lean: each step ends in a working demo)
1. **Loader + widget format.** Coming Soon is type #1. ✅
2. **PocketBase + editor:** login, widget list, settings form generated from the schema, live preview, Save, Copy embed code.
3. **Promo widgets:** banner/top bar, popup, countdown.

Out of scope: form/lead-capture widgets (the site builder handles those), client accounts, billing.
