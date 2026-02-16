# Deployment Checklist – “Works Locally, Fails in Production”

If the app works on your machine but breaks after pushing, it’s usually because **environment variables** (or related config) are only set locally and not in your deployment platform.

## 1. Set environment variables in your hosting platform

`.env.local` is **not** committed. Any hosting platform (Vercel, Netlify, etc.) needs these set manually.

| Variable                         | Required             | Example                         | Notes                                        |
| -------------------------------- | -------------------- | ------------------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_API_URL`            | **Yes**              | `https://api.novunt.com/api/v1` | Backend API base URL                         |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Yes (if using login) | `0x4AAAAAACYFUiUbw2p7Qoh4`      | Use test key locally, production key in prod |
| `NEXT_PUBLIC_DEBUG_API`          | No                   | `false`                         | Optional debug logging                       |

### Vercel

1. Project → Settings → Environment Variables
2. Add each variable
3. Redeploy after changes

### Netlify

1. Site → Site configuration → Environment variables
2. Add each variable
3. Redeploy

## 2. Local vs production differences

- **Localhost bypass**: Middleware skips auth checks on localhost; in production it enforces them.
- **Cookies**: Secure flag is added automatically on `https`.
- **API URL**: Local uses `localhost:5000`; production must use `https://api.novunt.com/api/v1`.

## 3. Common production issues

| Symptom                  | Likely cause                  | Action                                                     |
| ------------------------ | ----------------------------- | ---------------------------------------------------------- |
| Login doesn’t work       | Missing `NEXT_PUBLIC_API_URL` | Set in hosting env vars                                    |
| Infinite redirect loop   | Cookie/domain mismatch        | Confirm production URL is `https` and env vars are set     |
| Blank page / build error | Env var missing at build      | Set vars in hosting dashboard; redeploy                    |
| “Network Error” / CORS   | Wrong API URL or backend CORS | Ensure API URL matches backend and CORS allows your domain |

## 4. Verify deployment

After setting env vars and redeploying:

1. Open browser DevTools → Console
2. Check for `🔧 API Base URL:` – it should show `https://api.novunt.com/api/v1`
3. Try logging in and confirm no redirect loops
