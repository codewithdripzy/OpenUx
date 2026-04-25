import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText, streamText, generateObject } from 'ai';
import { z } from 'zod';

export class AIService {
    static getModel(provider: string, modelId: string) {
        switch (provider.toLowerCase()) {
            case 'google':
                return google(modelId);
            case 'openai':
                return openai(modelId);
            case 'anthropic':
                return anthropic(modelId);
            default:
                return google(modelId);
        }
    }

    static async generate(prompt: string, provider: string = 'google', modelId: string = 'gemini-2.5-flash') {
        const model = this.getModel(provider, modelId);
        
        const { text } = await generateText({
            model,
            prompt,
        });

        return text;
    }

    static async generateStructured<T>(prompt: string, schema: z.ZodType<T>, provider: string = 'google', modelId: string = 'gemini-1.5-pro') {
        const model = this.getModel(provider, modelId);

        const { object } = await generateObject({
            model,
            prompt,
            schema,
        });

        return object;
    }

    static async stream(prompt: string, provider: string = 'google', modelId: string = 'gemini-1.5-pro') {
        const model = this.getModel(provider, modelId);

        return streamText({
            model,
            prompt,
        });
    }
}

export default AIService;