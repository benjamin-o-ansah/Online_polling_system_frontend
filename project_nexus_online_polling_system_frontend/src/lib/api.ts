const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://project-nexus-online-polling-system.onrender.com/api";

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, skipAuth = false } = options;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (!skipAuth) {
    const token = localStorage.getItem("access_token");
    if (token) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !skipAuth) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      return request<T>(endpoint, options);
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || error.msg || error.detail || res.statusText);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    request<{ access_token: string; refresh_token: string; user?: { id: string; email: string; role: string } }>("/auth/login", {
      method: "POST",
      body: { email, password },
      skipAuth: true,
    }),
  register: (data: { email: string; password: string; role: string }) =>
    request<{
      message: string;
      user?: { id: string; email: string; role: string; is_active: boolean; created_at: string };
    }>("/auth/register", {
      method: "POST",
      body: data,
      skipAuth: true,
    }),
  logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),
  me: () => request<{ user: User }>("/auth/me").then((res) => res.user),
};

// Polls
export const pollsApi = {
  list: (params?: { status?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    const qs = query.toString();
    return request<{ polls: ApiPoll[] }>(`/polls/${qs ? `?${qs}` : ""}`).then((res) =>
      (res.polls || (res as unknown as ApiPoll[])).map(normalizePoll)
    );
  },
  get: (id: string) =>
    request<{ poll: ApiPoll }>(`/polls/${id}`).then((res) =>
      normalizePoll(res.poll || (res as unknown as ApiPoll))
    ),
  create: (data: CreatePollData) =>
    request<{ poll: ApiPoll }>("/polls/", {
      method: "POST",
      body: {
        title: data.title,
        description: data.description,
        options: data.options.map((text) => ({ text })),
      },
    }).then((res) => normalizePoll(res.poll || (res as unknown as ApiPoll))),
  update: (id: string, data: CreatePollData) =>
    request<{ poll: ApiPoll }>(`/polls/${id}`, {
      method: "PUT",
      body: {
        title: data.title,
        description: data.description,
        options: data.options.map((text) => ({ text })),
      },
    }).then((res) => normalizePoll(res.poll || (res as unknown as ApiPoll))),
  delete: (id: string) => request<{ message: string }>(`/polls/${id}`, { method: "DELETE" }),
  publish: (id: string) =>
    request<{ poll: ApiPoll }>(`/polls/${id}/publish`, { method: "POST" }).then((res) =>
      normalizePoll(res.poll || (res as unknown as ApiPoll))
    ),
  close: (id: string) =>
    request<{ poll: ApiPoll }>(`/polls/${id}/close`, { method: "POST" }).then((res) =>
      normalizePoll(res.poll || (res as unknown as ApiPoll))
    ),
  results: (id: string) => request<PollResultsResponse>(`/polls/${id}/results`),
  vote: (id: string, data: { option_id: string }) =>
    request<VoteResponse>(`/polls/${id}/vote`, { method: "POST", body: data }),
  voteStatus: (id: string) => request<VoteStatusResponse>(`/polls/${id}/vote/status`),
};

// Voter-specific endpoints
export interface ClosedPollResult {
  poll_id: string;
  title: string;
  description?: string;
  status: string;
  closed_at: string;
  total_votes: number;
  results: PollResultOption[];
}

export interface ClosedResultsResponse {
  count: number;
  polls: ClosedPollResult[];
}

export const voterApi = {
  activePolls: () =>
    request<{ polls: ApiPoll[] }>("/polls/voter/active").then((res) =>
      (res.polls || []).map(normalizePoll)
    ),
  closedPolls: () =>
    request<{ polls: ApiPoll[] }>("/polls/voter/closed").then((res) =>
      (res.polls || []).map(normalizePoll)
    ),
  closedResults: () =>
    request<ClosedResultsResponse>("/polls/closed"),
};

// Admin
export const adminApi = {
  metrics: () => request<AdminMetrics>("/admin/metrics"),
  auditLogs: (params?: { limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.offset !== undefined) query.set("offset", String(params.offset));
    const qs = query.toString();
    return request<AuditLogResponse>(`/admin/audit-logs${qs ? `?${qs}` : ""}`);
  },
};

// --- Normalization layer ---
// The backend uses uppercase statuses (DRAFT, ACTIVE, CLOSED) and `text` for option text.
// We normalize to lowercase statuses and `option_text` for internal use.

interface ApiPollOption {
  id: string;
  text: string;
  vote_count?: number;
  created_at?: string;
}

interface ApiPoll {
  id: string;
  title: string;
  description?: string;
  status: string;
  options: ApiPollOption[];
  created_at: string;
  updated_at?: string;
  closed_at?: string | null;
  published_at?: string | null;
  owner_id?: string;
  total_votes?: number;
}

function normalizePoll(raw: ApiPoll): Poll {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    status: raw.status.toLowerCase() as Poll["status"],
    options: raw.options.map((o) => ({
      id: o.id,
      option_text: o.text,
      vote_count: o.vote_count,
    })),
    created_at: raw.created_at,
    updated_at: raw.updated_at || undefined,
    closed_at: raw.closed_at || undefined,
    total_votes: raw.total_votes,
  };
}

// Types
export interface User {
  id: string;
  email: string;
  username?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface PollOption {
  id: string;
  option_text: string;
  vote_count?: number;
}

export interface Poll {
  id: string;
  title: string;
  description?: string;
  status: "draft" | "active" | "closed";
  options: PollOption[];
  created_at: string;
  updated_at?: string;
  closed_at?: string;
  created_by?: string;
  total_votes?: number;
}

export interface CreatePollData {
  title: string;
  description?: string;
  options: string[];
}

export interface PollResultOption {
  option_id: string;
  option_text: string;
  votes: number;
  percentage: number;
}

export interface PollResultsResponse {
  poll_id: string;
  total_votes: number;
  status: string;
  results: PollResultOption[];
}

export interface VoteResponse {
  message: string;
  vote_id?: string;
}

export interface VoteStatusResponse {
  has_voted: boolean;
  vote_id?: string;
  option_id?: string;
  voted_at?: string;
}

export interface AdminMetrics {
  users: { total: number };
  polls: { total: number; active: number; closed: number; draft: number; created_last_24h: number };
  votes: { total: number; submitted_last_24h: number };
  audit: { events_last_24h: number };
  timestamp: string;
}

export interface AuditLog {
  id: string;
  actor_user_id?: string | null;
  actor_role?: string | null;
  action: string;
  entity_type?: string;
  entity_id?: string | null;
  details?: Record<string, unknown> | null;
  ip_address?: string;
  user_agent?: string | null;
  created_at: string;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}
