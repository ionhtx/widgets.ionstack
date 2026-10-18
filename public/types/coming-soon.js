/* Widget type: coming-soon — headline over optional animated bagua artwork, paragraph, note and optional email signup. */
(function () {
IonWidgets.define("coming-soon", {
  name: "Coming Soon",
  schema: [
    { key: "kicker", label: "Kicker", type: "text", group: "Content", "default": "A new space is opening" },
    { key: "title", label: "Title", type: "text", group: "Content", "default": "Coming" },
    { key: "titleItalic", label: "Title, italic line", type: "text", group: "Content", "default": "Soon" },
    { key: "body", label: "Paragraph", type: "textarea", group: "Content", "default": "Something new is on its way. Check back soon." },
    { key: "showDivider", label: "Show divider", type: "toggle", group: "Content", "default": true },
    { key: "note", label: "Note under divider", type: "textarea", group: "Content", "default": "" },

    { key: "signup", label: "Show email signup", type: "toggle", group: "Signup", "default": false },
    { key: "signupUrl", label: "Signup page URL (opens in a new tab)", type: "url", group: "Signup", "default": "" },
    { key: "signupField", label: "Email field name", type: "text", group: "Signup", "default": "EMAIL" },
    { key: "signupPlaceholder", label: "Email placeholder", type: "text", group: "Signup", "default": "Your email address" },
    { key: "signupButton", label: "Button label", type: "text", group: "Signup", "default": "Notify me" },

    { key: "artwork", label: "Artwork", type: "select", group: "Style", options: [["bagua", "Bagua rings"], ["none", "None"]], "default": "bagua" },
    { key: "motion", label: "Animate artwork", type: "toggle", group: "Style", "default": true },
    { key: "accent", label: "Accent colour", type: "color", group: "Style", "default": "#b68235" },
    { key: "accentDark", label: "Kicker colour", type: "color", group: "Style", "default": "#7d5411" },
    { key: "ink", label: "Text colour", type: "color", group: "Style", "default": "#201f1d" },
    { key: "muted", label: "Note colour", type: "color", group: "Style", "default": "#605d5d" },
    { key: "headingFont", label: "Heading font", type: "font", group: "Style", "default": "Cormorant Garamond" },
    { key: "bodyFont", label: "Body font", type: "font", group: "Style", "default": "Lora" },
    { key: "maxWidth", label: "Max width (px)", type: "number", group: "Style", min: 280, max: 1200, "default": 640 }
  ],

  render: function (s, ui) {
    var hf = ui.font(s.headingFont), bf = ui.font(s.bodyFont);

    var css =
      ".zn{--gold:" + s.accent + ";--gold-d:" + s.accentDark + ";--ink:" + s.ink + ";--mute:" + s.muted + ";width:100%;max-width:" + s.maxWidth + "px;margin:0 auto;padding:24px 16px;display:flex;flex-direction:column;align-items:center;text-align:center;color:var(--ink);font:400 16px/1.6 " + bf + ";background:transparent}" +
      ".art{position:relative;width:100%;max-width:550px;aspect-ratio:1;display:flex;align-items:center;justify-content:center;container-type:inline-size}" +
      ".art.plain{aspect-ratio:auto;padding:24px 0}" +
      ".svg{position:absolute;inset:0;display:block;width:100%;height:100%;overflow:visible;transform-origin:50% 50%}" +
      ".svg.moving{animation:breathe 9s ease-in-out infinite}" +
      ".txt{position:relative;display:flex;flex-direction:column;align-items:center;gap:10px;padding:0 15%}" +
      ".kick{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold-d)}" +
      "h2{margin:0;font-family:" + hf + ";font-weight:400;font-size:clamp(40px,9vw,60px);font-size:clamp(28px,10.9cqi,60px);line-height:1.05;letter-spacing:.01em}" +
      "h2 em{font-style:italic}" +
      ".p{max-width:520px;margin:40px 0 0;font-size:18px;line-height:1.6;text-wrap:pretty}" +
      ".rule{width:64px;height:1px;background:var(--gold);margin:40px 0 0}" +
      ".sub{max-width:520px;margin:40px 0 0;font-size:16px;line-height:1.6;color:var(--mute);text-wrap:pretty}" +
      "form{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin:20px 0 0;width:min(480px,100%)}" +
      "input{flex:1 1 220px;min-width:0;padding:11px 14px;font:400 14px/1.4 " + bf + ";color:var(--ink);background:#fff;border:1px solid rgba(32,31,29,.25);border-radius:2px;-webkit-appearance:none;appearance:none}" +
      "input:focus{outline:2px solid var(--gold);outline-offset:1px}" +
      "button{padding:11px 22px;font:600 15px/1.4 " + hf + ";color:var(--ink);background:var(--gold);border:1px solid var(--gold);border-radius:2px;cursor:pointer;-webkit-appearance:none;appearance:none}" +
      "button:hover{filter:brightness(1.07)}" +
      "button:focus-visible{outline:2px solid var(--gold-d);outline-offset:2px}" +
      "@keyframes breathe{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.03);opacity:1}}" +
      "@media (prefers-reduced-motion:reduce){.svg.moving{animation:none}}";

    var showSignup = s.signup && s.signupUrl;
    var html =
      '<div class="zn">' +
        '<div class="art' + (s.artwork === "none" ? " plain" : "") + '">' +
          (s.artwork === "bagua" ? bagua(s.accent, s.motion) : "") +
          '<div class="txt">' +
            (s.kicker ? '<div class="kick">' + ui.esc(s.kicker) + "</div>" : "") +
            "<h2>" + ui.esc(s.title) + (s.titleItalic ? (s.title ? "<br>" : "") + "<em>" + ui.esc(s.titleItalic) + "</em>" : "") + "</h2>" +
          "</div>" +
        "</div>" +
        (s.body ? '<p class="p">' + ui.text(s.body) + "</p>" : "") +
        (s.showDivider ? '<div class="rule"></div>' : "") +
        (s.note ? '<div class="sub">' + ui.text(s.note) + "</div>" : "") +
        (showSignup
          ? '<form action="' + ui.esc(s.signupUrl) + '" method="get" target="_blank">' +
              '<input type="email" name="' + ui.esc(s.signupField) + '" placeholder="' + ui.esc(s.signupPlaceholder) + '" aria-label="Email address" autocomplete="email" required>' +
              '<button type="submit">' + ui.esc(s.signupButton) + "</button>" +
            "</form>"
          : "") +
      "</div>";

    return { css: css, html: html };
  }
});

// Bagua artwork. Rotations are SMIL animateTransforms around the exact viewBox centre (200,200),
// so nothing outside the SVG can shift the pivot.
function bagua(color, motion) {
  function spin(to, dur) {
    return motion ? '<animateTransform attributeName="transform" type="rotate" from="0 200 200" to="' + to + ' 200 200" dur="' + dur + '" repeatCount="indefinite"></animateTransform>' : "";
  }
  // Trigram lines, top to bottom: 1 = solid, 0 = broken.
  var TRIGRAMS = ["111", "110", "010", "100", "000", "001", "101", "011"];
  var trigrams = TRIGRAMS.map(function (bits, i) {
    var d = "";
    for (var r = 0; r < 3; r++) {
      var y = 16 + r * 10;
      d += bits[r] === "1" ? "M190 " + y + "H210" : "M190 " + y + "H197M203 " + y + "H210";
    }
    return '<g transform="rotate(' + i * 45 + ' 200 200)"><path d="' + d + '"></path></g>';
  }).join("");
  return '<svg class="svg' + (motion ? " moving" : "") + '" viewBox="-50 -50 500 500" fill="none" stroke="' + color + '" stroke-width="1" aria-hidden="true" focusable="false">' +
    '<circle cx="200" cy="200" r="196"></circle>' +
    '<circle cx="200" cy="200" r="150" stroke-opacity=".6"></circle>' +
    '<g stroke-opacity=".55">' + spin(360, "240s") +
      '<polygon points="200,-40 369.7,30.3 440,200 369.7,369.7 200,440 30.3,369.7 -40,200 30.3,30.3"></polygon>' +
      '<polygon points="200,-18 354,46 418,200 354,354 200,418 46,354 -18,200 46,46" stroke-opacity=".5"></polygon>' +
    "</g>" +
    '<g stroke-width="2" stroke-opacity=".7">' + spin(-360, "120s") + trigrams + "</g>" +
    "<g>" + spin(360, "60s") + '<circle cx="200" cy="50" r="3" fill="' + color + '" stroke="none"></circle></g>' +
    '<circle cx="200" cy="4" r="3" fill="' + color + '" stroke="none"></circle>' +
    '<circle cx="200" cy="396" r="3" fill="' + color + '" stroke="none"></circle>' +
  "</svg>";
}
})();
