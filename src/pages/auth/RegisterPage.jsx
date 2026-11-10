import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../../components/common/ThemeToggle";
import { Trophy, ArrowRight, Lock, Mail, User, Phone, AlertCircle, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";

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

    if (result.success) {
      await Swal.fire({
        icon: "success",
        title: "Registration Successful!",
        text: "Your account has been created with the user role. Please log in with your credentials to continue.",
        confirmButtonColor: "#f97316",
        background: "#18181b",
        color: "#ffffff",
      });

      // Redirect to login page as specified in user workflow
      navigate("/login");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-center py-10 px-4 sm:px-6 sm:py-12 lg:px-8 relative overflow-hidden page-transition">
      {/* GLOW */}
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-orange-500/10 blur-[130px] pointer-events-none" />

      {/* TOP HOME LINK */}
      <div className="absolute top-8 left-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-orange-500 transition"
        >
          <ArrowLeft size={14} />
          Back to Website
        </Link>
      </div>

      {/* THEME SWITCH */}
      <div className="absolute top-8 right-8">
        <ThemeToggle variant="panel" className="h-10 w-10" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="flex h-12 w-[84px] items-center justify-center overflow-hidden rounded-lg border border-orange-500/40 bg-zinc-900 px-1.5">
            <img
              src="/sports-hub-logo.svg"
              alt="Sports Hub Logo"
              className="h-7 w-auto object-contain"
            />
          </div>
          <div className="text-left">
            <div className="text-xl font-black text-white leading-none">
              SPORTS <span className="text-orange-500">HUB</span>
            </div>
            <div className="mt-1 text-[8.5px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              Club Management System
            </div>
          </div>
        </Link>

        <h2 className="mt-6 text-2xl font-black tracking-tight text-white">
          Create Member Account
        </h2>
        <p className="mt-1 text-xs text-zinc-400">
          Join Sports Hub to subscribe to memberships and access facilities.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="border border-zinc-800 bg-[#121215] p-5 shadow-2xl sm:p-7">
          {error && (
            <div className="mb-5 flex items-center gap-2 border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-400">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Full Name *
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                />
                <User size={15} className="absolute right-3.5 top-3 text-zinc-500" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Email Address *
              </label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                />
                <Mail size={15} className="absolute right-3.5 top-3 text-zinc-500" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Phone Number (Optional)
              </label>
              <div className="mt-1 relative">
                <input
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0300-1234567"
                  className="w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                />
                <Phone size={15} className="absolute right-3.5 top-3 text-zinc-500" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Password *
                </label>
                <div className="mt-1 relative">
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 8 chars"
                    className="w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                  />
                  <Lock size={15} className="absolute right-3.5 top-3 text-zinc-500" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Confirm *
                </label>
                <div className="mt-1 relative">
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Re-type"
                    className="w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                  />
                  <Lock size={15} className="absolute right-3.5 top-3 text-zinc-500" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-none bg-orange-500 py-3.5 text-xs font-extrabold uppercase tracking-wider text-black transition-all hover:bg-white disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
              <ArrowRight size={14} />
            </button>
          </form>

          <div className="mt-6 border-t border-zinc-800 pt-4 text-center text-xs text-zinc-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-orange-500 hover:text-white transition"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
