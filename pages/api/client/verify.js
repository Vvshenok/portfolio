const { verifyOTP, verifyClient, getClientByEmail, createClientSession, setClientCookie } = require('../../../lib/clients');
const { sendEmail } = require('../../../lib/email');

function welcomeHtml(username) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#0c0c0c;font-family:Inter,-apple-system,sans-serif;color:#d8d8d8;}.w{max-width:560px;margin:0 auto;padding:40px 20px;}.c{background:#141414;border:1px solid #242424;border-radius:8px;overflow:hidden;}.h{padding:40px 36px 32px;border-bottom:1px solid #242424;}.logo{font-family:monospace;font-size:13px;color:#777;margin-bottom:28px;}.logo em{color:#c8ff00;font-style:normal;}.title{font-size:28px;font-weight:700;color:#f0f0f0;margin-bottom:10px;}.title em{color:#c8ff00;font-style:normal;}.sub{font-size:14px;color:#777;}.b{padding:32px 36px;}.txt{font-size:14px;color:#d8d8d8;line-height:1.75;margin-bottom:24px;}.feats{background:#0c0c0c;border:1px solid #242424;border-radius:6px;padding:20px 22px;margin-bottom:28px;}.feat{display:flex;gap:12px;align-items:flex-start;margin-bottom:14px;}.feat:last-child{margin-bottom:0;}.fd{width:6px;height:6px;border-radius:50%;background:#c8ff00;flex-shrink:0;margin-top:6px;}.ft{font-size:13px;color:#d8d8d8;line-height:1.6;}.ft strong{color:#f0f0f0;font-weight:600;}.btns{display:flex;gap:12px;flex-wrap:wrap;}.btn1{display:inline-block;background:#f0f0f0;color:#000;font-size:13px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:6px;}.btn2{display:inline-block;background:transparent;color:#d8d8d8;font-size:13px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:6px;border:1px solid #2e2e2e;}.div{height:1px;background:#242424;margin:0 36px;}.f{padding:20px 36px;font-family:monospace;font-size:11px;color:#404040;}.f a{color:#777;text-decoration:none;}</style></head><body><div class="w"><div class="c"><div class="h"><div class="logo">vvshenok<em>.dev</em></div><div class="title">Welcome, <em>${username}</em>.</div><div class="sub">You're now connected with Vvshenok — Roblox Developer.</div></div><div class="b"><p class="txt">Hey ${username}, glad to have you here. Here's what you can explore:</p><div class="feats"><div class="feat"><div class="fd"></div><div class="ft"><strong>Games</strong> — Browse titles I've worked on with live player and visit stats.</div></div><div class="feat"><div class="fd"></div><div class="ft"><strong>Skills and rates</strong> — See what I specialize in and what a full project looks like.</div></div><div class="feat"><div class="fd"></div><div class="ft"><strong>My Orders</strong> — Track your project progress and changelogs in real time.</div></div></div><div class="btns"><a href="https://vvshenok.is-a.dev" class="btn1">View Portfolio</a><a href="https://vvshenok.is-a.dev/#contact" class="btn2">Get in touch</a></div></div><div class="div"></div><div class="f"><a href="https://vvshenok.is-a.dev">vvshenok.is-a.dev</a> · Roblox Developer</div></div></div></body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, otp } = req.body || {};
  if (!email || !otp) return res.status(400).json({ error: 'Missing fields' });

  try {
    console.log('[verify] attempt for', email, '| otp:', otp);
    const valid = await verifyOTP(email, 'verify', otp);
    console.log('[verify] OTP valid:', valid);
    if (!valid) return res.status(400).json({ error: 'Invalid or expired code' });

    await verifyClient(email);
    const client = await getClientByEmail(email);

    sendEmail({ to: email, subject: 'Welcome to Vvshenok.dev', html: welcomeHtml(client.username) })
      .catch(e => console.error('[verify] welcome email error:', e.message));

    const token = await createClientSession(email);
    setClientCookie(res, token);
    return res.status(200).json({ ok: true, username: client.username });
  } catch (e) {
    console.error('[verify] error:', e.message);
    return res.status(500).json({ error: 'Verification failed' });
  }
}
