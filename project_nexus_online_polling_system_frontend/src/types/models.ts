export type UserRole = "user" | "admin" | "system_admin";

export interface User {
  email: string;
  role: UserRole;
}

export type PollStatus = "draft" | "active" | "closed";

export interface PollOption {
  id: string;
  text: string;
  votes?: number;
}

export interface Poll {
  id: string;
  title: string;
  description?: string;
  status: PollStatus;
  options: PollOption[];
  allow_multiple_answers?: boolean;
  anonymous_voting?: boolean;
  created_at?: string;
}

export interface AuditLog {
  id?: string;
  timestamp: string;
  user?: { name?: string; email?: string } | null;
  action: string;
  resource: string;
  result: "Success" | "Failed" | string;
  ip?: string;
}

export interface Metrics {
  total_polls?: number;
  active_polls?: number;
  total_votes?: number;
  active_users?: number;
}
