/// <reference path="../pb_data/types.d.ts" />
// Creates the widgets collection and seeds the two widgets from step 1.
// All API rules are null = superusers only; the public reads settings through GET /w/<slug>.json (pb_hooks).
migrate((app) => {
  const widgets = new Collection({
    type: "base",
    name: "widgets",
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "slug", type: "text", required: true, pattern: "^[a-z0-9-]+$", max: 64 },
      { name: "name", type: "text", max: 120 },
      { name: "type", type: "text", required: true, pattern: "^[a-z0-9-]+$", max: 64 },
      { name: "settings", type: "json", maxSize: 200000 },
      { name: "created", type: "autodate", onCreate: true },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
    ],
    indexes: ["CREATE UNIQUE INDEX idx_widgets_slug ON widgets (slug)"]
  });
  app.save(widgets);

  const seed = [
    {
      slug: "zenotica-coming-soon",
      name: "Zenotica — Coming Soon",
      type: "coming-soon",
      settings: {
        kicker: "A new space is opening",
        title: "Coming",
        titleItalic: "Soon",
        body: "Dynamic visual brands and harmonious spaces. The new Zenotica® website is being prepared with the same care we give every brand.",
        note: "Receive practical Good Shui tips and the opening announcement.",
        signup: true,
        signupUrl: "https://eepurl.com/c-yhkD"
      }
    },
    {
      slug: "demo-coming-soon",
      name: "Demo — Coming Soon",
      type: "coming-soon",
      settings: {
        kicker: "Launching this winter",
        title: "Almost",
        titleItalic: "there",
        body: "A second widget from the same code, configured only by its settings.",
        showDivider: false,
        accent: "#2f6f62",
        accentDark: "#1d4a41",
        headingFont: "Playfair Display",
        bodyFont: "DM Sans"
      }
    }
  ];
  seed.forEach((w) => {
    const r = new Record(widgets);
    r.set("slug", w.slug);
    r.set("name", w.name);
    r.set("type", w.type);
    r.set("settings", w.settings);
    app.save(r);
  });
}, (app) => {
  app.delete(app.findCollectionByNameOrId("widgets"));
});
