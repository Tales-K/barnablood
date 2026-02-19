## Plan: Incremental Migration to Firebase on User Login
## Step-by-Step Refactor Guide: Migrating from GCS to Firebase Firestore

Follow these steps to refactor BarnaBlood to use Firebase Firestore for all monster data storage and authentication:

### 1. Set Up Firebase Project & Firestore
1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable Firestore (recommended) and Firebase Auth.
3. Download your Firebase service account key (JSON).
4. Add Firebase config and credentials to your `.env` and Railway environment variables:
   - FIREBASE_PROJECT_ID
   - FIREBASE_CLIENT_EMAIL
   - FIREBASE_PRIVATE_KEY
   - FIREBASE_API_KEY
   - FIREBASE_AUTH_DOMAIN
   - FIREBASE_STORAGE_BUCKET
   - FIREBASE_MESSAGING_SENDER_ID
   - FIREBASE_APP_ID

### 2. Install Firebase SDK
1. Run: `npm install firebase @firebase/firestore`
2. (For Node backend) Run: `npm install firebase-admin`

### 3. Create Firestore Helper Module
1. Create `lib/firestore.ts`.
2. Initialize Firestore client using credentials from environment variables.
3. Implement helper functions:
   - `saveMonsterToFirestore(userId, monsterId, monster)`
   - `getMonsterFromFirestore(userId, monsterId)`
   - `listMonstersFromFirestore(userId)`
   - `deleteMonsterFromFirestore(userId, monsterId)`

### 4. Refactor Monster CRUD Endpoints
1. In `app/api/monsters/route.ts` and `app/api/monsters/[id]/route.ts`:
   - Replace all imports and calls to GCS helpers with Firestore helpers.
   - Update logic to use Firestore collections: `users/{userId}/monsters/{monsterId}`.
2. Remove GCS-specific error handling and bucket logic.

### 5. Remove GCS Logic
1. Remove or archive `lib/gcs.ts`.
2. Remove GCS environment variables from `.env` and Railway.
3. Delete any GCS credentials from the project.

### 6. Update Authentication (Optional)
1. If switching to Firebase Auth:
   - Integrate Firebase Auth in frontend and backend.
   - Remove NextAuth and Google provider logic from `lib/auth.ts` and `app/api/auth/[...nextauth]/route.ts`.
   - Update login flow in `app/login/page.tsx`.
2. If keeping NextAuth, ensure it works with Firestore user IDs.

### 7. Implement On-Login Migration Logic
1. On user login, check if monsters exist in Firestore for that user.
2. If not, fetch all monsters from GCS (legacy) and save to Firestore.
3. Mark user as migrated (e.g., with a flag in Firestore).
4. Ensure migration runs only once per user.

### 8. Update Environment Variables
1. Add all required Firebase config to `.env` and Railway.
2. Remove all GCS-related variables.

### 9. Test Locally
1. Test login and monster CRUD for both new and migrated users.
2. Verify authentication, migration, and data access.

### 10. Deploy and Validate
1. Deploy to Railway with new Firebase config.
2. Test in production, verify migration and CRUD operations.

### 11. Clean Up
1. Remove GCS code and credentials after all users are migrated and validated.
2. Archive any legacy migration logic.

This plan covers migrating the BarnaBlood project from Google Cloud Storage buckets to Firebase (Firestore or Realtime Database), but instead of a bulk migration, each user's monster data will be migrated automatically the first time they log in after the update.


### Steps

#### 1. Evaluate Firebase Free Tier
   - Review [Firebase pricing](https://firebase.google.com/pricing) for Firestore and Realtime Database.
   - Confirm free tier covers expected usage (read/write ops, storage, bandwidth).

#### 2. Set Up Firebase Project
   - Create a new Firebase project in the [Firebase Console](https://console.firebase.google.com/).
   - Enable Firestore (recommended) or Realtime Database.

#### 3. Update Authentication
   - Set up Google authentication in Firebase Auth.
   - Replace NextAuth Google provider with Firebase Auth integration.
   - **Files to change:**
      - app/api/auth/[...nextauth]/route.ts
      - lib/auth.ts
      - Any frontend login logic (app/login/page.tsx)
   - **Functions to change:**
      - NextAuth handler and Google provider logic
      - User session management

#### 4. Update Data Model
   - Design Firestore collections (e.g., `users/{userId}/monsters/{monsterId}`).
   - **Files to change:**
      - types/monster.ts
      - Any model or type definitions for user/monster
   - **Functions to change:**
      - Monster type definitions
      - Data validation helpers

#### 5. Implement On-Login Migration Logic
   - On user login, check if the user's monsters exist in Firestore.
   - If not, fetch all monster JSON files for that user from the GCS bucket.
   - Save each monster to Firestore under the user's collection.
   - Mark the user as migrated (e.g., with a flag in Firestore or local storage).
   - Ensure this runs only once per user.
   - **Files to change:**
      - lib/auth.ts (login handler)
      - lib/gcs.ts (fetching from GCS)
      - lib/gcs.ts or new lib/firestore.ts (saving to Firestore)
      - app/api/auth/[...nextauth]/route.ts (migration trigger)
   - **Functions to change:**
      - User login handler
      - Monster fetch from GCS
      - Monster save to Firestore
      - Migration flag check/set

#### 6. Update Backend Code
   - Replace all GCS logic in lib/gcs.ts with Firestore SDK calls for all new and migrated users.
   - Update monster CRUD functions to use Firestore as the source of truth.
   - Remove GCS environment variables and credentials after all users have migrated.
   - **Files to change:**
      - lib/gcs.ts (remove/replace)
      - lib/firestore.ts (new or updated)
      - app/api/monsters/route.ts
      - app/api/monsters/[id]/route.ts
      - app/api/combat/save/route.ts (if it saves monsters)
   - **Functions to change:**
      - Monster CRUD (create, read, update, delete)
      - Any GCS-specific logic

#### 7. Update Environment Variables
   - Add Firebase service account credentials to Railway.
   - Add any required Firebase config (API key, project ID, etc.).
   - **Files to change:**
      - .env (local)
      - Railway environment variables
      - Remove GCS credentials

#### 8. Test Locally
   - Test login and monster CRUD operations for both new and existing users.
   - Verify authentication, migration, and data access.
   - **Files to change:**
      - Test scripts or manual test plans

#### 9. Deploy and Validate
   - Deploy to Railway with new Firebase config.
   - Test in production, verify that users' monsters are migrated on login and new monsters can be created.
   - **Files to change:**
      - Deployment config
      - Railway settings


### Further Considerations

1. **Migration Logic**
   - Migration is triggered on user login, not as a one-time bulk operation.
   - Users who never log in will not have their data migrated until they do.
   - Option: Add admin endpoint to trigger migration for specific users if needed.
   - **Files to change:**
     - app/api/admin/migrate/route.ts (if admin endpoint is added)
   - **Functions to change:**
     - Admin-triggered migration handler

2. **Security**
   - Set Firestore security rules to restrict access to authenticated users only.
   - **Files to change:**
     - Firestore rules (in Firebase Console)

3. **Cost**
   - Firestore free tier is generous, but monitor usage to avoid unexpected costs.

4. **Rollback**
   - Keep GCS bucket and code until all users have migrated and migration is fully validated.
   - **Files to change:**
     - lib/gcs.ts (remove after validation)
