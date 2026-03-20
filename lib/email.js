async function sendEmail({ to, subject, html, replyTo }) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.error('[email] Missing GMAIL_USER or GMAIL_APP_PASSWORD');
    return { ok: false, error: 'Email not configured' };
  }

  try {
    // nodemailer v8 compatible import
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from: `"Vvshenok.dev" <${user}>`,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });

    console.log('[email] Sent to', to, '| id:', info.messageId);
    return { ok: true, id: info.messageId };
  } catch (e) {
    console.error('[email] Error:', e.message);
    return { ok: false, error: e.message };
  }
}

module.exports = { sendEmail };