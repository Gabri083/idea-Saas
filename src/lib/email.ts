const API_BASE = "https://api.resend.com";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Best-effort transactional email via Resend. Never throws — a failed send
 * must never take down the review/appeal/signup flow that triggered it, and
 * silently no-ops when RESEND_API_KEY isn't set (local/demo environments).
 */
export async function sendEmail(params: { to: string; subject: string; html: string }): Promise<void> {
  if (!isEmailConfigured()) return;

  try {
    const res = await fetch(`${API_BASE}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "Kelsira <hola@kelsira.app>",
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });

    if (!res.ok) {
      console.error("Resend send failed", res.status, await res.text());
    }
  } catch (err) {
    console.error("Resend send threw", err);
  }
}
