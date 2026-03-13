import { supabase } from './supabase';
import { buildCacheKey } from './cache-utils';

export type CacheType = 'project-extraction' | 'clarifying-questions' | 'estimate-explanation';

export async function getCachedResponse(
  input: string,
  cacheType: CacheType
): Promise<unknown | null> {
  const hash = buildCacheKey(input, cacheType);

  const { data, error } = await supabase
    .from('ai_response_cache')
    .select('response')
    .eq('cache_key_hash', hash)
    .eq('cache_type', cacheType)
    .single();

  if (error || !data) return null;
  return data.response as unknown;
}

export async function setCachedResponse(
  input: string,
  cacheType: CacheType,
  response: unknown,
  _modelUsed?: string
): Promise<void> {
  const hash = buildCacheKey(input, cacheType);

  const { error } = await supabase.from('ai_response_cache').upsert(
    {
      cache_key_hash: hash,
      cache_type: cacheType,
      response: response as object,
      created_at: new Date().toISOString(),
    },
    { onConflict: ['cache_key_hash', 'cache_type'] }
  );

  if (error) {
    console.error('[ai-cache] Failed to save response:', error.message, {
      code: error.code,
      details: error.details,
    });
    throw error;
  }
}