import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import startPolling from "../../services/polling";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import SummaryBox from "../../components/dashboard/SummaryBox";
import StatusBadge from "../../components/dashboard/StatusBadge";
import PageLoader from "../../components/dashboard/PageLoader";

import {
  CreditCard,
  ReceiptText,
  Clock,
  UploadCloud,
  Zap,
  CalendarDays,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Trophy,
  CheckCircle2,
  FileText,
  Dumbbell,
  Calendar,
  Activity,
} from "lucide-react";

function UserOverview() {
  const { user, refreshUser, isMemberActive } = useAuth();
  const navigate = useNavigate();

  const [membershipData, setMembershipData] = useState(null);
  const [feeSummary, setFeeSummary] = useState(null);
  const [recentVouchers, setRecentVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserData(true);

    // Live auto-refresh (skipped while the tab is hidden)
    return startPolling(() => {
      fetchUserData(false);
      refreshUser();
    });
  }, []);

  const fetchUserData = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      setError("");

      const [memberRes, summaryRes, vouchersRes] = await Promise.all([
        api.get("/membership/my-status"),
        api.get("/vouchers/my-summary"),
        api.get("/vouchers/my-vouchers"),
      ]);

      if (memberRes.data.success) {
        setMembershipData(memberRes.data);
      }
      if (summaryRes.data.success) {
        setFeeSummary(summaryRes.data.summary);
      }
      if (vouchersRes.data.success) {
        setRecentVouchers(vouchersRes.data.vouchers.slice(0, 4));
      }
    } catch (err) {
      console.error("User overview fetch error:", err);
      if (isInitial) setError("Failed to load your member profile data.");
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="user">
        <PageLoader message="Loading member workspace..." />
      </DashboardLayout>
    );
  }

  const membership = membershipData?.membership;
  const hasApplication = membershipData?.hasMembership;
  const status = membership?.MembershipStatus || (hasApplication ? "Pending Approval" : "Not Enrolled");

  const quickActions = [
    {
      title: "Sports & Courses",
      icon: Dumbbell,
      path: "/user/sports",
      desc: "Enroll in sports per plan quota",
    },
    {
      title: "Training Timetable",
      icon: Calendar,
      path: "/user/schedules",
      desc: "Weekly drills & training timetable",
    },
    {
      title: "Athletic Scorecard",
      icon: Trophy,
      path: "/user/performance",
      desc: "Coach evaluations & attendance",
    },
    {
      title: "View Vouchers",
      icon: FileText,
      path: "/user/vouchers",
      desc: "Check monthly & advance fee slips",
    },
    {
      title: "Upload Slip",
      icon: UploadCloud,
      path: "/user/upload-receipt",
      desc: "Submit payment proof for approval",
    },
    {
      title: "Pay in Advance",
      icon: Zap,
      path: "/user/advance-payment",
      desc: "Pay 1-12 months ahead & save fines",
    },
    {
      title: "Tournaments",
      icon: Trophy,
      path: "/user/events",
      desc: "Register for upcoming club leagues",
    },
    {
      title: "My Membership",
      icon: ShieldCheck,
      path: "/user/membership",
      desc: "Package details & plan status",
    },
  ];

  return (
    <DashboardLayout role="user">
      <div className="w-full">
        {/* =========================================================
            HEADER
        ========================================================= */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-px w-5 bg-orange-500" />
              <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-orange-500">
                Member Workspace
              </span>
            </div>

            <h1 className="mt-2 text-[22px] font-extrabold tracking-tight text-white md:text-[24px]">
              Welcome back, {user?.fullName || "Member"}
            </h1>

            <p className="mt-1 text-xs text-zinc-400">
              Review your membership standing, fee vouchers, and club facility access.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-2 text-[10.5px] text-zinc-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Auto-Sync (5s)</span>
            </div>
            {isMemberActive ? (
              <button
                onClick={() => navigate("/user/upload-receipt")}
                className="inline-flex items-center gap-2 rounded-none bg-orange-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-white"
              >
                <UploadCloud size={15} />
                Upload Slip
              </button>
            ) : (
              <button
                onClick={() => navigate("/user/membership")}
                className="inline-flex items-center gap-2 rounded-none bg-orange-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-white"
              >
                <ShieldCheck size={15} />
                My Membership
              </button>
            )}
          </div>
        </div>

        {/* =========================================================
            APPLICATION / MEMBERSHIP STATUS BANNER
        ========================================================= */}
        {!hasApplication ? (
          <div className="mb-6 border border-orange-500/30 bg-orange-500/10 p-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                <AlertCircle size={18} />
                No Active Membership Subscription
              </div>
              <p className="mt-1 text-xs text-zinc-300">
                You have not yet enrolled in a Sports Hub membership tier. Select a plan to access sports arenas and member privileges.
              </p>
            </div>
            <Link
              to="/user/membership"
              className="inline-flex items-center gap-2 rounded-none bg-orange-500 px-5 py-2.5 text-xs font-bold text-black uppercase transition hover:bg-white shrink-0"
            >
              Select Plan Inside Panel
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : !isMemberActive ? (
          <div className="mb-6 border border-amber-500/30 bg-amber-500/10 p-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Clock size={18} />
                Application Under Administrative Review — Features Restricted
              </div>
              <p className="mt-1 text-xs text-zinc-300">
                Your application for <span className="font-bold text-white">{membership?.PlanName}</span> is currently pending administrator verification. Panel modules (Monthly Fees, Advance Vouchers, Tournaments) will unlock once approved.
              </p>
            </div>
            <Link
              to="/user/membership"
              className="inline-flex items-center gap-2 rounded-none border border-amber-500/50 bg-amber-500/20 px-4 py-2 text-xs font-bold text-amber-300 uppercase shrink-0 transition hover:bg-amber-500 hover:text-black"
            >
              View Application
              <ArrowRight size={13} />
            </Link>
          </div>
        ) : null}

        {/* =========================================================
            STAT CARDS
        ========================================================= */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard
            title="Membership Status"
            value={membership?.MembershipStatus || (hasApplication ? "Pending" : "Inactive")}
            label={membership?.PlanName || "No package selected"}
            icon={ShieldCheck}
            tone={membership?.MembershipStatus === "Active" ? "emerald" : "orange"}
            changeType="neutral"
            change={membership?.MembershipNumber || "Temporary ID"}
          />

          <StatCard
            title="Monthly Fee"
            value={`Rs. ${(membership?.MonthlyFee ? Number(membership.MonthlyFee) : 0).toLocaleString()}`}
            label="Standard monthly subscription"
            icon={ReceiptText}
            tone="black"
            changeType="neutral"
            change={`${membership?.DurationMonths || 0} Months cycle`}
          />

          <StatCard
            title="Outstanding Dues"
            value={`Rs. ${(feeSummary?.totalOutstanding || 0).toLocaleString()}`}
            label={`${feeSummary?.unpaidVouchersCount || 0} unpaid voucher(s)`}
            icon={AlertCircle}
            tone={feeSummary?.totalOutstanding > 0 ? "red" : "emerald"}
            changeType={feeSummary?.overdueCount > 0 ? "down" : "neutral"}
            change={feeSummary?.overdueCount > 0 ? `${feeSummary.overdueCount} Overdue` : "All dues current"}
          />

          <StatCard
            title="Prepaid Months"
            value={feeSummary?.prepaidMonths?.length || 0}
            label="Paid in advance"
            icon={Zap}
            tone="orange"
            changeType="up"
            change="Advance Protection"
          />
        </div>

        {/* =========================================================
            QUICK ACTIONS GRID
        ========================================================= */}
        <section className="mt-6 border border-zinc-800 bg-[#121215] p-5">
          <div className="border-b border-zinc-800 pb-3 mb-4">
            <h2 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-white">
              <span className="text-orange-500">⚡</span>
              Quick Actions
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  onClick={() => navigate(action.path)}
                  className="group flex min-h-[110px] flex-col items-center justify-center gap-2 rounded-none border border-dashed border-zinc-700 bg-zinc-900/60 p-4 text-center transition-all duration-200 hover:border-orange-500 hover:bg-orange-500/5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-none bg-zinc-800 text-orange-500 transition duration-200 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-black">
                    <Icon size={18} />
                  </div>
                  <span className="text-xs font-bold text-zinc-200 group-hover:text-orange-400">
                    {action.title}
                  </span>
                  <span className="text-[10px] text-zinc-500 text-center line-clamp-1">
                    {action.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* =========================================================
            RECENT VOUCHERS & DIGITAL CARD PREVIEW
        ========================================================= */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.9fr)_minmax(320px,1.1fr)]">
          {/* RECENT VOUCHERS TABLE */}
          <section className="border border-zinc-800 bg-[#121215] overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                <ReceiptText size={16} className="text-orange-500" />
                Recent Fee Vouchers
              </h2>

              <button
                onClick={() => navigate("/user/vouchers")}
                className="text-xs font-bold text-orange-500 hover:text-white transition"
              >
                View All →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    <th className="p-3">Voucher #</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Period</th>
                    <th className="p-3">Total Payable</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {recentVouchers.length > 0 ? (
                    recentVouchers.map((v) => (
                      <tr key={v.VoucherID} className="hover:bg-zinc-900/40 transition">
                        <td className="p-3 font-mono font-bold text-orange-400">
                          {v.VoucherNumber}
                        </td>
                        <td className="p-3">
                          <span className="rounded-none bg-zinc-800 px-2 py-0.5 text-[9px] font-bold uppercase text-zinc-300">
                            {v.VoucherType}
                          </span>
                        </td>
                        <td className="p-3 text-zinc-300">
                          {v.VoucherType === "Advance"
                            ? "Advance"
                            : v.VoucherType === "Admission"
                            ? "Admission Fee"
                            : `${v.BillingMonth}/${v.BillingYear}`}
                        </td>
                        <td className="p-3 font-bold text-white">
                          Rs. {Number(v.totalPayable || v.BaseAmount).toLocaleString()}
                        </td>
                        <td className="p-3 text-zinc-400">
                          {new Date(v.DueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </td>
                        <td className="p-3">
                          <StatusBadge status={v.VoucherStatus} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-xs text-zinc-500">
                        No vouchers generated yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* DIGITAL CARD PREVIEW */}
          <section className="border border-zinc-800 bg-[#121215] p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <CreditCard size={15} className="text-orange-500" />
                Digital Membership Card
              </h2>
              <button
                onClick={() => navigate("/user/membership")}
                className="text-xs font-bold text-orange-500 hover:text-white"
              >
                Full Card →
              </button>
            </div>

            {/* CARD UI */}
            <div className="keep-dark my-4 rounded-none border border-orange-500/40 bg-gradient-to-br from-zinc-900 via-black to-[#1a1208] p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 bg-orange-500/10 rounded-full blur-2xl" />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-orange-500/40 bg-zinc-900 p-0.5">
                    <img
                      src="/sports-hub-mark.svg"
                      alt="Sports Hub"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="font-black text-xs uppercase tracking-tight text-white">
                    Sports Hub
                  </span>
                </div>
                <StatusBadge status={membership?.MembershipStatus || "Pending"} />
              </div>

              <div className="mt-6 relative z-10">
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Member Name
                </div>
                <div className="text-base font-black text-white truncate">
                  {user?.fullName}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3 relative z-10 text-xs">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-zinc-500">
                    Card ID
                  </div>
                  <div className="font-mono font-bold text-orange-400">
                    {membership?.MembershipNumber || "PENDING"}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-wider text-zinc-500">
                    Plan Tier
                  </div>
                  <div className="font-bold text-white">
                    {membership?.PlanName || "Standard"}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-zinc-500 italic text-center">
              * Show this digital membership card or barcode at club turnstiles and sports courts for verification.
            </p>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default UserOverview;
