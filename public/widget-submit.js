(function () {
  "use strict";

  // Companion to widget.js, but for collecting a review instead of showing
  // them — an <iframe> onto /embed/review/{businessId}, which is the same
  // real ReviewForm the /review link page uses (nudge, validation, category
  // stars, all of it), just themed with the business's own saved
  // theme_mode/accent_color and stripped of Kelsira's own nav chrome.
  //
  // Every UI label this script owns (button/bubble copy) defaults to English
  // to match Kelsira's current target market, and can be overridden per
  // data- attribute for a business that wants something else.

  var DEFAULT_MODAL_LABEL = "★ Rate your order";
  var DEFAULT_LAUNCHER_LABEL = "Leave a review";
  var AUTO_CLOSE_AFTER_SUBMIT_MS = 4000;
  var MIN_IFRAME_HEIGHT = 200;

  function buildSrc(origin, businessId, script) {
    var params = new URLSearchParams();
    var name = script.getAttribute("data-name");
    var email = script.getAttribute("data-email");
    var product = script.getAttribute("data-product");
    if (name) params.set("name", name);
    if (email) params.set("email", email);
    if (product) params.set("product", product);
    var qs = params.toString();
    return origin + "/embed/review/" + encodeURIComponent(businessId) + (qs ? "?" + qs : "");
  }

  function makeIframe(src) {
    var iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.title = "Leave a review";
    iframe.style.width = "100%";
    iframe.style.border = "none";
    iframe.style.display = "block";
    iframe.style.height = MIN_IFRAME_HEIGHT + "px";
    return iframe;
  }

  // Every mounted iframe registers itself here so the single page-level
  // "message" listener below can find which one a resize/submitted event
  // came from — postMessage carries no id of its own, only e.source.
  var registry = [];

  function register(iframe, onSubmitted) {
    registry.push({ iframe: iframe, onSubmitted: onSubmitted });
  }

  window.addEventListener("message", function (e) {
    if (!e.data || e.data.source !== "kelsira-embed") return;
    for (var i = 0; i < registry.length; i++) {
      var entry = registry[i];
      if (entry.iframe.contentWindow !== e.source) continue;
      if (e.data.type === "resize" && typeof e.data.height === "number") {
        entry.iframe.style.height = Math.max(MIN_IFRAME_HEIGHT, e.data.height) + "px";
      } else if (e.data.type === "submitted" && entry.onSubmitted) {
        entry.onSubmitted();
      }
    }
  });

  function mountInline(container, src) {
    var iframe = makeIframe(src);
    container.appendChild(iframe);
    register(iframe, null);
  }

  function mountModal(container, src, label, autoOpenAfter) {
    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "kelsira-submit-trigger";
    trigger.textContent = label;

    var overlay = document.createElement("div");
    overlay.className = "kelsira-submit-overlay";
    overlay.style.display = "none";

    var dialog = document.createElement("div");
    dialog.className = "kelsira-submit-dialog";

    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "kelsira-submit-close";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.textContent = "✕";

    var iframeMounted = false;
    var body = document.createElement("div");
    body.className = "kelsira-submit-dialog-body";
    dialog.appendChild(closeBtn);
    dialog.appendChild(body);
    overlay.appendChild(dialog);

    function open() {
      overlay.style.display = "flex";
      if (!iframeMounted) {
        var iframe = makeIframe(src);
        body.appendChild(iframe);
        register(iframe, function () {
          setTimeout(close, AUTO_CLOSE_AFTER_SUBMIT_MS);
        });
        iframeMounted = true;
      }
    }
    function close() {
      overlay.style.display = "none";
    }

    // A visitor who already opened or dismissed this on their own shouldn't
    // have it snap back open just because the timer happened to land after —
    // auto-open is a nudge for someone who hasn't interacted at all yet.
    var userInteracted = false;
    trigger.addEventListener("click", function () {
      userInteracted = true;
      open();
    });
    closeBtn.addEventListener("click", function () {
      userInteracted = true;
      close();
    });
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) {
        userInteracted = true;
        close();
      }
    });

    container.appendChild(trigger);
    container.appendChild(overlay);

    if (autoOpenAfter != null) {
      setTimeout(function () {
        if (!userInteracted) open();
      }, autoOpenAfter * 1000);
    }
  }

  function mountLanzador(container, src, label, autoOpenAfter) {
    var wrap = document.createElement("div");
    wrap.className = "kelsira-submit-launcher";

    var panel = document.createElement("div");
    panel.className = "kelsira-submit-panel";
    panel.style.display = "none";

    var head = document.createElement("div");
    head.className = "kelsira-submit-panel-head";
    var headTitle = document.createElement("span");
    headTitle.textContent = label;
    var headClose = document.createElement("button");
    headClose.type = "button";
    headClose.setAttribute("aria-label", "Close");
    headClose.textContent = "✕";
    head.appendChild(headTitle);
    head.appendChild(headClose);

    var body = document.createElement("div");
    body.className = "kelsira-submit-panel-body";
    panel.appendChild(head);
    panel.appendChild(body);

    var bubble = document.createElement("button");
    bubble.type = "button";
    bubble.className = "kelsira-submit-bubble";
    bubble.setAttribute("aria-label", label);
    bubble.textContent = "★";

    var open = false;
    var iframeMounted = false;
    function render() {
      panel.style.display = open ? "flex" : "none";
      if (open && !iframeMounted) {
        var iframe = makeIframe(src);
        body.appendChild(iframe);
        register(iframe, null);
        iframeMounted = true;
      }
    }

    // Same "leave it alone once they've touched it" rule as the modal above.
    var userInteracted = false;
    bubble.addEventListener("click", function () {
      userInteracted = true;
      open = !open;
      render();
    });
    headClose.addEventListener("click", function () {
      userInteracted = true;
      open = false;
      render();
    });

    wrap.appendChild(panel);
    wrap.appendChild(bubble);
    container.appendChild(wrap);

    if (autoOpenAfter != null) {
      setTimeout(function () {
        if (!userInteracted && !open) {
          open = true;
          render();
        }
      }, autoOpenAfter * 1000);
    }
  }

  function injectStyles(id) {
    if (document.getElementById(id)) return;
    var style = document.createElement("style");
    style.id = id;
    style.textContent =
      ".kelsira-submit-trigger{display:inline-flex;align-items:center;gap:6px;border:1.5px solid currentColor;background:transparent;border-radius:8px;padding:9px 16px;font:inherit;font-size:13px;font-weight:600;cursor:pointer;}" +
      ".kelsira-submit-overlay{position:fixed;inset:0;z-index:2147483000;background:rgba(15,15,17,.5);align-items:center;justify-content:center;padding:20px;}" +
      ".kelsira-submit-dialog{position:relative;width:100%;max-width:360px;max-height:100%;overflow-y:auto;background:#101114;border-radius:16px;box-shadow:0 30px 70px -20px rgba(0,0,0,.5);}" +
      ".kelsira-submit-close{position:absolute;top:10px;right:12px;background:none;border:none;color:#9a9da5;font-size:14px;cursor:pointer;z-index:1;}" +
      ".kelsira-submit-launcher{position:fixed;right:20px;bottom:20px;z-index:2147483000;display:flex;flex-direction:column;align-items:flex-end;gap:12px;max-height:calc(100vh - 40px);}" +
      ".kelsira-submit-bubble{width:52px;height:52px;border-radius:50%;background:#4f7cff;color:#fff;font-size:17px;border:none;cursor:pointer;box-shadow:0 10px 26px -8px rgba(0,0,0,.4);flex-shrink:0;}" +
      ".kelsira-submit-panel{width:300px;max-height:70vh;background:#101114;border-radius:14px;overflow:hidden;box-shadow:0 20px 50px -18px rgba(0,0,0,.4);display:flex;flex-direction:column;}" +
      ".kelsira-submit-panel-head{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:#4f7cff;color:#fff;font-size:13px;font-weight:600;flex-shrink:0;}" +
      ".kelsira-submit-panel-head button{background:none;border:none;color:#fff;cursor:pointer;font-size:13px;}" +
      ".kelsira-submit-panel-body{overflow-y:auto;}" +
      ".kelsira-submit-dialog,.kelsira-submit-panel-body{scrollbar-width:thin;}" +
      ".kelsira-submit-dialog::-webkit-scrollbar,.kelsira-submit-panel-body::-webkit-scrollbar{width:6px;}" +
      ".kelsira-submit-dialog::-webkit-scrollbar-thumb,.kelsira-submit-panel-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,.25);border-radius:3px;}" +
      ".kelsira-submit-dialog::-webkit-scrollbar-track,.kelsira-submit-panel-body::-webkit-scrollbar-track{background:transparent;}";
    document.head.appendChild(style);
  }

  function mount(script) {
    var businessId = script.getAttribute("data-business-id");
    if (!businessId) return;

    var style = script.getAttribute("data-style") || "inline";
    var origin = new URL(script.src).origin;
    var src = buildSrc(origin, businessId, script);

    // Opt-in only — omit data-auto-open-after and nothing changes from
    // click-to-open. Any non-negative number of seconds; invalid values are
    // ignored rather than treated as "open instantly", which would surprise
    // a merchant who mistyped the attribute.
    var autoOpenAfterRaw = script.getAttribute("data-auto-open-after");
    var autoOpenAfter = null;
    if (autoOpenAfterRaw != null) {
      var parsed = parseFloat(autoOpenAfterRaw);
      if (!isNaN(parsed) && parsed >= 0) autoOpenAfter = parsed;
    }

    var container = document.createElement("div");
    container.className = "kelsira-submit-widget";
    script.parentNode.insertBefore(container, script.nextSibling);

    injectStyles("kelsira-submit-styles");

    if (style === "modal") {
      mountModal(container, src, script.getAttribute("data-label") || DEFAULT_MODAL_LABEL, autoOpenAfter);
    } else if (style === "lanzador") {
      mountLanzador(container, src, script.getAttribute("data-label") || DEFAULT_LAUNCHER_LABEL, autoOpenAfter);
    } else {
      mountInline(container, src);
    }
  }

  mount(document.currentScript);
})();
