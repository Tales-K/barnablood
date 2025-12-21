# BarnaBlood - D&D 5e Monster Manager

A modern web application for managing D&D 5e monsters and tracking combat sessions.

## Features

- ✅ **Monster Management**: Create, view, and manage your D&D 5e monster collection
- ✅ **Combat Tracking**: Track HP, conditions, and notes during combat encounters
- ✅ **Google Cloud Storage**: Sync your monsters and combat sessions to the cloud
- ✅ **Google OAuth**: Secure authentication using your Google account
- ✅ **Image Processing**: Auto-compress and resize monster images to ~30KB
- ✅ **Improved Initiative Compatible**: Import/export monsters in Improved Initiative JSON format
- ✅ **Real-time Sync**: Combat sessions auto-save every 2 seconds

## Tech Stack

- **Framework**: Next.js 14+ with App Router (SSR)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: NextAuth.js v5 (Auth.js) with Google OAuth
- **Storage**: Google Cloud Storage
- **State Management**: Zustand (with localStorage persistence)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: shadcn/ui (Radix UI + Tailwind)

## Prerequisites

- Node.js 20.9.0 or higher
- npm 10+
- Google Cloud Platform account (for GCS and OAuth)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Google Cloud Platform

#### Create a Google Cloud Storage Bucket

1. Go to [Google Cloud Console](https://console.cloud.google.com/storage)
2. Create a new bucket (choose Standard storage and region-appropriate location)
3. Note your bucket name

#### Create a Service Account

1. Go to [IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Create a new service account
3. Grant it "Storage Object Admin" role
4. Create a JSON key and download it
5. Save the file as `service-account-key.json` in the project root

#### Set up Google OAuth

1. Go to [APIs & Credentials](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Note your Client ID and Client Secret

### 3. Environment Variables

Create a `.env.local` file in the project root:

```env
# Auth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-here

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Google Cloud Storage Configuration
GCS_BUCKET_NAME=your-bucket-name-here
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
```

Generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 4. Run the Application

#### Development

```bash
# Make sure you're using Node v20
nvm use 20

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:3000`

#### Production Build

```bash
npm run build
npm start
```

## Usage Guide

### Login

1. Navigate to `http://localhost:3000`
2. Click "Sign in with Google"
3. Authorize the application

### Managing Monsters

1. Click "Create Monster" on the Monsters page
2. Fill in the monster details:
   - Basic info (Name, Type, CR, Source)
   - Combat stats (AC, HP, Initiative)
   - Ability scores (STR, DEX, CON, INT, WIS, CHA)
   - Additional details (Speed, Senses, Languages, Resistances, etc.)
3. Upload an image (auto-compressed to ~30KB)
4. Click "Create Monster"

### Combat Tracking

1. Go to the "Combat" tab
2. Click "Add Monster" to add monsters to the encounter
3. Track each monster's:
   - Current HP (use +/- buttons)
   - Conditions (click "Add Condition")
   - Combat notes
4. Session auto-saves every 2 seconds to Google Cloud Storage

### Data Storage

- **Local**: Combat state is persisted in browser localStorage
- **Cloud**: Monsters and combat sessions sync to Google Cloud Storage
- **Format**: Compatible with Improved Initiative JSON format

## Project Structure

```
barnablood/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth handler
│   │   ├── monsters/route.ts            # Monster CRUD API
│   │   └── combat/save/route.ts         # Combat session sync
│   ├── combat/page.tsx                  # Combat tracker UI
│   ├── monsters/
│   │   ├── page.tsx                     # Monster list
│   │   └── new/page.tsx                 # Monster creation form
│   ├── login/page.tsx                   # Login page
│   └── layout.tsx                       # Root layout
├── lib/
│   ├── auth.ts                          # NextAuth configuration
│   ├── gcs.ts                           # Google Cloud Storage helpers
│   ├── imageProcessing.ts               # Image compression utilities
│   └── stores/combat.ts                 # Zustand combat store
├── types/
│   └── monster.ts                       # TypeScript types & Zod schemas
└── components/ui/                       # shadcn/ui components
```

## API Endpoints

- `GET /api/monsters` - List all monsters for authenticated user
- `POST /api/monsters` - Create a new monster
- `DELETE /api/monsters?id=...` - Delete a monster
- `POST /api/combat/save` - Save combat session to cloud
- `GET /api/combat/save?sessionId=...` - Load combat session

## Development Notes

### Node.js Version

This project requires Node.js 20.9.0+ due to Next.js 14+ requirements. Use nvm to manage versions:

```bash
nvm install 20
nvm use 20
```

### Environment Variables

The application gracefully handles missing GCS credentials at build time but requires them at runtime for cloud features.

### TypeScript

Strict mode is enabled. All monster data follows the Improved Initiative JSON schema with Zod validation.

## Troubleshooting

### "SyntaxError: Unexpected token '?'"

Your Node.js version is too old. Use Node v20+:
```bash
nvm use 20
```

### GCS Connection Errors

1. Verify `service-account-key.json` is in the project root
2. Check `GCS_BUCKET_NAME` matches your bucket name
3. Ensure service account has "Storage Object Admin" role

### OAuth Errors

1. Verify redirect URI includes your exact URL
2. Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
3. Ensure OAuth consent screen is configured

## License

MIT

## Author

Built with ❤️ for D&D enthusiasts


