const { getClientByEmail, saveOTP } = require('../../../lib/clients');
const { sendEmail } = require('../../../lib/email');

function resetHtml(username, otp) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vvshenok.is-a.dev';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#0c0c0c;font-family:Inter,-apple-system,sans-serif;color:#d8d8d8;}.w{max-width:560px;margin:0 auto;padding:40px 20px;}.c{background:#141414;border:1px solid #242424;border-radius:8px;overflow:hidden;}.h{padding:32px 36px 28px;border-bottom:1px solid #242424;}.logo{font-family:monospace;font-size:13px;color:#777;margin-bottom:20px;}.logo em{color:#c8ff00;font-style:normal;}.badge{display:inline-block;background:rgba(255,140,0,.08);border:1px solid rgba(255,140,0,.2);color:#ff8c00;font-family:monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;padding:4px 10px;border-radius:4px;margin-bottom:14px;}.title{font-size:20px;font-weight:700;color:#f0f0f0;}.b{padding:28px 36px;}.txt{font-size:14px;color:#777;line-height:1.75;margin-bottom:28px;}.box{background:#0c0c0c;border:1px solid #242424;border-radius:8px;padding:24px;margin-bottom:24px;text-align:center;}.lbl{font-family:monospace;font-size:10px;color:#404040;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px;}.code{font-family:monospace;font-size:42px;font-weight:700;color:#c8ff00;letter-spacing:.18em;}.exp{font-family:monospace;font-size:11px;color:#404040;margin-top:12px;}.warn{display:flex;gap:10px;background:rgba(245,85,85,.06);border:1px solid rgba(245,85,85,.15);border-radius:6px;padding:14px 16px;}.wi{color:#f55;font-size:14px;flex-shrink:0;}.wt{font-size:12px;color:#777;line-height:1.6;}.div{height:1px;background:#242424;margin:0 36px;}.f{padding:20px 36px;font-family:monospace;font-size:11px;color:#404040;}.f a{color:#777;text-decoration:none;}</style></head><body><div class="w"><div class="c"><div class="h"><div class="logo">vvshenok<em>.dev</em></div><div class="badge">Security</div><div class="title">Reset your password</div></div><div class="b"><p class="txt">Hey ${username}, enter this code on the reset screen to set a new password. Valid for 10 minutes.</p><div class="box"><div class="lbl">Reset Code</div><div class="code">${otp}</div><div class="exp">Expires in 10 minutes</div></div><div class="warn"><div class="wi">⚠</div><div class="wt">If you didn't request a password reset, ignore this email. Your password will not change.</div></div></div><div class="div"></div><div class="f">Sent via <a href="https://vvshenok.is-a.dev">vvshenok.is-a.dev</a></div></div></div></body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const client = await getClientByEmail(email);
    if (!client) return res.status(200).json({ ok: true });

    const otp = await saveOTP(email, 'reset');
    console.log('[forgot] reset OTP for', email, '| OTP:', otp);

    sendEmail({ to: email, subject: 'Reset your password — Vvshenok.dev', html: resetHtml(client.username, otp) })
      .then(r => console.log('[forgot] email result:', JSON.stringify(r)))
      .catch(e => console.error('[forgot] email error:', e.message));

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[forgot] error:', e.message);
    return res.status(500).json({ error: 'Failed' });
  }
}
