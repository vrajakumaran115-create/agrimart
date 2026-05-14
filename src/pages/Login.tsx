import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, signIn, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      navigate("/admin");
    } else if (user) {
      navigate("/");
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/admin");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-3xl bg-white p-8 shadow-xl border border-slate-200">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-3xl bg-green-100 p-4 text-green-700">
            <LogIn className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Admin login</h1>
            <p className="mt-2 text-sm text-slate-500">Sign in with your Supabase admin account.</p>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-3xl bg-rose-50 px-4 py-4 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block text-sm font-semibold text-slate-700">
            Email address
            <div className="mt-3 relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 pl-12 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                placeholder="admin@example.com"
              />
            </div>
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Password
            <div className="mt-3 relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 pl-12 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                placeholder="Enter your password"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-3xl bg-green-600 px-5 py-4 text-sm font-semibold text-white hover:bg-green-700 transition disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Need an admin account? Configure <code className="rounded bg-slate-100 px-2 py-1">VITE_ADMIN_EMAIL</code> in your environment.
        </p>
      </div>
    </div>
  );
}
