// const API_URL = import.meta.env.VITE_API_URL;
export const API_URL = "/api";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function toApiError(res: Response): Promise<ApiError> {
  const body = await res.json().catch(() => null);
  // Nest 에러의 message는 문자열이거나, ValidationPipe면 문자열 배열
  const msg = Array.isArray(body?.message)
    ? body.message.join(", ")
    : body?.message;
  return new ApiError(res.status, msg ?? res.statusText);
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) throw await toApiError(res);
  if (res.status === 204) return undefined as T; // DELETE, 복원 등
  return res.json() as Promise<T>;
}
