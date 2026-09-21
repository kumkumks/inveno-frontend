import type { AxiosError } from 'axios';

export function formatApiError(error: unknown): string {
  const ax = error as AxiosError<Record<string, unknown>>;
  const data = ax.response?.data;
  if (!data) return ax.message || 'Request failed';

  if (typeof data.detail === 'string') return data.detail;

  if (Array.isArray(data.non_field_errors)) {
    return (data.non_field_errors as string[]).join(' ');
  }

  const parts: string[] = [];
  for (const [field, msgs] of Object.entries(data)) {
    if (Array.isArray(msgs)) parts.push(`${field}: ${(msgs as string[]).join(', ')}`);
  }
  return parts.join('; ') || 'Request failed';
}

export function retryAfterSeconds(error: unknown): number | null {
  const ax = error as AxiosError;
  const header = ax.response?.headers?.['retry-after'];
  if (!header) return null;
  const n = parseInt(String(header), 10);
  return Number.isFinite(n) ? n : null;
}
