# 🔧 Super Admin Login Troubleshooting Guide

**Issue:** Super Admin is not getting login access

---

## 🔍 Debugging Steps

### **1. Check Browser Console**

After attempting to log in as super admin, check the browser console for:

```
[AdminAuthService] Role extraction: { ... }
[AdminAuthService] Storing user data: { role: ..., isSuperAdmin: ... }
[AdminLogin] Login response: { ... }
```

**Look for:**

- ✅ `role: "superAdmin"` in the logs
- ✅ `isSuperAdmin: true` in the logs
- ❌ If `role: "admin"` or `role: undefined`, the backend might not be returning the correct role

### **2. Check Backend Response**

The backend should return the role in one of these locations:

- `response.data.role`
- `response.data.user.role`
- `response.data.data.role`
- `response.data.data.user.role`

**Expected Response Structure:**

```json
{
  "success": true,
  "data": {
    "token": "...",
    "user": {
      "role": "superAdmin",  // ← This must be "superAdmin" not "admin"
      "email": "...",
      ...
    }
  }
}
```

### **3. Verify Token Contains Role**

The JWT token should also contain the role. Check the token payload:

```javascript
// In browser console after login:
const token = localStorage.getItem('adminToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token payload:', payload);
console.log('Role in token:', payload.role);
```

### **4. Check Admin Data Storage**

After login, verify the admin data is stored correctly:

```javascript
// In browser console:
const admin = JSON.parse(localStorage.getItem('adminUser') || '{}');
console.log('Stored admin:', admin);
console.log('Stored role:', admin.role);
console.log('Is Super Admin:', admin.role === 'superAdmin');
```

---

## 🐛 Common Issues

### **Issue 1: Backend Not Returning Correct Role**

**Symptom:** Role is always "admin" even for super admin

**Solution:** Backend needs to ensure the login response includes:

```json
{
  "data": {
    "user": {
      "role": "superAdmin" // Must be exactly "superAdmin"
    }
  }
}
```

### **Issue 2: Role Not Extracted from Response**

**Symptom:** Role is undefined or null

**Solution:** Frontend now checks multiple locations in the response. If still failing, check console logs to see which location has the role.

### **Issue 3: HMR Error Causing Issues**

**Symptom:** Module instantiation errors in console

**Solution:**

1. Stop the dev server (Ctrl+C)
2. Clear Next.js cache: `rm -rf .next` (or delete `.next` folder)
3. Restart dev server: `npm run dev`
4. Hard refresh browser: Ctrl+Shift+R

### **Issue 4: Token Not Stored**

**Symptom:** Login succeeds but redirect fails

**Solution:** Check if token is in localStorage:

```javascript
localStorage.getItem('adminToken');
```

---

## ✅ Verification Checklist

After login attempt, verify:

- [ ] **Backend Response:** Check Network tab → Login request → Response
  - [ ] `success: true`
  - [ ] `data.token` exists
  - [ ] `data.user.role === "superAdmin"`

- [ ] **Frontend Storage:** Check Application tab → Local Storage
  - [ ] `adminToken` exists
  - [ ] `adminUser` exists
  - [ ] `adminUser.role === "superAdmin"`

- [ ] **Console Logs:** Check browser console
  - [ ] `[AdminAuthService] Role extraction:` shows `backendRole: "superAdmin"`
  - [ ] `[AdminAuthService] Storing user data:` shows `role: "superAdmin"` and `isSuperAdmin: true`
  - [ ] `[AdminLogin] Login response:` shows success

- [ ] **Redirect:** After successful login
  - [ ] Redirects to `/admin/overview` or `/admin/setup-2fa`
  - [ ] No redirect loop
  - [ ] Admin dashboard loads

---

## 🔧 Frontend Fixes Applied

1. ✅ **Enhanced Role Extraction:** Now checks multiple locations in response
2. ✅ **Better Logging:** Added detailed role extraction logs
3. ✅ **Role Verification:** Ensures role is set from backend response

---

## 📝 Next Steps

1. **Clear Cache and Restart:**

   ```bash
   # Stop dev server
   # Delete .next folder
   rm -rf .next
   # Restart
   npm run dev
   ```

2. **Test Login:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Attempt login as super admin
   - Check all console logs

3. **Check Network Tab:**
   - Go to Network tab
   - Filter by "login"
   - Check the login request response
   - Verify `role: "superAdmin"` in response

4. **If Role is Still Wrong:**
   - Share the backend login response structure
   - Check if backend is returning role correctly
   - Verify backend admin model has `role: "superAdmin"`

---

## 🚨 If Issue Persists

If super admin still can't log in after these checks:

1. **Share Console Logs:** Copy all `[AdminAuthService]` and `[AdminLogin]` logs
2. **Share Network Response:** Copy the login API response
3. **Share Backend Admin Data:** Check if the admin user in database has `role: "superAdmin"`

The frontend code is now more robust and should handle various response structures. The issue is likely:

- Backend not returning correct role
- HMR cache issue (fixed by restarting)
- Token not being stored (check localStorage)
