import { z } from 'zod';

export const FEATURE_CATEGORIES = ['Traits', 'Actions', 'Reactions', 'LegendaryActions'] as const;
export type FeatureCategory = typeof FEATURE_CATEGORIES[number];

export const CATEGORY_LABELS: Record<FeatureCategory, string> = {
    Traits: 'Trait',
    Actions: 'Action',
    Reactions: 'Reaction',
    LegendaryActions: 'Legendary Action',
};

export const CATEGORY_COLORS: Record<FeatureCategory, string> = {
    Traits: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Actions: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Reactions: 'bg-green-500/20 text-green-400 border-green-500/30',
    LegendaryActions: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

export const featureSchema = z.object({
    Name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    Content: z.string().min(1, 'Description is required').max(5000, 'Content too long'),
    Usage: z.string().max(200, 'Usage too long').optional(),
    Category: z.enum(FEATURE_CATEGORIES),
});

export type Feature = z.infer<typeof featureSchema>;

export interface FeatureWithId extends Feature {
    id: string;
    /** true for features not yet persisted to Firestore */
    isNew?: boolean;
    /** number of monsters referencing this feature */
    monsterCount?: number;
}
