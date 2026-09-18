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
    html: `
      <p>Hi there,</p>
      <p>Click the link below to sign in to ThoughtDrop:</p>
      <p><a href="${url}" style="font-size:16px;font-weight:bold">Sign in to ThoughtDrop</a></p>
      <p>This link expires in 24 hours. If you didn't request this, you can ignore it.</p>
    `,
    text: `Sign in to ThoughtDrop: ${url}`,
  });
}
