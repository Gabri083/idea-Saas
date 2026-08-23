(function () {
  "use strict";

  // "full" is capped at 28px rather than a true pill (999px): that reads fine on
  // the short single-line badge, but mangles multi-line review cards.
  var RADIUS_MAP = { none: "0px", sm: "6px", md: "10px", lg: "16px", full: "28px" };
  // El Recibo's cut corner (see .kelsira-ticket below) is a fixed, deliberate
  // 8px — part of the style's identity, not a "Bordes" setting. Scaling it
  // 0-12px was too subtle to read as working next to every other style's
  // dramatic 0-28px rounding, so the configurator hides "Bordes" for this
  // style instead of pretending.
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
  // Below this gap between the customer's own star pick and the AI score, we
  // treat them as "the same" — the AI confirmed the customer, it didn't correct
  // them, so the copy shouldn't read like a correction happened.
  var CONFIRM_EPSILON = 0.15;

  // Every UI string the widget itself renders (not the review text, which is
  // never touched) — keyed off the embedding business's own locale, since a
  // storefront visitor has no Kelsira session/cookie of their own to read.
  var STRINGS = {
    en: {
      aiTagTitle: "Score calculated by AI from the review's text",
      aiTag: "AI",
      confirmedCaption: "Confirmed by AI",
      correctedCaption: "Corrected on facts, not anger",
      product: "Product",
      service: "Service",
      delivery: "Shipping",
      replyFrom: "Reply from ",
      reviewAriaLabel: "Review ",
      reviewsWord: "reviews",
      verifiedReviewsWord: "verified reviews",
      kelsiraVerified: "Verified by Kelsira",
      aiScoresHeader: "AI objective scores",
      viewReviews: "View reviews →",
      viewAllPrefix: "View all ",
      viewVerifiedAria: "View verified reviews",
      noReviewsYet: "No verified reviews yet.",
      poweredFooter: "Reviews verified by Kelsira — AI Objective Score",
      clientAndAi: "Customer & AI: ",
      client: "Customer ",
      dateLocale: "en-US",
      notificationJustLeft: "{name} left a {score} review",
      comparatorAbove: "{delta}% above the {category} average",
      comparatorBelow: "{delta}% below the {category} average",
      comparatorOnPar: "On par with the {category} average",
      checkoutTrustText: "{n} verified purchases — AI-scored, uncensored.",
    },
    es: {
      aiTagTitle: "Puntaje calculado por IA a partir del texto de la reseña",
      aiTag: "IA",
      confirmedCaption: "Confirmado por IA",
      correctedCaption: "Corrección por hechos, no por enojo",
      product: "Producto",
      service: "Atención",
      delivery: "Envío",
      replyFrom: "Respuesta de ",
      reviewAriaLabel: "Reseña ",
      reviewsWord: "reseñas",
      verifiedReviewsWord: "reseñas verificadas",
      kelsiraVerified: "Verificado por Kelsira",
      aiScoresHeader: "Puntajes objetivo IA",
      viewReviews: "Ver reseñas →",
      viewAllPrefix: "Ver las ",
      viewVerifiedAria: "Ver reseñas verificadas",
      noReviewsYet: "Aún no hay reseñas verificadas.",
      poweredFooter: "Reseñas verificadas por Kelsira — Puntaje Objetivo IA",
      clientAndAi: "Cliente e IA: ",
      client: "Cliente ",
      dateLocale: "es",
      notificationJustLeft: "{name} dejó una reseña de {score}",
      comparatorAbove: "{delta}% arriba del promedio de {category}",
      comparatorBelow: "{delta}% bajo el promedio de {category}",
      comparatorOnPar: "En línea con el promedio de {category}",
      checkoutTrustText: "{n} compras verificadas — evaluadas por IA, sin censura.",
    },
  };
  // Reassigned in mount() once the business's locale arrives — safe as a
  // module-level var because each embedded <script> tag re-runs this whole
  // IIFE in its own fresh scope, so multiple widgets on one page never share it.
  var T = STRINGS.en;

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

  function avatarHtml(name, size) {
    var hue = AVATAR_HUES[hashStr(name) % AVATAR_HUES.length];
    return (
      '<span class="kelsira-avatar" style="background:hsl(' +
      hue +
      ',65%,50%);' +
      (size ? "width:" + size + "px;height:" + size + "px;font-size:" + Math.round(size * 0.37) + "px;" : "") +
      '">' +
      escapeHtml(initials(name)) +
      "</span>"
    );
  }

  function formatDate(iso) {
    try {
      return new Intl.DateTimeFormat(T.dateLocale, { day: "numeric", month: "short" }).format(new Date(iso));
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

  // Is the AI score effectively the same as what the customer picked? If so,
  // the copy/visuals should read as "confirmed", never as a correction.
  function isConfirmed(review) {
    return (
      review.customer_star_rating == null ||
      Math.abs(review.customer_star_rating - review.overall_ai_rating) < CONFIRM_EPSILON
    );
  }

  function aiTagHtml() {
    return '<span class="kelsira-ai-tag" title="' + T.aiTagTitle + '">' + T.aiTag + "</span>";
  }

  // The signature "correction line" shared by El Recibo and El Medidor: a
  // struck-through customer pick → the AI's final score, like a discounted
  // price — or, when they agree, a single confirmed number.
  function correctionRowHtml(review, accent) {
    if (isConfirmed(review)) {
      return {
        row:
          '<span class="kelsira-final" style="color:' + accent + '">' + review.overall_ai_rating.toFixed(1) + "</span>" +
          aiTagHtml(),
        caption: T.confirmedCaption,
      };
    }
    return {
      row:
        '<span class="kelsira-raw">' + review.customer_star_rating.toFixed(1) + "★</span>" +
        '<span class="kelsira-arrow">→</span>' +
        '<span class="kelsira-final" style="color:' + accent + '">' + review.overall_ai_rating.toFixed(1) + "</span>" +
        aiTagHtml(),
      caption: T.correctedCaption,
    };
  }

  function breakdownHtml(review) {
    return (
      '<div class="kelsira-breakdown">' +
      '<span class="kelsira-pill">' + T.product + " " +
      review.product_score +
      "★</span>" +
      '<span class="kelsira-pill">' + T.service + " " +
      review.service_score +
      "★</span>" +
      '<span class="kelsira-pill">' + T.delivery + " " +
      review.delivery_score +
      "★</span>" +
      "</div>"
    );
  }

  function replyHtml(review, businessName) {
    if (!review.business_reply) return "";
    return (
      '<div class="kelsira-reply">' +
      '<span class="kelsira-reply-from">' + T.replyFrom +
      escapeHtml(businessName) +
      "</span>" +
      '<p class="kelsira-reply-text">' +
      escapeHtml(truncate(review.business_reply, 280)) +
      "</p>" +
      "</div>"
    );
  }

  // ---------- El Recibo: ticket-shaped card, correction line up top ----------
  function reciboCardHtml(review, showBreakdown, accent, businessName) {
    var c = correctionRowHtml(review, accent);
    return (
      '<div class="kelsira-ticket">' +
      '<div class="kelsira-ticket-head">' +
      '<div class="kelsira-correction-row">' + c.row + "</div>" +
      '<div class="kelsira-correction-caption">' + c.caption + "</div>" +
      starsHtml(review.overall_ai_rating, 14, accent) +
      "</div>" +
      '<div class="kelsira-perforation"></div>' +
      '<div class="kelsira-ticket-body">' +
      '<p class="kelsira-quote">' +
      escapeHtml(truncate(review.review_text, 160)) +
      "</p>" +
      (showBreakdown ? breakdownHtml(review) : "") +
      '<div class="kelsira-card-foot">' +
      avatarHtml(review.customer_name) +
      '<div class="kelsira-name-col"><span class="kelsira-name">' +
      escapeHtml(review.customer_name) +
      "</span>" +
      '<span class="kelsira-date">' +
      formatDate(review.created_at) +
      "</span></div>" +
      "</div>" +
      "</div>" +
      replyHtml(review, businessName) +
      "</div>"
    );
  }

  // ---------- El Medidor: comparative gauge, no strikethrough text ----------
  function medidorCardHtml(review, showBreakdown, accent, businessName) {
    var confirmed = isConfirmed(review);
    var rawPct = confirmed ? null : Math.max(0, Math.min(100, ((review.customer_star_rating - 1) / 4) * 100));
    var finalPct = Math.max(0, Math.min(100, ((review.overall_ai_rating - 1) / 4) * 100));
    var fillPct = confirmed ? finalPct : Math.min(rawPct, finalPct);
    var fillWidth = confirmed ? finalPct : Math.abs(finalPct - rawPct);
    return (
      '<div class="kelsira-gauge-card">' +
      '<div class="kelsira-gauge-head">' +
      starsHtml(review.overall_ai_rating, 14, accent) +
      aiTagHtml() +
      "</div>" +
      '<p class="kelsira-quote kelsira-gauge-quote">' +
      escapeHtml(truncate(review.review_text, 130)) +
      "</p>" +
      '<div class="kelsira-gauge-track">' +
      '<div class="kelsira-gauge-fill" style="left:' + fillPct + '%;width:' + fillWidth + '%"></div>' +
      (confirmed ? "" : '<div class="kelsira-gauge-dot" style="left:' + rawPct + '%"></div>') +
      '<div class="kelsira-gauge-pin" style="left:' + finalPct + '%;background:' + accent + '"></div>' +
      "</div>" +
      '<div class="kelsira-gauge-legend">' +
      (confirmed
        ? '<span>' + T.clientAndAi + '<b style="color:' + accent + '">' + review.overall_ai_rating.toFixed(1) + "</b></span>"
        : '<span>' + T.client + '<b>' + review.customer_star_rating.toFixed(1) + "</b></span>" +
          '<span style="color:' + accent + '">' + T.aiTag + ' <b style="color:' + accent + '">' + review.overall_ai_rating.toFixed(1) + "</b></span>") +
      "</div>" +
      (showBreakdown ? breakdownHtml(review) : "") +
      '<div class="kelsira-card-foot">' +
      avatarHtml(review.customer_name) +
      '<div class="kelsira-name-col"><span class="kelsira-name">' +
      escapeHtml(review.customer_name) +
      "</span>" +
      '<span class="kelsira-date">' +
      formatDate(review.created_at) +
      "</span></div>" +
      "</div>" +
      replyHtml(review, businessName) +
      "</div>"
    );
  }

  function cardHtml(review, showBreakdown, accent, businessName, cardStyle) {
    return cardStyle === "medidor"
      ? medidorCardHtml(review, showBreakdown, accent, businessName)
      : reciboCardHtml(review, showBreakdown, accent, businessName);
  }

  // ---------- La Cita: oversized spotlight quote ----------
  function mountSpotlight(container, reviews, showBreakdown, accent, businessName) {
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
      var confirmed = isConfirmed(r);
      inner.innerHTML =
        '<p class="kelsira-big-quote">' + escapeHtml(truncate(r.review_text, 220)) + "</p>" +
        '<div class="kelsira-spotlight-foot">' +
        avatarHtml(r.customer_name) +
        '<div class="kelsira-name-col" style="text-align:left"><span class="kelsira-name">' +
        escapeHtml(r.customer_name) +
        "</span>" +
        starsHtml(r.overall_ai_rating, 12, accent) +
        "</div>" +
        '<span class="kelsira-quote-chip">' +
        (confirmed
          ? '<span class="kelsira-final" style="color:' + accent + '">' + r.overall_ai_rating.toFixed(1) + "</span>"
          : '<span class="kelsira-raw">' + r.customer_star_rating.toFixed(1) + "★</span>" +
            '<span class="kelsira-arrow">→</span>' +
            '<span class="kelsira-final" style="color:' + accent + '">' + r.overall_ai_rating.toFixed(1) + "</span>") +
        aiTagHtml() +
        "</span>" +
        "</div>" +
        (showBreakdown ? breakdownHtml(r) : "") +
        replyHtml(r, businessName);

      if (dots) {
        dots.innerHTML = "";
        for (var i = 0; i < reviews.length; i++) {
          (function (i) {
            var dot = document.createElement("button");
            dot.type = "button";
            dot.className = "kelsira-dot" + (i === index ? " kelsira-dot--active" : "");
            dot.setAttribute("aria-label", T.reviewAriaLabel + (i + 1));
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

  // ---------- El Clásico: minimal single-line badge ----------
  function mountBadge(container, data, accent, origin) {
    var showBranding = data.config.show_branding;
    var badge = document.createElement("div");
    badge.className = "kelsira-badge";
    badge.innerHTML =
      (showBranding
        ? '<img class="kelsira-badge-logo" src="' + origin + '/logo-mark.png" alt="" width="22" height="22">'
        : "") +
      '<div class="kelsira-badge-main">' +
      '<div class="kelsira-badge-top">' +
      starsHtml(data.average_rating, 16, accent) +
      '<span class="kelsira-badge-rating" style="color:' + accent + '">' + data.average_rating.toFixed(1) + "</span>" +
      aiTagHtml() +
      "</div>" +
      '<span class="kelsira-badge-sub">' +
      data.total_reviews +
      " " + T.verifiedReviewsWord +
      (showBranding ? " · Kelsira" : "") +
      "</span>" +
      "</div>";
    container.appendChild(badge);
  }

  // ---------- El Sello: circular seal ----------
  function mountSello(container, data, accent, origin) {
    var showBranding = data.config.show_branding;
    var wrap = document.createElement("div");
    wrap.className = "kelsira-seal-wrap";
    wrap.innerHTML =
      '<div class="kelsira-seal" style="--kelsira-seal-accent:' + accent + '">' +
      '<span class="kelsira-seal-num">' + data.average_rating.toFixed(1) + "</span>" +
      starsHtml(data.average_rating, 12, accent) +
      '<span class="kelsira-seal-sub">' + data.total_reviews + " " + T.reviewsWord + " · " + T.aiTag + "</span>" +
      "</div>" +
      (showBranding
        ? '<div class="kelsira-seal-caption">' +
          '<img src="' + origin + '/logo-mark.png" alt="" width="16" height="16">' +
          "<span>" + T.kelsiraVerified + "</span>" +
          "</div>"
        : "");
    container.appendChild(wrap);
  }

  // ---------- El Mosaico: dense rows, one disclosure line for the whole block ----------
  function mountMosaico(container, reviews, accent) {
    var wrap = document.createElement("div");
    wrap.className = "kelsira-mosaic-wrap";
    var header = document.createElement("div");
    header.className = "kelsira-mosaic-header";
    header.textContent = T.aiScoresHeader;
    wrap.appendChild(header);

    var list = document.createElement("div");
    list.className = "kelsira-mosaic";
    reviews.forEach(function (r) {
      list.insertAdjacentHTML(
        "beforeend",
        '<div class="kelsira-mosaic-row">' +
          avatarHtml(r.customer_name, 26) +
          '<div class="kelsira-mosaic-who"><span class="kelsira-name">' + escapeHtml(r.customer_name) + "</span>" +
          '<span class="kelsira-date">' + formatDate(r.created_at) + "</span></div>" +
          '<span class="kelsira-mosaic-num" style="color:' + accent + '">' + r.overall_ai_rating.toFixed(1) + "</span>" +
          '<span class="kelsira-mosaic-quote">' + escapeHtml(truncate(r.review_text, 70)) + "</span>" +
          "</div>",
      );
    });
    wrap.appendChild(list);
    container.appendChild(wrap);
  }

  // ---------- La Cinta: scrolling trust ticker ----------
  // Fixed dark bar regardless of theme_mode — like El Recibo's cut corner and
  // El Sello's circle, this style's identity doesn't flex with light/dark; it
  // reads as a bold ribbon on any storefront background.
  function mountTicker(container, data, accent) {
    var single = data.reviews
      .map(function (r) {
        return (
          '<span class="kelsira-ticker-item">' +
          '<b class="kelsira-ticker-name">' + escapeHtml(r.customer_name) + "</b> " +
          '<b class="kelsira-ticker-score" style="color:' + accent + '">' + r.overall_ai_rating.toFixed(1) + "</b> " +
          "· " + escapeHtml(truncate(r.review_text, 70)) +
          "</span>"
        );
      })
      .join('<span class="kelsira-ticker-dot">●</span>');

    var wrap = document.createElement("div");
    wrap.className = "kelsira-ticker";
    wrap.innerHTML =
      '<div class="kelsira-ticker-badge">' +
      '<b style="color:' + accent + '">' + data.average_rating.toFixed(1) + "★</b>" +
      "<span>" + data.total_reviews + " " + T.reviewsWord + "</span>" +
      "</div>" +
      '<div class="kelsira-ticker-mask">' +
      '<div class="kelsira-ticker-track">' +
      single +
      '<span class="kelsira-ticker-dot">●</span>' +
      single +
      "</div>" +
      "</div>";
    container.appendChild(wrap);
  }

  // ---------- La Fila de Producto: no box at all, just the inline star row ----------
  function mountFila(container, data, accent) {
    var wrap = document.createElement("div");
    wrap.className = "kelsira-row";
    wrap.innerHTML =
      starsHtml(data.average_rating, 16, accent) +
      '<b style="color:' + accent + '">' + data.average_rating.toFixed(1) + "</b>" +
      aiTagHtml() +
      '<span class="kelsira-row-count">(' + data.total_reviews + " " + T.reviewsWord + ")</span>";
    container.appendChild(wrap);
  }

  // ---------- La Barra Superior: full-bleed bar pinned above the page ----------
  // Folds the Kelsira mark inline (see mountLanzador note) since a separate
  // footer line would render wherever the script tag sits in the DOM, not
  // next to this bar once it's pinned to the viewport.
  function mountBarra(container, data, accent, origin, businessId) {
    var showBranding = data.config.show_branding;
    var bar = document.createElement("div");
    bar.className = "kelsira-bar";
    bar.innerHTML =
      starsHtml(data.average_rating, 13, accent) +
      "<b>" + data.average_rating.toFixed(1) + "</b>" +
      '<span class="kelsira-bar-mid">· ' +
      data.total_reviews +
      " " + T.verifiedReviewsWord +
      (showBranding ? " · Kelsira" : "") +
      "</span>" +
      '<a class="kelsira-bar-link" href="' +
      origin + "/resenas/" + encodeURIComponent(businessId) +
      '" target="_blank" rel="noopener">' + T.viewReviews + "</a>";
    container.appendChild(bar);
  }

  // ---------- El Lanzador: floating corner bubble + popover panel ----------
  // Branding folds into the panel footer instead of the separate global
  // line, for the same reason as La Barra Superior.
  function mountLanzador(container, data, accent, origin, businessId) {
    var showBranding = data.config.show_branding;
    var wrap = document.createElement("div");
    wrap.className = "kelsira-launcher";

    var panel = document.createElement("div");
    panel.className = "kelsira-launcher-panel";
    panel.innerHTML =
      '<div class="kelsira-launcher-head" style="background:' + accent + '">' +
      "<b>" + data.average_rating.toFixed(1) + "★ " + escapeHtml(data.business.name) + "</b>" +
      "<span>" + data.total_reviews + "</span>" +
      "</div>" +
      data.reviews
        .slice(0, 3)
        .map(function (r) {
          return (
            '<div class="kelsira-launcher-row"><b>' +
            escapeHtml(r.customer_name) +
            "</b><span>" +
            r.overall_ai_rating.toFixed(1) +
            " · " +
            escapeHtml(truncate(r.review_text, 60)) +
            "</span></div>"
          );
        })
        .join("") +
      '<a class="kelsira-launcher-cta" style="color:' + accent + '" href="' +
      origin + "/resenas/" + encodeURIComponent(businessId) +
      '" target="_blank" rel="noopener">' + T.viewAllPrefix + data.total_reviews + " " + T.reviewsWord + " →</a>" +
      (showBranding ? '<div class="kelsira-launcher-brand">' + T.kelsiraVerified + "</div>" : "");

    var bubble = document.createElement("button");
    bubble.type = "button";
    bubble.className = "kelsira-launcher-bubble";
    bubble.style.background = accent;
    bubble.textContent = data.average_rating.toFixed(1) + "★";
    bubble.setAttribute("aria-label", T.viewVerifiedAria);

    var open = true;
    function render() {
      panel.style.display = open ? "block" : "none";
    }
    bubble.addEventListener("click", function () {
      open = !open;
      render();
    });
    render();

    wrap.appendChild(panel);
    wrap.appendChild(bubble);
    container.appendChild(wrap);
  }

  // ---------- La Notificación: live social-proof toast, cycles reviews on its own ----------
  function mountNotificacion(container, data, showBranding) {
    var wrap = document.createElement("div");
    wrap.className = "kelsira-notify";

    var reviews = data.reviews;
    var index = 0;

    function render() {
      var r = reviews[index];
      wrap.innerHTML =
        avatarHtml(r.customer_name) +
        '<div class="kelsira-notify-body">' +
        "<p>" +
        T.notificationJustLeft
          .replace("{name}", "<b>" + escapeHtml(r.customer_name) + "</b>")
          .replace("{score}", r.overall_ai_rating.toFixed(1) + "★") +
        "</p>" +
        (showBranding
          ? '<span class="kelsira-notify-meta">' + T.kelsiraVerified + " · " + formatDate(r.created_at) + "</span>"
          : "") +
        "</div>";
    }

    render();
    if (reviews.length > 1) {
      setInterval(function () {
        index = (index + 1) % reviews.length;
        render();
      }, 4500);
    }

    container.appendChild(wrap);
  }

  // ---------- El Comparador: business average vs. category benchmark ----------
  function mountComparador(container, data, accent) {
    var wrap = document.createElement("div");
    wrap.className = "kelsira-compare";

    var benchmark = data.category_benchmark;
    var category = data.business.category_label || "";
    var illustrative = !benchmark || !benchmark.available;
    var delta = illustrative
      ? 15
      : Math.round(((data.average_rating - benchmark.average) / benchmark.average) * 100);
    var isAbove = delta > 2;
    var isBelow = delta < -2;
    var tone = isAbove ? "#16a34a" : isBelow ? "#e11d48" : null;
    var label = isAbove
      ? T.comparatorAbove.replace("{delta}", Math.abs(delta)).replace("{category}", category)
      : isBelow
        ? T.comparatorBelow.replace("{delta}", Math.abs(delta)).replace("{category}", category)
        : T.comparatorOnPar.replace("{category}", category);

    wrap.innerHTML =
      '<b style="color:' + accent + '">' + data.average_rating.toFixed(1) + "★</b>" +
      '<span class="kelsira-compare-div"></span>' +
      '<span class="kelsira-compare-delta"' +
      (tone ? ' style="color:' + tone + ";background:" + tone + '1f"' : "") +
      ">" +
      (isAbove ? "↑ " : isBelow ? "↓ " : "") +
      escapeHtml(label) +
      "</span>";

    container.appendChild(wrap);
  }

  // ---------- La Franja de Pie de Página: quiet, inline reputation strip ----------
  function mountFranja(container, data, accent, showBranding) {
    var wrap = document.createElement("div");
    wrap.className = "kelsira-strip";
    wrap.innerHTML =
      '<div class="kelsira-strip-left">' +
      (showBranding
        ? '<span class="kelsira-strip-logo" style="background:' + accent + '">K</span>'
        : "") +
      "<span>" +
      data.total_reviews + " " + T.verifiedReviewsWord +
      (showBranding ? " · Kelsira" : "") +
      "</span>" +
      "</div>" +
      '<div class="kelsira-strip-avatars">' +
      data.reviews
        .slice(0, 3)
        .map(function (r) {
          return avatarHtml(r.customer_name, 22);
        })
        .join("") +
      "</div>";
    container.appendChild(wrap);
  }

  // ---------- El Cierre: checkout-page reassurance, right above the buy button ----------
  function mountCierre(container, data, accent) {
    var wrap = document.createElement("div");
    wrap.className = "kelsira-checkout-trust";
    wrap.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="' + accent + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
      "<span>" + escapeHtml(T.checkoutTrustText.replace("{n}", data.total_reviews)) + "</span>";
    container.appendChild(wrap);
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
      ".kelsira-ai-tag{font-size:9px;font-weight:700;letter-spacing:.03em;opacity:.5;border:1px solid currentColor;border-radius:4px;padding:1px 4px;line-height:1.4;cursor:default;}" +
      ".kelsira-name{font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}" +
      ".kelsira-date{font-size:11px;opacity:.55;}" +
      ".kelsira-name-col{display:flex;flex-direction:column;line-height:1.25;min-width:0;}" +
      ".kelsira-quote{font-size:13.5px;line-height:1.55;margin:0;opacity:.92;}" +
      ".kelsira-quote:before{content:'\\201C';}" +
      ".kelsira-quote:after{content:'\\201D';}" +
      ".kelsira-breakdown{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;}" +
      ".kelsira-pill{font-size:10.5px;padding:3px 9px;border-radius:999px;background:var(--kelsira-pill-bg);opacity:.85;}" +
      ".kelsira-reply{margin-top:12px;padding:10px 12px;border-radius:calc(var(--kelsira-radius) * 0.6);background:var(--kelsira-pill-bg);}" +
      ".kelsira-reply-from{display:block;font-size:11px;font-weight:700;opacity:.7;margin-bottom:3px;}" +
      ".kelsira-reply-text{margin:0;font-size:12.5px;line-height:1.5;opacity:.85;}" +
      ".kelsira-card-foot{display:flex;align-items:center;gap:10px;margin-top:14px;}" +
      ".kelsira-carousel{display:flex;gap:14px;overflow-x:auto;padding:6px 2px 14px;scroll-snap-type:x proximity;}" +
      ".kelsira-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px;}" +
      ".kelsira-wall{display:flex;flex-direction:column;gap:12px;}" +
      ".kelsira-empty{font-size:13px;opacity:.7;}" +
      ".kelsira-powered{font-size:10px;opacity:.5;margin-top:12px;text-align:right;}" +
      // El Recibo — ticket shape: dashed cut corners + a perforation rule.
      ".kelsira-ticket{position:relative;background:var(--kelsira-bg);border:1px solid var(--kelsira-border);box-shadow:0 1px 2px rgba(0,0,0,.04),0 10px 24px -14px rgba(0,0,0,.16);clip-path:polygon(0 8px,8px 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%);transition:transform .18s ease;overflow:hidden;}" +
      ".kelsira-ticket:hover{transform:translateY(-3px);}" +
      ".kelsira-carousel .kelsira-ticket{flex:0 0 270px;scroll-snap-align:start;}" +
      ".kelsira-ticket-head{padding:16px 18px 13px;}" +
      ".kelsira-correction-row{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;}" +
      ".kelsira-raw{font-size:13px;opacity:.5;text-decoration:line-through;}" +
      ".kelsira-arrow{font-size:12px;opacity:.4;}" +
      ".kelsira-final{font-weight:700;font-size:19px;}" +
      ".kelsira-correction-caption{margin:5px 0 10px;font-size:10px;letter-spacing:.03em;text-transform:uppercase;opacity:.45;}" +
      ".kelsira-perforation{height:0;border-top:1.5px dashed var(--kelsira-border);margin:0 18px;}" +
      ".kelsira-ticket-body{padding:14px 18px 16px;}" +
      // El Medidor — comparative gauge.
      ".kelsira-gauge-card{background:var(--kelsira-bg);border:1px solid var(--kelsira-border);border-radius:var(--kelsira-radius);box-shadow:0 1px 2px rgba(0,0,0,.04),0 10px 24px -14px rgba(0,0,0,.16);padding:16px 18px;transition:transform .18s ease;}" +
      ".kelsira-gauge-card:hover{transform:translateY(-3px);}" +
      ".kelsira-carousel .kelsira-gauge-card{flex:0 0 270px;scroll-snap-align:start;}" +
      ".kelsira-gauge-head{display:flex;align-items:center;gap:8px;margin-bottom:11px;}" +
      ".kelsira-gauge-quote{margin-bottom:14px;}" +
      ".kelsira-gauge-track{position:relative;height:4px;background:var(--kelsira-pill-bg);border-radius:999px;margin:16px 4px 9px;}" +
      ".kelsira-gauge-fill{position:absolute;top:0;bottom:0;background:currentColor;opacity:.35;border-radius:999px;}" +
      ".kelsira-gauge-dot{position:absolute;top:50%;width:8px;height:8px;border-radius:50%;background:var(--kelsira-fg);opacity:.4;transform:translate(-50%,-50%);border:2px solid var(--kelsira-bg);}" +
      ".kelsira-gauge-pin{position:absolute;top:50%;width:12px;height:12px;border-radius:50%;transform:translate(-50%,-50%);border:2px solid var(--kelsira-bg);}" +
      ".kelsira-gauge-legend{display:flex;justify-content:space-between;font-size:11px;opacity:.7;margin-bottom:2px;}" +
      // La Cita — big spotlight quote.
      ".kelsira-spotlight{border-radius:var(--kelsira-radius);border:1px solid var(--kelsira-border);background:var(--kelsira-bg);padding:26px;box-shadow:0 1px 2px rgba(0,0,0,.04),0 10px 24px -14px rgba(0,0,0,.16);}" +
      ".kelsira-spotlight-inner{transition:opacity .22s ease;text-align:center;}" +
      ".kelsira-big-quote{margin:0;font-size:18px;font-weight:500;line-height:1.5;}" +
      ".kelsira-big-quote:before{content:'\\201C';}" +
      ".kelsira-big-quote:after{content:'\\201D';}" +
      ".kelsira-spotlight-foot{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:18px;}" +
      ".kelsira-quote-chip{display:inline-flex;align-items:center;gap:6px;font-size:13px;margin-left:6px;}" +
      ".kelsira-spotlight .kelsira-breakdown{justify-content:center;margin-top:14px;}" +
      ".kelsira-spotlight .kelsira-reply{text-align:left;max-width:360px;margin-left:auto;margin-right:auto;}" +
      ".kelsira-dots{display:flex;justify-content:center;gap:6px;margin-top:18px;}" +
      ".kelsira-dot{width:6px;height:6px;border-radius:50%;background:var(--kelsira-border);border:none;padding:0;cursor:pointer;transition:width .2s ease,background .2s ease;}" +
      ".kelsira-dot--active{width:18px;border-radius:3px;background:var(--kelsira-accent);}" +
      // El Clásico — minimal single-line badge.
      ".kelsira-badge{display:inline-flex;align-items:center;gap:12px;padding:12px 18px;border:1px solid var(--kelsira-border);border-radius:var(--kelsira-radius);background:var(--kelsira-bg);box-shadow:0 1px 2px rgba(0,0,0,.05),0 6px 18px -10px rgba(0,0,0,.18);}" +
      ".kelsira-badge-logo{border-radius:6px;flex-shrink:0;}" +
      ".kelsira-badge-main{display:flex;flex-direction:column;gap:3px;}" +
      ".kelsira-badge-top{display:flex;align-items:center;gap:7px;}" +
      ".kelsira-badge-rating{font-weight:700;font-size:16px;}" +
      ".kelsira-badge-sub{font-size:11.5px;opacity:.6;}" +
      // El Sello — circular seal.
      ".kelsira-seal-wrap{display:inline-flex;flex-direction:column;align-items:center;gap:12px;}" +
      ".kelsira-seal{width:140px;height:140px;border-radius:50%;background:var(--kelsira-bg);border:1.5px solid var(--kelsira-seal-accent,var(--kelsira-accent));display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 1px 2px rgba(0,0,0,.05),0 10px 24px -14px rgba(0,0,0,.2);}" +
      ".kelsira-seal-num{font-weight:700;font-size:28px;line-height:1;}" +
      ".kelsira-seal .kelsira-stars{margin-top:7px;}" +
      ".kelsira-seal-sub{margin-top:6px;font-size:9px;letter-spacing:.05em;text-transform:uppercase;opacity:.5;}" +
      ".kelsira-seal-caption{display:flex;align-items:center;gap:7px;}" +
      ".kelsira-seal-caption img{border-radius:5px;}" +
      ".kelsira-seal-caption span{font-size:11.5px;opacity:.7;}" +
      // El Mosaico — dense rows.
      ".kelsira-mosaic-wrap{border:1px solid var(--kelsira-border);border-radius:var(--kelsira-radius);overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.04),0 10px 24px -14px rgba(0,0,0,.16);}" +
      ".kelsira-mosaic-header{font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;opacity:.45;padding:10px 13px 0;background:var(--kelsira-bg);}" +
      ".kelsira-mosaic{display:flex;flex-direction:column;background:var(--kelsira-bg);}" +
      ".kelsira-mosaic-row{display:flex;align-items:center;gap:9px;padding:9px 13px;}" +
      ".kelsira-mosaic-row+.kelsira-mosaic-row{border-top:1px solid var(--kelsira-border);}" +
      ".kelsira-mosaic-who{display:flex;flex-direction:column;width:78px;flex-shrink:0;line-height:1.25;}" +
      ".kelsira-mosaic-who .kelsira-name{font-size:11.5px;}" +
      ".kelsira-mosaic-who .kelsira-date{font-size:9.5px;}" +
      ".kelsira-mosaic-num{font-weight:700;font-size:12.5px;width:28px;flex-shrink:0;}" +
      ".kelsira-mosaic-quote{font-size:11.5px;opacity:.7;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;}" +
      // La Cinta — scrolling trust ticker, fixed dark bar (see comment above mountTicker).
      ".kelsira-ticker{display:flex;align-items:center;background:#14161c;color:#fff;border-radius:var(--kelsira-radius);overflow:hidden;box-shadow:0 12px 32px -16px rgba(0,0,0,.5);}" +
      ".kelsira-ticker-badge{flex-shrink:0;display:flex;align-items:center;gap:8px;padding:12px 16px;background:rgba(255,255,255,.06);border-right:1px solid rgba(255,255,255,.08);white-space:nowrap;font-size:14px;}" +
      ".kelsira-ticker-badge span{font-size:11px;opacity:.55;}" +
      ".kelsira-ticker-mask{flex:1;overflow:hidden;position:relative;min-width:0;}" +
      ".kelsira-ticker-track{display:inline-flex;align-items:center;gap:40px;white-space:nowrap;padding:0 20px;font-size:12.5px;animation:kelsira-ticker-scroll 26s linear infinite;}" +
      ".kelsira-ticker-item{opacity:.85;}" +
      ".kelsira-ticker-dot{opacity:.3;}" +
      "@keyframes kelsira-ticker-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}" +
      "@media (prefers-reduced-motion: reduce){.kelsira-ticker-track{animation:none}}" +
      // La Fila de Producto — no box, just the inline row.
      ".kelsira-row{display:inline-flex;align-items:center;gap:8px;font-size:14px;}" +
      ".kelsira-row-count{text-decoration:underline;text-underline-offset:2px;opacity:.7;}" +
      // La Barra Superior — full-bleed bar pinned above the page.
      ".kelsira-bar{position:fixed;top:0;left:0;right:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;gap:8px;background:var(--kelsira-bg);color:var(--kelsira-fg);border-bottom:1px solid var(--kelsira-border);padding:10px 16px;font-size:13px;box-shadow:0 2px 12px rgba(0,0,0,.06);}" +
      ".kelsira-bar b{font-weight:700;}" +
      ".kelsira-bar-mid{opacity:.7;}" +
      ".kelsira-bar-link{text-decoration:underline;text-underline-offset:2px;opacity:.85;color:inherit;}" +
      // El Lanzador — floating corner bubble + popover panel.
      ".kelsira-launcher{position:fixed;right:20px;bottom:20px;z-index:2147483000;display:flex;flex-direction:column;align-items:flex-end;gap:12px;}" +
      ".kelsira-launcher-bubble{width:52px;height:52px;border-radius:50%;color:#fff;font-weight:700;font-size:13px;border:none;cursor:pointer;box-shadow:0 10px 26px -8px rgba(0,0,0,.4);}" +
      ".kelsira-launcher-panel{width:260px;background:var(--kelsira-bg);color:var(--kelsira-fg);border:1px solid var(--kelsira-border);border-radius:var(--kelsira-radius);overflow:hidden;box-shadow:0 20px 50px -18px rgba(0,0,0,.4);}" +
      ".kelsira-launcher-head{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;color:#fff;}" +
      ".kelsira-launcher-head b{font-size:13px;}" +
      ".kelsira-launcher-head span{font-size:11px;opacity:.75;}" +
      ".kelsira-launcher-row{display:flex;align-items:center;gap:8px;padding:9px 14px;font-size:11.5px;border-top:1px solid var(--kelsira-border);}" +
      ".kelsira-launcher-row:first-of-type{border-top:none;}" +
      ".kelsira-launcher-row b{flex-shrink:0;}" +
      ".kelsira-launcher-row span{opacity:.7;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;}" +
      ".kelsira-launcher-cta{display:block;text-align:center;padding:10px;font-size:11.5px;font-weight:600;text-decoration:none;border-top:1px solid var(--kelsira-border);}" +
      ".kelsira-launcher-brand{text-align:center;padding:8px;font-size:10px;opacity:.55;border-top:1px solid var(--kelsira-border);}" +
      // La Notificación — floating corner toast, opposite side from El Lanzador.
      ".kelsira-notify{position:fixed;left:20px;bottom:20px;z-index:2147483000;display:flex;align-items:center;gap:10px;max-width:280px;background:var(--kelsira-bg);color:var(--kelsira-fg);border:1px solid var(--kelsira-border);border-radius:var(--kelsira-radius);padding:12px;box-shadow:0 10px 26px -10px rgba(0,0,0,.35);animation:kelsira-notify-in .4s cubic-bezier(.2,.8,.2,1);}" +
      "@keyframes kelsira-notify-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}" +
      ".kelsira-notify-body p{margin:0;font-size:12px;line-height:1.4;}" +
      ".kelsira-notify-meta{display:block;margin-top:2px;font-size:10.5px;opacity:.55;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}" +
      // El Comparador — pill badge, always rounded regardless of the Bordes setting.
      ".kelsira-compare{display:inline-flex;align-items:center;gap:10px;border:1px solid var(--kelsira-border);border-radius:999px;padding:7px 7px 7px 16px;font-size:14px;}" +
      ".kelsira-compare-div{width:1px;height:16px;background:var(--kelsira-border);}" +
      ".kelsira-compare-delta{border-radius:999px;padding:5px 10px;font-size:11px;font-weight:600;}" +
      // La Franja de Pie de Página — quiet, full-bleed, sits inline in the footer.
      ".kelsira-strip{display:flex;align-items:center;justify-content:space-between;gap:16px;border-top:1px solid var(--kelsira-border);padding:14px 0;}" +
      ".kelsira-strip-left{display:flex;align-items:center;gap:10px;font-size:12px;opacity:.8;}" +
      ".kelsira-strip-logo{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:6px;color:#fff;font-size:11px;font-weight:800;flex-shrink:0;}" +
      ".kelsira-strip-avatars{display:flex;}" +
      ".kelsira-strip-avatars .kelsira-avatar{margin-left:-8px;border:2px solid var(--kelsira-bg);}" +
      // El Cierre — checkout-page reassurance block.
      ".kelsira-checkout-trust{display:flex;align-items:center;gap:10px;border-radius:calc(var(--kelsira-radius) * 0.7);padding:12px 14px;font-size:12px;background:var(--kelsira-pill-bg);}" +
      ".kelsira-checkout-trust svg{flex-shrink:0;}";
    document.head.appendChild(style);
  }

  // Structured data (JSON-LD) for the host page's own Google rich-snippet
  // eligibility — not a Kelsira branding element, so it's injected regardless
  // of show_branding and regardless of plan. This does not, by itself,
  // guarantee Google shows review stars in search (that also depends on
  // Google's own policies for the page), but it's the correct, honest,
  // self-service groundwork — the same mechanism other review platforms use.
  function injectStructuredData(data, businessName) {
    var id = "kelsira-widget-jsonld";
    if (document.getElementById(id) || !data.reviews.length) return;

    var jsonLd = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: businessName,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: data.average_rating.toFixed(1),
        reviewCount: data.total_reviews,
        bestRating: "5",
        worstRating: "1",
      },
      review: data.reviews.slice(0, 20).map(function (r) {
        return {
          "@type": "Review",
          author: { "@type": "Person", name: r.customer_name },
          datePublished: r.created_at,
          reviewBody: r.review_text,
          reviewRating: {
            "@type": "Rating",
            ratingValue: r.overall_ai_rating.toFixed(1),
            bestRating: "5",
            worstRating: "1",
          },
        };
      }),
    };

    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
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
        T = STRINGS[data.business.locale] || STRINGS.en;
        injectStyles("kelsira-widget-styles");

        var isDark = data.config.theme_mode === "dark";
        var accent = data.config.accent_color || "#4f7cff";
        var cardStyle = data.config.card_style || "recibo";
        container.style.setProperty("--kelsira-bg", isDark ? "#101114" : "#ffffff");
        container.style.setProperty("--kelsira-fg", isDark ? "#f4f5f7" : "#111318");
        container.style.setProperty("--kelsira-border", isDark ? "#232529" : "#e5e7eb");
        container.style.setProperty("--kelsira-star-bg", isDark ? "#3a3d44" : "#e2e4e8");
        container.style.setProperty("--kelsira-pill-bg", isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)");
        container.style.setProperty("--kelsira-accent", accent);
        container.style.setProperty("--kelsira-radius", RADIUS_MAP[data.config.border_radius] || "10px");
        container.style.setProperty("--kelsira-font", FONT_MAP[data.config.font_family] || "inherit");

        injectStructuredData(data, data.business.name);

        if (data.total_reviews === 0) {
          var empty = document.createElement("div");
          empty.className = "kelsira-badge kelsira-empty";
          empty.textContent = T.noReviewsYet;
          container.appendChild(empty);
          return;
        }

        var layout = data.config.layout;
        if (layout === "badge") {
          mountBadge(container, data, accent, origin);
        } else if (layout === "sello") {
          mountSello(container, data, accent, origin);
        } else if (layout === "mosaico") {
          mountMosaico(container, data.reviews, accent);
        } else if (layout === "cinta") {
          mountTicker(container, data, accent);
        } else if (layout === "fila") {
          mountFila(container, data, accent);
        } else if (layout === "barra") {
          mountBarra(container, data, accent, origin, businessId);
        } else if (layout === "lanzador") {
          mountLanzador(container, data, accent, origin, businessId);
        } else if (layout === "notificacion") {
          mountNotificacion(container, data, data.config.show_branding);
        } else if (layout === "comparador") {
          mountComparador(container, data, accent);
        } else if (layout === "franja") {
          mountFranja(container, data, accent, data.config.show_branding);
        } else if (layout === "cierre") {
          mountCierre(container, data, accent);
        } else if (layout === "spotlight") {
          mountSpotlight(container, data.reviews, data.config.show_breakdown, accent, data.business.name);
        } else {
          var list = document.createElement("div");
          list.className =
            layout === "grid" ? "kelsira-grid" : layout === "wall" ? "kelsira-wall" : "kelsira-carousel";
          data.reviews.forEach(function (review) {
            list.insertAdjacentHTML(
              "beforeend",
              cardHtml(review, data.config.show_breakdown, accent, data.business.name, cardStyle),
            );
          });
          container.appendChild(list);
        }

        // El Clásico, El Sello, La Barra Superior, El Lanzador, La
        // Notificación, El Comparador, La Franja and El Cierre already fold
        // the Kelsira mark into themselves, so the separate footer line would
        // just repeat it below — or, for the fixed-position ones, render as an
        // orphaned line wherever the script tag happens to sit in the DOM.
        if (
          data.config.show_branding &&
          layout !== "badge" &&
          layout !== "sello" &&
          layout !== "barra" &&
          layout !== "lanzador" &&
          layout !== "notificacion" &&
          layout !== "comparador" &&
          layout !== "franja" &&
          layout !== "cierre"
        ) {
          var footer = document.createElement("div");
          footer.className = "kelsira-powered";
          footer.textContent = T.poweredFooter;
          container.appendChild(footer);
        }
      })
      .catch(function () {
        container.textContent = "";
      });
  }

  mount(document.currentScript);
})();
