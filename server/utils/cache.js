import { kv } from '@vercel/kv';

export async function getCachedTemplate(domain) {
  try {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return null;
    }
    const cached = await kv.get(`landing:${domain}`);
    return cached;
  } catch (error) {
    console.warn(`KV Cache read failed for domain ${domain}:`, error);
    return null;
  }
}

export async function setCachedTemplate(domain, html, ttlInSeconds = 86400) {
  try {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return;
    }
    await kv.set(`landing:${domain}`, html, { ex: ttlInSeconds });
  } catch (error) {
    console.warn(`KV Cache write failed for domain ${domain}:`, error);
  }
}
