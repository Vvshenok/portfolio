let nodemailer;
try {
  nodemailer = require('nodemailer');
  console.log('[email] nodemailer loaded, version:', nodemailer.version || 'unknown');
} catch(e) {
  console.error('[email] Failed to load nodemailer:', e.message);
}

async function sendEmail({ to, subject, html, replyTo }) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  console.log('[email] sendEmail called | to:', to, '| user configured:', !!user, '| pass configured:', !!pass, '| nodemailer loaded:', !!nodemailer);

  if (!user || !pass) {
    console.error('[email] Missing GMAIL_USER or GMAIL_APP_PASSWORD');
    return { ok: false, error: 'Email not configured' };
  }

  if (!nodemailer) {
    console.error('[email] nodemailer not available');
    return { ok: false, error: 'nodemailer not available' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    console.log('[email] transporter created, sending...');

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