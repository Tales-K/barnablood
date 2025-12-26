# Changelog

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
