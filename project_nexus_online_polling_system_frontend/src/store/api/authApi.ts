import { baseApi } from "./baseApi";
import type { User } from "@/types/models";

type LoginReq = { email: string; password: string };
type LoginRes = { access_token: string; refresh_token?: string };

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginRes, LoginReq>({
      query: (body) => ({
        url: import.meta.env.VITE_API_AUTH_LOGIN || "/api/auth/login",
        method: "POST",
        body,
      }),
    }),
    register: builder.mutation<any, LoginReq>({
      query: (body) => ({
        url: import.meta.env.VITE_API_AUTH_REGISTER || "/api/auth/register",
        method: "POST",
        body,
      }),
    }),
    me: builder.query<User, void>({
      query: () => import.meta.env.VITE_API_AUTH_ME || "/api/auth/me",
      providesTags: ["Me"],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: import.meta.env.VITE_API_AUTH_LOGOUT || "/api/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useMeQuery,
  useLogoutMutation,
} = authApi;
