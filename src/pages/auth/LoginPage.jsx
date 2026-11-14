import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowRight, ArrowUpRight, Building2, Lock, Mail } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AuthShell from "../../components/common/AuthShell";

const homeFor = (role) =>
  role === "admin" ? "/admin/dashboard" : role === "coach" ? "/coach/dashboard" : "/user/dashboard";

/**
 * Member / staff sign-in.
 *
 * This is the plain email + password door into a club workspace. Club owners
 * who bought the software use /owner/login instead - the two are
 * deliberately separate entry points.
 */
function LoginPage() {
  const { login, selectClub } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const [formData, setFormData] = useState({
    email: params.get("email") || "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");

  // Where to go back to after a successful sign-in (set by the guard).
  const from = location.state?.from || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setErrorCode("");
    setLoading(true);

    const result = await login(formData.email, formData.password);
    setLoading(false);

    if (!result.success) {
      setError(result.message || "Sign-in failed.");
      setErrorCode(result.code || "");
      return;
    }

    // A `?club=slug` link (the enrolment CTA on a club's public page) wins over
    // the generic destination, so the person lands where they were headed.
    const wanted = params.get("club");
    const next = params.get("next");

    if (wanted) {
      const chosen = await selectClub(wanted);
      if (chosen.success) {
        navigate(next || homeFor(chosen.club?.role), { replace: true });
        return;
      }
    }

    if (result.requiresClubSelection) {
      navigate("/select-club", { replace: true });
      return;
    }

    navigate(next || from || homeFor(result.user?.role), { replace: true });
  };

  return (
    <AuthShell
      eyebrow="Member sign-in"
      title="Sign in to your club"
      subtitle="Your account works with every club you have joined. Fees, vouchers, schedules and events stay inside that club."
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="font-bold text-orange-500 transition hover:text-white">
            Create an account
          </Link>
          <span className="mx-2 text-zinc-700">·</span>
          <Link to="/clubs" className="font-bold text-zinc-400 transition hover:text-white">
            Browse clubs
          </Link>
        </>
      }
    >
      {params.get("registered") === "1" && !error && (
        <div className="mb-5 border border-emerald-500/30 bg-emerald-500/10 p-3 text-[11.5px] leading-6 text-emerald-300">
          Account created. Sign in below, then pick a club to join from the directory.
        </div>
      )}

      {error && (
        <div className="mb-5 border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-400">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
          {errorCode === "PLATFORM_OWNER" && (
            <Link
              to="/platform/login"
              className="mt-2 inline-flex items-center gap-1 font-bold text-orange-400 transition hover:text-white"
            >
              Open the owner console <ArrowRight size={13} />
            </Link>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Email address
          </label>
          <div className="relative mt-1">
            <input
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@example.com"
              className="w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
            <Mail size={15} className="absolute right-3.5 top-3 text-zinc-500" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Password
          </label>
          <div className="relative mt-1">
            <input
              type="password"
              required
              autoComplete="current-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
            <Lock size={15} className="absolute right-3.5 top-3 text-zinc-500" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 bg-orange-500 py-3.5 text-xs font-extrabold uppercase tracking-wider text-black transition-all hover:bg-white disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
          <ArrowRight size={14} />
        </button>
      </form>

      <div className="mt-6 border-t border-zinc-800 pt-4">
        <Link
          to="/owner/login"
          className="flex items-center justify-between gap-3 border border-zinc-800 bg-zinc-900/40 px-3.5 py-3 text-left transition hover:border-orange-500/60"
        >
          <span className="flex items-center gap-2.5">
            <Building2 size={14} className="text-orange-500" />
            <span>
              <span className="block text-[11.5px] font-bold text-white">Club owner?</span>
              <span className="block text-[10.5px] text-zinc-500">
                Sign in to manage your club
              </span>
            </span>
          </span>
          <ArrowUpRight size={14} className="shrink-0 text-zinc-600" />
        </Link>
      </div>
    </AuthShell>
  );
}

export default LoginPage;
