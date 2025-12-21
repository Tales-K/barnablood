# BarnaBlood - D&D 5e Monster Management
A web application for managing D&D 5e monsters and tracking combat encounters with cloud synchronization.

# Tech Stack
- Framework: Next.js 14+ (App Router, React Server Components, TypeScript)
- Styling: Tailwind CSS v4 with shadcn/ui components
- Authentication: NextAuth.js v5 with Google OAuth
- Storage: Google Cloud Storage (GCS) for persistent data
- State Management: Zustand with localStorage persistence for combat tracking
- Validation: Zod schemas matching Improved Initiative JSON format
- Forms: React Hook Form with Zod resolver

# Project Structure

```
app/
├── api/
│   ├── auth/           # NextAuth endpoints (configured via lib/auth.ts)
│   ├── monsters/
│   │   ├── route.ts    # GET (list), POST (create), DELETE endpoints
│   │   └── [id]/
│   │       └── route.ts # GET (view), PUT (update), DELETE endpoints
│   └── combat/
│       └── save/
│           └── route.ts # POST/GET for combat session sync
├── monsters/
│   ├── page.tsx        # Monster list with cards
│   ├── new/page.tsx    # Create new monster form
│   └── [id]/
│       ├── page.tsx    # View monster details
│       └── edit/page.tsx # Edit monster form
├── combat/page.tsx     # Combat tracker with HP management
└── login/page.tsx      # Google OAuth login

lib/
├── auth.ts             # NextAuth configuration
├── gcs.ts              # Google Cloud Storage helper functions
└── stores/
    └── combat.ts       # Zustand combat state store

types/
└── monster.ts          # Zod schemas & TypeScript types (Improved Initiative format)

components/ui/          # shadcn/ui components (Button, Card, Input, etc.)
```

# Key Features

- Monster CRUD: Create, read, update, delete D&D monsters with full stat blocks
- Combat Tracking: Real-time HP tracking with conditions, auto-syncs to GCS every 2 seconds
- Google Authentication: Secure login with Google accounts only
- Cloud Persistence: All data stored in Google Cloud Storage, organized by user email
- Improved Initiative Compatible: Monsters follow Improved Initiative JSON schema

# Environment Setup

Required .env.local variables:

- NEXTAUTH_URL, NEXTAUTH_SECRET - Auth configuration
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET - Google OAuth credentials
- GCS_BUCKET_NAME, GOOGLE_APPLICATION_CREDENTIALS - GCS configuration

# Development

```
npm install
npm run dev  # Starts on localhost:3000
```

Note: Requires Node.js 18+ (use nvm use with the included .nvmrc)
