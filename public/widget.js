(function () {
  "use strict";

  // "full" is capped at 28px rather than a true pill (999px): that reads fine on
  // the short single-line badge, but mangles multi-line review cards.
  var RADIUS_MAP = { none: "0px", sm: "6px", md: "10px", lg: "16px", full: "28px" };
  var FONT_MAP = {
    inter: "Inter, ui-sans-serif, sans-serif",
    "system-ui": "system-ui, sans-serif",
    georgia: "Georgia, serif",
    mono: "ui-monospace, monospace",
  };
  var STAR_PATH =
    "M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z";
  var AVATAR_HUES = [210, 260, 330, 20, 160, 40, 280, 190];
  var SPOTLIGHT_INTERVAL_MS = 5000;

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function truncate(str, n) {
    return str.length > n ? str.slice(0, n).trim() + "…" : str;
  }

  function hashStr(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
  }

  function initials(name) {
    var parts = name.trim().split(/\s+/);
    var out = (parts[0] ? parts[0][0] : "") + (parts[1] ? parts[1][0] : "");
    return out.toUpperCase() || "?";
  }

  function avatarHtml(name) {
    var hue = AVATAR_HUES[hashStr(name) % AVATAR_HUES.length];
    return (
      '<span class="kelsira-avatar" style="background:hsl(' +
      hue +
      ',65%,50%)">' +
      escapeHtml(initials(name)) +
      "</span>"
    );
  }

  function formatDate(iso) {
    try {
      return new Intl.DateTimeFormat("es", { day: "numeric", month: "short" }).format(new Date(iso));
    } catch {
      return "";
    }
  }

  function starSvg(color, size) {
    return (
      '<svg width="' +
      size +
      '" height="' +
      size +
      '" viewBox="0 0 24 24" fill="' +
      color +
      '" style="display:block"><path d="' +
      STAR_PATH +
      '"/></svg>'
    );
  }

  function starsHtml(value, size, accent) {
    size = size || 15;
    var html = '<span class="kelsira-stars">';
    for (var i = 0; i < 5; i++) {
      var pct = Math.max(0, Math.min(100, (value - i) * 100));
      html +=
        '<span class="kelsira-star-slot" style="width:' +
        size +
        "px;height:" +
        size +
        'px">' +
        '<span class="kelsira-star-bg">' +
        starSvg("currentColor", size) +
        "</span>" +
        '<span class="kelsira-star-fg" style="width:' +
        pct +
        '%">' +
        starSvg(accent, size) +
        "</span>" +
        "</span>";
    }
    html += "</span>";
    return html;
  }

  function breakdownHtml(review) {
    return (
      '<div class="kelsira-breakdown">' +
      '<span class="kelsira-pill">Producto ' +
      review.product_score +
      "★</span>" +
      '<span class="kelsira-pill">Atención ' +
      review.service_score +
      "★</span>" +
      '<span class="kelsira-pill">Envío ' +
      review.delivery_score +
      "★</span>" +
      "</div>"
    );
  }

  function cardHtml(review, showBreakdown, accent) {
    return (
      '<div class="kelsira-card">' +
      '<div class="kelsira-card-top">' +
      starsHtml(review.overall_ai_rating, 15, accent) +
      '<span class="kelsira-rating-num" style="color:' +
      accent +
      '">' +
      review.overall_ai_rating.toFixed(1) +
      "</span>" +
      '<span class="kelsira-ai-tag" title="Puntaje calculado por IA a partir del texto de la reseña">IA</span>' +
      "</div>" +
      '<p class="kelsira-quote">' +
      escapeHtml(truncate(review.review_text, 140)) +
      "</p>" +
      '<div class="kelsira-card-foot">' +
      avatarHtml(review.customer_name) +
      '<div class="kelsira-name-col"><span class="kelsira-name">' +
      escapeHtml(review.customer_name) +
      "</span>" +
      '<span class="kelsira-date">' +
      formatDate(review.created_at) +
      "</span></div>" +
      "</div>" +
      (showBreakdown ? breakdownHtml(review) : "") +
      "</div>"
    );
  }

  function injectStyles(id) {
    if (document.getElementById(id)) return;
    var style = document.createElement("style");
    style.id = id;
    style.textContent =
      ".kelsira-widget{font-family:var(--kelsira-font,inherit);color:var(--kelsira-fg);}" +
      ".kelsira-widget *{box-sizing:border-box;}" +
      ".kelsira-stars{display:inline-flex;gap:2px;color:var(--kelsira-star-bg);}" +
      ".kelsira-star-slot{position:relative;display:inline-block;}" +
      ".kelsira-star-bg{position:absolute;inset:0;}" +
      ".kelsira-star-fg{position:absolute;inset:0;overflow:hidden;}" +
      ".kelsira-avatar{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;color:#fff;font-size:12.5px;font-weight:600;flex-shrink:0;letter-spacing:.02em;}" +
      ".kelsira-badge{display:inline-flex;align-items:center;gap:10px;padding:11px 18px;border:1px solid var(--kelsira-border);border-radius:var(--kelsira-radius);background:var(--kelsira-bg);box-shadow:0 1px 2px rgba(0,0,0,.05),0 6px 18px -10px rgba(0,0,0,.18);}" +
      ".kelsira-badge-rating{font-weight:700;font-size:15px;}" +
      ".kelsira-badge-sub{font-size:12px;opacity:.6;}" +
      ".kelsira-carousel{display:flex;gap:14px;overflow-x:auto;padding:6px 2px 14px;scroll-snap-type:x proximity;}" +
      ".kelsira-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px;}" +
      ".kelsira-wall{display:flex;flex-direction:column;gap:12px;}" +
      ".kelsira-card{position:relative;border-radius:var(--kelsira-radius);padding:18px;background:var(--kelsira-bg);border:1px solid var(--kelsira-border);box-shadow:0 1px 2px rgba(0,0,0,.04),0 10px 24px -14px rgba(0,0,0,.16);transition:transform .18s ease,box-shadow .18s ease;overflow:hidden;}" +
      ".kelsira-card:hover{transform:translateY(-3px);box-shadow:0 4px 10px rgba(0,0,0,.06),0 18px 32px -12px rgba(0,0,0,.22);}" +
      ".kelsira-carousel .kelsira-card{flex:0 0 270px;scroll-snap-align:start;}" +
      ".kelsira-card-top{display:flex;align-items:center;gap:6px;margin-bottom:10px;}" +
      ".kelsira-rating-num{font-weight:700;font-size:13.5px;}" +
      ".kelsira-ai-tag{font-size:9px;font-weight:700;letter-spacing:.03em;opacity:.45;border:1px solid currentColor;border-radius:4px;padding:1px 4px;line-height:1.4;cursor:default;}" +
      ".kelsira-quote{font-size:13.5px;line-height:1.55;margin:0;opacity:.92;}" +
      ".kelsira-quote:before{content:'\\201C';}" +
      ".kelsira-quote:after{content:'\\201D';}" +
      ".kelsira-card-foot{display:flex;align-items:center;gap:10px;margin-top:14px;}" +
      ".kelsira-name-col{display:flex;flex-direction:column;line-height:1.25;min-width:0;}" +
      ".kelsira-name{font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}" +
      ".kelsira-date{font-size:11px;opacity:.55;}" +
      ".kelsira-breakdown{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;}" +
      ".kelsira-pill{font-size:10.5px;padding:3px 9px;border-radius:999px;background:var(--kelsira-pill-bg);opacity:.85;}" +
      ".kelsira-spotlight{border-radius:var(--kelsira-radius);border:1px solid var(--kelsira-border);background:var(--kelsira-bg);padding:28px;box-shadow:0 1px 2px rgba(0,0,0,.04),0 10px 24px -14px rgba(0,0,0,.16);}" +
      ".kelsira-spotlight-inner{transition:opacity .22s ease;text-align:center;}" +
      ".kelsira-spotlight .kelsira-stars{justify-content:center;}" +
      ".kelsira-spotlight .kelsira-quote{font-size:16px;margin-top:14px;}" +
      ".kelsira-spotlight .kelsira-card-foot{justify-content:center;margin-top:18px;text-align:left;}" +
      ".kelsira-spotlight .kelsira-breakdown{justify-content:center;}" +
      ".kelsira-dots{display:flex;justify-content:center;gap:6px;margin-top:18px;}" +
      ".kelsira-dot{width:6px;height:6px;border-radius:50%;background:var(--kelsira-border);border:none;padding:0;cursor:pointer;transition:width .2s ease,background .2s ease;}" +
      ".kelsira-dot--active{width:18px;border-radius:3px;background:var(--kelsira-accent);}" +
      ".kelsira-empty{font-size:13px;opacity:.7;}" +
      ".kelsira-powered{font-size:10px;opacity:.5;margin-top:12px;text-align:right;}";
    document.head.appendChild(style);
  }

  function mountSpotlight(container, reviews, showBreakdown, accent) {
    var wrap = document.createElement("div");
    wrap.className = "kelsira-spotlight";
    var inner = document.createElement("div");
    inner.className = "kelsira-spotlight-inner";
    wrap.appendChild(inner);

    var dots = null;
    if (reviews.length > 1) {
      dots = document.createElement("div");
      dots.className = "kelsira-dots";
      wrap.appendChild(dots);
    }

    var index = 0;
    var timer = null;

    function render() {
      var r = reviews[index];
      inner.innerHTML =
        starsHtml(r.overall_ai_rating, 18, accent) +
        '<span class="kelsira-ai-tag" title="Puntaje calculado por IA a partir del texto de la reseña">IA</span>' +
        '<p class="kelsira-quote">' +
        escapeHtml(truncate(r.review_text, 220)) +
        "</p>" +
        '<div class="kelsira-card-foot">' +
        avatarHtml(r.customer_name) +
        '<div class="kelsira-name-col"><span class="kelsira-name">' +
        escapeHtml(r.customer_name) +
        "</span>" +
        '<span class="kelsira-date">' +
        formatDate(r.created_at) +
        "</span></div>" +
        "</div>" +
        (showBreakdown ? breakdownHtml(r) : "");

      if (dots) {
        dots.innerHTML = "";
        for (var i = 0; i < reviews.length; i++) {
          (function (i) {
            var dot = document.createElement("button");
            dot.type = "button";
            dot.className = "kelsira-dot" + (i === index ? " kelsira-dot--active" : "");
            dot.setAttribute("aria-label", "Reseña " + (i + 1));
            dot.addEventListener("click", function () {
              goTo(i);
            });
            dots.appendChild(dot);
          })(i);
        }
      }
    }

    function goTo(i) {
      index = i;
      inner.style.opacity = "0";
      setTimeout(function () {
        render();
        inner.style.opacity = "1";
      }, 200);
      restart();
    }

    function tick() {
      goTo((index + 1) % reviews.length);
    }

    function restart() {
      if (timer) clearInterval(timer);
      if (reviews.length > 1) timer = setInterval(tick, SPOTLIGHT_INTERVAL_MS);
    }

    render();
    restart();

    wrap.addEventListener("mouseenter", function () {
      if (timer) clearInterval(timer);
    });
    wrap.addEventListener("mouseleave", restart);

    container.appendChild(wrap);
  }

  function mount(script) {
    var businessId = script.getAttribute("data-business-id");
    if (!businessId) return;

    var origin = new URL(script.src).origin;
    var container = document.createElement("div");
    container.className = "kelsira-widget";
    script.parentNode.insertBefore(container, script.nextSibling);

    fetch(origin + "/api/widget/" + encodeURIComponent(businessId))
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        injectStyles("kelsira-widget-styles");

        var isDark = data.config.theme_mode === "dark";
        var accent = data.config.accent_color || "#4f7cff";
        container.style.setProperty("--kelsira-bg", isDark ? "#101114" : "#ffffff");
        container.style.setProperty("--kelsira-fg", isDark ? "#f4f5f7" : "#111318");
        container.style.setProperty("--kelsira-border", isDark ? "#232529" : "#e5e7eb");
        container.style.setProperty("--kelsira-star-bg", isDark ? "#3a3d44" : "#e2e4e8");
        container.style.setProperty("--kelsira-pill-bg", isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)");
        container.style.setProperty("--kelsira-accent", accent);
        container.style.setProperty("--kelsira-radius", RADIUS_MAP[data.config.border_radius] || "10px");
        container.style.setProperty("--kelsira-font", FONT_MAP[data.config.font_family] || "inherit");

        if (data.total_reviews === 0) {
          var empty = document.createElement("div");
          empty.className = "kelsira-badge kelsira-empty";
          empty.textContent = "Aún no hay reseñas verificadas.";
          container.appendChild(empty);
          return;
        }

        if (data.config.layout === "badge") {
          var badge = document.createElement("div");
          badge.className = "kelsira-badge";
          badge.innerHTML =
            starsHtml(data.average_rating, 16, accent) +
            '<span class="kelsira-badge-rating" style="color:' +
            accent +
            '">' +
            data.average_rating.toFixed(1) +
            "/5</span>" +
            '<span class="kelsira-badge-sub">(' +
            data.total_reviews +
            " reseñas · Puntaje Objetivo IA)</span>";
          container.appendChild(badge);
        } else if (data.config.layout === "spotlight") {
          mountSpotlight(container, data.reviews, data.config.show_breakdown, accent);
        } else {
          var list = document.createElement("div");
          list.className =
            data.config.layout === "grid"
              ? "kelsira-grid"
              : data.config.layout === "wall"
                ? "kelsira-wall"
                : "kelsira-carousel";
          data.reviews.forEach(function (review) {
            list.insertAdjacentHTML("beforeend", cardHtml(review, data.config.show_breakdown, accent));
          });
          container.appendChild(list);
        }

        if (data.config.show_branding) {
          var footer = document.createElement("div");
          footer.className = "kelsira-powered";
          footer.textContent = "Reseñas verificadas por Kelsira — Puntaje Objetivo IA";
          container.appendChild(footer);
        }
      })
      .catch(function () {
        container.textContent = "";
      });
  }

  mount(document.currentScript);
})();
