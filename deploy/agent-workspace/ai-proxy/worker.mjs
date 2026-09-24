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
