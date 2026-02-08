import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setTokens, setUser, clearAuth } from "@/store/slices/authSlice";
import { useLazyMeQuery, useLoginMutation, useLogoutMutation } from "@/store/api/authApi";

export function useAuth() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);

  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();
  const [fetchMe] = useLazyMeQuery();

  const login = async (email: string, password: string) => {
    const tokens = await loginMutation({ email, password }).unwrap();
    dispatch(setTokens(tokens));

    const user = await fetchMe().unwrap();
    dispatch(setUser(user));
    return user;
  };

  const logout = async () => {
    try {
      await logoutMutation().unwrap();
    } finally {
      dispatch(clearAuth());
    }
  };

  return {
    ...auth,
    isAuthenticated: Boolean(auth.accessToken),
    login,
    logout,
  };
}
