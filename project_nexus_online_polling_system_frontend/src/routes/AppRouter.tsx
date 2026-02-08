import { Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/auth/Login";
import { AuthGuard, AdminGuard, SystemAdminGuard } from "./guards";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />

      {/* placeholders for next screens */}
      <Route
        path="/admin/create-poll"
        element={
          <AdminGuard>
            <div>Admin Create Poll (next)</div>
          </AdminGuard>
        }
      />
      <Route
        path="/system/audit-logs"
        element={
          <SystemAdminGuard>
            <div>Audit Logs (next)</div>
          </SystemAdminGuard>
        }
      />
      <Route
        path="/system/states"
        element={
          <AuthGuard>
            <div>System States (next)</div>
          </AuthGuard>
        }
      />
    </Routes>
  );
}
