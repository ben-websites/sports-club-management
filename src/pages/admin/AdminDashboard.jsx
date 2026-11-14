import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import startPolling from "../../services/polling";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import StatCard from "../../components/dashboard/StatCard";
import StatusBadge from "../../components/dashboard/StatusBadge";
import SummaryBox from "../../components/dashboard/SummaryBox";

import {
  Users,
  ShieldCheck,
  CreditCard,
  ReceiptText,
  AlertCircle,
  Clock,
  UserCheck,
  Megaphone,
  UserPlus,
  FileText,
  CheckCircle2,
  DollarSign,
  Trophy,
  Zap,
  Award,
  Shield,
  ClipboardCheck,
  Box,
  BarChart3,
  Dumbbell,
} from "lucide-react";

const quickActions = [
  {
    title: "Coaches Faculty",
    icon: Award,
    path: "/admin/coaches",
  },
  {
    title: "Sports Teams",
    icon: Shield,
    path: "/admin/teams",
  },
  {
    title: "Tournaments & Matches",
    icon: Trophy,
    path: "/admin/tournaments",
  },
  {
    title: "Attendance Registry",
    icon: ClipboardCheck,
    path: "/admin/attendance",
  },
  {
    title: "Equipment & Gear",
    icon: Box,
    path: "/admin/equipment",
  },
  {
    title: "Reports & Analytics",
    icon: BarChart3,
    path: "/admin/reports",
  },
  {
    title: "Generate Vouchers",
    icon: ReceiptText,
    path: "/admin/vouchers",
  },
  {
    title: "Review Applications",
    icon: UserCheck,
    path: "/admin/memberships",
  },
];

function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard(true);

    // Live auto-refresh (skipped while the tab is hidden)
    return startPolling(() => fetchDashboard(false));
  }, []);

  const fetchDashboard = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      setError("");

      const response = await api.get("/admin/dashboard");
      if (response.data.success) {
        setDashboardData(response.data);
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      if (isInitial) setError(err.response?.data?.message || "Failed to load admin dashboard data.");
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <PageLoader message="Loading club administration dashboard..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="admin">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="max-w-md rounded-none border border-red-500/30 bg-[#121215] p-6 text-center shadow-2xl">
            <AlertCircle size={32} className="mx-auto text-red-500" />
            <h2 className="mt-3 text-base font-bold text-white">
              Failed to Load Dashboard
            </h2>
            <p className="mt-2 text-xs text-zinc-400">{error}</p>
            <button
              onClick={fetchDashboard}
              className="mt-5 rounded-none bg-orange-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-white"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = dashboardData?.stats || {};
  const recentApplications = dashboardData?.recentApplications || [];
  const recentPayments = dashboardData?.recentPayments || [];

  return (
    <DashboardLayout role="admin">
      <div className="w-full">
        {/* =========================================================
            PAGE HEADER
        ========================================================= */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-px w-5 bg-orange-500" />
              <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-orange-500">
                Administration
              </span>
            </div>

            <h1 className="mt-2 text-[22px] font-extrabold tracking-tight text-white md:text-[24px]">
              Club Overview & Control Center
            </h1>

            <p className="mt-1 text-xs text-zinc-400">
              Monitor active members, fee vouchers, receipt approvals, and club revenue.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/vouchers")}
            className="inline-flex items-center gap-2 rounded-none bg-orange-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-orange-500/10 transition hover:bg-white"
          >
            <ReceiptText size={15} />
            Generate Monthly Fees
          </button>
        </div>

        {/* =========================================================
            STAT CARDS
        ========================================================= */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard
            title="Total Members"
            value={stats.TotalUsers || 0}
            label={`${stats.TotalRegisteredUsers || 0} accounts joined this club`}
            icon={Users}
            tone="black"
            changeType="neutral"
            change="Paid Memberships"
          />

          <StatCard
            title="Active Members"
            value={stats.ActiveMembers || 0}
            label="Enrolled in club plans"
            icon={ShieldCheck}
            tone="orange"
            changeType="up"
            change="Active Subscriptions"
          />

          <StatCard
            title="Total Revenue"
            value={`Rs. ${(stats.TotalRevenue ? Number(stats.TotalRevenue) : 0).toLocaleString()}`}
            label="Verified payments"
            icon={DollarSign}
            tone="emerald"
            changeType="up"
            change="Verified Collections"
          />

          <StatCard
            title="Pending Verification"
            value={(stats.PendingApplications || 0) + (stats.PendingPayments || 0)}
            label={`${stats.PendingApplications || 0} apps · ${stats.PendingPayments || 0} slips`}
            icon={Clock}
            tone="red"
            changeType="down"
            change="Requires Admin Action"
          />
        </div>

        {/* =========================================================
            QUICK ACTIONS
        ========================================================= */}
        <section className="mt-6 border border-zinc-800 bg-[#121215] shadow-xl">
          <div className="flex items-center border-b border-zinc-800 px-5 py-3.5">
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
              <span className="text-orange-500">⚡</span>
              Quick Management Shortcuts
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 p-5 md:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  type="button"
                  onClick={() => navigate(action.path)}
                  className="group flex min-h-[110px] flex-col items-center justify-center gap-2.5 rounded-none border border-dashed border-zinc-700 bg-zinc-900/50 px-4 text-center transition-all duration-200 hover:border-orange-500 hover:bg-orange-500/5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-none bg-zinc-800 text-orange-500 transition duration-200 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-black">
                    <Icon size={20} />
                  </div>
                  <span className="text-xs font-bold text-zinc-200 group-hover:text-orange-400">
                    {action.title}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* =========================================================
            RECENT APPLICATIONS & PAYMENTS
        ========================================================= */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
          {/* RECENT APPLICATIONS */}
          <section className="border border-zinc-800 bg-[#121215] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                <UserCheck size={16} className="text-orange-500" />
                Recent Membership Applications
              </h2>

              <button
                onClick={() => navigate("/admin/memberships")}
                className="text-xs font-bold text-orange-500 hover:text-white transition"
              >
                View All →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    <th className="p-3">ID</th>
                    <th className="p-3">Applicant</th>
                    <th className="p-3">Package</th>
                    <th className="p-3">Fee</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {recentApplications.length > 0 ? (
                    recentApplications.map((app) => (
                      <tr key={app.ApplicationID} className="hover:bg-zinc-900/40 transition">
                        <td className="p-3 font-mono font-bold text-orange-400">
                          #{String(app.ApplicationID).padStart(4, "0")}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-white">{app.FullName}</div>
                          <div className="text-[10px] text-zinc-400">{app.Email}</div>
                        </td>
                        <td className="p-3 text-zinc-300 font-medium">
                          {app.PlanName}
                        </td>
                        <td className="p-3 font-mono text-zinc-300">
                          Rs. {Number(app.MonthlyFee).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <StatusBadge status={app.ApplicationStatus} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-xs text-zinc-500">
                        No applications pending.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* RECENT PAYMENT RECEIPTS */}
          <section className="border border-zinc-800 bg-[#121215] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                <CreditCard size={16} className="text-orange-500" />
                Recent Fee Receipts
              </h2>

              <button
                onClick={() => navigate("/admin/payments")}
                className="text-xs font-bold text-orange-500 hover:text-white transition"
              >
                Review →
              </button>
            </div>

            <div className="space-y-3 p-5">
              {recentPayments.length > 0 ? (
                recentPayments.map((pay) => (
                  <div
                    key={pay.PaymentID}
                    className="flex items-center justify-between border border-zinc-800 bg-zinc-900/60 p-3 text-xs transition hover:border-orange-500/40"
                  >
                    <div>
                      <div className="font-bold text-white">{pay.FullName}</div>
                      <div className="text-[10px] text-zinc-400">
                        Voucher #{pay.VoucherNumber} · {pay.PaymentMethod}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-orange-400">
                        Rs. {Number(pay.Amount).toLocaleString()}
                      </div>
                      <div className="mt-0.5">
                        <StatusBadge status={pay.PaymentStatus} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-xs text-zinc-500">
                  No payment receipts submitted recently.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* =========================================================
            SUMMARY BOXES
        ========================================================= */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <SummaryBox
            label="Total Members"
            value={stats.TotalUsers || 0}
            subtext="With a membership in this club"
          />
          <SummaryBox
            label="Pending Applications"
            value={stats.PendingApplications || 0}
            subtext="Awaiting approval"
          />
          <SummaryBox
            label="Pending Payments"
            value={stats.PendingPayments || 0}
            subtext="Receipts to verify"
          />
          <SummaryBox
            label="Overdue Vouchers"
            value={stats.overdueCount || 0}
            subtext={`Fines: Rs. ${(stats.overdueFinesTotal || 0).toLocaleString()}`}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;
