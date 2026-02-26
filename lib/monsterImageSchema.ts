/**
 * JSON schema that OpenAI must return when extracting a monster from an image.
 * Only Name, Type, AC.Value and HP.Value are required; everything else is optional.
 */
export const MONSTER_IMAGE_EXAMPLE_JSON = {
    Name: "Ancient Red Dragon",
    Type: "Dragon",
    Challenge: "24",
    Source: "Monster Manual",
    Description: "A colossal dragon with crimson scales and burning eyes.",
    AC: { Value: 22, Notes: "natural armor" },
    HP: { Value: 546, Notes: "28d20+252" },
    InitiativeModifier: 0,
    InitiativeAdvantage: false,
    Abilities: { Str: 30, Dex: 10, Con: 29, Int: 18, Wis: 15, Cha: 23 },
    Speed: ["40 ft.", "climb 40 ft.", "fly 80 ft."],
    Senses: ["blindsight 60 ft.", "darkvision 120 ft.", "passive Perception 26"],
    Languages: ["Common", "Draconic"],
    Skills: [
        { Name: "Perception", Modifier: 16 },
        { Name: "Stealth", Modifier: 7 }
    ],
    Saves: [
        { Name: "Dex", Modifier: 7 },
        { Name: "Con", Modifier: 16 }
    ],
    DamageImmunities: ["fire"],
    DamageResistances: [],
    DamageVulnerabilities: [],
    ConditionImmunities: [],
    SearchTags: ["dragon", "legendary"],
    Traits: [
        {
            Name: "Legendary Resistance (3/Day)",
            Content: "If the dragon fails a saving throw, it can choose to succeed instead.",
            Usage: "3/Day"
        }
    ],
    Actions: [
        {
            Name: "Multiattack",
            Content: "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws."
        },
        {
            Name: "Bite",
            Content: "Melee Weapon Attack: +17 to hit, reach 15 ft., one target. Hit: 21 (2d10 + 10) piercing damage plus 14 (4d6) fire damage."
        }
    ],
    Reactions: [],
    LegendaryActions: [
        {
            Name: "Detect",
            Content: "The dragon makes a Wisdom (Perception) check."
        }
    ]
};

export const MONSTER_IMAGE_SYSTEM_PROMPT = `You are a D&D 5e monster stat block extractor.
Given an image of a monster stat block (from a book, screen, or handwritten note), extract all visible data and return ONLY valid JSON matching this exact structure:

${JSON.stringify(MONSTER_IMAGE_EXAMPLE_JSON, null, 2)}

Rules:
- Return ONLY valid JSON, no markdown, no extra text
- Required fields: Name (string), Type (string), AC.Value (integer ≥ 1), HP.Value (integer ≥ 1)
- All other fields are optional; omit fields you cannot read from the image
- Challenge can be a number or fraction string like "1/2", "1/4"
- Arrays default to empty [] if not present
- Traits/Actions/Reactions/LegendaryActions each have Name (string) and Content (string), Usage is optional
- Skills and Saves each have Name (string) and Modifier (integer)
- Abilities: Str, Dex, Con, Int, Wis, Cha must all be present if you include the Abilities object (integers 1-100)
- If you cannot extract the minimum required fields, return: {"error": "Could not extract monster data from image"}`;
