# Deploy Referral Fix — Next Steps

The referral code auto-population fix has been **pushed to GitHub** (`main` branch).  
Complete deployment with these steps:

---

## 1. Vercel auto-deploy (likely already done)

If your Vercel project is connected to `NovuntFinance/frontend-fe`, a deployment should have started automatically when we pushed.

1. Go to **[vercel.com/dashboard](https://vercel.com/dashboard)**
2. Open the **frontend-fe** project
3. Check **Deployments** — look for a new deployment from the recent push
4. Wait until status is **Ready** (typically 2–5 minutes)

---

## 2. Manual deploy (if auto-deploy did not run)

If no new deployment appears, deploy manually:

```bash
cd frontend-fe
vercel login          # Sign in if needed
vercel --prod --yes   # Deploy to production
```

---

## 3. Verify it works

After deployment:

1. Open: **https://novunt-frontend-dgwf.vercel.app/register?ref=TEST123**
2. You should be redirected to `/signup?ref=TEST123`
3. Fill Steps 1 and 2, then go to Step 3
4. The **Referral Code** field should show `TEST123`

---

## 4. Backend status

- **EMAIL_FROM** — already updated on EC2 (production)
- **Backend repo** — not modified by these changes

---

## Quick checklist

- [ ] New Vercel deployment is Ready
- [ ] `/register?ref=XXX` redirects to `/signup?ref=XXX`
- [ ] Referral code auto-populates on Step 3
