import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = useAppSelector((s) => s.auth.accessToken);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { accessToken, user } = useAppSelector((s) => s.auth);
  if (!accessToken) return <Navigate to="/login" replace />;
  if (user?.role !== "admin" && user?.role !== "system_admin")
    return <Navigate to="/system/states" replace />;
  return <>{children}</>;
}

export function SystemAdminGuard({ children }: { children: React.ReactNode }) {
  const { accessToken, user } = useAppSelector((s) => s.auth);
  if (!accessToken) return <Navigate to="/login" replace />;
  if (user?.role !== "system_admin") return <Navigate to="/system/states" replace />;
  return <>{children}</>;
}
