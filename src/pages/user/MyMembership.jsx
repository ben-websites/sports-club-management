import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatusBadge from "../../components/dashboard/StatusBadge";
import PageLoader from "../../components/dashboard/PageLoader";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import {
  Trophy,
  Printer,
  ShieldCheck,
  Calendar,
  MapPin,
  Phone,
  AlertCircle,
  ArrowRight,
  Lock,
  CheckCircle2,
  Clock,
  Gem,
  User,
  Sparkles,
} from "lucide-react";

function MyMembership() {
  const { user, refreshUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // If user hasn't enrolled yet: available plans list & enrollment form state
  const [availablePlans, setAvailablePlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [enrollForm, setEnrollForm] = useState({
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMembership(true);

    // Live auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchMembership(false);
      refreshUser();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchMembership = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await api.get("/membership/my-status");
      if (res.data.success) {
        setData(res.data);
      }

      // If no membership yet, fetch plans for inline selection right inside the panel
      if (!res.data?.hasMembership) {
        const plansRes = await api.get("/public/plans");
        if (plansRes.data.success) {
          const plans = plansRes.data.plans || plansRes.data.data || [];
          setAvailablePlans(plans);
          setSelectedPlan((prev) => prev || (plans.length > 0 ? plans[0] : null));
        }
      }
    } catch (err) {
      console.error("Failed to load membership:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;

    if (!enrollForm.address.trim() || !enrollForm.emergencyContactName.trim() || !enrollForm.emergencyContactPhone.trim()) {
      toast.error("Please fill in your address and emergency contact details.");
      return;
    }

    const confirm = await Swal.fire({
      title: "Confirm Membership Application?",
      html: `
        <div class="text-left text-xs space-y-2 mt-2 p-3 bg-zinc-900 border border-zinc-800">
          <p><b>Selected Plan:</b> <span class="text-orange-400 font-bold">${selectedPlan.PlanName}</span></p>
          <p><b>Monthly Fee:</b> Rs. ${Number(selectedPlan.MonthlyFee).toLocaleString()} / month</p>
          <p><b>Standard Duration:</b> ${selectedPlan.DurationMonths} Months</p>
          <p><b>Emergency Contact:</b> ${enrollForm.emergencyContactName} (${enrollForm.emergencyContactPhone})</p>
        </div>
        <p class="text-xs text-zinc-400 mt-3">Once submitted, your application will be reviewed by club administration.</p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#27272a",
      confirmButtonText: "Yes, Submit Application",
      cancelButtonText: "Cancel",
      background: "#18181b",
      color: "#ffffff",
      allowOutsideClick: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      setSubmitting(true);
      const res = await api.post("/membership/apply", {
        planId: selectedPlan.PlanID,
        address: enrollForm.address.trim(),
        emergencyContactName: enrollForm.emergencyContactName.trim(),
        emergencyContactPhone: enrollForm.emergencyContactPhone.trim(),
      });

      if (res.data.success) {
        await Swal.fire({
          icon: "success",
          title: "Application Received!",
          html: `<p>Your enrollment application for <b>${selectedPlan.PlanName}</b> has been submitted successfully.</p><p class="text-xs text-zinc-400 mt-2">Status is currently <b>Pending Admin Verification</b>. All member features will unlock upon approval.</p>`,
          confirmButtonColor: "#f97316",
          background: "#18181b",
          color: "#ffffff",
          allowOutsideClick: true,
        });

        await refreshUser();
        fetchMembership();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit membership application.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout role="user">
        <PageLoader message="Loading membership credentials..." />
      </DashboardLayout>
    );
  }

  const membership = data?.membership;
  const hasApplication = data?.hasMembership;
  const isActive = membership?.MembershipStatus === "Active";

  // CASE 1: USER HAS NOT APPLIED FOR MEMBERSHIP YET (IN-PANEL PLAN SELECTION)
  if (!hasApplication) {
    return (
      <DashboardLayout role="user">
        <div className="w-full">
          {/* HEADER */}
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <span className="h-px w-5 bg-orange-500" />
              <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-orange-500">
                Enrollment Center
              </span>
            </div>
            <h1 className="mt-2 text-[22px] font-extrabold tracking-tight text-white md:text-[24px]">
              Select a Club Membership Plan
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Choose your membership tier to activate your credentials and access club facilities.
            </p>
          </div>

          {/* NOTICE BANNER */}
          <div className="mb-8 border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
            <Lock className="text-amber-400 shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-zinc-300 leading-relaxed">
              <span className="font-bold text-amber-400 uppercase">Panel Features Restricted:</span> You currently have no active membership. Panel modules (Monthly Fee Slips, Advance Payments, Tournaments, and Receipt Verification) require an approved membership. Select a plan below to submit your enrollment application.
            </div>
          </div>

          {/* PLANS GRID */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {availablePlans.map((p) => {
              const isSelected = selectedPlan?.PlanID === p.PlanID;
              return (
                <div
                  key={p.PlanID}
                  onClick={() => setSelectedPlan(p)}
                  className={`cursor-pointer border p-6 flex flex-col justify-between transition duration-200 relative ${
                    isSelected
                      ? "border-orange-500 bg-[#16161c] shadow-xl shadow-orange-500/10"
                      : "border-zinc-800 bg-[#121215] hover:border-zinc-700"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-3 left-4 bg-orange-500 text-black text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                      Selected Tier
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <Gem size={20} className={isSelected ? "text-orange-500" : "text-zinc-500"} />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">
                        {p.DurationMonths} Months
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-black text-white">{p.PlanName}</h3>
                    <p className="mt-2 text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                      {p.Description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800">
                    <div className="text-[9px] uppercase tracking-wider text-zinc-500">Monthly Fee</div>
                    <div className="text-xl font-black text-orange-500">
                      Rs. {Number(p.MonthlyFee).toLocaleString()}
                      <span className="text-xs font-normal text-zinc-400"> /mo</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedPlan(p)}
                      className={`mt-4 w-full py-2 text-xs font-bold uppercase tracking-wider transition ${
                        isSelected
                          ? "bg-orange-500 text-black"
                          : "border border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
                      }`}
                    >
                      {isSelected ? "Selected" : "Select Tier"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* APPLICATION FORM (IN-PANEL) */}
          {selectedPlan && (
            <div className="border border-zinc-800 bg-[#121215] p-6 md:p-8 max-w-2xl shadow-2xl">
              <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-6">
                <div className="h-10 w-10 bg-orange-500 flex items-center justify-center text-black font-black">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight">
                    Complete Enrollment for {selectedPlan.PlanName}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Provide your residential and emergency contact details to register your application.
                  </p>
                </div>
              </div>

              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                    Residential Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. House 14, Street 5, Sector F-7, Islamabad"
                    value={enrollForm.address}
                    onChange={(e) => setEnrollForm({ ...enrollForm, address: e.target.value })}
                    className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                      Emergency Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tariq Mahmood"
                      value={enrollForm.emergencyContactName}
                      onChange={(e) => setEnrollForm({ ...enrollForm, emergencyContactName: e.target.value })}
                      className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                      Emergency Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +92 300 1234567"
                      value={enrollForm.emergencyContactPhone}
                      onChange={(e) => setEnrollForm({ ...enrollForm, emergencyContactPhone: e.target.value })}
                      className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                  <div className="text-xs text-zinc-400">
                    Plan Fee: <span className="font-bold text-orange-400">Rs. {Number(selectedPlan.MonthlyFee).toLocaleString()} / month</span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-none bg-orange-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-white disabled:opacity-50"
                  >
                    {submitting ? "Submitting Application..." : "Submit Application"}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // CASE 2: APPLICATION EXISTS (EITHER PENDING OR ACTIVE)
  return (
    <DashboardLayout role="user">
      <div className="w-full">
        {/* HEADER */}
        <div className="no-print mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-px w-5 bg-orange-500" />
              <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-orange-500">
                Credentials & Pass
              </span>
            </div>
            <h1 className="mt-2 text-[22px] font-extrabold tracking-tight text-white md:text-[24px]">
              My Club Membership
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Official membership credentials, digital pass, and plan duration.
            </p>
          </div>

          {isActive && (
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-none bg-orange-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-white"
            >
              <Printer size={15} />
              Print Card
            </button>
          )}
        </div>

        {/* STATUS BANNER IF PENDING */}
        {!isActive && (
          <div className="no-print mb-6 border border-amber-500/40 bg-amber-500/10 p-5">
            <div className="flex items-start gap-3">
              <Clock className="text-amber-400 shrink-0 mt-0.5" size={20} />
              <div>
                <div className="text-sm font-black uppercase text-amber-400">
                  Membership Under Administrative Review
                </div>
                <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
                  Your application for <span className="font-bold text-white">{membership?.PlanName}</span> was submitted on{" "}
                  {new Date(membership?.AppliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.
                  Club management is currently verifying your details.
                </p>
                <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-amber-300">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  Restricted Access Mode: Other user panel features will automatically unlock as soon as your membership is approved.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* APPLICATION REMARKS (IF ANY) */}
        {membership?.AdminRemarks && (
          <div className="mb-6 border border-zinc-800 bg-zinc-900/60 p-4 text-xs">
            <span className="font-bold text-orange-400 uppercase tracking-wider text-[10px]">
              Administration Remarks:
            </span>
            <p className="mt-1 text-zinc-300">{membership.AdminRemarks}</p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,1fr)]">
          {/* DIGITAL CARD (PRINTABLE) */}
          <div className="border border-zinc-800 bg-[#121215] p-6 flex flex-col justify-center items-center">
            <div className="w-full max-w-sm rounded-none border-2 border-orange-500/60 bg-gradient-to-br from-black via-zinc-950 to-[#1e1307] p-6 shadow-2xl relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 h-40 w-40 bg-orange-500/15 rounded-full blur-3xl" />

              {/* CARD TOP */}
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-orange-500/40 bg-zinc-900 p-1">
                    <img
                      src="/z-sports-animated-logo.svg"
                      alt="Z Sports Logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-black tracking-wider leading-none">
                      Z SPORTS CLUB
                    </div>
                    <div className="text-[7.5px] uppercase tracking-[0.2em] text-zinc-400 mt-0.5">
                      Digital Pass
                    </div>
                  </div>
                </div>

                <StatusBadge status={isActive ? "Active" : "PendingVerification"} />
              </div>

              {/* PHOTO / AVATAR + CHIP */}
              <div className="mt-6 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={membership?.FullName}
                      className="h-12 w-12 rounded-none object-cover border-2 border-orange-500"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-none bg-orange-500 text-black font-black text-lg flex items-center justify-center">
                      {membership?.FullName?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="h-7 w-10 rounded-none bg-gradient-to-r from-amber-400 to-amber-600 border border-amber-300 opacity-80" />
                </div>

                <div className="font-mono text-xs tracking-widest text-orange-400 font-bold">
                  {isActive ? membership?.MembershipNumber : "PENDING ID"}
                </div>
              </div>

              {/* MEMBER DETAILS */}
              <div className="mt-5 relative z-10">
                <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                  Card Holder
                </div>
                <div className="text-lg font-black tracking-wide text-white truncate">
                  {membership?.FullName}
                </div>
              </div>

              {/* VALIDITY & TIER */}
              <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3 relative z-10 text-xs">
                <div>
                  <div className="text-[8px] uppercase tracking-wider text-zinc-400">
                    Tier
                  </div>
                  <div className="font-extrabold text-white text-xs">
                    {membership?.PlanName}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[8px] uppercase tracking-wider text-zinc-400">
                    Valid Thru
                  </div>
                  <div className="font-mono text-xs text-orange-400 font-bold">
                    {membership?.EndDate
                      ? new Date(membership.EndDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                      : "Pending Approval"}
                  </div>
                </div>
              </div>

              {/* BARCODE */}
              <div className="mt-4 pt-3 border-t border-zinc-800 text-center font-mono text-[9px] tracking-[0.3em] text-zinc-500">
                {isActive ? "|||| | ||||| ||| || |||||| | |||||" : "|| PENDING ADMIN ACTIVATION ||"}
              </div>
            </div>

            <p className="no-print mt-4 text-[10px] text-zinc-500 text-center">
              {isActive
                ? "Official membership barcode for facility turnstile entry and equipment checkout."
                : "Pass is inactive until approved by club administration."}
            </p>
          </div>

          {/* SUBSCRIPTION DETAILS TABLE */}
          <div className="border border-zinc-800 bg-[#121215] p-6 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-zinc-800 pb-3">
              Application & Package Record
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                <span className="text-zinc-400">Package Name:</span>
                <span className="font-bold text-white">{membership?.PlanName}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                <span className="text-zinc-400">Monthly Fee Schedule:</span>
                <span className="font-bold text-orange-400">
                  Rs. {Number(membership?.MonthlyFee).toLocaleString()} / month
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                <span className="text-zinc-400">Duration:</span>
                <span className="font-bold text-white">{membership?.DurationMonths} Months</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                <span className="text-zinc-400">Application Status:</span>
                <span className="font-bold text-amber-400">{membership?.ApplicationStatus || "Pending"}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                <span className="text-zinc-400">Enrolled On:</span>
                <span className="text-zinc-300">
                  {new Date(membership?.AppliedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                <span className="text-zinc-400">Emergency Contact:</span>
                <span className="text-zinc-300">
                  {membership?.EmergencyContactName || "N/A"} ({membership?.EmergencyContactPhone || "N/A"})
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                <span className="text-zinc-400">Registered Address:</span>
                <span className="text-zinc-300 truncate max-w-[200px]">
                  {membership?.Address || "N/A"}
                </span>
              </div>
            </div>

            <div className="mt-6 border border-zinc-800 bg-zinc-900/60 p-4 text-xs text-zinc-400 space-y-1">
              <div className="font-bold text-white">Facility Access Policy:</div>
              <p>
                {isActive
                  ? "Access to Olympic Swimming, Badminton Courts, and Gymnasium is granted to all active members."
                  : "Facility turnstiles and sports bookings are unlocked immediately once administration approves your application."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MyMembership;
