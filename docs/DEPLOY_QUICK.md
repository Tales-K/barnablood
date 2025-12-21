# Quick Railway Deployment Guide

## Your Railway URL
`https://barnablood-production.up.railway.app`

## Steps to Complete Deployment

### 1. Update Google OAuth Redirect URIs

Since you already have Google OAuth working locally, you just need to add the Railway URL:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your existing **OAuth 2.0 Client ID**
4. Under **Authorized redirect URIs**, click **ADD URI**
5. Add: `https://barnablood-production.up.railway.app/api/auth/callback/google`
6. Click **Save**

Keep your localhost URI - you can have both!

### 2. Set Environment Variables in Railway

Go to your Railway project > **Variables** tab and add:

```env
# Authentication (REQUIRED)
NEXTAUTH_URL=https://barnablood-production.up.railway.app
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Google OAuth (use your existing credentials)
GOOGLE_CLIENT_ID=<your-existing-google-client-id>
GOOGLE_CLIENT_SECRET=<your-existing-google-client-secret>
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Get Your Google OAuth Credentials

If you don't remember them:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** > **Credentials**
3. Find your OAuth 2.0 Client ID
4. Click to view **Client ID** and **Client Secret**

### 4. Deploy

Railway auto-deploys from your connected GitHub repo. Once you:
1. ✅ Add environment variables in Railway
2. ✅ Update Google OAuth redirect URIs

Railway will automatically deploy and your app should be live!

### 5. Test Your Deployment

1. Visit: `https://barnablood-production.up.railway.app`
2. Try signing in with Google
3. Create a test monster

## Troubleshooting

### Can't Sign In
- ✅ Check `NEXTAUTH_URL` is exactly: `https://barnablood-production.up.railway.app`
- ✅ Verify Google OAuth redirect URI includes the Railway domain
- ✅ Ensure `NEXTAUTH_SECRET` is set (32+ character random string)

### App Won't Start
- Check Railway logs in the dashboard
- Verify all 4 environment variables are set correctly
- Ensure no trailing spaces in variable values

### "Invalid Redirect URI" Error
- Double-check the redirect URI in Google Console matches exactly:
  `https://barnablood-production.up.railway.app/api/auth/callback/google`

## Environment Variables Checklist

Before deploying, make sure you have:

- [ ] `NEXTAUTH_URL` - Your Railway URL
- [ ] `NEXTAUTH_SECRET` - Generated random string
- [ ] `GOOGLE_CLIENT_ID` - From Google Console
- [ ] `GOOGLE_CLIENT_SECRET` - From Google Console

## Port Configuration

Railway will ask for the port. Use: **3000** (Next.js default)

Railway's `PORT` environment variable is automatically used by Next.js in production.

## Updating Your App

Push to your connected GitHub branch:

```bash
git add .
git commit -m "Your changes"
git push
```

Railway auto-deploys on every push!

---

**Your App:** https://barnablood-production.up.railway.app
