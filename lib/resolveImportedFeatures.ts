import type { Monster } from '@/types/monster';
import type { FeatureWithId, FeatureCategory } from '@/types/feature';

const FEATURE_CATEGORY_KEYS: Array<{ field: keyof Monster; category: FeatureCategory }> = [
    { field: 'Traits', category: 'Traits' },
    { field: 'Actions', category: 'Actions' },
    { field: 'Reactions', category: 'Reactions' },
    { field: 'LegendaryActions', category: 'LegendaryActions' },
];

/**
 * Resolves features from an imported monster against the current feature library.
 * Resolution priority:
 *  1. Match by FeatureId (from monster.FeatureIds) + same Category + same Name → reuse library entry
 *  2. Match by Name + Category in the library → reuse library entry
 *  3. No match → create a local placeholder (isNew: true) to be persisted on save
 */
export function resolveImportedFeatures(
    monster: Monster,
    availableFeatures: FeatureWithId[],
): FeatureWithId[] {
    const remainingIds = new Set(monster.FeatureIds ?? []);
    const byId = new Map(availableFeatures.map(f => [f.id, f]));
    const resolved: FeatureWithId[] = [];

    for (const { field, category } of FEATURE_CATEGORY_KEYS) {
        const items = (monster[field] as Array<{ Name: string; Content: string; Usage?: string }>) ?? [];
        for (const item of items) {
            // 1. Try FeatureIds: a library feature whose id, category and name all match
            let matched: FeatureWithId | undefined;
            for (const id of remainingIds) {
                const candidate = byId.get(id);
                if (candidate && candidate.Category === category && candidate.Name === item.Name) {
                    matched = candidate;
                    remainingIds.delete(id);
                    break;
                }
            }

            if (!matched) {
                // 2. Fall back to Name + Category match
                matched = availableFeatures.find(f => f.Category === category && f.Name === item.Name);
            }

            if (matched) {
                resolved.push(matched);
            } else {
                // 3. New local placeholder — will be persisted on submit
                resolved.push({
                    Name: item.Name,
                    Content: item.Content,
                    ...(item.Usage ? { Usage: item.Usage } : {}),
                    Category: category,
                    id: crypto.randomUUID(),
                    isNew: true,
                });
            }
        }
    }

    return resolved;
}
