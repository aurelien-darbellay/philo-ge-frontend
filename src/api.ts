import type { AdminCycle, AdminCycleSummary, AdminUser, AuthPayload, CycleInput, EventInput, Invitation, MediaImage, Podcast, PodcastPagination, PublicCycle, PublicEvent } from "./types";

const DEFAULT_API_URL = import.meta.env.DEV ? "/api" : "https://api.philo-ge.ch";
const API_URL = (import.meta.env.VITE_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "");

export function apiAssetUrl(path: string): string {
  return `${API_URL}${path}`;
}

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
      ...(options.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
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
    username: string,
    password: string,
    passwordConfirmation: string,
    rememberMe: boolean,
  ) =>
    request<AuthPayload>("/auth/accept-invitation.php", {
      method: "POST",
      body: JSON.stringify({
        token,
        username,
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

  setUserBlocked: (id: number, blocked: boolean, csrfToken: string) =>
    request<{ user: AdminUser }>(`/admin/users/block.php?id=${id}`, {
      method: "PUT",
      headers: { "X-CSRF-Token": csrfToken },
      body: JSON.stringify({ blocked }),
    }),

  setUserRole: (id: number, role: AdminUser["role"], csrfToken: string) =>
    request<{ user: AdminUser }>(`/admin/users/role.php?id=${id}`, {
      method: "PUT",
      headers: { "X-CSRF-Token": csrfToken },
      body: JSON.stringify({ role }),
    }),

  mediaImages: () => request<{ images: MediaImage[] }>("/admin/media/images.php"),

  deleteMediaImage: (filename: string, csrfToken: string) =>
    request<{ status: "ok" }>(`/admin/media/images.php?filename=${encodeURIComponent(filename)}`, {
      method: "DELETE",
      headers: { "X-CSRF-Token": csrfToken },
    }),

  podcasts: (page = 1, limit = 20) =>
    request<{ podcasts: Podcast[]; pagination: PodcastPagination }>(
      `/podcasts.php?page=${page}&limit=${limit}`,
    ),

  podcast: (id: number) => request<{ podcast: Podcast }>(`/podcasts.php?id=${id}`),

  uploadPodcastImage: (image: File, csrfToken: string) => {
    const body = new FormData();
    body.append("image", image);
    return request<{ image_path: string }>("/admin/podcasts/image.php", {
      method: "POST",
      headers: { "X-CSRF-Token": csrfToken },
      body,
    });
  },

  createPodcast: (
    title: string,
    description: string,
    imagePath: string | null,
    audio: File,
    csrfToken: string,
  ) => {
    const body = new FormData();
    body.append("title", title);
    body.append("description", description);
    body.append("image_path", imagePath ?? "");
    body.append("audio", audio);
    return request<{ podcast: Podcast }>("/admin/podcasts.php", {
      method: "POST",
      headers: { "X-CSRF-Token": csrfToken },
      body,
    });
  },

  deletePodcast: (id: number, csrfToken: string) =>
    request<{ status: "ok" }>(`/admin/podcasts.php?id=${id}`, {
      method: "DELETE",
      headers: { "X-CSRF-Token": csrfToken },
    }),

  adminEvents: (from: string, to: string) =>
    request<{ events: PublicEvent[] }>(`/admin/events.php?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),

  adminEvent: (id: number) => request<{ event: PublicEvent }>(`/admin/events.php?id=${id}`),

  adminCycles: (from: string, to: string) =>
    request<{ cycles: AdminCycle[] }>(`/admin/cycles.php?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),

  adminCycle: (id: number) => request<{ cycle: AdminCycle }>(`/admin/cycles.php?id=${id}`),

  createCycle: (cycle: CycleInput, csrfToken: string) => request<{ cycle: AdminCycle }>("/admin/cycles.php", { method: "POST", headers: { "X-CSRF-Token": csrfToken }, body: JSON.stringify(cycle) }),

  updateCycle: (id: number, cycle: CycleInput, csrfToken: string) => request<{ cycle: AdminCycle }>(`/admin/cycles.php?id=${id}`, { method: "PUT", headers: { "X-CSRF-Token": csrfToken }, body: JSON.stringify(cycle) }),

  deleteCycle: (id: number, csrfToken: string) => request<{ status: "ok" }>(`/admin/cycles.php?id=${id}`, { method: "DELETE", headers: { "X-CSRF-Token": csrfToken } }),

  setCycleStatus: (id: number, status: AdminCycle["status"], csrfToken: string) => request<{ cycle: AdminCycle }>(`/admin/cycles/status.php?id=${id}`, { method: "PUT", headers: { "X-CSRF-Token": csrfToken }, body: JSON.stringify({ status }) }),

  setCycleHighlighted: (id: number, isHighlighted: boolean, csrfToken: string) => request<{ cycle: AdminCycle }>(`/admin/cycles/highlight.php?id=${id}`, { method: "PUT", headers: { "X-CSRF-Token": csrfToken }, body: JSON.stringify({ is_highlighted: isHighlighted }) }),

  uploadCycleImage: (image: File, csrfToken: string) => {
    const body = new FormData();
    body.append("image", image);
    return request<{ image_path: string }>("/admin/cycles/image.php", { method: "POST", headers: { "X-CSRF-Token": csrfToken }, body });
  },

  createEvent: (event: EventInput, csrfToken: string) =>
    request<{ event: PublicEvent }>("/admin/events.php", {
      method: "POST",
      headers: { "X-CSRF-Token": csrfToken },
      body: JSON.stringify(event),
    }),

  updateEvent: (id: number, event: EventInput, csrfToken: string) =>
    request<{ event: PublicEvent }>(`/admin/events.php?id=${id}`, {
      method: "PUT",
      headers: { "X-CSRF-Token": csrfToken },
      body: JSON.stringify(event),
    }),

  deleteEvent: (id: number, csrfToken: string) =>
    request<{ status: "ok" }>(`/admin/events.php?id=${id}`, {
      method: "DELETE",
      headers: { "X-CSRF-Token": csrfToken },
    }),

  uploadEventImage: (image: File, csrfToken: string) => {
    const body = new FormData();
    body.append("image", image);
    return request<{ image_path: string }>("/admin/events/image.php", {
      method: "POST",
      headers: { "X-CSRF-Token": csrfToken },
      body,
    });
  },

  setEventStatus: (id: number, status: PublicEvent["status"], csrfToken: string) =>
    request<{ event: PublicEvent }>(`/admin/events/status.php?id=${id}`, {
      method: "PUT",
      headers: { "X-CSRF-Token": csrfToken },
      body: JSON.stringify({ status }),
    }),

  setEventHighlighted: (id: number, isHighlighted: boolean, csrfToken: string) =>
    request<{ event: PublicEvent }>(`/admin/events/highlight.php?id=${id}`, { method: "PUT", headers: { "X-CSRF-Token": csrfToken }, body: JSON.stringify({ is_highlighted: isHighlighted }) }),

  highlightedCycle: () => request<{ cycle: PublicCycle | null }>("/cycles/highlighted.php"),

  highlightedEvent: () => request<{ event: PublicEvent | null }>("/events/highlighted.php"),

  event: (id: number) => request<{ event: PublicEvent }>(`/events.php?id=${id}`),

  cycle: (id: number) => request<{ cycle: PublicCycle }>(`/cycles.php?id=${id}`),

  cycles: (from: string, to: string) =>
    request<{ cycles: PublicCycle[] }>(`/cycles.php?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),

  events: (from: string, to: string) =>
    request<{ events: PublicEvent[] }>(`/events.php?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
};
