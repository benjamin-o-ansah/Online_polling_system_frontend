import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types/models";
import { clearStoredTokens, getStoredTokens, storeTokens } from "@/lib/tokenStorage";

type TokensPayload = { access_token: string; refresh_token?: string };

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
}

const stored = getStoredTokens();

const initialState: AuthState = {
  accessToken: stored.accessToken,
  refreshToken: stored.refreshToken,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokens(state, action: PayloadAction<TokensPayload>) {
      state.accessToken = action.payload.access_token;
      state.refreshToken = action.payload.refresh_token ?? null;
      storeTokens(action.payload.access_token, action.payload.refresh_token ?? null);
    },
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
    clearAuth() {
      clearStoredTokens();
      return { accessToken: null, refreshToken: null, user: null };
    },
  },
});

export const { setTokens, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
