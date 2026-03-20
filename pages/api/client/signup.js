const { createClient, saveOTP } = require('../../../lib/clients');
const { sendEmail } = require('../../../lib/email');

function otpHtml(username, otp) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#0c0c0c;font-family:Inter,-apple-system,sans-serif;color:#d8d8d8;}.w{max-width:560px;margin:0 auto;padding:40px 20px;}.c{background:#141414;border:1px solid #242424;border-radius:8px;overflow:hidden;}.h{padding:32px 36px 28px;border-bottom:1px solid #242424;}.logo{font-family:monospace;font-size:13px;color:#777;margin-bottom:20px;}.logo em{color:#c8ff00;font-style:normal;}.title{font-size:20px;font-weight:700;color:#f0f0f0;}.b{padding:32px 36px;text-align:center;}.txt{font-size:14px;color:#777;line-height:1.7;margin-bottom:32px;text-align:left;}.box{background:#0c0c0c;border:1px solid #242424;border-radius:8px;padding:28px;margin-bottom:12px;}.lbl{font-family:monospace;font-size:10px;color:#404040;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px;}.code{font-family:monospace;font-size:42px;font-weight:700;color:#c8ff00;letter-spacing:.18em;}.exp{font-family:monospace;font-size:11px;color:#404040;margin-top:12px;}.warn{display:flex;gap:10px;background:rgba(245,85,85,.06);border:1px solid rgba(245,85,85,.15);border-radius:6px;padding:14px 16px;margin-top:24px;text-align:left;}.wi{color:#f55;font-size:14px;flex-shrink:0;}.wt{font-size:12px;color:#777;line-height:1.6;}.div{height:1px;background:#242424;margin:0 36px;}.f{padding:20px 36px;font-family:monospace;font-size:11px;color:#404040;line-height:1.7;}.f a{color:#777;text-decoration:none;}</style></head><body><div class="w"><div class="c"><div class="h"><div class="logo">vvshenok<em>.dev</em></div><div class="title">Your one-time code</div></div><div class="b"><p class="txt">Hey ${username}, here is your verification code. Enter it to confirm your email. Do not share this with anyone.</p><div class="box"><div class="lbl">Verification Code</div><div class="code">${otp}</div><div class="exp">Expires in 10 minutes</div></div><div class="warn"><div class="wi">⚠</div><div class="wt">Never share this code with anyone. We will never ask for your code over chat or Discord.</div></div></div><div class="div"></div><div class="f">Didn't request this? Ignore this email · <a href="https://vvshenok.is-a.dev">vvshenok.is-a.dev</a></div></div></div></body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { username, email, password } = req.body || {};
  if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });
  if (username.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email address' });

  try {
    const result = await createClient({ username, email, password });
    if (result.error) return res.status(400).json({ error: result.error });

    const otp = await saveOTP(email, 'verify');
    console.log('[signup] created account for', email, '| OTP:', otp);

    sendEmail({ to: email, subject: 'Verify your email — Vvshenok.dev', html: otpHtml(username, otp) })
      .then(r => console.log('[signup] email result:', JSON.stringify(r)))
      .catch(e => console.error('[signup] email error:', e.message));

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[signup] error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
