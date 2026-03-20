const { getClientByEmail, checkPassword, createClientSession, setClientCookie, saveOTP } = require('../../../lib/clients');
const { sendEmail } = require('../../../lib/email');

function otpHtml(username, otp) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#0c0c0c;font-family:Inter,-apple-system,sans-serif;color:#d8d8d8;}.w{max-width:560px;margin:0 auto;padding:40px 20px;}.c{background:#141414;border:1px solid #242424;border-radius:8px;overflow:hidden;}.h{padding:32px 36px 28px;border-bottom:1px solid #242424;}.logo{font-family:monospace;font-size:13px;color:#777;margin-bottom:20px;}.logo em{color:#c8ff00;font-style:normal;}.title{font-size:20px;font-weight:700;color:#f0f0f0;}.b{padding:32px 36px;text-align:center;}.txt{font-size:14px;color:#777;line-height:1.7;margin-bottom:32px;text-align:left;}.box{background:#0c0c0c;border:1px solid #242424;border-radius:8px;padding:28px;margin-bottom:12px;}.lbl{font-family:monospace;font-size:10px;color:#404040;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px;}.code{font-family:monospace;font-size:42px;font-weight:700;color:#c8ff00;letter-spacing:.18em;}.exp{font-family:monospace;font-size:11px;color:#404040;margin-top:12px;}.div{height:1px;background:#242424;margin:0 36px;}.f{padding:20px 36px;font-family:monospace;font-size:11px;color:#404040;}.f a{color:#777;text-decoration:none;}</style></head><body><div class="w"><div class="c"><div class="h"><div class="logo">vvshenok<em>.dev</em></div><div class="title">Your one-time code</div></div><div class="b"><p class="txt">Hey ${username}, here is a fresh verification code for your account.</p><div class="box"><div class="lbl">Verification Code</div><div class="code">${otp}</div><div class="exp">Expires in 10 minutes</div></div></div><div class="div"></div><div class="f">Didn't request this? Ignore this email · <a href="https://vvshenok.is-a.dev">vvshenok.is-a.dev</a></div></div></div></body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const client = await getClientByEmail(email);
    console.log('[login] client found:', !!client, '| email:', email);
    if (!client) return res.status(401).json({ error: 'Invalid email or password' });
    if (!checkPassword(client, password)) return res.status(401).json({ error: 'Invalid email or password' });
    if (!client.verified) {
      const otp = await saveOTP(email, 'verify');
      console.log('[login] unverified, resending OTP for', email, '| OTP:', otp);
      sendEmail({ to: email, subject: 'Verify your email — Vvshenok.dev', html: otpHtml(client.username, otp) })
        .then(r => console.log('[login] email result:', JSON.stringify(r)))
        .catch(e => console.error('[login] email error:', e.message));
      return res.status(403).json({ error: 'Please verify your email first', unverified: true });
    }

    const token = await createClientSession(email);
    setClientCookie(res, token);
    return res.status(200).json({ ok: true, username: client.username });
  } catch (e) {
    console.error('[login] error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
