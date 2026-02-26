import { z } from 'zod';

// Partial monster schema for OpenAI extraction — only Name, Type, AC.Value, HP.Value required
const extractedActionSchema = z.object({
    Name: z.string().min(1).max(100),
    Content: z.string().min(1).max(5000),
    Usage: z.string().max(200).optional(),
});

const extractedSkillOrSaveSchema = z.object({
    Name: z.string().min(1).max(50),
    Modifier: z.number().int().min(-20).max(50),
});

const extractedAbilitiesSchema = z.object({
    Str: z.number().int().min(1).max(100),
    Dex: z.number().int().min(1).max(100),
    Con: z.number().int().min(1).max(100),
    Int: z.number().int().min(1).max(100),
    Wis: z.number().int().min(1).max(100),
    Cha: z.number().int().min(1).max(100),
});

export const extractedMonsterSchema = z.object({
    // Required
    Name: z.string().min(1, 'Name is required').max(200),
    Type: z.string().min(1, 'Type is required').max(100),
    AC: z.object({
        Value: z.number().int().min(1, 'AC Value is required').max(100),
        Notes: z.string().max(500).optional(),
    }),
    HP: z.object({
        Value: z.number().int().min(1, 'HP Value is required').max(100000),
        Notes: z.string().max(500).optional(),
    }),

    // Optional scalars
    Challenge: z.string().max(20).optional(),
    Source: z.string().max(200).optional(),
    Description: z.string().max(10000).optional(),
    InitiativeModifier: z.number().int().min(-20).max(50).optional(),
    InitiativeAdvantage: z.boolean().optional(),

    // Optional objects
    Abilities: extractedAbilitiesSchema.optional(),

    // Optional arrays
    Speed: z.array(z.string().max(100)).max(20).optional(),
    Senses: z.array(z.string().max(200)).max(30).optional(),
    Languages: z.array(z.string().max(100)).max(50).optional(),
    Skills: z.array(extractedSkillOrSaveSchema).max(30).optional(),
    Saves: z.array(extractedSkillOrSaveSchema).max(10).optional(),
    DamageImmunities: z.array(z.string().max(100)).max(30).optional(),
    DamageResistances: z.array(z.string().max(100)).max(30).optional(),
    DamageVulnerabilities: z.array(z.string().max(100)).max(30).optional(),
    ConditionImmunities: z.array(z.string().max(50)).max(30).optional(),
    SearchTags: z.array(z.string().max(50)).max(20).optional(),

    // Feature arrays
    Traits: z.array(extractedActionSchema).max(50).optional(),
    Actions: z.array(extractedActionSchema).max(50).optional(),
    Reactions: z.array(extractedActionSchema).max(20).optional(),
    LegendaryActions: z.array(extractedActionSchema).max(20).optional(),
});

export type ExtractedMonster = z.infer<typeof extractedMonsterSchema>;

export interface MonsterExtractionResult {
    success: true;
    data: ExtractedMonster;
}

export interface MonsterExtractionError {
    success: false;
    error: string;
    details?: z.ZodIssue[];
}

export type MonsterExtractionOutcome = MonsterExtractionResult | MonsterExtractionError;

/**
 * Parses and validates the raw JSON string returned by OpenAI.
 */
export function validateExtractedMonster(rawJson: string): MonsterExtractionOutcome {
    let parsed: unknown;

    // Strip potential markdown code fences
    const cleaned = rawJson.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

    try {
        parsed = JSON.parse(cleaned);
    } catch {
        return { success: false, error: 'OpenAI returned invalid JSON. Please try again.' };
    }

    // Check for explicit OpenAI error message
    if (
        parsed !== null &&
        typeof parsed === 'object' &&
        'error' in (parsed as Record<string, unknown>)
    ) {
        return {
            success: false,
            error: (parsed as { error: string }).error ?? 'Could not extract monster data from image.',
        };
    }

    const result = extractedMonsterSchema.safeParse(parsed);

    if (!result.success) {
        return {
            success: false,
            error: 'Extracted data did not pass validation.',
            details: result.error.issues,
        };
    }

    return { success: true, data: result.data };
}
