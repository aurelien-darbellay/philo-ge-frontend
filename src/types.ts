export type Role = "admin" | "guest";

export type User = {
  id: number;
  email: string;
  role: Role;
};

export type AdminUser = User & {
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
