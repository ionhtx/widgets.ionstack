# ionstack widgets

My own Elfsight-style embeddable widgets, served from https://widgets.ionstack.dev.

## Embed

```html
<script src="https://widgets.ionstack.dev/platform.js" async></script>
<div class="ion-widget" data-id="WIDGET_ID"></div>
```

Several widgets on one page share one `platform.js`. Old Zenotica embeds (`zenotica-coming-soon.js` + `<div class="zenotica-coming-soon">`) keep working through a shim. Edits saved in the editor show on the next page load, with no re-pasting.

## Editor

`https://widgets.ionstack.dev/editor/`: log in, pick or create a widget, edit its settings with a live preview (desktop/mobile width, light/dark background), **Save** (or Ctrl/Cmd+S) and **Copy embed code**. Duplicate and Delete are there too. PocketBase's own admin is at `/_/`.

## How it works

One container: [PocketBase](https://pocketbase.io) 0.39.10 (pinned in `Dockerfile`) stores widgets, handles the login and serves `public/`.

| Path | What it is |
|---|---|
| `public/platform.js` | Loader. Finds `.ion-widget` placeholders, fetches `/w/<id>.json`, loads `types/<type>.js` once and renders inside a Shadow DOM (host theme CSS can't leak in). Validates settings against the type's schema, loads Google Fonts, pauses SVG animation for reduced-motion visitors, and picks up placeholders that page builders insert later. |
| `public/types/<type>.js` | A widget type: `IonWidgets.define(name, { schema, render(settings, ui), mount? })`. The `schema` lists each setting (`text`, `textarea`, `toggle`, `color`, `url`, `number`, `select`, `font`, `datetime`) with its default, and the editor builds its form from it. |
| `public/editor/` | The editor (plain HTML/CSS/JS). |
| `pb/pb_hooks/widgets.pb.js` | Public read-only endpoint `GET /w/<id>.json` → `{ type, settings }` (`no-cache`, CORS open). |
| `pb/pb_migrations/` | Creates the `widgets` collection (slug, name, type, settings; API is superuser-only) and seeds the Zenotica and demo widgets. |
| `pb/entrypoint.sh` | Creates or updates the editor login from `PB_ADMIN_EMAIL` / `PB_ADMIN_PASSWORD`, then starts PocketBase. |
| `design/`, `docs/` | Original Claude Design export; kickoff brief and older deploy notes. |

### Add a widget type
1. Add `public/types/<id>.js` calling `IonWidgets.define("<id>", { name, schema, render })`. See `coming-soon.js`.
2. Add it to `TYPES` at the top of `public/editor/editor.js`.

## Deploy on Dokploy
Application → Provider: GitHub `ionhtx/widgets.ionstack`, branch `main`, Build type: **Dockerfile**.
- **Environment:** `PB_ADMIN_EMAIL=…`, `PB_ADMIN_PASSWORD=…` (your editor login; changing them and redeploying updates it).
- **Volume:** mount a volume at `/pb/pb_data`. It holds the database, and without it widgets are lost on redeploy.
- **Domain:** `widgets.ionstack.dev`, container port **8090**, HTTPS on.

## Run locally
```bash
mkdir -p bin && curl -sSL https://github.com/pocketbase/pocketbase/releases/download/v0.39.10/pocketbase_0.39.10_linux_amd64.zip -o /tmp/pb.zip && unzip -o /tmp/pb.zip pocketbase -d bin
PB_ADMIN_EMAIL=you@example.com PB_ADMIN_PASSWORD=change-me-123 ./dev.sh   # http://127.0.0.1:8090/editor/
```
`public/demo.html` is a test page with deliberately clashing theme CSS.

## Roadmap (lean: each step ends in a working demo)
1. **Loader + widget format.** Coming Soon is type #1. ✅
2. **PocketBase + editor with live preview.** ✅
3. **Promo widgets:** banner/top bar, popup, countdown.

Out of scope: form/lead-capture widgets (the site builder handles those), client accounts, billing.
