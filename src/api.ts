import type { AdminUser, AuthPayload, Invitation } from "./types";

const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

type ApiErrorBody = { error?: { code?: string; message?: string } };

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const body = (await response.json()) as T & ApiErrorBody;

  if (!response.ok) {
    throw new ApiError(
      body.error?.message ?? "The request could not be completed.",
      response.status,
      body.error?.code ?? "request_failed",
    );
  }

  return body;
}

export const api = {
  login: (email: string, password: string, rememberMe: boolean) =>
    request<AuthPayload>("/auth/login.php", {
      method: "POST",
      body: JSON.stringify({ email, password, remember_me: rememberMe }),
    }),

  me: () => request<AuthPayload>("/auth/me.php"),

  logout: (csrfToken: string) =>
    request<{ status: "ok" }>("/auth/logout.php", {
      method: "POST",
      headers: { "X-CSRF-Token": csrfToken },
    }),

  inspectInvitation: (token: string) =>
    request<{ invitation: Invitation }>(`/auth/invitation.php?token=${encodeURIComponent(token)}`),

  acceptInvitation: (
    token: string,
    password: string,
    passwordConfirmation: string,
    rememberMe: boolean,
  ) =>
    request<AuthPayload>("/auth/accept-invitation.php", {
      method: "POST",
      body: JSON.stringify({
        token,
        password,
        password_confirmation: passwordConfirmation,
        remember_me: rememberMe,
      }),
    }),

  createInvitation: (email: string, csrfToken: string) =>
    request<{ invitation: Invitation }>("/admin/invitations.php", {
      method: "POST",
      headers: { "X-CSRF-Token": csrfToken },
      body: JSON.stringify({ email }),
    }),

  users: () => request<{ users: AdminUser[] }>("/admin/users.php"),
};
