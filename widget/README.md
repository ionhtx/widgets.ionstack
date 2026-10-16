# Zenotica Coming Soon widget

Elfsight-style embed for Simvoly (or any site): one hosted script plus a placeholder `<div>`.

```html
<script src="https://YOUR-HOST/zenotica-coming-soon.js" async></script>
<div class="zenotica-coming-soon"></div>
```

- `zenotica-coming-soon.js`: the widget. It renders inside a Shadow DOM, so the site theme can't restyle it. The background is transparent and it's at most 640px wide.
- `demo.html`: a local test page with deliberately hostile theme CSS. Open it in a browser to preview.
- Motion: the rings rotate around the SVG's exact centre (SMIL). Visitors with reduced motion turned on see them paused.
- Signup: the form opens the Mailchimp signup (`https://eepurl.com/c-yhkD`) in a new tab, passing the email as `EMAIL`.
