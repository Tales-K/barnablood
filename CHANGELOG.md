# Changelog

## 0.2.1

### Added
- Monsters page: tag-based accordion grouping — each tag is a collapsible group with a monster count badge
- Search bar on monsters page filters by name or tag across all groups
- Expand / Collapse all groups toggle button
- Divider between tag groups
- Monsters with no tags are grouped under “Untagged” (shown last)

---

## 0.2.0

### Added
- **Features collection** — monster features (traits, actions, reactions, legendary actions) are now stored as a dedicated Firestore collection (`users/{userId}/features/{featureId}`), shared across monsters
- **Feature library** — Monster Features page now shows, edits, and deletes features from the collection with confirmation prompts
- **Edit features** in monster form — each feature row now has an edit button that opens the feature dialog pre-filled
- **Import from feature library** — Add Monster Feature dialog now imports from the shared feature library instead of embedded monster data
- **Multi-monster conflict resolution** — editing a shared feature asks whether to update all monsters or only the current one
- **Centralized app version** — version is now sourced from `lib/version.ts`, shown in the header and linked to the changelog page
- **Changelog page** — new `/changelog` route to view version history
- **Login-time migration** — existing embedded features are automatically extracted into the features collection on first login after the upgrade

### Changed
- `DynamicMonsterForm` no longer manages features via React Hook Form; parent pages handle feature state externally
- Feature type dropdown in the "Add Monster Feature" dialog now uses a native `<select>` element (fixes z-index conflict with Radix Dialog)
- Feature description textarea now has a transparent background matching other input fields
- Combat session now persists as a single `active` document per user (event-driven save, no polling)

---

## 0.1.2 - 2025-12-26

### Added
- TagInput component for reusable tag/condition input (used in monster form and combat conditions)
- Multi-tag support for monsters (SearchTags field now uses TagInput)
- Monster search now matches all entered tags for robust filtering
- Error highlighting and auto-expansion for form sections with validation errors
- CollapsibleCard and FieldWithError components for modular, maintainable forms
- Dynamic add/remove logic for all array fields (traits, actions, etc.) centralized
- HP in combat can now go below 0 or above max HP (no clamping)
- Edit monster link in combat page now uses full UUID (fixes navigation bug)
- Added monster download and upload buttons

### Changed
- All dynamic fields in monster form use FieldWithError for consistent error display
- Monster form refactored for maintainability and DRYness

### Fixed
- Error highlighting for dynamically added fields (e.g., Saving Throws, Traits, Actions)
- Edit monster link bug (UUID cut at first dash)

---

## 0.1.1 - Project published live on Railway

## 0.1.0 - Initial project setup
