## Plan: Migrate Project and Data to Firebase

This plan covers migrating the BarnaBlood project from Google Cloud Storage buckets to Firebase (Firestore or Realtime Database), including all saved monster data.

### Steps

1. **Evaluate Firebase Free Tier**
   - Review [Firebase pricing](https://firebase.google.com/pricing) for Firestore and Realtime Database.
   - Confirm free tier covers expected usage (read/write ops, storage, bandwidth).

2. **Set Up Firebase Project**
   - Create a new Firebase project in the [Firebase Console](https://console.firebase.google.com/).
   - Enable Firestore (recommended) or Realtime Database.

3. **Update Authentication**
   - Set up Google authentication in Firebase Auth.
   - Replace NextAuth Google provider with Firebase Auth integration.

4. **Migrate Data Model**
   - Design Firestore collections (e.g., `users/{userId}/monsters/{monsterId}`).
   - Write a migration script to read all JSON files from the GCS bucket and write them to Firestore.

5. **Update Backend Code**
   - Replace all GCS logic in `lib/gcs.ts` with Firestore SDK calls.
   - Update monster CRUD functions to use Firestore.
   - Remove GCS environment variables and credentials.

6. **Update Environment Variables**
   - Add Firebase service account credentials to Railway.
   - Add any required Firebase config (API key, project ID, etc.).

7. **Test Locally**
   - Test all monster CRUD operations with Firestore.
   - Verify authentication and data access.

8. **Deploy and Validate**
   - Deploy to Railway with new Firebase config.
   - Test in production, verify all data is accessible and new monsters can be created.

### Further Considerations

1. **Data Migration**
   - Will require a one-time script to copy all monsters from GCS to Firestore.
   - Option: Use Node.js script with both GCS and Firestore SDKs.

2. **Security**
   - Set Firestore security rules to restrict access to authenticated users only.

3. **Cost**
   - Firestore free tier is generous, but monitor usage to avoid unexpected costs.

4. **Rollback**
   - Keep GCS bucket and code until migration is fully validated.

5. **Optional**
   - Consider using Firebase Storage for images if needed in the future.