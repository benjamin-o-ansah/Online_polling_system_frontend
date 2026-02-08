import { useAppDispatch, useAppSelector } from "./useRedux";
import { clearAuth, setTokens, setUser } from "../store/slices/authSlice";
import { useLoginMutation, useLogoutMutation, useMeQuery } from "../store/api/authApi";

export function useAuth() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);

  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();
  const { refetch: refetchMe } = useMeQuery(undefined, { skip: !auth.accessToken });

  const login = async (email: string, password: string) => {
    const tokens = await loginMutation({ email, password }).unwrap();
    dispatch(setTokens(tokens));
    const user = await refetchMe().unwrap();
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
    login,
    logout,
    isAuthenticated: Boolean(auth.accessToken),
  };
}
