import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";
import { clearAuth, setTokens } from "@/store/slices/authSlice";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    // try refresh once
    const refreshPath = import.meta.env.VITE_API_AUTH_REFRESH || "/api/auth/refresh";
    const refreshResult = await rawBaseQuery(
      { url: refreshPath, method: "POST" },
      api,
      extraOptions
    );

    if (refreshResult.data && typeof refreshResult.data === "object") {
      api.dispatch(setTokens(refreshResult.data as any));
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(clearAuth());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Me", "Polls", "Poll", "AuditLogs", "Metrics", "VoteStatus", "Results"],
  endpoints: () => ({}),
});
