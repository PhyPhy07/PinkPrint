import { generateObject, generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';
import { z } from 'zod';
import { getCachedResponse, setCachedResponse, type CacheType } from './ai-cache';

// Use Groq (free tier) if GROQ_API_KEY is set; otherwise Google
const aiModel = process.env.GROQ_API_KEY
  ? groq('llama-3.3-70b-versatile')
  : google('gemini-2.5-flash-lite');

export async function cachedGenerateObject<T extends z.ZodType>(
  input: string,
  cacheType: CacheType,
  schema: T,
  systemPrompt: string,
  userPromptTemplate: (input: string) => string
): Promise<z.infer<T>> {
  const cached = await getCachedResponse(input, cacheType);
  if (cached) {
    return cached as z.infer<T>;
  }

  const { object } = await generateObject({
    model: aiModel,
    schema,
    system: systemPrompt,
    prompt: userPromptTemplate(input),
  });

  await setCachedResponse(input, cacheType, object);
  return object as z.infer<T>;
}

export async function cachedGenerateText(
  input: string,
  cacheType: CacheType,
  systemPrompt: string,
  userPromptTemplate: (input: string) => string
): Promise<string> {
  const cached = await getCachedResponse(input, cacheType);
  if (cached && typeof cached === 'string') {
    return cached;
  }

  const { text } = await generateText({
    model: aiModel,
    system: systemPrompt,
    prompt: userPromptTemplate(input),
  });

  await setCachedResponse(input, cacheType, text);
  return text;
}