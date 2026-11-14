import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, Lock, Mail, Phone, User } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import AuthShell from "../../components/common/AuthShell";

/**
 * Creates a global member account.
 *
 * The account is not tied to a club - that is the whole point of the platform:
 * one login, then join whichever club you like from the directory.
 */
function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await register({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
    });
    setLoading(false);

    if (!result.success) {
      setError(result.message || "Registration failed.");
      return;
    }

    toast.success("Account created. Sign in to join a club.");
    navigate(`/login?email=${encodeURIComponent(formData.email)}&registered=1`, { replace: true });
  };

  return (
    <AuthShell
      eyebrow="Create account"
      title="Join the platform"
      subtitle="One account, every club you enrol in. After signing in you pick the club you want to train at."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-orange-500 transition hover:text-white">
            Sign in
          </Link>
          <span className="mx-2 text-zinc-700">·</span>
          <Link to="/clubs" className="font-bold text-zinc-400 transition hover:text-white">
            Browse clubs
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-5 flex items-center gap-2 border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-400">
          <AlertCircle size={16} className="shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Full name *
          </label>
          <div className="relative mt-1">
            <input
              type="text"
              required
              autoComplete="name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. John Doe"
              className="w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
            <User size={15} className="absolute right-3.5 top-3 text-zinc-500" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Email address *
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
            Phone number (optional)
          </label>
          <div className="relative mt-1">
            <input
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="0300-1234567"
              className="w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
            <Phone size={15} className="absolute right-3.5 top-3 text-zinc-500" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Password *
            </label>
            <div className="relative mt-1">
              <input
                type="password"
                required
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min 8 chars"
                className="w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
              />
              <Lock size={15} className="absolute right-3.5 top-3 text-zinc-500" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Confirm *
            </label>
            <div className="relative mt-1">
              <input
                type="password"
                required
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Re-type"
                className="w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
              />
              <Lock size={15} className="absolute right-3.5 top-3 text-zinc-500" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 bg-orange-500 py-3.5 text-xs font-extrabold uppercase tracking-wider text-black transition-all hover:bg-white disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
          <ArrowRight size={14} />
        </button>
      </form>

      <p className="mt-5 border-t border-zinc-800 pt-4 text-[10.5px] leading-6 text-zinc-500">
        Owning a club rather than joining one? The software is bought from{" "}
        <Link to="/for-clubs" className="font-bold text-orange-500 hover:text-white">
          For Clubs
        </Link>{" "}
        and signed into with a club owner account.
      </p>
    </AuthShell>
  );
}

export default RegisterPage;
