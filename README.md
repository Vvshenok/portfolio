# Vvshenok Portfolio

Full-stack Roblox developer portfolio with live Roblox API data, staff dashboard, and EmailJS contact form.

---

## Stack

- **Next.js 14** — API routes (no frontend framework, pages are plain HTML)
- **Vercel** — free hosting, no trial, no credit card required
- **games.json** — your game database, no external DB needed
- **EmailJS** — contact form emails
- **Stripe + PayPal** — secure service payments
- **Nodemailer + PDFKit** — automatic PDF invoices

---

## Directory structure

```
portfolio/
├── config.js                 ← EDIT THIS: your info, availability, socials
├── .env.local                ← EDIT THIS: secret keys, never commit
├── next.config.js
├── package.json
├── .gitignore
│
├── lib/
│   ├── roblox.js             ← fetches live data from Roblox API
│   ├── games.js              ← reads/writes public/games.json
│   └── auth.js               ← session management for dashboard
│
├── pages/
│   ├── _app.js
│   └── api/
│       ├── config.js         ← GET  /api/config
│       ├── games.js          ← GET  /api/games  (public, live Roblox data)
│       └── admin/
│           ├── login.js      ← POST /api/admin/login
│           ├── logout.js     ← POST /api/admin/logout
│           ├── check.js      ← GET  /api/admin/check
│           └── games.js      ← GET/POST/PUT/DELETE /api/admin/games
│
└── public/
    ├── index.html            ← main portfolio page
    ├── login.html            ← staff login  →  go to /login
    ├── dashboard.html        ← game manager →  go to /dashboard
    ├── style.css
    └── games.json            ← your games database
```

---

## Step 1 — Install Node.js

Download from https://nodejs.org — use the LTS version.

---

## Step 2 — Set up the project locally

```bash
cd portfolio
npm install
```

---

## Step 3 — Fill in config.js

Open `config.js` and update:

- `available: true` or `false` — controls the availability badge on the site
- `username`, `displayName`, `bio`, `bioExtra`
- `socials.roblox` — your Roblox profile URL
- `socials.twitter` — your Twitter/X URL
- `socials.discord` — your Discord tag
- `stats` — your own numbers (visits, years, favorites, games count)

---

## Step 4 — Fill in .env.local

```
ADMIN_USERNAME=Vvshenok
ADMIN_PASSWORD=your_secure_password_here

EMAILJS_SERVICE_ID=your_service_id
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_CONTACT_TEMPLATE=your_contact_template_id
EMAILJS_AUTOREPLY_TEMPLATE=your_autoreply_template_id

# Client portal email templates
EMAILJS2_SERVICE_ID=your_transactional_service_id
EMAILJS2_PUBLIC_KEY=your_transactional_public_key
EMAILJS2_OTP_TEMPLATE=your_otp_template_id
EMAILJS2_WELCOME_TEMPLATE=your_welcome_template_id

CONTACT_TO_EMAIL=you@example.com

SESSION_SECRET=any_random_string_32_chars_or_longer
ACTIVITY_PUBLIC_ENABLED=false

# Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_ENV=sandbox
PUBLIC_SITE_URL=http://localhost:3000

# Invoice email via SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASSWORD=your_smtp_password
INVOICE_FROM_EMAIL=you@example.com

# Gmail shortcut: these use your existing Vercel variables instead
# GMAIL_USER=you@gmail.com
# GMAIL_APP_PASSWORD=your_16_character_app_password

# Persistent storage: configure either KV/STORAGE or the Upstash pair
KV_REST_API_URL=https://your-kv.upstash.io
KV_REST_API_TOKEN=your_kv_token
# STORAGE_REST_API_URL=...
# STORAGE_REST_API_TOKEN=...

# Optional Discord login
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_ALLOWED_USER_ID=your_discord_user_id
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Optional activity publisher
ACTIVITY_API_KEY=your_private_activity_api_key
```

**.env.local is in .gitignore — it will never be pushed to GitHub.**

---

## Step 5 — Set up EmailJS (free, takes 5 minutes)

1. Go to https://www.emailjs.com and create a free account
2. Add a new **Email Service** (connect your Gmail or any email)
3. Create a new **Email Template** — use these variables in the template body:
   ```
   From: {{from_name}} ({{from_email}})
   
   {{message}}
   ```
4. Copy your **Service ID**, **Template ID**, and **Public Key** into `.env.local`

## Payments and invoices

The `/pay` page accepts an email, service description, and amount in USD. Stripe Checkout handles cards and Apple Pay when enabled in your Stripe account. PayPal buttons use sandbox mode until `PAYPAL_ENV=live` is set. After a completed payment, the app emails the customer a PDF invoice through SMTP.

1. Create Stripe API keys and add a webhook endpoint at `https://your-domain.com/api/payments/stripe-webhook` for `checkout.session.completed`. Add its signing secret as `STRIPE_WEBHOOK_SECRET`.
2. Create a PayPal app in the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/) and add its client ID and secret.
3. Use SMTP credentials for the mailbox that should send invoices. `INVOICE_FROM_EMAIL` must be an address allowed by that SMTP provider.
4. Set `PUBLIC_SITE_URL` to the deployed HTTPS URL in Vercel.

## Discord login setup

Discord login is for the site owner/admin dashboard, not for customers. To configure it:

1. Open the [Discord Developer Portal](https://discord.com/developers/applications) and choose **New Application**.
2. Open **OAuth2** and copy the **Client ID** into `DISCORD_CLIENT_ID`.
3. Click **Reset Secret**, copy the new secret into `DISCORD_CLIENT_SECRET`, and never expose it in frontend code.
4. Add this exact redirect URL under **Redirects**:
   `https://vvshenok.xyz/api/auth/discord/callback`
5. Copy your own Discord user ID into `DISCORD_ALLOWED_USER_ID`. Enable **Developer Mode** in Discord, right-click your profile, and choose **Copy User ID**.
6. Set `NEXT_PUBLIC_BASE_URL=https://vvshenok.xyz` in Vercel and redeploy.
7. Open `/login` and use **Continue with Discord**. Only the Discord ID in `DISCORD_ALLOWED_USER_ID` will be allowed into the admin dashboard.

The client portal uses a separate route, `/api/client/discord`, and does not use `DISCORD_ALLOWED_USER_ID`. Any Discord user with a verified Discord email can create or connect a customer portal account. Their Discord ID is stored against the client record, and the normal `vs_client` customer session cookie is issued; this never creates an admin session.

---

## Step 6 — Find your Universe IDs and Place IDs

For each game you've worked on:

**Universe ID** — go to the game page on Roblox, click the share button, the URL is:
`https://www.roblox.com/games/PLACE_ID/game-name`
That number after `/games/` is the **Place ID**.

To get the **Universe ID** from a Place ID, go to:
`https://apis.roblox.com/universes/v1/places/PLACE_ID/universe`

It returns JSON like: `{"universeId": 1234567890}`

---

## Step 7 — Update games.json

Edit `public/games.json` with your real universe IDs and place IDs.
Or leave it and use the dashboard to manage games after deploying.

---

## Step 8 — Run locally to test

```bash
npm run dev
```

Open http://localhost:3000

- Main site: http://localhost:3000
- Login: http://localhost:3000/login
- Dashboard: http://localhost:3000/dashboard

---

## Step 9 — Deploy to Vercel (free)

1. Create a free account at https://vercel.com (no credit card)
2. Push your project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   ```
   Then create a repo on GitHub and push.
3. On Vercel, click **Add New Project** → import your GitHub repo
4. Before clicking Deploy, go to **Environment Variables** and add all the keys from your `.env.local`:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `EMAILJS_SERVICE_ID`
   - `EMAILJS_TEMPLATE_ID`
   - `EMAILJS_PUBLIC_KEY`
   - `SESSION_SECRET`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
   - `PAYPAL_ENV`
   - `PUBLIC_SITE_URL`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASSWORD`
   - `INVOICE_FROM_EMAIL`
5. Click **Deploy**

Vercel gives you a free `.vercel.app` domain instantly.

---

## Managing games after deployment

Go to `yoursite.vercel.app/login`, sign in with the credentials from your `.env.local`, and you can:

- **Add** a game — paste in Universe ID, Place ID, your role, and optionally a description
- **Hide/Show** a game — toggle visibility without deleting it
- **Delete** a game — permanently removes it from the list

The dashboard writes to `public/games.json`. On Vercel, file writes persist within a deployment but reset on redeploy. For permanent game management, either:
- Edit `games.json` directly and redeploy (simplest), or
- Upgrade to a free database like Supabase when ready

---

## Changing availability

Open `config.js`, change `available: true` to `available: false`, commit and push.
Vercel redeploys automatically. The badge on your site updates within seconds.

---

## URLs

| Page | URL |
|------|-----|
| Portfolio | `/` |
| Login | `/login` |
| Dashboard | `/dashboard` |
| Config API | `/api/config` |
| Games API | `/api/games` |
