/*! Legacy embed for the Zenotica Coming Soon widget — kept so existing embeds keep working:
 *   <script src="https://widgets.ionstack.dev/zenotica-coming-soon.js" async></script>
 *   <div class="zenotica-coming-soon"></div>
 * It tags those placeholders as platform widgets and loads platform.js.
 * New embeds should use platform.js with <div class="ion-widget" data-id="zenotica-coming-soon"></div>.
 */
(function () {
  "use strict";
  var src = document.currentScript && document.currentScript.src;
  var base = src ? src.replace(/[^\/?#]*([?#].*)?$/, "") : "https://widgets.ionstack.dev/";

  function tag() {
    var els = document.querySelectorAll(".zenotica-coming-soon:not(.ion-widget)");
    for (var i = 0; i < els.length; i++) {
      els[i].setAttribute("data-id", "zenotica-coming-soon");
      els[i].classList.add("ion-widget");
    }
  }

  function init() {
    tag();
    if (window.MutationObserver) new MutationObserver(tag).observe(document.documentElement, { childList: true, subtree: true });
    if (!window.IonWidgets && !document.querySelector('script[src^="' + base + 'platform.js"]')) {
      var s = document.createElement("script");
      s.src = base + "platform.js";
      s.async = true;
      (document.head || document.documentElement).appendChild(s);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
