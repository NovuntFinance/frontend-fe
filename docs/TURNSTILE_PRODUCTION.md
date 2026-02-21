# Cloudflare Turnstile – Production Setup

If the login or signup page shows **"Verification failed. Please complete the security check and try again"** but **no Turnstile widget** is visible, the frontend was built without the Turnstile site key.

## Fix: Set the env var and redeploy

`NEXT_PUBLIC_TURNSTILE_SITE_KEY` is **inlined at build time** by Next.js. You must:

1. **Add the variable in your production environment**
   - **Vercel:** Project → Settings → Environment Variables → add `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = `0x4AAAAAACYFUiUbw2p7Qoh4` (or your key) for Production (and Preview if needed).
   - **Vercel / AWS / other:** Add the same variable in the project’s environment / build settings.

2. **Redeploy**
   - Trigger a new build (e.g. push a commit or use “Redeploy” in the dashboard).
   - A build that ran _before_ the variable was set will never show the widget.

3. **Allow your domain in Cloudflare**
   - In [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile), open the widget that uses this site key.
   - In **Allowed Domains**, add `novunt.com` (and `www.novunt.com` if you use it).

After this, the Turnstile widget should appear on `/login` and `/signup`, and the backend will receive a valid token.
