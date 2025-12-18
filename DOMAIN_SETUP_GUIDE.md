# Domain Setup Guide: Connecting novunt.com to Vercel

This guide will help you connect your custom domain `novunt.com` (registered on Namecheap) to your Vercel deployment.

## Prerequisites

- Access to your Vercel account
- Access to your Namecheap account
- Your domain `novunt.com` registered on Namecheap

## Step 1: Add Domain in Vercel

1. **Log in to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Navigate to your project dashboard

2. **Add Custom Domain**
   - Click on your project
   - Go to **Settings** → **Domains**
   - Click **Add Domain**
   - Enter `novunt.com` and click **Add**
   - Also add `www.novunt.com` (optional but recommended)

3. **Get DNS Configuration**
   - After adding the domain, Vercel will show you the DNS records you need to configure
   - You'll see something like:
     - **Type**: A or CNAME
     - **Name**: @ or www
     - **Value**: Vercel's IP addresses or CNAME target

## Step 2: Configure DNS in Namecheap

**⚠️ IMPORTANT**: Since your domain is linked to another Vercel account, you need to add verification TXT records first.

1. **Log in to Namecheap**
   - Go to [namecheap.com](https://namecheap.com) and sign in
   - Navigate to **Domain List**

2. **Access DNS Settings**
   - Find `novunt.com` in your domain list
   - Click **Manage** next to your domain
   - Go to the **Advanced DNS** tab

3. **Step 2a: Add Verification TXT Records (REQUIRED FIRST)**

   Add these TXT records to verify domain ownership:
   
   **For novunt.com verification:**
   - **Type**: TXT Record
   - **Host**: `_vercel`
   - **Value**: `vc-domain-verify=novunt.com,0b84c1cde3f9a87e9e69`
   - **TTL**: Automatic (or 3600)
   
   **For www.novunt.com verification:**
   - **Type**: TXT Record
   - **Host**: `_vercel`
   - **Value**: `vc-domain-verify=www.novunt.com,b95608ce25b9ad6ddad9`
   - **TTL**: Automatic (or 3600)

   ⚠️ **Note**: If you already have a `_vercel` TXT record, you may need to add both values or replace it. Namecheap allows multiple TXT records with the same host.

4. **Step 2b: Add DNS Records for Domain Routing**

   After verification (or simultaneously), add these records:

   **For novunt.com (root domain):**
   - **Type**: A Record
   - **Host**: `@`
   - **Value**: `216.198.79.1`
   - **TTL**: Automatic (or 3600)
   
   **For www.novunt.com:**
   - **Type**: CNAME Record
   - **Host**: `www`
   - **Value**: `13b578f64025bf1a.vercel-dns-017.com.`
   - **TTL**: Automatic (or 3600)
   
   ⚠️ **Important**: Make sure the CNAME value ends with a dot (`.`) - `13b578f64025bf1a.vercel-dns-017.com.`

5. **Remove Conflicting Records (CRITICAL!)**
   - ⚠️ **This is very important**: Remove ALL old DNS records that point to your old hosting
   - Remove any existing A records pointing to other IPs (except `216.198.79.1`)
   - Remove any conflicting CNAME records for `www` (except the Vercel one)
   - Remove any A records for `www` (should only use CNAME for www)
   - Check for records pointing to:
     - Old hosting provider IPs
     - Old website builder services
     - Any other IP addresses that aren't Vercel's
   - Keep the verification TXT records until verification is complete
   - **If you don't remove old records, your domain will still point to the old website!**

6. **Save Changes**
   - Click **Save All Changes** (green checkmark button)
   - Wait 5-10 minutes for DNS to propagate

## Step 3: Verify Domain Ownership

1. **Wait for DNS Propagation**
   - After adding the TXT records, wait 5-30 minutes for DNS to propagate
   - You can check propagation using [whatsmydns.net](https://www.whatsmydns.net/#TXT/_vercel.novunt.com)

2. **Check Verification Status in Vercel**
   - Go back to Vercel → Settings → Domains
   - The domain should automatically verify once DNS propagates
   - You'll see the status change from "Verification Needed" to "Valid Configuration"

3. **After Verification**
   - Once verified, you can optionally remove the `_vercel` TXT records (they're only needed for initial verification)
   - However, keeping them won't cause any issues

## Step 4: SSL Certificate (Automatic)

- Vercel automatically provisions SSL certificates via Let's Encrypt
- This happens automatically after DNS propagation (usually within 24 hours)
- You don't need to configure anything manually

## Step 5: Verify Configuration

1. **Check DNS Propagation**
   - Wait 5-30 minutes for DNS changes to propagate (can take up to 48 hours)
   - Use these tools to verify:
     - [whatsmydns.net](https://www.whatsmydns.net) - Check A record for `novunt.com`
     - [dnschecker.org](https://dnschecker.org/#A/novunt.com) - Global DNS propagation check
   - The A record should show `216.198.79.1` (Vercel's IP)

2. **Verify in Vercel**
   - Go back to Vercel → Settings → Domains
   - Check the status of your domain
   - It should show "Valid Configuration" (green checkmark) once DNS is properly configured
   - If it shows "Invalid Configuration", check your DNS records again

3. **Test Your Domain**
   - **Important**: Use Incognito/Private mode or clear browser cache first
   - Visit `https://novunt.com` in your browser
   - Visit `https://www.novunt.com` (if configured)
   - Both should load your Vercel deployment (not the old website)

4. **Verify DNS is pointing to Vercel**
   - Open Command Prompt (Windows) or Terminal (Mac/Linux)
   - Run: `nslookup novunt.com`
   - The IP address should be `216.198.79.1`
   - If it shows a different IP, DNS hasn't propagated yet or old records are still active

## Common Issues & Solutions

### Issue: Domain shows "Verification Needed" or "Invalid Configuration" in Vercel
**Solution**: 
- **First**: Ensure the `_vercel` TXT records are added correctly
- Double-check DNS records match exactly what Vercel shows (including the dot at the end of CNAME)
- Verify TXT records are visible using DNS checker tools
- Ensure TTL is set correctly
- Wait for DNS propagation (can take up to 48 hours, but usually 5-30 minutes)

### Issue: Domain verification fails
**Solution**:
- Check that both TXT records are added (one for novunt.com, one for www.novunt.com)
- Verify the TXT record values match exactly (including commas and verification codes)
- Ensure the host is `_vercel` (with underscore)
- Wait longer for DNS propagation (up to 1 hour)

### Issue: SSL Certificate not issued
**Solution**:
- Ensure DNS is properly configured
- Wait 24-48 hours for automatic SSL provisioning
- Check that your domain is pointing to Vercel's servers

### Issue: Still seeing the old website (MOST COMMON)

This usually means DNS hasn't propagated yet or old DNS records are still active. Follow these steps:

**Step 1: Verify DNS is pointing to Vercel**
1. Open a command prompt (Windows) or terminal (Mac/Linux)
2. Run: `nslookup novunt.com` or `ping novunt.com`
3. Check if the IP address matches Vercel's IP (`216.198.79.1`)
4. If it shows a different IP, DNS hasn't propagated yet

**Step 2: Check DNS records in Namecheap**
- Go to Namecheap → Domain List → Manage → Advanced DNS
- Verify you have:
  - ✅ A record: `@` → `216.198.79.1`
  - ✅ CNAME record: `www` → `13b578f64025bf1a.vercel-dns-017.com.`
  - ❌ **Remove any old A records** pointing to other IPs
  - ❌ **Remove any old CNAME records** for `www` pointing elsewhere

**Step 3: Clear browser cache and test**
1. **Hard refresh**: Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. **Clear cache**: 
   - Chrome: Settings → Privacy → Clear browsing data → Cached images and files
   - Or use Incognito/Private mode to test
3. **Test in different browser** or use a tool like [whatsmydns.net](https://www.whatsmydns.net)

**Step 4: Check DNS propagation globally**
- Visit [dnschecker.org](https://dnschecker.org/#A/novunt.com)
- Enter `novunt.com` and check A record
- It should show `216.198.79.1` in most locations
- If it shows different IPs, DNS is still propagating (wait 1-24 hours)

**Step 5: Verify in Vercel**
- Go to Vercel → Settings → Domains
- Check if domain shows "Valid Configuration" (green checkmark)
- If it shows "Invalid Configuration", DNS records aren't correct yet

**Step 6: If still not working after 24 hours**
- Double-check all DNS records match exactly what Vercel shows
- Make sure you removed ALL old DNS records
- Contact Namecheap support if DNS changes aren't taking effect
- Verify the domain isn't using Namecheap's "BasicDNS" (should use "Custom DNS" or "PremiumDNS")

### Issue: www subdomain not working
**Solution**:
- Ensure CNAME record for `www` is configured
- Check that the CNAME value matches Vercel's requirements
- Wait for DNS propagation

## Important Notes

1. **DNS Propagation**: Changes can take anywhere from 5 minutes to 48 hours to fully propagate globally

2. **SSL Certificate**: Vercel automatically provides SSL certificates. No manual configuration needed.

3. **Both www and non-www**: It's recommended to configure both `novunt.com` and `www.novunt.com` for better user experience

4. **Vercel IP Addresses**: Vercel's IP addresses may change. Using CNAME for www is more flexible, but root domains require A records.

## Quick Reference: Your Specific DNS Values

Use these **exact values** in Namecheap:

### Verification Records (Add First)
- **TXT Record**: Host `_vercel` → Value `vc-domain-verify=novunt.com,0b84c1cde3f9a87e9e69`
- **TXT Record**: Host `_vercel` → Value `vc-domain-verify=www.novunt.com,b95608ce25b9ad6ddad9`

### Domain Routing Records
- **A Record**: Host `@` → Value `216.198.79.1` (for novunt.com)
- **CNAME Record**: Host `www` → Value `13b578f64025bf1a.vercel-dns-017.com.` (for www.novunt.com)

⚠️ **Important**: The CNAME value must end with a dot (`.`)

## Need Help?

- **Vercel Documentation**: [vercel.com/docs/concepts/projects/domains](https://vercel.com/docs/concepts/projects/domains)
- **Namecheap Support**: Check Namecheap's knowledge base or contact support
- **DNS Checker**: Use online tools to verify DNS propagation

---

**Last Updated**: Based on current Vercel and Namecheap configurations
**Estimated Setup Time**: 15-30 minutes (plus DNS propagation time)

