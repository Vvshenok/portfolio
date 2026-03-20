const nodemailer = require('nodemailer');

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

async function sendEmail({ to, subject, html, replyTo }) {
  const fromEmail = process.env.GMAIL_USER;

  if (!fromEmail || !process.env.GMAIL_APP_PASSWORD) {
    console.error('[email] Missing GMAIL_USER or GMAIL_APP_PASSWORD');
    return { ok: false, error: 'Email not configured' };
  }

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: `Vvshenok.dev <${fromEmail}>`,
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
