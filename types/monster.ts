import { z } from 'zod';

// Monster action/trait/reaction schema
export const actionSchema = z.object({
    Name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    Content: z.string().min(1, 'Content is required').max(5000, 'Content too long'),
    Usage: z.string().max(200, 'Usage too long').optional(),
});

// Skill/Save schema
export const skillOrSaveSchema = z.object({
    Name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
    Modifier: z.number().int().min(-20, 'Modifier too low').max(50, 'Modifier too high'),
});

// Monster abilities schema - allows powerful monsters but prevents abuse
export const abilitiesSchema = z.object({
    Str: z.number().int().min(1, 'Strength must be at least 1').max(100, 'Strength too high'),
    Dex: z.number().int().min(1, 'Dexterity must be at least 1').max(100, 'Dexterity too high'),
    Con: z.number().int().min(1, 'Constitution must be at least 1').max(100, 'Constitution too high'),
    Int: z.number().int().min(1, 'Intelligence must be at least 1').max(100, 'Intelligence too high'),
    Wis: z.number().int().min(1, 'Wisdom must be at least 1').max(100, 'Wisdom too high'),
    Cha: z.number().int().min(1, 'Charisma must be at least 1').max(100, 'Charisma too high'),
});

// AC and HP schemas - generous limits for epic monsters
export const acSchema = z.object({
    Value: z.number().int().min(1, 'AC must be at least 1').max(100, 'AC too high'),
    Notes: z.string().max(500, 'AC notes too long').optional(),
});

export const hpSchema = z.object({
    Value: z.number().int().min(1, 'HP must be at least 1').max(100000, 'HP too high'),
    Notes: z.string().max(500, 'HP notes too long').optional(),
});

// Full monster schema matching Improved Initiative format
export const monsterSchema = z.object({
    Abilities: abilitiesSchema,
    AC: acSchema,
    Actions: z.array(actionSchema).max(50, 'Too many actions'),
    Challenge: z.string().max(20, 'Challenge rating too long'),
    ConditionImmunities: z.array(z.string().max(50, 'Condition name too long')).max(30, 'Too many condition immunities'),
    DamageImmunities: z.array(z.string().max(100, 'Damage immunity too long')).max(30, 'Too many damage immunities'),
    DamageResistances: z.array(z.string().max(100, 'Damage resistance too long')).max(30, 'Too many damage resistances'),
    DamageVulnerabilities: z.array(z.string().max(100, 'Damage vulnerability too long')).max(30, 'Too many damage vulnerabilities'),
    Description: z.string().max(10000, 'Description too long').optional(),
    HP: hpSchema,
    ImageURL: z.string().max(10000000, 'Image too large').optional(), // ~10MB for base64 images
    InitiativeAdvantage: z.boolean().optional(),
    InitiativeModifier: z.number().int().min(-20, 'Initiative modifier too low').max(50, 'Initiative modifier too high').optional(),
    Languages: z.array(z.string().max(100, 'Language name too long')).max(50, 'Too many languages'),
    LegendaryActions: z.array(actionSchema).max(20, 'Too many legendary actions'),
    Player: z.string().max(200, 'Player name too long').optional(),
    Reactions: z.array(actionSchema).max(20, 'Too many reactions'),
    Saves: z.array(skillOrSaveSchema).max(10, 'Too many saving throws'),
    Senses: z.array(z.string().max(200, 'Sense description too long')).max(30, 'Too many senses'),
    Skills: z.array(skillOrSaveSchema).max(30, 'Too many skills'),
    Source: z.string().max(200, 'Source too long'),
    Speed: z.array(z.string().max(100, 'Speed description too long')).max(20, 'Too many speed types'),
    Traits: z.array(actionSchema).max(50, 'Too many traits'),
    Type: z.string().max(100, 'Type too long'),
    Version: z.string().max(20, 'Version too long').optional(),
    Name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
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
