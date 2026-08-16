export type Role = "admin" | "guest";

export type User = {
  id: number;
  username: string;
  email: string;
  role: Role;
};

export type AdminUser = User & {
  blocked: boolean;
  created_at: string;
};

export type AuthPayload = {
  user: User;
  csrf_token: string;
};

export type Invitation = {
  email: string;
  expires_at: string;
  url?: string;
};

export type MediaImage = {
  filename: string;
  path: string;
  size: number;
  modified_at: string;
};

export type ContentStatus = "draft" | "published" | "cancelled";

export type EventSpeaker = {
  id: number;
  name: string;
  role_label: string | null;
  affiliation: string | null;
  biography: string | null;
  image_path: string | null;
  display_order: number;
};

export type PublicEvent = {
  id: number;
  cycle: { id: number; title: string; slug: string; status: ContentStatus } | null;
  title: string;
  slug: string;
  summary: string | null;
  description: string;
  status: ContentStatus;
  is_highlighted: boolean;
  starts_at: string;
  ends_at: string | null;
  timezone: string;
  venue: { name: string | null; address: string | null; online_url: string | null };
  image_path: string | null;
  speakers: EventSpeaker[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EventSpeakerInput = {
  name: string;
  role_label: string | null;
  affiliation: string | null;
  biography: string | null;
  image_path: string | null;
  display_order: number;
};

export type EventInput = {
  cycle_id: number | null;
  title: string;
  summary: string | null;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  timezone: string;
  venue_name: string | null;
  venue_address: string | null;
  online_url: string | null;
  image_path: string | null;
  speakers: EventSpeakerInput[];
};

export type AdminCycleSummary = {
  id: number;
  title: string;
  status: ContentStatus;
};

export type AdminCycle = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  status: ContentStatus;
  is_highlighted: boolean;
  starts_on: string | null;
  ends_on: string | null;
  image_path: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  events: null;
};

export type CycleInput = {
  title: string;
  description: string | null;
  starts_on: string | null;
  ends_on: string | null;
  image_path: string | null;
};

export type PublicCycle = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  status: ContentStatus;
  is_highlighted: boolean;
  starts_on: string | null;
  ends_on: string | null;
  image_path: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  events: PublicEvent[];
};
