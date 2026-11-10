import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import {
  AlertTriangle,
  BarChart3,
  CalendarCheck,
  CreditCard,
  RefreshCw,
  ReceiptText,
  ShieldCheck,
  Trophy,
  TrendingUp,
  Wallet,
} from "lucide-react";

const money = (value) => `Rs ${Number(value || 0).toLocaleString()}`;

function UserReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/reports/me");
      if (res.data.success) setReport(res.data);
      else setError(res.data.message || "Report could not be generated.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your report.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <DashboardLayout role="user">
        <PageLoader message="Building your personal performance report..." />
      </DashboardLayout>
    );
  }

  if (error || !report) {
    return (
      <DashboardLayout role="user">
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

  const { membership, fees, payments, paymentTrend, attendance, sports, performance } = report;
  const maxPaid = Math.max(1, ...paymentTrend.map((m) => m.Paid));

  const kpis = [
    {
      label: "Outstanding Dues",
      value: money(fees.OutstandingAmount),
      hint: `${fees.OpenVouchers || 0} open voucher(s)`,
      icon: ReceiptText,
      tone: "text-amber-400",
    },
    {
      label: "Lifetime Paid",
      value: money(payments.TotalPaid),
      hint: `${payments.ApprovedPayments || 0} cleared receipt(s)`,
      icon: Wallet,
      tone: "text-emerald-400",
    },
    {
      label: "Attendance Rate",
      value: `${attendance.Rate || 0}%`,
      hint: `${attendance.AttendedSessions || 0}/${attendance.TotalSessions || 0} sessions`,
      icon: CalendarCheck,
      tone: "text-sky-400",
    },
    {
      label: "Sports Enrolled",
      value: sports.length,
      hint: `${performance.length} evaluation(s) on file`,
      icon: Trophy,
      tone: "text-orange-400",
    },
  ];

  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="border border-zinc-800 bg-[#121215] p-6 shadow-xl no-print">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 size={22} className="text-orange-500" />
                <h1 className="text-xl font-extrabold uppercase tracking-tight text-white sm:text-2xl">
                  My Reports &amp; Analytics
                </h1>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                Personal statement of fees, payments, attendance and coaching evaluations for{" "}
                {membership?.MembershipNumber || "your account"}.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={load}
                className="inline-flex items-center gap-2 border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-zinc-200 hover:bg-zinc-700 transition"
              >
                <RefreshCw size={14} /> Refresh
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-orange-600 hover:text-black transition"
              >
                <ReceiptText size={14} /> Print / PDF
              </button>
            </div>
          </div>
        </div>

        {/* PRINT HEADER */}
        <div className="hidden print:block border-b border-zinc-400 pb-3">
          <h1 className="text-2xl font-black uppercase text-black">SPORTS HUB — MEMBER STATEMENT</h1>
          <p className="text-xs text-zinc-600">
            {membership?.PlanName || "Member"} · generated {new Date().toLocaleString()}
          </p>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="border border-zinc-800 bg-[#121215] p-4 shadow-lg">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[9.5px] font-bold uppercase tracking-[0.16em]">{kpi.label}</span>
                  <Icon size={16} className={kpi.tone} />
                </div>
                <div className="mt-2 text-lg font-black text-white">{kpi.value}</div>
                <div className="mt-1 text-[10px] text-zinc-500">{kpi.hint}</div>
              </div>
            );
          })}
        </div>

        {/* MEMBERSHIP + FEES */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="border border-zinc-800 bg-[#121215] p-6">
            <h3 className="flex items-center gap-2 border-b border-zinc-800 pb-3 text-sm font-extrabold uppercase tracking-tight text-white">
              <ShieldCheck size={15} className="text-orange-500" /> Membership Statement
            </h3>
            <div className="mt-4 space-y-2.5 text-[11.5px]">
              {[
                ["Membership No", membership?.MembershipNumber || "—"],
                ["Plan", membership?.PlanName || "—"],
                ["Status", membership?.MembershipStatus || "—"],
                ["Monthly Fee", money(membership?.MonthlyFee)],
                ["Admission Fee", money(membership?.AdmissionFee)],
                ["Valid From", membership?.StartDate ? new Date(membership.StartDate).toLocaleDateString() : "—"],
                ["Valid Until", membership?.EndDate ? new Date(membership.EndDate).toLocaleDateString() : "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b border-zinc-800/60 pb-2 last:border-0">
                  <span className="text-[9.5px] uppercase tracking-wider text-zinc-500">{label}</span>
                  <span className="font-bold text-zinc-200">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-zinc-800 bg-[#121215] p-6">
            <h3 className="flex items-center gap-2 border-b border-zinc-800 pb-3 text-sm font-extrabold uppercase tracking-tight text-white">
              <CreditCard size={15} className="text-emerald-400" /> Fee Ledger Health
            </h3>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="border border-emerald-500/25 bg-emerald-500/5 p-2.5">
                <div className="text-lg font-black text-emerald-400">{fees.PaidVouchers || 0}</div>
                <div className="text-[9px] uppercase font-bold text-emerald-400/80">Paid</div>
              </div>
              <div className="border border-amber-500/25 bg-amber-500/5 p-2.5">
                <div className="text-lg font-black text-amber-400">{fees.OpenVouchers || 0}</div>
                <div className="text-[9px] uppercase font-bold text-amber-400/80">Open</div>
              </div>
              <div className="border border-zinc-700 bg-zinc-900 p-2.5">
                <div className="text-lg font-black text-zinc-200">{fees.TotalVouchers || 0}</div>
                <div className="text-[9px] uppercase font-bold text-zinc-400">Total</div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-[11.5px]">
              <div className="flex justify-between border-b border-zinc-800/60 pb-2">
                <span className="text-zinc-500">Settled amount</span>
                <span className="font-bold text-emerald-400">{money(fees.PaidAmount)}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800/60 pb-2">
                <span className="text-zinc-500">Outstanding amount</span>
                <span className="font-bold text-amber-400">{money(fees.OutstandingAmount)}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800/60 pb-2">
                <span className="text-zinc-500">Late fines billed</span>
                <span className="font-bold text-red-400">{money(fees.TotalFines)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Collection progress</span>
                <span className="font-bold text-white">{fees.CollectionRate || 0}%</span>
              </div>
            </div>

            <div className="mt-3 h-2 w-full bg-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.min(100, fees.CollectionRate || 0)}%` }}
              />
            </div>
          </div>
        </div>

        {/* PAYMENT TREND */}
        <div className="border border-zinc-800 bg-[#121215] p-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-tight text-white">
              <TrendingUp size={15} className="text-orange-500" /> Last 6 Months Payments
            </h3>
            <span className="text-[10px] font-bold uppercase text-zinc-400">
              {payments.PendingPayments || 0} pending · {payments.RejectedPayments || 0} rejected
            </span>
          </div>

          <div className="mt-6 flex h-40 items-end gap-3">
            {paymentTrend.map((m) => (
              <div key={m.label} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[9.5px] font-bold text-zinc-300">{m.Paid > 0 ? money(m.Paid) : "—"}</span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full bg-gradient-to-t from-orange-700 to-amber-400 transition-all duration-500"
                    style={{ height: `${Math.max(4, Math.round((m.Paid / maxPaid) * 100))}%` }}
                  />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SPORTS BREAKDOWN */}
        <div className="border border-zinc-800 bg-[#121215] p-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-tight text-white">
              <Trophy size={15} className="text-orange-500" /> Sport-wise Training Record
            </h3>
            <span className="text-[10px] font-bold uppercase text-zinc-400">{sports.length} enrolment(s)</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[11.5px]">
              <thead>
                <tr className="border-b border-zinc-800 text-[9px] uppercase tracking-wider text-zinc-500">
                  <th className="py-2">Sport</th>
                  <th className="py-2">Coach</th>
                  <th className="py-2">Level</th>
                  <th className="py-2 text-center">Present</th>
                  <th className="py-2 text-center">Missed</th>
                  <th className="py-2 text-center">Rate</th>
                  <th className="py-2 text-right">Latest Score</th>
                </tr>
              </thead>
              <tbody>
                {sports.map((s) => {
                  const total = Number(s.PresentSessions || 0) + Number(s.MissedSessions || 0);
                  const rate = total > 0 ? Math.round((Number(s.PresentSessions) / total) * 100) : 0;
                  return (
                    <tr key={s.SportID} className="border-b border-zinc-800/60">
                      <td className="py-2.5 font-bold text-zinc-200">{s.SportName}</td>
                      <td className="py-2.5 text-zinc-400">{s.CoachName || "Not assigned"}</td>
                      <td className="py-2.5 text-zinc-400">{s.SkillLevel || "—"}</td>
                      <td className="py-2.5 text-center text-emerald-400 font-bold">{s.PresentSessions || 0}</td>
                      <td className="py-2.5 text-center text-red-400 font-bold">{s.MissedSessions || 0}</td>
                      <td className="py-2.5 text-center text-zinc-300 font-bold">{rate}%</td>
                      <td className="py-2.5 text-right font-bold text-orange-400">
                        {s.LatestScore != null ? Number(s.LatestScore).toFixed(1) : "—"}
                      </td>
                    </tr>
                  );
                })}
                {sports.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-zinc-500">
                      You are not enrolled in any sport yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* COACH EVALUATIONS */}
        <div className="border border-zinc-800 bg-[#121215] p-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-tight text-white">
              <CalendarCheck size={15} className="text-sky-400" /> Coaching Evaluations
            </h3>
            <span className="text-[10px] font-bold uppercase text-zinc-400">{performance.length} report(s)</span>
          </div>

          <div className="mt-4 space-y-3">
            {performance.slice(0, 6).map((p) => (
              <div key={p.PerformanceID} className="border border-zinc-800/70 bg-zinc-900/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-bold text-white">{p.SportName || "General"}</div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                    {new Date(p.EvaluationDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  {[
                    ["Fitness", p.FitnessScore, "text-sky-400"],
                    ["Skill", p.SkillScore, "text-emerald-400"],
                    ["Attendance", p.AttendanceScore, "text-amber-400"],
                  ].map(([label, score, tone]) => (
                    <div key={label} className="border border-zinc-800 bg-[#121215] py-2">
                      <div className={`text-sm font-black ${tone}`}>{score ?? "—"}</div>
                      <div className="text-[9px] uppercase tracking-wider text-zinc-500">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-4 text-[10.5px] text-zinc-400">
                  <span>
                    Matches: <strong className="text-zinc-200">{p.MatchesPlayed || 0}</strong>
                  </span>
                  <span>
                    Won: <strong className="text-emerald-400">{p.MatchesWon || 0}</strong>
                  </span>
                </div>
                {p.CoachFeedback && (
                  <p className="mt-2 border-l-2 border-orange-500/60 pl-2 text-[11px] italic text-zinc-400">
                    “{p.CoachFeedback}”
                  </p>
                )}
                {p.NextMilestones && (
                  <p className="mt-1 text-[10.5px] text-zinc-500">Next milestones: {p.NextMilestones}</p>
                )}
              </div>
            ))}
            {performance.length === 0 && (
              <div className="py-6 text-center text-[11px] text-zinc-500">
                No coaching evaluation has been recorded for you yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default UserReports;
