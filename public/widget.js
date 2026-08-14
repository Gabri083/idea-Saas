(function () {
  "use strict";

  // "full" is capped at 28px rather than a true pill (999px): that reads fine on
  // the short single-line badge, but mangles multi-line review cards.
  var RADIUS_MAP = { none: "0px", sm: "6px", md: "10px", lg: "16px", full: "28px" };

  function starString(value) {
    var full = Math.round(value);
    return "★★★★★☆☆☆☆☆".slice(5 - full, 10 - full);
  }

  function injectStyles(id) {
    if (document.getElementById(id)) return;
    var style = document.createElement("style");
    style.id = id;
    style.textContent =
      ".kelsira-widget{font-family:var(--kelsira-font,inherit);color:var(--kelsira-fg);}" +
      ".kelsira-widget *{box-sizing:border-box;}" +
      ".kelsira-badge{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border:1px solid var(--kelsira-border);border-radius:var(--kelsira-radius);background:var(--kelsira-bg);}" +
      ".kelsira-star{color:#f5a623;font-size:16px;letter-spacing:1px;}" +
      ".kelsira-carousel{display:flex;gap:12px;overflow-x:auto;padding:4px 2px;}" +
      ".kelsira-card{flex:0 0 260px;border:1px solid var(--kelsira-border);border-radius:var(--kelsira-radius);padding:16px;background:var(--kelsira-bg);overflow:hidden;}" +
      ".kelsira-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;}" +
      ".kelsira-name{font-size:12px;opacity:.6;margin-top:8px;}" +
      ".kelsira-breakdown{display:flex;gap:10px;margin-top:10px;font-size:11px;opacity:.7;}" +
      ".kelsira-powered{font-size:10px;opacity:.5;margin-top:10px;text-align:right;}";
    document.head.appendChild(style);
  }

  function renderCard(review, showBreakdown) {
    var card = document.createElement("div");
    card.className = "kelsira-card";
    card.innerHTML =
      '<div class="kelsira-star">' + starString(review.overall_ai_rating) + " " +
      review.overall_ai_rating.toFixed(1) + "/5</div>" +
      "<div>" + escapeHtml(truncate(review.review_text, 140)) + "</div>" +
      '<div class="kelsira-name">— ' + escapeHtml(review.customer_name) + "</div>" +
      (showBreakdown
        ? '<div class="kelsira-breakdown"><span>Producto ' + review.product_score +
          "★</span><span>Atención " + review.service_score +
          "★</span><span>Envío " + review.delivery_score + "★</span></div>"
        : "");
    return card;
  }

  function truncate(str, n) {
    return str.length > n ? str.slice(0, n).trim() + "…" : str;
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
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
        container.style.setProperty("--kelsira-bg", isDark ? "#101114" : "#ffffff");
        container.style.setProperty("--kelsira-fg", isDark ? "#f4f5f7" : "#111318");
        container.style.setProperty("--kelsira-border", isDark ? "#232529" : "#e5e7eb");
        container.style.setProperty("--kelsira-radius", RADIUS_MAP[data.config.border_radius] || "10px");

        if (data.config.layout === "badge" || data.total_reviews === 0) {
          var badge = document.createElement("div");
          badge.className = "kelsira-badge";
          badge.innerHTML =
            '<span class="kelsira-star">' + starString(data.average_rating) + "</span>" +
            "<strong>" + data.average_rating.toFixed(1) + "/5</strong>" +
            "<span style='opacity:.6;font-size:12px'>(" + data.total_reviews + " reseñas · Puntaje Objetivo IA)</span>";
          container.appendChild(badge);
          return;
        }

        var list = document.createElement("div");
        list.className = data.config.layout === "grid" ? "kelsira-grid" : "kelsira-carousel";
        data.reviews.forEach(function (review) {
          list.appendChild(renderCard(review, data.config.show_breakdown));
        });
        container.appendChild(list);

        var footer = document.createElement("div");
        footer.className = "kelsira-powered";
        footer.textContent = "Reseñas verificadas por Kelsira — Puntaje Objetivo IA";
        container.appendChild(footer);
      })
      .catch(function () {
        container.textContent = "";
      });
  }

  mount(document.currentScript);
})();
