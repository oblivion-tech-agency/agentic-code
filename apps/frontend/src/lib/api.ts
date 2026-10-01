import type { ApiErrorResponse, HealthStatus } from '../types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type ApiFetchOptions = RequestInit & {
  token?: string;
};

export async function apiFetch<T>(
  path: string,
  { token, headers, ...init }: ApiFetchOptions = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as T | ApiErrorResponse) : null;

  if (!response.ok) {
    const errorResponse = data as ApiErrorResponse | null;
    const message = Array.isArray(errorResponse?.message)
      ? errorResponse.message.join(', ')
      : errorResponse?.message || response.statusText;

    throw new Error(message);
  }

  return data as T;
}

export async function fetchHealth(): Promise<HealthStatus> {
  return apiFetch<HealthStatus>('/health');
}
