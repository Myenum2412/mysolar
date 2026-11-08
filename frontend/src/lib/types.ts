export type UserRole = "admin" | "user";

export type User = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  created_by_id: string | null;
  created_at: string;
  member_count: number;
  membership_role: "owner" | "admin" | "member" | null;
};

export type Member = {
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "owner" | "admin" | "member";
  joined_at: string;
};
