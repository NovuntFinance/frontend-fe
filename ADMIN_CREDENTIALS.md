# Admin Login Credentials

## ✅ Correct Super Admin Credentials

These credentials were created by the backend setup script:

```
Email: superadmin@novunt.com
Password: NovuntTeam@2025
Username: superadmin
Role: superAdmin
ID: 692c234531c96b685fce21bb
```

## 🔐 Login Steps

1. Navigate to: `http://localhost:3000/admin/login`
2. Enter:
   - **Email or Username**: `superadmin@novunt.com` (or `superadmin`)
   - **Password**: `NovuntTeam@2025`
3. Click "Login"

## 🎯 What Happens After Login

Based on the setup, the super admin account likely doesn't have 2FA enabled yet, so after successful login:

1. **If 2FA is not enabled**: You'll be redirected to `/admin/setup-2fa` to set up two-factor authentication
2. **If 2FA is already enabled**: You'll be redirected to `/admin/overview` (admin dashboard)

## ⚠️ Important Notes

- Keep these credentials secure
- The password cannot be recovered if lost
- This is a super admin account with full permissions
- Consider setting up 2FA immediately after first login

## 🐛 If Login Still Fails

1. **Clear browser storage**:
   - Open DevTools (F12)
   - Go to Application tab → Storage → Clear site data
2. **Check backend**:
   - Verify backend is running
   - Check backend logs for any errors
3. **Verify credentials**:
   - Double-check you're using: `NovuntTeam@2025` (not `NovuntTest@2025`)
   - Make sure there are no extra spaces

## 📝 Previous Issue

You were using: `NovuntTest@2025` ❌
Correct password is: `NovuntTeam@2025` ✅

The difference: `Test` vs `Team` in the middle of the password!
