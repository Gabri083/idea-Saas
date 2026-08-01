(function () {
  "use strict";

  var RADIUS_MAP = { none: "0px", sm: "6px", md: "10px", lg: "16px", full: "999px" };

  function starString(value) {
    var full = Math.round(value);
    return "★★★★★☆☆☆☆☆".slice(5 - full, 10 - full);
  }

  function injectStyles(id) {
    if (document.getElementById(id)) return;
    var style = document.createElement("style");
    style.id = id;
    style.textContent =
      ".veris-widget{font-family:var(--veris-font,inherit);color:var(--veris-fg);}" +
      ".veris-widget *{box-sizing:border-box;}" +
      ".veris-badge{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border:1px solid var(--veris-border);border-radius:var(--veris-radius);background:var(--veris-bg);}" +
      ".veris-star{color:#f5a623;font-size:16px;letter-spacing:1px;}" +
      ".veris-carousel{display:flex;gap:12px;overflow-x:auto;padding:4px 2px;}" +
      ".veris-card{flex:0 0 260px;border:1px solid var(--veris-border);border-radius:var(--veris-radius);padding:16px;background:var(--veris-bg);}" +
      ".veris-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;}" +
      ".veris-name{font-size:12px;opacity:.6;margin-top:8px;}" +
      ".veris-breakdown{display:flex;gap:10px;margin-top:10px;font-size:11px;opacity:.7;}" +
      ".veris-powered{font-size:10px;opacity:.5;margin-top:10px;text-align:right;}";
    document.head.appendChild(style);
  }

  function renderCard(review, showBreakdown) {
    var card = document.createElement("div");
    card.className = "veris-card";
    card.innerHTML =
      '<div class="veris-star">' + starString(review.overall_ai_rating) + " " +
      review.overall_ai_rating.toFixed(1) + "/5</div>" +
      "<div>" + escapeHtml(truncate(review.review_text, 140)) + "</div>" +
      '<div class="veris-name">— ' + escapeHtml(review.customer_name) + "</div>" +
      (showBreakdown
        ? '<div class="veris-breakdown"><span>Producto ' + review.product_score +
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
    container.className = "veris-widget";
    script.parentNode.insertBefore(container, script.nextSibling);

    fetch(origin + "/api/widget/" + encodeURIComponent(businessId))
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        injectStyles("veris-widget-styles");

        var isDark = data.config.theme_mode === "dark";
        container.style.setProperty("--veris-bg", isDark ? "#101114" : "#ffffff");
        container.style.setProperty("--veris-fg", isDark ? "#f4f5f7" : "#111318");
        container.style.setProperty("--veris-border", isDark ? "#232529" : "#e5e7eb");
        container.style.setProperty("--veris-radius", RADIUS_MAP[data.config.border_radius] || "10px");

        if (data.config.layout === "badge" || data.total_reviews === 0) {
          var badge = document.createElement("div");
          badge.className = "veris-badge";
          badge.innerHTML =
            '<span class="veris-star">' + starString(data.average_rating) + "</span>" +
            "<strong>" + data.average_rating.toFixed(1) + "/5</strong>" +
            "<span style='opacity:.6;font-size:12px'>(" + data.total_reviews + " reseñas · Puntaje Objetivo IA)</span>";
          container.appendChild(badge);
          return;
        }

        var list = document.createElement("div");
        list.className = data.config.layout === "grid" ? "veris-grid" : "veris-carousel";
        data.reviews.forEach(function (review) {
          list.appendChild(renderCard(review, data.config.show_breakdown));
        });
        container.appendChild(list);

        var footer = document.createElement("div");
        footer.className = "veris-powered";
        footer.textContent = "Reseñas verificadas por Veris — Puntaje Objetivo IA";
        container.appendChild(footer);
      })
      .catch(function () {
        container.textContent = "";
      });
  }

  mount(document.currentScript);
})();
