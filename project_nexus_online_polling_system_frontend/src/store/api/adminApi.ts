import { baseApi } from "./baseApi";
import type { AuditLog, Metrics } from "@/types/models";

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMetrics: builder.query<Metrics, void>({
      query: () => ({ url: import.meta.env.VITE_API_ADMIN_METRICS || "/api/admin/metrics", method: "GET" }),
      providesTags: ["Metrics"],
    }),
    getAuditLogs: builder.query<AuditLog[], void>({
      query: () => ({ url: import.meta.env.VITE_API_ADMIN_AUDIT_LOGS || "/api/admin/audit-logs", method: "GET" }),
      providesTags: ["AuditLogs"],
    }),
  }),
});

export const { useGetMetricsQuery, useGetAuditLogsQuery } = adminApi;
