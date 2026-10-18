/// <reference path="../pb_data/types.d.ts" />
// Public, read-only settings endpoint used by platform.js: GET /w/<slug>.json -> { type, settings }
routerAdd("GET", "/w/{file}", (e) => {
  const slug = e.request.pathValue("file").replace(/\.json$/, "");
  if (!/^[a-z0-9-]+$/.test(slug)) return e.json(404, { message: "Not found." });

  let rec;
  try {
    rec = e.app.findFirstRecordByData("widgets", "slug", slug);
  } catch (_) {
    return e.json(404, { message: "Not found." });
  }

  // Always revalidate, so edits show up on the next page load.
  e.response.header().set("Cache-Control", "no-cache");
  return e.json(200, { type: rec.get("type"), settings: rec.get("settings") });
});
