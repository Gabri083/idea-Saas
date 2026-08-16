function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shell(title: string, bodyHtml: string): string {
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
                <span style="font-size:11px;color:#8a8f98;">Reputación justa y reseñas asistidas por IA — Kelsira</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function reviewConfirmationEmail(params: {
  customerName: string;
  businessName: string;
  overallRating: number;
}): { subject: string; html: string } {
  const name = escapeHtml(params.customerName);
  const business = escapeHtml(params.businessName);
  return {
    subject: `Tu reseña para ${params.businessName} fue publicada`,
    html: shell(
      "¡Gracias por tu reseña!",
      `<p>Hola ${name},</p>
       <p>Tu reseña para <strong>${business}</strong> ya está publicada. Nuestra IA la analizó de forma
       imparcial y calculó un puntaje objetivo de <strong>${params.overallRating.toFixed(1)}/5</strong>.</p>
       <p>Tu texto se publicó tal cual lo escribiste, sin edición ni censura.</p>`,
    ),
  };
}

export function appealResolvedEmail(params: {
  businessName: string;
  status: "approved" | "rejected";
  resolutionNotes: string | null;
}): { subject: string; html: string } {
  const business = escapeHtml(params.businessName);
  const approved = params.status === "approved";
  return {
    subject: approved ? "Tu apelación fue aprobada" : "Tu apelación fue rechazada",
    html: shell(
      approved ? "Apelación aprobada" : "Apelación rechazada",
      `<p>Hola equipo de <strong>${business}</strong>,</p>
       <p>Revisamos la apelación que enviaste sobre una reseña y fue
       <strong>${approved ? "aprobada" : "rechazada"}</strong>.</p>
       ${
         params.resolutionNotes
           ? `<p style="background:#f4f5f7;border-radius:8px;padding:12px;">${escapeHtml(params.resolutionNotes)}</p>`
           : ""
       }
       <p>Puedes ver el detalle en tu panel, sección Apelaciones.</p>`,
    ),
  };
}

export function recurringIssueAlertEmail(params: {
  businessName: string;
  issueLabel: string;
  deadline: string;
}): { subject: string; html: string } {
  const business = escapeHtml(params.businessName);
  const issue = escapeHtml(params.issueLabel);
  const deadlineDate = new Date(params.deadline).toLocaleDateString("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return {
    subject: `Nuevo problema recurrente detectado: ${params.issueLabel}`,
    html: shell(
      "Se detectó un problema recurrente",
      `<p>Hola equipo de <strong>${business}</strong>,</p>
       <p>Nuestra IA detectó un problema que se repite en tus reseñas: <strong>${issue}</strong>.</p>
       <p>Tienes hasta el <strong>${deadlineDate}</strong> (30 días) para resolverlo antes de que
       empiece a penalizar el puntaje de nuevas reseñas relacionadas.</p>
       <p>Puedes verlo en tu panel, sección Consultor IA.</p>`,
    ),
  };
}

export function reviewCapReachedEmail(params: {
  businessName: string;
  cap: number;
}): { subject: string; html: string } {
  const business = escapeHtml(params.businessName);
  return {
    subject: "Llegaste al límite de reseñas de tu plan este mes",
    html: shell(
      "Límite de reseñas alcanzado",
      `<p>Hola equipo de <strong>${business}</strong>,</p>
       <p>Tu negocio alcanzó el límite de <strong>${params.cap} reseñas</strong> incluidas en tu plan
       actual este mes. Las nuevas reseñas no se van a poder recibir hasta el próximo mes, salvo que
       actualices tu plan.</p>
       <p>Puedes revisar los planes disponibles en tu panel, sección Configuración.</p>`,
    ),
  };
}
