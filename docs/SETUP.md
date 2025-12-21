# 🚀 Setup Checklist for BarnaBlood

## ✅ What's Already Done

- ✅ Next.js 14+ project initialized
- ✅ All dependencies installed
- ✅ Complete backend implementation (APIs, auth, storage)
- ✅ All UI pages created (Login, Monsters, Monster Form, Combat)
- ✅ TypeScript types and Zod validation schemas
- ✅ shadcn/ui components installed
- ✅ Build tested successfully
- ✅ Dev server running at http://localhost:3000

## ⚠️ What You Need to Do

### 1. Set Up Google Cloud Platform (GCP)

#### A. Create Google Cloud Storage Bucket
1. Go to: https://console.cloud.google.com/storage
2. Click "Create Bucket"
3. Choose a unique bucket name (e.g., `barnablood-yourname`)
4. Select region closest to you
5. Choose "Standard" storage class
6. Click "Create"

#### B. Create Service Account for GCS
1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Click "Create Service Account"
3. Name: `barnablood-storage`
4. Grant role: "Storage Object Admin"
5. Click "Done"
6. Click on the service account you just created
7. Go to "Keys" tab → "Add Key" → "Create new key"
8. Choose "JSON" format
9. Save the downloaded file as `service-account-key.json` in your project root:
   ```
   /home/talesrodrigo/Área de Trabalho/pessoal/barnablood/service-account-key.json
   ```

#### C. Set Up Google OAuth
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. If prompted, configure OAuth consent screen:
   - Choose "External" user type
   - Fill in app name: "BarnaBlood"
   - Add your email as support email
   - Save and continue (you can skip optional fields)
4. Back to credentials, choose "Web application"
5. Add authorized redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. Click "Create"
7. **Copy the Client ID and Client Secret** (you'll need these next)

### 2. Update Environment Variables

Edit the `.env.local` file in your project and replace the placeholder values:

```bash
# Open the file
nano /home/talesrodrigo/Área\ de\ Trabalho/pessoal/barnablood/.env.local
```

Replace:
- `your-google-client-id-here` → Your actual Google OAuth Client ID
- `your-google-client-secret-here` → Your actual Google OAuth Client Secret
- `your-bucket-name-here` → Your GCS bucket name (e.g., `barnablood-yourname`)

Generate a secure secret for NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

Your `.env.local` should look like:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generated-secret-here>

GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-client-secret>

GCS_BUCKET_NAME=barnablood-yourname
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
```

### 3. Restart the Development Server

After updating environment variables:

```bash
# Stop the current server (Ctrl+C in the terminal)
# Then restart with:
cd "/home/talesrodrigo/Área de Trabalho/pessoal/barnablood"
source ~/.nvm/nvm.sh
nvm use 20
npm run dev
```

### 4. Test the Application

1. Open your browser: http://localhost:3000
2. You should see the login page
3. Click "Sign in with Google"
4. Authorize the application
5. You should be redirected to the Monsters page

## 📋 Testing Checklist

Once logged in, test these features:

- [ ] Create a new monster
  - Fill in Name, Type, CR
  - Set AC and HP
  - Upload an image (it will be auto-compressed)
  - Submit the form
  
- [ ] View monster list
  - You should see your created monster
  - Check if the image appears
  
- [ ] Combat tracking
  - Go to Combat tab
  - Click "Add Monster"
  - Select a monster
  - Try HP controls (+1, -1, +5, -5)
  - Add a condition (e.g., "Poisoned")
  - Add notes

- [ ] Cloud sync
  - Check your GCS bucket at https://console.cloud.google.com/storage
  - You should see folders: `users/<your-email>/monsters/` and `users/<your-email>/combat-sessions/`

## 🐛 Common Issues

### Issue: "Sign in with Google" doesn't work
**Solution**: 
- Verify OAuth redirect URI is exactly `http://localhost:3000/api/auth/callback/google`
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local
- Make sure OAuth consent screen is configured

### Issue: Monster creation fails
**Solution**:
- Open browser DevTools (F12) → Console tab
- Check for errors
- Verify service-account-key.json exists
- Check GCS_BUCKET_NAME matches your actual bucket

### Issue: Images don't appear
**Solution**:
- Check browser console for errors
- Images are base64-encoded and stored in GCS
- Verify your service account has "Storage Object Admin" role

## 📝 Next Steps (Optional Enhancements)

After basic setup works, you can:

1. **Add more monster fields**: Edit `/app/monsters/new/page.tsx` to include Actions, Traits, Legendary Actions
2. **Import/Export**: Add buttons to import monsters from Improved Initiative JSON
3. **Monster editing**: Create `/app/monsters/[id]/edit/page.tsx`
4. **Initiative tracking**: Add initiative rolling to combat screen
5. **Deploy to production**: Use Vercel or your preferred hosting

## 🎉 You're All Set!

Once you complete the setup steps above, you'll have a fully functional D&D 5e monster management system!

**Current Status**: ✅ Dev server running at http://localhost:3000

Just need to:
1. Set up GCP (Storage + OAuth)
2. Update .env.local
3. Restart server
4. Start managing monsters! 🐉
