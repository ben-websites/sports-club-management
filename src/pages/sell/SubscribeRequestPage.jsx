import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  ImagePlus,
  Loader2,
  LogIn,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import AuthShell from "../../components/common/AuthShell";

const money = (value) =>
  value === null || value === undefined ? "-" : `PKR ${Number(value).toLocaleString("en-PK")}`;

const EMPTY_FORM = {
  planId: "",
  billingCycle: "Monthly",
  companyName: "",
  contactPerson: "",
  contactEmail: "",
  contactPhone: "",
  city: "",
  addressLine: "",
  websiteUrl: "",
  clubDescription: "",
  expectedMembers: "",
  paymentReference: "",
};

/**
 * The "buy the software" form.
 *
 * A buyer creates an email + password account (or signs back into one), then
 * the company details the brief asks for are collected here. Nothing is created
 * until the platform owner approves - approval is what mints the club and turns
 * this account into that club's admin.
 */
const SubscribeRequestPage = () => {
  const { isAuthenticated, user, loading, login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [proof, setProof] = useState(null);
  const [pending, setPending] = useState(null);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Creating the account doubles as this flow's sign-in screen.
  const [authMode, setAuthMode] = useState("register");
  const [authForm, setAuthForm] = useState({ fullName: "", email: "", password: "" });
  const [authBusy, setAuthBusy] = useState(false);

  // Pricing tiers.
  useEffect(() => {
    let alive = true;

    api
      .get("/public/pricing")
      .then(({ data }) => {
        if (alive && data.success) setPlans(data.data || []);
      })
      .catch((error) => console.error("Pricing unavailable:", error.message));

    return () => {
      alive = false;
    };
  }, []);

  // An open request blocks a second one (the API enforces it too).
  useEffect(() => {
    if (!isAuthenticated) {
      setChecking(false);
      return undefined;
    }

    let alive = true;
    setChecking(true);

    api
      .get("/public/subscriptions/my")
      .then(({ data }) => {
        if (!alive || !data.success) return;

        const open = (data.data || []).find((row) => row.Status === "Pending");
        setPending(open || null);
      })
      .catch((error) => console.error("Requests unavailable:", error.message))
      .finally(() => {
        if (alive) setChecking(false);
      });

    return () => {
      alive = false;
    };
  }, [isAuthenticated]);

  const selectedPlan = useMemo(
    () => plans.find((plan) => String(plan.PlanID) === String(form.planId)) || null,
    [plans, form.planId]
  );

  // Preselect the tier the visitor clicked on /for-clubs, or the middle one.
  useEffect(() => {
    if (!plans.length) return;

    const wanted = searchParams.get("plan");
    const exists = plans.some((plan) => String(plan.PlanID) === String(wanted));

    setForm((current) => {
      if (current.planId) return current;
      const fallback = exists ? wanted : String(plans[Math.min(1, plans.length - 1)].PlanID);
      return { ...current, planId: fallback };
    });
  }, [plans, searchParams]);

  // Prefill the contact fields from the account they just signed in with.
  useEffect(() => {
    if (!user) return;

    setForm((current) => ({
      ...current,
      contactPerson: current.contactPerson || user.fullName || "",
      contactEmail: current.contactEmail || user.email || "",
    }));
  }, [user]);

  const set = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const setAuth = (field) => (event) =>
    setAuthForm({ ...authForm, [field]: event.target.value });

  /**
   * Register, then sign in. /auth/register deliberately returns no token, and
   * the subscription endpoint needs one - so the two calls are chained here.
   * The account is a plain global user: the club, and the admin role, only
   * exist once a platform owner approves the request.
   */
  const createAccount = async (event) => {
    event.preventDefault();
    setError("");

    const email = authForm.email.trim().toLowerCase();
    const fullName = authForm.fullName.trim();

    if (!fullName || !email || authForm.password.length < 8) {
      setError("Full name, email and a password of at least 8 characters are required.");
      return;
    }

    setAuthBusy(true);

    try {
      const created = await register({ fullName, email, password: authForm.password });

      if (!created.success) {
        setError(
          /already registered/i.test(created.message || "")
            ? "That email already has an account - switch to sign in below."
            : created.message || "Could not create the account."
        );
        return;
      }

      const signedIn = await login(email, authForm.password);

      if (!signedIn.success) {
        setError(signedIn.message || "Account created, but signing in failed.");
        return;
      }

      setForm((current) => ({
        ...current,
        contactPerson: current.contactPerson || fullName,
        contactEmail: current.contactEmail || email,
      }));
    } finally {
      setAuthBusy(false);
    }
  };

  const signIn = async (event) => {
    event.preventDefault();
    setError("");
    setAuthBusy(true);

    const email = authForm.email.trim().toLowerCase();
    const result = await login(email, authForm.password);

    setAuthBusy(false);

    if (!result.success) {
      setError(result.message || "Could not sign in.");
      return;
    }

    setForm((current) => ({
      ...current,
      contactPerson: current.contactPerson || result.user?.fullName || "",
      contactEmail: current.contactEmail || result.user?.email || email,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.planId || !form.companyName || !form.contactPerson || !form.contactEmail) {
      setError("Plan, club name, contact person and contact email are required.");
      return;
    }

    setSubmitting(true);

    try {
      const { data } = await api.post("/public/subscriptions", {
        planId: Number(form.planId),
        billingCycle: form.billingCycle,
        companyName: form.companyName,
        contactPerson: form.contactPerson,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone || null,
        city: form.city || null,
        addressLine: form.addressLine || null,
        websiteUrl: form.websiteUrl || null,
        clubDescription: form.clubDescription || null,
        expectedMembers: form.expectedMembers ? Number(form.expectedMembers) : null,
        paymentReference: form.paymentReference || null,
      });

      if (!data.success) {
        setError(data.message || "Could not submit the request.");
        return;
      }

      // The receipt is optional, and only attachable once the request exists.
      if (proof) {
        const body = new FormData();
        body.append("proof", proof);

        try {
          await api.post(`/public/subscriptions/${data.requestId}/proof`, body, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } catch (uploadError) {
          toast.error("Request saved, but the receipt did not upload. Add it from the status page.");
        }
      }

      toast.success("Request submitted.");
      navigate("/sell/status", { replace: true });
    } catch (submitError) {
      const message = submitError.response?.data?.message || "Could not submit the request.";
      setError(message);
      if (submitError.response?.status === 409) setPending({ Status: "Pending" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || checking) {
    return (
      <AuthShell eyebrow="For Club Owners" title="Preparing your request" subtitle="One moment...">
        <div className="flex items-center justify-center gap-3 py-6 text-xs text-zinc-400">
          <Loader2 size={16} className="animate-spin text-orange-500" />
          Loading...
        </div>
      </AuthShell>
    );
  }

  // ---------------------------------------------------------------- not in ---
  if (!isAuthenticated) {
    const creating = authMode === "register";

    return (
      <AuthShell
        eyebrow="For Club Owners"
        title={creating ? "Create your owner account" : "Sign in to continue"}
        subtitle={
          creating
            ? "This email and password become your club's admin login once the request is approved, so keep it somewhere safe."
            : "Use the email and password you applied with."
        }
        footer={
          <>
            Just comparing plans?{" "}
            <Link to="/for-clubs" className="font-bold text-orange-500 hover:text-white">
              See pricing
            </Link>
          </>
        }
      >
        {error && (
          <div className="mb-4 border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={creating ? createAccount : signIn} className="space-y-4">
          {creating && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Your full name *
              </label>
              <input
                required
                autoComplete="name"
                value={authForm.fullName}
                onChange={setAuth("fullName")}
                placeholder="Full name"
                className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Email *
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={authForm.email}
              onChange={setAuth("email")}
              placeholder="you@yourclub.com"
              className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Password *
            </label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete={creating ? "new-password" : "current-password"}
              value={authForm.password}
              onChange={setAuth("password")}
              placeholder="At least 8 characters"
              className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={authBusy}
            className="flex w-full items-center justify-center gap-2 bg-orange-500 py-3.5 text-xs font-extrabold uppercase tracking-wider text-black transition hover:bg-white disabled:opacity-50"
          >
            {authBusy ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Working...
              </>
            ) : creating ? (
              <>
                <Building2 size={15} />
                Continue to club details
              </>
            ) : (
              <>
                <LogIn size={15} />
                Sign in
              </>
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setAuthMode(creating ? "signin" : "register");
            setError("");
          }}
          className="mt-5 w-full text-center text-[11px] font-semibold text-zinc-500 transition hover:text-white"
        >
          {creating
            ? "I already have an account - sign in"
            : "No account yet? Create one"}
        </button>
      </AuthShell>
    );
  }

  // ------------------------------------------------------- already pending ---
  if (pending) {
    return (
      <AuthShell
        eyebrow="For Club Owners"
        title="Your request is under review"
        subtitle="The platform owner is reviewing your club. You will get access to your admin dashboard as soon as it is approved."
        footer={
          <>
            <Link to="/sell/status" className="font-bold text-orange-500 hover:text-white">
              Track this request
            </Link>
          </>
        }
      >
        <div className="flex items-start gap-3 border border-amber-500/30 bg-amber-500/10 p-4">
          <Clock size={18} className="mt-0.5 shrink-0 text-amber-400" />
          <div className="text-[11.5px] leading-6 text-amber-200">
            <p className="font-bold">Pending approval</p>
            <p className="mt-1 text-amber-300/90">
              {pending.CompanyName || form.companyName || "Your club"} - submitted{" "}
              {pending.RequestedAt ? new Date(pending.RequestedAt).toLocaleDateString("en-GB") : "just now"}.
            </p>
          </div>
        </div>

        <Link
          to="/sell/status"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-orange-500 px-5 py-3 text-[11px] font-black uppercase tracking-wider text-black transition hover:bg-white"
        >
          Open request status
          <ArrowRight size={14} />
        </Link>
      </AuthShell>
    );
  }

  // ------------------------------------------------------------------ form ---
  return (
    <AuthShell
      eyebrow="For Club Owners"
      title="Tell us about your club"
      subtitle="These details become your club's public profile on the directory. You can change them later from your dashboard."
      maxWidth="max-w-2xl"
      footer={
        <>
          Signed in as <span className="font-bold text-white">{user?.email}</span> ·{" "}
          <Link to="/sell/status" className="font-bold text-orange-500 hover:text-white">
            My requests
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        {error && (
          <div className="border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-400">
            {error}
          </div>
        )}

        {/* PLAN */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Software plan
          </label>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {plans.map((plan) => {
              const active = String(plan.PlanID) === String(form.planId);

              return (
                <button
                  type="button"
                  key={plan.PlanID}
                  onClick={() => setForm({ ...form, planId: String(plan.PlanID) })}
                  className={`border p-3 text-left transition ${
                    active
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-zinc-800 bg-[#0e0e11] hover:border-zinc-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-white">{plan.PlanName}</span>
                    {active && <CheckCircle2 size={13} className="text-orange-500" />}
                  </div>
                  <div className="mt-1 text-[11px] text-zinc-500">
                    {money(plan.PriceMonthly)}/mo
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* BILLING CYCLE */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Billing cycle
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {["Monthly", "Yearly"].map((cycle) => {
              const active = form.billingCycle === cycle;
              const price =
                cycle === "Monthly" ? selectedPlan?.PriceMonthly : selectedPlan?.PriceYearly;

              return (
                <button
                  type="button"
                  key={cycle}
                  onClick={() => setForm({ ...form, billingCycle: cycle })}
                  className={`border px-4 py-3 text-left transition ${
                    active
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-zinc-800 bg-[#0e0e11] hover:border-zinc-600"
                  }`}
                >
                  <div className="text-[12px] font-bold text-white">{cycle}</div>
                  <div className="text-[11px] text-zinc-500">{money(price)}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* COMPANY */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Club / company name *
            </label>
            <input
              required
              value={form.companyName}
              onChange={set("companyName")}
              placeholder="e.g. Riverside Sports Club"
              className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Contact person *
            </label>
            <input
              required
              value={form.contactPerson}
              onChange={set("contactPerson")}
              placeholder="Full name"
              className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Contact email *
            </label>
            <input
              required
              type="email"
              value={form.contactEmail}
              onChange={set("contactEmail")}
              placeholder="you@example.com"
              className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Phone
            </label>
            <input
              value={form.contactPhone}
              onChange={set("contactPhone")}
              placeholder="+92 300 1234567"
              className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              City
            </label>
            <input
              value={form.city}
              onChange={set("city")}
              placeholder="Lahore"
              className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Expected members
            </label>
            <input
              type="number"
              min="1"
              value={form.expectedMembers}
              onChange={set("expectedMembers")}
              placeholder="200"
              className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Street address
            </label>
            <input
              value={form.addressLine}
              onChange={set("addressLine")}
              placeholder="Street, area"
              className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Website (optional)
            </label>
            <input
              value={form.websiteUrl}
              onChange={set("websiteUrl")}
              placeholder="https://yourclub.com"
              className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              About your club
            </label>
            <textarea
              rows={4}
              value={form.clubDescription}
              onChange={set("clubDescription")}
              placeholder="What sports do you offer? Who trains your members?"
              className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs leading-6 text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        {/* PAYMENT */}
        <div className="border-t border-zinc-800 pt-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Payment
          </p>
          <p className="mt-2 text-[11.5px] leading-6 text-zinc-500">
            Transfer the fee to the platform account and attach a photo of the receipt.
            The platform owner checks it before approving your club. Your reference is
            optional but speeds up approval.
          </p>

          <input
            value={form.paymentReference}
            onChange={set("paymentReference")}
            placeholder="Transaction / reference number"
            className="mt-3 w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
          />

          <div className="mt-3">
            {proof ? (
              <div className="flex items-center justify-between border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-300">
                <span className="truncate">{proof.name}</span>
                <button
                  type="button"
                  onClick={() => setProof(null)}
                  className="ml-3 shrink-0 text-zinc-500 hover:text-red-400"
                  aria-label="Remove receipt"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-zinc-700 bg-zinc-900/50 px-3.5 py-4 text-[11px] font-semibold text-zinc-400 transition hover:border-orange-500 hover:text-white">
                <ImagePlus size={16} className="text-orange-500" />
                Attach receipt photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => setProof(event.target.files?.[0] || null)}
                />
              </label>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 bg-orange-500 py-3.5 text-xs font-extrabold uppercase tracking-wider text-black transition hover:bg-white disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Building2 size={15} />
              Submit request for approval
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
};

export default SubscribeRequestPage;
