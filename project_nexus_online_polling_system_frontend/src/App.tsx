import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AppLayout from "@/layouts/AppLayout";
import Polls from "./pages/Polls";
import PollDetail from "./pages/PollDetail";
import CreatePoll from "./pages/CreatePoll";
import PollResults from "./pages/PollResults";
import VoteStatus from "./pages/VoteStatus";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AuditLogs from "./pages/AuditLogs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register/:role" element={<Register />} />
              <Route path="/" element={<Navigate to="/polls" replace />} />

              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/polls" element={<Polls />} />
                <Route path="/polls/create" element={<CreatePoll />} />
                <Route path="/polls/:id" element={<PollDetail />} />
                <Route path="/polls/:id/edit" element={<CreatePoll />} />
                <Route path="/polls/:id/results" element={<PollResults />} />
                <Route path="/polls/:id/voted" element={<VoteStatus />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/audit-logs" element={<AuditLogs />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
