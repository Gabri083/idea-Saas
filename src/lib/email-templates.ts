import type { Locale } from "@/lib/i18n/config";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const FOOTER_TAGLINE: Record<Locale, string> = {
  es: "Reputación justa y reseñas asistidas por IA — Kelsira",
  en: "Fair reputation and AI-assisted reviews — Kelsira",
};

function shell(locale: Locale, title: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:24px 28px;border-bottom:1px solid #e5e7eb;">
                <span style="font-size:16px;font-weight:700;color:#111318;">Kelsira</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <h1 style="margin:0 0 12px;font-size:18px;color:#111318;">${title}</h1>
                <div style="font-size:14px;line-height:1.6;color:#3a3d44;">${bodyHtml}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;border-top:1px solid #e5e7eb;">
                <span style="font-size:11px;color:#8a8f98;">${FOOTER_TAGLINE[locale]}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Sent to the customer who just submitted a review — locale follows their own site visit, not the business's. */
export function reviewConfirmationEmail(params: {
  locale: Locale;
  customerName: string;
  businessName: string;
  overallRating: number;
}): { subject: string; html: string } {
  const name = escapeHtml(params.customerName);
  const business = escapeHtml(params.businessName);
  const rating = params.overallRating.toFixed(1);

  if (params.locale === "en") {
    return {
      subject: `Your review for ${params.businessName} was published`,
      html: shell(
        "en",
        "Thanks for your review!",
        `<p>Hi ${name},</p>
         <p>Your review for <strong>${business}</strong> is now published. Our AI analyzed it
         impartially and calculated an objective score of <strong>${rating}/5</strong>.</p>
         <p>Your text was published exactly as you wrote it, with no editing or censorship.</p>`,
      ),
    };
  }
  return {
    subject: `Tu reseña para ${params.businessName} fue publicada`,
    html: shell(
      "es",
      "¡Gracias por tu reseña!",
      `<p>Hola ${name},</p>
       <p>Tu reseña para <strong>${business}</strong> ya está publicada. Nuestra IA la analizó de forma
       imparcial y calculó un puntaje objetivo de <strong>${rating}/5</strong>.</p>
       <p>Tu texto se publicó tal cual lo escribiste, sin edición ni censura.</p>`,
    ),
  };
}

/** Sent to the business owner — locale follows the business's saved preference (Settings), not the request that triggered it. */
export function appealResolvedEmail(params: {
  locale: Locale;
  businessName: string;
  status: "approved" | "rejected";
  resolutionNotes: string | null;
}): { subject: string; html: string } {
  const business = escapeHtml(params.businessName);
  const approved = params.status === "approved";
  const notesHtml = params.resolutionNotes
    ? `<p style="background:#f4f5f7;border-radius:8px;padding:12px;">${escapeHtml(params.resolutionNotes)}</p>`
    : "";

  if (params.locale === "en") {
    return {
      subject: approved ? "Your appeal was approved" : "Your appeal was rejected",
      html: shell(
        "en",
        approved ? "Appeal approved" : "Appeal rejected",
        `<p>Hi ${business} team,</p>
         <p>We reviewed the appeal you submitted about a review and it was
         <strong>${approved ? "approved" : "rejected"}</strong>.</p>
         ${notesHtml}
         <p>You can see the details in your dashboard, under Appeals.</p>`,
      ),
    };
  }
  return {
    subject: approved ? "Tu apelación fue aprobada" : "Tu apelación fue rechazada",
    html: shell(
      "es",
      approved ? "Apelación aprobada" : "Apelación rechazada",
      `<p>Hola equipo de <strong>${business}</strong>,</p>
       <p>Revisamos la apelación que enviaste sobre una reseña y fue
       <strong>${approved ? "aprobada" : "rechazada"}</strong>.</p>
       ${notesHtml}
       <p>Puedes ver el detalle en tu panel, sección Apelaciones.</p>`,
    ),
  };
}

/** Sent to the business owner — locale follows the business's saved preference (Settings). */
export function recurringIssueAlertEmail(params: {
  locale: Locale;
  businessName: string;
  issueLabel: string;
  deadline: string;
}): { subject: string; html: string } {
  const business = escapeHtml(params.businessName);
  const issue = escapeHtml(params.issueLabel);

  if (params.locale === "en") {
    const deadlineDate = new Date(params.deadline).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return {
      subject: `New recurring issue detected: ${params.issueLabel}`,
      html: shell(
        "en",
        "A recurring issue was detected",
        `<p>Hi ${business} team,</p>
         <p>Our AI detected a problem that keeps repeating across your reviews: <strong>${issue}</strong>.</p>
         <p>You have until <strong>${deadlineDate}</strong> (30 days) to resolve it before it starts
         penalizing the score of new related reviews.</p>
         <p>You can see it in your dashboard, under AI Consultant.</p>`,
      ),
    };
  }
  const deadlineDate = new Date(params.deadline).toLocaleDateString("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return {
    subject: `Nuevo problema recurrente detectado: ${params.issueLabel}`,
    html: shell(
      "es",
      "Se detectó un problema recurrente",
      `<p>Hola equipo de <strong>${business}</strong>,</p>
       <p>Nuestra IA detectó un problema que se repite en tus reseñas: <strong>${issue}</strong>.</p>
       <p>Tienes hasta el <strong>${deadlineDate}</strong> (30 días) para resolverlo antes de que
       empiece a penalizar el puntaje de nuevas reseñas relacionadas.</p>
       <p>Puedes verlo en tu panel, sección Consultor IA.</p>`,
    ),
  };
}

/** Sent to the customer whose review was removed after a business appeal was approved —
 * locale follows the business's saved preference, since we don't track the customer's own.
 * Never includes the business's evidence, only the category of guideline violated. */
export function reviewRemovedEmail(params: {
  locale: Locale;
  customerName: string;
  businessName: string;
}): { subject: string; html: string } {
  const name = escapeHtml(params.customerName);
  const business = escapeHtml(params.businessName);

  if (params.locale === "en") {
    return {
      subject: `Your review for ${params.businessName} was removed`,
      html: shell(
        "en",
        "Your review was removed",
        `<p>Hi ${name},</p>
         <p>Your review for <strong>${business}</strong> was removed for violating Kelsira's
         guidelines (e.g. not tied to a real purchase, personal data, abusive language, or spam).</p>
         <p>This is never a scoring decision — Kelsira's AI never edits or corrects a review's
         score. A review either stays exactly as you wrote it, or gets removed entirely for a
         guideline violation like this one.</p>`,
      ),
    };
  }
  return {
    subject: `Tu reseña para ${params.businessName} fue eliminada`,
    html: shell(
      "es",
      "Tu reseña fue eliminada",
      `<p>Hola ${name},</p>
       <p>Tu reseña para <strong>${business}</strong> fue eliminada por infringir las normas de
       Kelsira (por ejemplo: no estar ligada a una compra real, datos personales, lenguaje
       abusivo o spam).</p>
       <p>Esto nunca es una decisión de puntaje — la IA de Kelsira nunca edita ni corrige el
       puntaje de una reseña. Una reseña se queda tal cual la escribiste, o se elimina por
       completo por infringir una norma como esta.</p>`,
    ),
  };
}

/** Sent to a customer whose review flagged an issue the business just proved it fixed — locale follows the business's saved preference, since we don't track the customer's own. */
export function reinviteToReReviewEmail(params: {
  locale: Locale;
  customerName: string;
  businessName: string;
  issueLabel: string;
  discountCode: string | null;
  reviewUrl: string;
}): { subject: string; html: string } {
  const name = escapeHtml(params.customerName);
  const business = escapeHtml(params.businessName);
  const issue = escapeHtml(params.issueLabel);
  const discountHtml = params.discountCode
    ? params.locale === "en"
      ? `<p>As a thank-you, use the code <strong>${escapeHtml(params.discountCode)}</strong> on your next order with them.</p>`
      : `<p>Como agradecimiento, usa el código <strong>${escapeHtml(params.discountCode)}</strong> en tu próxima compra con ellos.</p>`
    : "";

  if (params.locale === "en") {
    return {
      subject: `${params.businessName} fixed what you told them about`,
      html: shell(
        "en",
        "We fixed it",
        `<p>Hi ${name},</p>
         <p><strong>${business}</strong> read your review and fixed the issue you flagged: <strong>${issue}</strong>.</p>
         ${discountHtml}
         <p>We'd love for you to give them another try — and if your experience is different this time,
         you're welcome to leave a new review.</p>
         <p><a href="${params.reviewUrl}" style="color:#4f7cff;font-weight:600;">Leave a new review</a></p>
         <p style="color:#8a8f98;font-size:12px;">This is a one-time invitation — there's no obligation to respond, and your original review stays exactly as you wrote it either way.</p>`,
      ),
    };
  }
  return {
    subject: `${params.businessName} solucionó lo que nos comentaste`,
    html: shell(
      "es",
      "Ya lo solucionamos",
      `<p>Hola ${name},</p>
       <p><strong>${business}</strong> leyó tu reseña y solucionó el problema que marcaste: <strong>${issue}</strong>.</p>
       ${discountHtml}
       <p>Nos encantaría que le des otra oportunidad — y si esta vez tu experiencia es distinta,
       puedes dejar una nueva reseña.</p>
       <p><a href="${params.reviewUrl}" style="color:#4f7cff;font-weight:600;">Dejar una nueva reseña</a></p>
       <p style="color:#8a8f98;font-size:12px;">Esta es una invitación única — no hay obligación de responder, y tu reseña original queda exactamente como la escribiste de todas formas.</p>`,
    ),
  };
}

/** Sent to the business owner — locale follows the business's saved preference (Settings). */
export function reviewCapReachedEmail(params: {
  locale: Locale;
  businessName: string;
  cap: number;
}): { subject: string; html: string } {
  const business = escapeHtml(params.businessName);

  if (params.locale === "en") {
    return {
      subject: "You've reached your plan's review limit this month",
      html: shell(
        "en",
        "Review limit reached",
        `<p>Hi ${business} team,</p>
         <p>Your business reached the <strong>${params.cap} reviews</strong> included in your current
         plan this month. New reviews won't be accepted until next month, unless you upgrade your plan.</p>
         <p>You can check the available plans in your dashboard, under Settings.</p>`,
      ),
    };
  }
  return {
    subject: "Llegaste al límite de reseñas de tu plan este mes",
    html: shell(
      "es",
      "Límite de reseñas alcanzado",
      `<p>Hola equipo de <strong>${business}</strong>,</p>
       <p>Tu negocio alcanzó el límite de <strong>${params.cap} reseñas</strong> incluidas en tu plan
       actual este mes. Las nuevas reseñas no se van a poder recibir hasta el próximo mes, salvo que
       actualices tu plan.</p>
       <p>Puedes revisar los planes disponibles en tu panel, sección Configuración.</p>`,
    ),
  };
}
