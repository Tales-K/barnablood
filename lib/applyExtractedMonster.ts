import { UseFormReset } from 'react-hook-form';
import { toast } from 'sonner';
import type { Monster } from '@/types/monster';
import type { FeatureWithId } from '@/types/feature';
import type { ExtractedMonster } from '@/lib/validateExtractedMonster';
import { resolveImportedFeatures } from '@/lib/resolveImportedFeatures';

/**
 * Converts an ExtractedMonster (partial) to the full Monster shape expected by the form,
 * then merges it into the form state and resolves features.
 */
export function applyExtractedMonster(
    extracted: ExtractedMonster,
    reset: UseFormReset<Monster>,
    availableFeatures: FeatureWithId[],
    setFeatures: (features: FeatureWithId[]) => void,
): void {
    const partialMonster: Partial<Monster> = {
        Name: extracted.Name,
        Type: extracted.Type,
        AC: extracted.AC,
        HP: extracted.HP,
        Challenge: extracted.Challenge ?? '',
        Source: extracted.Source ?? '',
        Description: extracted.Description ?? '',
        InitiativeModifier: extracted.InitiativeModifier ?? 0,
        InitiativeAdvantage: extracted.InitiativeAdvantage ?? false,
        Abilities: extracted.Abilities ?? { Str: 10, Dex: 10, Con: 10, Int: 10, Wis: 10, Cha: 10 },
        Speed: extracted.Speed ?? [],
        Senses: extracted.Senses ?? [],
        Languages: extracted.Languages ?? [],
        Skills: extracted.Skills ?? [],
        Saves: extracted.Saves ?? [],
        DamageImmunities: extracted.DamageImmunities ?? [],
        DamageResistances: extracted.DamageResistances ?? [],
        DamageVulnerabilities: extracted.DamageVulnerabilities ?? [],
        ConditionImmunities: extracted.ConditionImmunities ?? [],
        SearchTags: extracted.SearchTags ?? [],
        Traits: extracted.Traits ?? [],
        Actions: extracted.Actions ?? [],
        Reactions: extracted.Reactions ?? [],
        LegendaryActions: extracted.LegendaryActions ?? [],
    };

    reset(partialMonster as Monster);

    // Reuse same feature resolution logic as "Fill from Monster" and "Fill from JSON"
    const resolved = resolveImportedFeatures(partialMonster as Monster, availableFeatures);
    setFeatures(resolved);

    const featureCount = resolved.length;
    toast.success(
        `Filled from image! ${featureCount > 0 ? `${featureCount} feature(s) imported.` : ''}`
    );
}
