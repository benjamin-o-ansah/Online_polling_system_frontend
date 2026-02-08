import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import type { UserRole } from "../types/models";
import type { JSX } from "react";

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export function RequireRole({
  role,
  children,
}: {
  role: UserRole | UserRole[];
  children: JSX.Element;
}) {
  const { user } = useAuth();
  const roles = Array.isArray(role) ? role : [role];
  return user && roles.includes(user.role) ? children : <Navigate to="/system/states" replace />;
}
