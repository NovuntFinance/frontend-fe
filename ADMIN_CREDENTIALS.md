# Admin Login Credentials

## Production Admin Accounts

| Email              | Role          | Access               |
| ------------------ | ------------- | -------------------- |
| admin@novunt.com   | superAdmin    | Full admin dashboard |
| support@novunt.com | support_agent | Support tickets only |

## Login Steps

1. Navigate to: `http://localhost:3000/admin/login`
2. Enter:
   - **Email or Username**: `admin@novunt.com` or `support@novunt.com`
   - **Password**: Your assigned password
3. If 2FA is enabled, you will be prompted for your 6-digit code after the first login attempt
4. Click "Login"

## 2FA Flow

- **Initial form**: Only Email/Username and Password are shown
- **First attempt**: Submit with credentials only
- **If 2FA required**: The 2FA code field appears after the backend returns `2FA_CODE_REQUIRED`
- **Second attempt**: Enter your 6-digit code and submit again

## What Happens After Login

- **superAdmin / admin**: Redirected to full dashboard (Overview, Users, Transactions, Analytics, etc.)
- **support_agent**: Redirected to Support tickets only
- **If 2FA not enabled**: Redirected to `/admin/setup-2fa` to set up two-factor authentication

## Important Notes

- Keep these credentials secure
- The password cannot be recovered if lost
- Contact your administrator if you need access
