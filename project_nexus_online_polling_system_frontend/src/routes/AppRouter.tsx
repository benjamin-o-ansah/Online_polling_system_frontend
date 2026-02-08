import { Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/auth/Login";
// import { AuthGuard, AdminGuard, SystemAdminGuard } from "./guards";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<div>Register (next)</div>} />

      <Route path="/polls" element={<div>Polls (next)</div>} />

      <Route path="/system/audit-logs" element={<div>Audit Logs (next)</div>} />
    </Routes>
  );
}
