async function sendEmailJS({ serviceId, templateId, publicKey, templateParams }) {
  const r = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: templateParams,
    }),
  });

  const text = await r.text();
  if (r.ok) {
    console.log('[email] Sent via EmailJS | template:', templateId, '| to:', templateParams.to_email || templateParams.from_email || '?');
    return { ok: true };
  }
  console.error('[email] EmailJS error:', r.status, text);
  return { ok: false, error: text };
}

// Account 1 — Contact Us + Auto-Reply
async function sendContactEmail({ templateId, templateParams }) {
  return sendEmailJS({
    serviceId: process.env.EMAILJS_SERVICE_ID,
    templateId,
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
    templateParams,
  });
}

// Account 2 — OTP/Reset + Welcome
async function sendTransactionalEmail({ templateId, templateParams }) {
  return sendEmailJS({
    serviceId: process.env.EMAILJS2_SERVICE_ID,
    templateId,
    publicKey: process.env.EMAILJS2_PUBLIC_KEY,
    templateParams,
  });
}

async function sendEmail({ to, subject, html, replyTo, type, templateParams }) {
  // If specific templateParams passed, use transactional account
  if (type === 'otp' || type === 'reset' || type === 'welcome') {
    const templateId = type === 'welcome'
      ? process.env.EMAILJS2_WELCOME_TEMPLATE
      : process.env.EMAILJS2_OTP_TEMPLATE;
    return sendTransactionalEmail({ templateId, templateParams: { ...templateParams, to_email: to } });
  }
  // Fallback — shouldn't hit this
  console.error('[email] Unknown email type:', type);
  return { ok: false, error: 'Unknown email type' };
}

module.exports = { sendEmail, sendContactEmail, sendTransactionalEmail };
