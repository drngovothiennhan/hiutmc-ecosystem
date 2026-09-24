const DEFAULT_MODEL = '@cf/zai-org/glm-4.7-flash';
const ALLOWED_MODELS = new Set([DEFAULT_MODEL]);

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function extractText(payload, depth = 0) {
  if (depth > 6 || payload == null) return '';
  if (typeof payload === 'string') return payload.trim();

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const text = extractText(item, depth + 1);
      if (text) return text;
    }
    return '';
  }

  if (typeof payload !== 'object') return '';

  for (const key of ['response', 'content', 'text', 'output_text', 'result', 'output']) {
    if (key in payload) {
      const text = extractText(payload[key], depth + 1);
      if (text) return text;
    }
  }

  if (Array.isArray(payload.choices)) {
    for (const choice of payload.choices) {
      const text = extractText(choice?.message?.content ?? choice?.text, depth + 1);
      if (text) return text;
    }
  }

  return '';
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/health') {
      return json({ ok: true, provider: 'cloudflare-workers-ai' });
    }

    if (request.method !== 'POST' || url.pathname !== '/run') {
      return json({ ok: false, error: 'NOT_FOUND' }, 404);
    }

    if (!env.AI_PROXY_TOKEN || request.headers.get('x-ai-proxy-token') !== env.AI_PROXY_TOKEN) {
      return json({ ok: false, error: 'UNAUTHORIZED' }, 401);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: 'INVALID_JSON' }, 400);
    }

    const model =
      typeof body.model === 'string' && ALLOWED_MODELS.has(body.model)
        ? body.model
        : DEFAULT_MODEL;
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const maxTokens = Number.isInteger(body.max_tokens)
      ? Math.min(4096, Math.max(64, body.max_tokens))
      : 2048;

    if (!prompt || prompt.length > 100000) {
      return json({ ok: false, error: 'PROMPT_INVALID' }, 400);
    }

    try {
      const result = await env.AI.run(model, {
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
      });

      const response = extractText(result);
      if (!response) return json({ ok: false, error: 'EMPTY_RESPONSE' }, 502);

      return json({ ok: true, model, response });
    } catch (error) {
      console.error('Workers AI proxy failed', error);
      return json({ ok: false, error: 'WORKERS_AI_FAILED' }, 502);
    }
  },
};
