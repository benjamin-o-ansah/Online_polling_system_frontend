import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAppSelector } from "@/hooks/useRedux";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const existingRole = useAppSelector((s) => s.auth.user?.role);
  const existingToken = useAppSelector((s) => s.auth.accessToken);

  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("password");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const alreadyAuthed = useMemo(() => Boolean(existingToken && existingRole), [existingToken, existingRole]);

  // If already authenticated, route immediately
  if (alreadyAuthed) {
    if (existingRole === "system_admin") navigate("/system/audit-logs", { replace: true });
    else navigate("/polls", { replace: true });
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Email and password are required.");
      return;
    }

    try {
      setSubmitting(true);
      const user = await login(email.trim(), password);
      if (user.role === "system_admin") navigate("/system/audit-logs");
      else navigate("/polls");
    } catch (err) {
      setErrorMsg("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-slate-50">
      {/* LEFT IMAGE PANEL */}
      <div className="hidden md:block relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/login-network.jpg)",
          }}
        />
        {/* fallback tint overlay */}
        <div className="absolute inset-0 bg-blue-200/40" />
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="flex items-center justify-center px-6 md:px-16">
        <div className="w-full max-w-[520px]">
          <div className="text-center md:text-left">
            <div className="text-sm font-semibold text-slate-800">Project Nexus</div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
            <p className="mt-3 text-slate-500">Enter your credentials to access the polling dashboard.</p>
          </div>

          <form onSubmit={onSubmit} className="mt-12 space-y-7">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-800" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="w-full h-12 rounded-md border border-slate-200 bg-white px-4 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="user@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-800" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full h-12 rounded-md border border-slate-200 bg-white px-4 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••••••"
              />
            </div>

            {errorMsg && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Logging in..." : "Login"}
            </button>

            <div className="pt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link className="text-blue-600 font-medium hover:underline" to="/register">
                Register
              </Link>
            </div>

            <div className="pt-10 border-t border-slate-200 text-center text-xs text-slate-400 leading-relaxed">
              Successful authentication via <span className="font-mono text-slate-500">POST /api/auth/login</span> will return
              <br />
              an <span className="font-mono text-slate-500">access_token</span> and{" "}
              <span className="font-mono text-slate-500">refresh_token</span>.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
