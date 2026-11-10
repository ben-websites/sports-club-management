import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import {
  AlertTriangle,
  BarChart3,
  Box,
  ClipboardCheck,
  DollarSign,
  RefreshCw,
  TrendingUp,
  Trophy,
  UserCog,
  Users,
} from "lucide-react";

const money = (value) => `PKR ${Number(value || 0).toLocaleString()}`;

function AdminReportsAnalytics() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/reports/admin");
      if (res.data.success) setReport(res.data);
      else setError(res.data.message || "Report could not be generated.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load the club analytics report.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <PageLoader message="Generating Comprehensive Club Analytics & Executive Report..." />
      </DashboardLayout>
    );
  }

  if (error || !report) {
    return (
      <DashboardLayout role="admin">
        <div className="border border-red-500/30 bg-red-500/5 p-8 text-center">
          <AlertTriangle className="mx-auto text-red-400" size={26} />
          <h2 className="mt-3 text-sm font-black uppercase tracking-wider text-red-300">Report unavailable</h2>
          <p className="mt-1 text-xs text-zinc-400">{error || "No report data found."}</p>
          <button
            onClick={load}
            className="mt-4 inline-flex items-center gap-2 bg-orange-500 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-black hover:bg-white transition"
          >
            <RefreshCw size={13} /> Try again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const { members, revenue, revenueTrend, sportsRanking, equipment, attendance, events, coaches } = report;
  const maxCollected = Math.max(1, ...revenueTrend.map((m) => m.Collected));

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="border border-zinc-800 bg-[#121215] p-6 shadow-xl no-print">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="text-orange-500" size={24} />
                <h1 className="text-xl font-extrabold uppercase tracking-tight text-white sm:text-2xl">
                  Executive Reports &amp; Club Analytics
                </h1>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                Aggregated institutional metrics across memberships, revenue collections, sports arenas, coaching staff
                and tournaments.
              </p>
            </div>

            <div className="flex gap-2 self-start md:self-auto">
              <button
                onClick={load}
                className="inline-flex items-center gap-2 border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-zinc-200 hover:bg-zinc-700 transition"
              >
                <RefreshCw size={14} /> Refresh
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-orange-600 hover:text-black transition"
              >
                <BarChart3 size={14} /> Print / PDF Report
              </button>
            </div>
          </div>
        </div>

        {/* PRINTABLE HEADER */}
        <div className="hidden print:block border-b border-zinc-400 pb-4 mb-6">
          <h1 className="text-2xl font-black text-black uppercase">SPORTS HUB MANAGEMENT SYSTEM</h1>
          <p className="text-xs text-zinc-600">Executive Comprehensive Audit &amp; Operational Summary Report</p>
          <div className="text-[10px] text-zinc-500 mt-1">Generated: {new Date().toLocaleString()}</div>
        </div>

        {/* KPI SUMMARY */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="border border-zinc-800 bg-[#121215] p-5 shadow-lg">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Registered Athletes</span>
              <Users size={18} className="text-orange-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">{members?.TotalMembers || 0}</div>
            <div className="mt-1 text-[10px] font-bold text-emerald-400">
              {members?.ActiveMemberships || 0} active · {members?.PendingMemberships || 0} pending
            </div>
          </div>

          <div className="border border-zinc-800 bg-[#121215] p-5 shadow-lg">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Revenue Paid</span>
              <DollarSign size={18} className="text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">{money(revenue?.TotalCollected)}</div>
            <div className="mt-1 text-[10px] text-zinc-400">
              {revenue?.PaidTransactions || 0} cleared receipts · {money(revenue?.OutstandingDues)} due
            </div>
          </div>

          <div className="border border-zinc-800 bg-[#121215] p-5 shadow-lg">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Attendance Rate</span>
              <ClipboardCheck size={18} className="text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">{attendance?.Rate || 0}%</div>
            <div className="mt-1 text-[10px] text-zinc-400">
              {attendance?.AttendedSessions || 0}/{attendance?.TotalSessions || 0} marked sessions
            </div>
          </div>

          <div className="border border-zinc-800 bg-[#121215] p-5 shadow-lg">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Tournaments &amp; Events</span>
              <Trophy size={18} className="text-orange-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {(events?.TotalTournaments || 0) + (events?.UpcomingEvents || 0)}
            </div>
            <div className="mt-1 text-[10px] text-zinc-400">
              {events?.TotalMatches || 0} matches · {events?.PendingTournaments || 0} awaiting approval
            </div>
          </div>
        </div>

        {/* REVENUE TREND */}
        <div className="border border-zinc-800 bg-[#121215] p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-tight text-white">
              <TrendingUp size={16} className="text-emerald-400" /> 6-Month Collection Trend
            </h3>
            <span className="text-[10px] font-bold uppercase text-zinc-400">
              {revenue?.PendingVerifications || 0} slips awaiting verification
            </span>
          </div>

          <div className="mt-6 flex h-44 items-end gap-3">
            {revenueTrend.map((m) => (
              <div key={m.label} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[9.5px] font-bold text-zinc-300">
                  {m.Collected > 0 ? money(m.Collected) : "—"}
                </span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-800 to-emerald-400 transition-all duration-500"
                    style={{ height: `${Math.max(4, Math.round((m.Collected / maxCollected) * 100))}%` }}
                    title={`${m.Receipts} receipts`}
                  />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SPORTS POPULARITY + FINANCIAL HEALTH */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4 border border-zinc-800 bg-[#121215] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-tight text-white">
                <TrendingUp size={16} className="text-orange-500" /> Sports Arena Popularity
              </h3>
              <span className="text-[10px] font-bold uppercase text-zinc-400">Top 10</span>
            </div>

            <div className="space-y-3">
              {sportsRanking.map((s, idx) => {
                const maxEnroll = Math.max(1, sportsRanking[0]?.EnrolledAthletes || 1);
                const pct = Math.round((s.EnrolledAthletes / maxEnroll) * 100);
                return (
                  <div key={s.SportID} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="truncate text-zinc-200">
                        <strong className="mr-2 text-orange-500">#{idx + 1}</strong>
                        {s.SportName}
                      </span>
                      <span className="shrink-0 font-bold text-white">{s.EnrolledAthletes} athletes</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-800">
                      <div
                        className="h-full bg-gradient-to-r from-orange-600 to-amber-400 transition-all duration-500"
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {sportsRanking.length === 0 && (
                <div className="py-6 text-center text-[11px] text-zinc-500">No sports registered yet.</div>
              )}
            </div>
          </div>

          <div className="space-y-4 border border-zinc-800 bg-[#121215] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-tight text-white">
                <DollarSign size={16} className="text-emerald-400" /> Financial &amp; Ledger Summary
              </h3>
              <span className="text-[10px] font-bold uppercase text-zinc-400">Billing status</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border border-zinc-800 bg-zinc-900 p-3">
                <span className="font-semibold text-zinc-400">Total verified collections</span>
                <span className="font-bold text-emerald-400">{money(revenue?.TotalCollected)}</span>
              </div>
              <div className="flex justify-between border border-zinc-800 bg-zinc-900 p-3">
                <span className="font-semibold text-zinc-400">Outstanding dues</span>
                <span className="font-bold text-amber-400">{money(revenue?.OutstandingDues)}</span>
              </div>
              <div className="flex justify-between border border-zinc-800 bg-zinc-900 p-3">
                <span className="font-semibold text-zinc-400">Late fines billed</span>
                <span className="font-bold text-red-400">{money(revenue?.TotalFines)}</span>
              </div>
              <div className="flex justify-between border border-zinc-800 bg-zinc-900 p-3">
                <span className="font-semibold text-zinc-400">Voucher collection rate</span>
                <span className="font-bold text-white">{revenue?.CollectionRate || 0}%</span>
              </div>

              <div className="space-y-2 border-t border-zinc-800 pt-3">
                <div className="text-[10px] font-bold uppercase text-zinc-400">Membership health</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="border border-zinc-800 bg-zinc-900 p-2.5">
                    <div className="text-lg font-black text-emerald-400">{members?.ActiveMemberships || 0}</div>
                    <div className="text-[9px] font-bold uppercase text-zinc-400">Active</div>
                  </div>
                  <div className="border border-zinc-800 bg-zinc-900 p-2.5">
                    <div className="text-lg font-black text-amber-400">{members?.PendingMemberships || 0}</div>
                    <div className="text-[9px] font-bold uppercase text-zinc-400">Pending</div>
                  </div>
                  <div className="border border-zinc-800 bg-zinc-900 p-2.5">
                    <div className="text-lg font-black text-red-400">{members?.ExpiredMemberships || 0}</div>
                    <div className="text-[9px] font-bold uppercase text-zinc-400">Expired</div>
                  </div>
                </div>
                <div className="flex justify-between pt-1 text-[10.5px] text-zinc-500">
                  <span>{members?.PendingApplications || 0} applications awaiting review</span>
                  <span>{members?.TotalCoaches || 0} coaching accounts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COACH PERFORMANCE */}
        <div className="border border-zinc-800 bg-[#121215] p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-tight text-white">
              <UserCog size={16} className="text-sky-400" /> Coaching Staff Performance
            </h3>
            <span className="text-[10px] font-bold uppercase text-zinc-400">{coaches.length} active coaches</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[11.5px]">
              <thead>
                <tr className="border-b border-zinc-800 text-[9px] uppercase tracking-wider text-zinc-500">
                  <th className="py-2">Coach</th>
                  <th className="py-2">Code</th>
                  <th className="py-2">Sport</th>
                  <th className="py-2 text-center">Students</th>
                  <th className="py-2 text-center">Trainers</th>
                  <th className="py-2 text-center">Sessions</th>
                  <th className="py-2 text-center">Tournaments</th>
                  <th className="py-2 text-right">Pending</th>
                </tr>
              </thead>
              <tbody>
                {coaches.map((c) => (
                  <tr key={c.CoachID} className="border-b border-zinc-800/60">
                    <td className="py-2.5 font-bold text-zinc-200">{c.FullName}</td>
                    <td className="py-2.5 text-zinc-500">{c.EmployeeCode || "—"}</td>
                    <td className="py-2.5 text-zinc-400">{c.SportName || "Unassigned"}</td>
                    <td className="py-2.5 text-center font-bold text-orange-400">{c.Students || 0}</td>
                    <td className="py-2.5 text-center text-zinc-300">{c.Trainers || 0}</td>
                    <td className="py-2.5 text-center text-zinc-300">{c.SessionsMarked || 0}</td>
                    <td className="py-2.5 text-center text-zinc-300">{c.Tournaments || 0}</td>
                    <td className="py-2.5 text-right font-bold text-amber-400">{c.PendingApprovals || 0}</td>
                  </tr>
                ))}
                {coaches.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-zinc-500">
                      No active coaching staff found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* EQUIPMENT */}
        <div className="space-y-4 border border-zinc-800 bg-[#121215] p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-tight text-white">
              <Box size={16} className="text-orange-500" /> Equipment &amp; Physical Assets
            </h3>
            <span className="text-[10px] font-bold uppercase text-zinc-400">
              {equipment?.PendingRequests || 0} pending approval
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-3">
            <div className="border border-zinc-800 bg-zinc-900 p-4">
              <div className="text-[10px] font-bold uppercase text-zinc-400">Total gear stock</div>
              <div className="mt-1 text-xl font-bold text-white">{equipment?.TotalInventory || 0} units</div>
            </div>
            <div className="border border-zinc-800 bg-zinc-900 p-4">
              <div className="text-[10px] font-bold uppercase text-zinc-400">Ready in lockers</div>
              <div className="mt-1 text-xl font-bold text-emerald-400">{equipment?.InStock || 0} units</div>
            </div>
            <div className="border border-zinc-800 bg-zinc-900 p-4">
              <div className="text-[10px] font-bold uppercase text-zinc-400">Checked out</div>
              <div className="mt-1 text-xl font-bold text-orange-400">{equipment?.CurrentlyIssued || 0} units</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminReportsAnalytics;
