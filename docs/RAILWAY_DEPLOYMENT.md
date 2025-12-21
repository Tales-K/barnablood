# Deploying BarnaBlood to Railway

This guide will walk you through deploying the BarnaBlood D&D 5e Monster Manager to Railway.

## Prerequisites

Before you begin, make sure you have:

1. A [Railway](https://railway.app) account
2. A [Google Cloud Platform](https://console.cloud.google.com) account
3. Your project code ready in a Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Set Up Google Cloud Services

### 1.1 Enable Required APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Cloud Storage API
   - OAuth 2.0 API

### 1.2 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application**
4. Add authorized redirect URIs:
   - `https://your-app-name.up.railway.app/api/auth/callback/google`
   - Add your Railway domain once you know it
5. Save the **Client ID** and **Client Secret**

### 1.3 Create Google Cloud Storage Bucket

1. Go to **Cloud Storage** > **Buckets**
2. Click **Create Bucket**
3. Choose a unique name (e.g., `barnablood-yourusername`)
4. Select a location/region close to your users
5. Choose **Standard** storage class
6. Set access control to **Fine-grained**
7. Click **Create**

### 1.4 Create Service Account

1. Go to **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Name it (e.g., `barnablood-storage`)
4. Grant roles:
   - **Storage Object Admin** (for full read/write access)
   - **Storage Admin** (for bucket management)
5. Click **Done**
6. Click on the service account you just created
7. Go to **Keys** tab
8. Click **Add Key** > **Create new key**
9. Choose **JSON** format
10. Download the key file (keep it secure!)

## Step 2: Prepare Your Service Account Key for Railway

Railway doesn't support uploading files directly, so you need to convert your service account JSON to a single-line string.

### Option 1: Using Command Line

```bash
# On Linux/Mac
cat service-account-key.json | tr -d '\n' | tr -d ' '

# On Windows PowerShell
(Get-Content service-account-key.json -Raw) -replace '\s',''
```

### Option 2: Using Online Tool

1. Open your `service-account-key.json` file
2. Copy the entire content
3. Use a JSON minifier (like [jsonformatter.org/json-minifier](https://jsonformatter.org/json-minifier))
4. Copy the minified output

Save this minified JSON string - you'll need it for the environment variables.

## Step 3: Generate NextAuth Secret

Generate a secure random string for NextAuth:

```bash
# Using OpenSSL (Linux/Mac)
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Using PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## Step 4: Deploy to Railway

### 4.1 Create New Project

1. Log in to [Railway](https://railway.app)
2. Click **New Project**
3. Select **Deploy from GitHub repo**
4. Authorize Railway to access your repository
5. Select your repository

### 4.2 Configure Environment Variables

In your Railway project dashboard, go to **Variables** tab and add the following:

#### Authentication Configuration

```env
NEXTAUTH_URL=https://your-app-name.up.railway.app
NEXTAUTH_SECRET=<your-generated-secret-from-step-3>
```

**Note:** Update `NEXTAUTH_URL` with your actual Railway domain after deployment.

#### Google OAuth Credentials

```env
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

#### Google Cloud Storage Configuration

```env
GCS_BUCKET_NAME=<your-bucket-name>
GOOGLE_APPLICATION_CREDENTIALS_JSON=<minified-service-account-json-from-step-2>
```

**Important:** The `GOOGLE_APPLICATION_CREDENTIALS_JSON` should be the entire minified JSON string from Step 2.

### 4.3 Update Application Code (if needed)

Your `lib/gcs.ts` file should handle the JSON string from environment variable. Make sure it has code similar to:

```typescript
// Parse credentials from environment variable
const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
  : undefined;

const storage = new Storage({
  credentials: credentials || undefined,
  projectId: credentials?.project_id,
});
```

## Step 5: Update OAuth Redirect URIs

Once your Railway app is deployed:

1. Note your Railway domain (e.g., `https://barnablood-production.up.railway.app`)
2. Go back to [Google Cloud Console](https://console.cloud.google.com)
3. Navigate to **APIs & Services** > **Credentials**
4. Edit your OAuth 2.0 Client ID
5. Add the Railway domain to **Authorized redirect URIs**:
   ```
   https://your-railway-domain.up.railway.app/api/auth/callback/google
   ```
6. Update the `NEXTAUTH_URL` environment variable in Railway with your actual domain
7. Redeploy your Railway app (it will auto-redeploy when you change env vars)

## Step 6: Configure Custom Domain (Optional)

1. In Railway dashboard, go to **Settings** > **Domains**
2. Click **Generate Domain** for a Railway subdomain
3. Or click **Custom Domain** to add your own domain
4. Follow Railway's DNS configuration instructions
5. Update `NEXTAUTH_URL` and Google OAuth redirect URIs accordingly

## Step 7: Test Your Deployment

1. Visit your Railway URL
2. Try logging in with Google
3. Create a test monster
4. Verify images upload correctly to Google Cloud Storage

## Troubleshooting

### Authentication Issues

- **Problem:** Can't sign in with Google
- **Solution:** 
  - Verify `NEXTAUTH_URL` matches your Railway domain
  - Check Google OAuth redirect URIs include your Railway domain
  - Ensure `NEXTAUTH_SECRET` is set

### Image Upload Issues

- **Problem:** Images fail to upload
- **Solution:**
  - Verify `GCS_BUCKET_NAME` is correct
  - Check `GOOGLE_APPLICATION_CREDENTIALS_JSON` is valid minified JSON
  - Ensure service account has correct permissions (Storage Object Admin)
  - Make bucket publicly accessible for image URLs

### Application Crashes

- **Problem:** App fails to start
- **Solution:**
  - Check Railway logs: **View Logs** in dashboard
  - Verify all required environment variables are set
  - Check for syntax errors in JSON credentials

## Environment Variables Summary

Here's a complete list of all required environment variables:

```env
# Authentication
NEXTAUTH_URL=https://your-app-name.up.railway.app
NEXTAUTH_SECRET=your-generated-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Cloud Storage
GCS_BUCKET_NAME=your-bucket-name
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"..."}
```

## Security Best Practices

1. **Never commit** `.env` files or service account keys to Git
2. **Rotate secrets** regularly, especially if exposed
3. **Use Railway's secret variables** for sensitive data
4. **Enable MFA** on Google Cloud and Railway accounts
5. **Restrict service account permissions** to minimum required
6. **Monitor usage** in Google Cloud Console to detect unauthorized access

## Updating Your Deployment

Railway auto-deploys when you push to your connected Git branch:

```bash
git add .
git commit -m "Update application"
git push origin main
```

Railway will automatically:
1. Pull the latest code
2. Install dependencies
3. Build the Next.js application
4. Deploy the new version

## Cost Considerations

### Railway
- **Free tier:** $5 credit/month
- **Pro plan:** $20/month for unlimited projects
- See [Railway pricing](https://railway.app/pricing)

### Google Cloud
- **Cloud Storage:** ~$0.02/GB/month
- **OAuth:** Free
- **Bandwidth:** $0.12/GB (first 1GB free)
- See [GCS pricing](https://cloud.google.com/storage/pricing)

## Support

For issues:
- Railway: [Railway Discord](https://discord.gg/railway)
- Google Cloud: [Support Center](https://cloud.google.com/support)
- Application: Check GitHub Issues

---

**Last Updated:** December 2025
