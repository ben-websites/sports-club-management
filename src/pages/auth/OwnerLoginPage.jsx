import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, Loader2, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AuthShell from "../../components/common/AuthShell";

/**
 * Club owners sign in with the email + password their club was created with.
 *
 * What happens next depends on the account:
 *   approved owner  -> their club-scoped session opens the admin dashboard
 *   brand new       -> the subscription form starts
 *   several clubs   -> the club chooser
 */
const OwnerLoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");

  const set = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setErrorCode("");

    const result = await login(form.email, form.password);
    setBusy(false);

    if (!result.success) {
      setError(result.message || "Could not sign in.");
      setErrorCode(result.code || "");
      return;
    }

    if (result.requiresClubSelection) {
      navigate("/select-club", { replace: true });
      return;
    }

    if (result.user?.role === "admin" && result.club) {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    // No club on this account yet: they are here to buy the software.
    navigate("/sell/subscribe", { replace: true });
  };

  return (
    <AuthShell
      eyebrow="For Club Owners"
      title="Club owner sign in"
      subtitle="Use the email and password your club was created with. Each owner only ever sees their own club - the workspace is separated at the database level."
      footer={
        <>
          Coach, staff or member?{" "}
          <Link to="/login" className="font-bold text-orange-500 transition hover:text-white">
            Use the member sign in
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-5 border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-400">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
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

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Owner email
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={set("email")}
            placeholder="you@yourclub.com"
            className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Password
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={form.password}
            onChange={set("password")}
            placeholder="********"
            className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 bg-orange-500 py-3.5 text-xs font-extrabold uppercase tracking-wider text-black transition hover:bg-white disabled:opacity-50"
        >
          {busy ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Checking your club...
            </>
          ) : (
            <>
              <LogIn size={15} />
              Sign in to my club
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>

      <div className="mt-7 space-y-3 border-t border-zinc-800 pt-6 text-[11px] leading-6 text-zinc-500">
        <p className="flex items-start gap-2">
          <ArrowRight size={13} className="mt-1 shrink-0 text-orange-500" />
          New here?{" "}
          <Link to="/sell/subscribe" className="font-bold text-orange-500 hover:text-white">
            Create an account
          </Link>{" "}
          and send us your club's details - the platform owner approves it before anyone
          gets access.
        </p>
        <p className="flex items-start gap-2">
          <ArrowRight size={13} className="mt-1 shrink-0 text-orange-500" />
          Want to see the plans first?{" "}
          <Link to="/for-clubs" className="font-bold text-orange-500 hover:text-white">
            Compare pricing
          </Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default OwnerLoginPage;
