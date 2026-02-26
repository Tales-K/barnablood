import OpenAI from 'openai';
import { MONSTER_IMAGE_SYSTEM_PROMPT } from './monsterImageSchema';

let _client: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
    if (!_client) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) throw new Error('OPENAI_API_KEY environment variable is not set');
        _client = new OpenAI({ apiKey });
    }
    return _client;
}

/**
 * Sends a base64-encoded image to OpenAI and returns the raw JSON string
 * extracted from the monster stat block.
 */
export async function extractMonsterFromImage(base64Image: string, mimeType: string): Promise<string> {
    const client = getOpenAIClient();

    const response = await client.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 4096,
        messages: [
            {
                role: 'system',
                content: MONSTER_IMAGE_SYSTEM_PROMPT,
            },
            {
                role: 'user',
                content: [
                    {
                        type: 'image_url',
                        image_url: {
                            url: `data:${mimeType};base64,${base64Image}`,
                            detail: 'high',
                        },
                    },
                    {
                        type: 'text',
                        text: 'Extract the monster stat block from this image and return only JSON.',
                    },
                ],
            },
        ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    return content.trim();
}
