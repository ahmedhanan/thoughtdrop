import { Resend } from "resend";

let _resend: Resend | null | undefined;
function getResend() {
  if (_resend === undefined) {
    _resend = process.env.RESEND_API_KEY
      ? new Resend(process.env.RESEND_API_KEY)
      : null;
  }
  return _resend;
}

const FROM =
  process.env.EMAIL_FROM ?? "ThoughtDrop <hello@mail.thoughtdrop.app>";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://thoughtdrop.app";

// Ember palette (must match src/app/globals.css :root tokens)
const C = {
  paper: "#FAF4EC",
  card: "#FFFDF9",
  border: "#E9DCC9",
  ink: "#2E2620",
  muted: "#8A7A66",
  primary: "#CF5A28",
  onPrimary: "#FFF8F1",
};

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

type BrandedEmailOptions = {
  previewText: string;
  heading: string;
  paragraphs: string[];
  cta?: { label: string; url: string };
};

/**
 * Renders a branded, email-client-safe HTML shell (table layout + inline
 * styles) in the app's Ember theme. The droplet mark reuses the app's own
 * /apple-icon PNG route so it always matches the favicon.
 */
export function renderBrandedEmail({
  previewText,
  heading,
  paragraphs,
  cta,
}: BrandedEmailOptions): string {
  const body = paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.ink};">${p}</p>`,
    )
    .join("");

  const button = cta
    ? `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;">
        <tr>
          <td align="center" bgcolor="${C.primary}" style="border-radius:8px;">
            <a href="${cta.url}" style="display:inline-block;padding:12px 24px;font-family:${SANS};font-size:15px;font-weight:600;color:${C.onPrimary};text-decoration:none;border-radius:8px;">${cta.label}</a>
          </td>
        </tr>
      </table>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light only" />
</head>
<body style="margin:0;padding:0;background:${C.paper};">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${previewText}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
          <tr>
            <td align="center" style="padding:24px 0 20px;">
              <img src="${APP_URL}/apple-icon" width="40" height="40" alt="ThoughtDrop" style="display:block;margin:0 auto 10px;border:0;" />
              <div style="font-family:${SERIF};font-size:22px;font-weight:500;color:${C.ink};letter-spacing:-0.01em;">ThoughtDrop</div>
            </td>
          </tr>
          <tr>
            <td style="background:${C.card};border:1px solid ${C.border};border-radius:12px;padding:32px 28px;">
              <h1 style="margin:0 0 16px;font-family:${SERIF};font-size:20px;font-weight:600;color:${C.ink};">${heading}</h1>
              ${body}
              ${button}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:20px 12px 8px;font-family:${SANS};font-size:12px;line-height:1.5;color:${C.muted};">
              ThoughtDrop · Dump thoughts, get structure.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendTaskReminderEmail(
  email: string,
  opts: { taskContent: string; dueDate: string },
) {
  const resend = getResend();
  const tasksUrl = `${APP_URL}/tasks`;
  if (!resend) {
    console.log(
      `\n⏰ Task reminder for ${email}: "${opts.taskContent}" (due ${opts.dueDate})\n`,
    );
    return;
  }
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Reminder: ${opts.taskContent}`,
    html: renderBrandedEmail({
      previewText: `A task is due: ${opts.taskContent}`,
      heading: "A task is due",
      paragraphs: [
        `<strong style="color:${C.ink}">${escapeHtml(opts.taskContent)}</strong>`,
        `Due ${escapeHtml(opts.dueDate)}. Open ThoughtDrop to mark it done or reschedule.`,
      ],
      cta: { label: "View your tasks", url: tasksUrl },
    }),
    text: `Reminder — a task is due: ${opts.taskContent} (due ${opts.dueDate}).\nView your tasks: ${tasksUrl}`,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendMagicLinkEmail(email: string, url: string) {
  const resend = getResend();
  if (!resend) {
    console.log(`\n✉️  Magic sign-in link for ${email}:\n${url}\n`);
    return;
  }
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Your ThoughtDrop sign-in link",
    html: renderBrandedEmail({
      previewText: "Your sign-in link for ThoughtDrop (expires in 24 hours).",
      heading: "Sign in to ThoughtDrop",
      paragraphs: [
        "Tap the button below to sign in. This link works once and expires in 24 hours.",
        "If you didn't request this, you can safely ignore this email.",
      ],
      cta: { label: "Sign in to ThoughtDrop", url },
    }),
    text: `Sign in to ThoughtDrop:\n${url}\n\nThis link expires in 24 hours. If you didn't request this, you can ignore it.`,
  });
}
