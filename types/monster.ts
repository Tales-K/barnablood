import { z } from 'zod';

// Monster action/trait/reaction schema
export const actionSchema = z.object({
    Name: z.string(),
    Content: z.string(),
    Usage: z.string().optional(),
});

// Skill/Save schema
export const skillOrSaveSchema = z.object({
    Name: z.string(),
    Modifier: z.number(),
});

// Monster abilities schema
export const abilitiesSchema = z.object({
    Str: z.number().min(1).max(50),
    Dex: z.number().min(1).max(50),
    Con: z.number().min(1).max(50),
    Int: z.number().min(1).max(50),
    Wis: z.number().min(1).max(50),
    Cha: z.number().min(1).max(50),
});

// AC and HP schemas
export const acSchema = z.object({
    Value: z.number().min(1),
    Notes: z.string().optional(),
});

export const hpSchema = z.object({
    Value: z.number().min(1),
    Notes: z.string().optional(),
});

// Full monster schema matching Improved Initiative format
export const monsterSchema = z.object({
    Abilities: abilitiesSchema,
    AC: acSchema,
    Actions: z.array(actionSchema),
    Challenge: z.string(),
    ConditionImmunities: z.array(z.string()),
    DamageImmunities: z.array(z.string()),
    DamageResistances: z.array(z.string()),
    DamageVulnerabilities: z.array(z.string()),
    Description: z.string().optional(),
    HP: hpSchema,
    ImageURL: z.string().optional(), // Can be URL or base64
    InitiativeAdvantage: z.boolean().optional(),
    InitiativeModifier: z.number().optional(),
    Languages: z.array(z.string()),
    LegendaryActions: z.array(actionSchema),
    Player: z.string().optional(),
    Reactions: z.array(actionSchema),
    Saves: z.array(skillOrSaveSchema),
    Senses: z.array(z.string()),
    Skills: z.array(skillOrSaveSchema),
    Source: z.string(),
    Speed: z.array(z.string()),
    Traits: z.array(actionSchema),
    Type: z.string(),
    Version: z.string().optional(),
    Name: z.string().optional(), // Added for monster name
});

// TypeScript types inferred from schemas
export type Monster = z.infer<typeof monsterSchema>;
export type Action = z.infer<typeof actionSchema>;
export type SkillOrSave = z.infer<typeof skillOrSaveSchema>;
export type Abilities = z.infer<typeof abilitiesSchema>;

// Combat-specific types
export interface CombatMonster {
    id: string;
    monster: Monster;
    currentHP: number;
    maxHP: number;
    conditions: string[];
    notes?: string;
}

// Helper to check if image is base64
export function isBase64Image(imageURL?: string): boolean {
    return imageURL?.startsWith('data:image/') ?? false;
}
