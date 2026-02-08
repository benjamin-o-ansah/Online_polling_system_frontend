import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types/models";

type Tokens = { access_token: string; refresh_token?: string };

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokens(state, action: PayloadAction<Tokens>) {
      state.accessToken = action.payload.access_token;
      state.refreshToken = action.payload.refresh_token ?? null;
    },
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
    clearAuth() {
      return initialState;
    },
  },
});

export const { setTokens, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
