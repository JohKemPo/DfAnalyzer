/** Thin fetch wrapper for the DfAnalyzer REST API. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE = '';

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    signal,
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new ApiError(response.status, (await safeText(response)) || response.statusText);
  }
  return (await response.json()) as T;
}

async function safeText(response: Response): Promise<string> {
  try {
    return (await response.text()).trim();
  } catch {
    return '';
  }
}

/** Envia um corpo JSON e devolve a resposta desserializada. */
export async function apiSend<T>(
  method: 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: body === undefined ? { Accept: 'application/json' } : {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new ApiError(response.status, await errorMessage(response));
  }
  // 200 sem corpo (DELETE) não tem JSON para desserializar.
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** Prefere a `message` do envelope de erro v2; cai no texto cru se não houver. */
async function errorMessage(response: Response): Promise<string> {
  const text = await safeText(response);
  if (!text) return response.statusText;
  try {
    const parsed = JSON.parse(text) as { message?: string };
    return parsed.message ?? text;
  } catch {
    return text;
  }
}
