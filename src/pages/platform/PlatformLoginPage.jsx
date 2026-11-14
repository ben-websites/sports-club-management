import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AuthShell from "../../components/common/AuthShell";

/**
 * The software owner's sign-in.
 *
 * Email + password only: the address must be listed in PLATFORM_ADMIN_EMAILS
 * and the password must match PLATFORM_ADMIN_PASSWORD on the server.
 */
const PlatformLoginPage = () => {
  const { platformLogin, isPlatformOwner } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Already signed in as the platform owner: nothing to do here.
  if (isPlatformOwner) return <Navigate to="/platform" replace />;

  const finish = (ok) => {
    if (ok) navigate("/platform", { replace: true });
  };

  const handlePassword = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = await platformLogin({ email: form.email, password: form.password });
    setBusy(false);
    if (!result.success) setError(result.message || "Platform sign-in failed.");
    else finish(true);
  };

  return (
    <AuthShell
      eyebrow="Platform Owner"
      title="Owner console"
      subtitle="This console creates clubs, approves subscriptions and manages the software plans. It is not part of any club's workspace."
    >
      {error && (
        <div className="mb-5 flex items-start gap-2 border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-400">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePassword} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Owner email
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="owner@example.com"
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
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            placeholder="••••••••"
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
              Checking...
            </>
          ) : (
            <>
              <ShieldCheck size={15} />
              Unlock console
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 border-t border-zinc-800 pt-4 text-[10.5px] leading-6 text-zinc-500">
        Only addresses listed in <code className="font-mono text-zinc-400">PLATFORM_ADMIN_EMAILS</code>{" "}
        can sign in here.
      </p>
    </AuthShell>
  );
};

export default PlatformLoginPage;
