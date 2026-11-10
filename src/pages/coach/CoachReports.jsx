import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import {
  AlertTriangle,
  BarChart3,
  Box,
  CalendarCheck,
  ClipboardCheck,
  RefreshCw,
  ReceiptText,
  TrendingUp,
  Trophy,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";

const money = (value) => `Rs ${Number(value || 0).toLocaleString()}`;

function CoachReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/reports/coach");
      if (res.data.success) setReport(res.data);
      else setError(res.data.message || "Report could not be generated.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load the coaching report.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <DashboardLayout role="coach">
        <PageLoader message="Compiling coaching analytics..." />
      </DashboardLayout>
    );
  }

  if (error || !report) {
    return (
      <DashboardLayout role="coach">
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

  const { coach, kpis, attendance, attendanceTrend, students, tournaments, trainers, payroll } = report;
  const maxSessions = Math.max(1, ...attendanceTrend.map((m) => m.Sessions));

  const cards = [
    { label: "Active Students", value: kpis.Students ?? 0, hint: `${kpis.Schedules || 0} schedules`, icon: Users, tone: "text-orange-400" },
    { label: "Attendance Rate", value: `${attendance.Rate || 0}%`, hint: `${attendance.AttendedSessions || 0}/${attendance.TotalSessions || 0}`, icon: CalendarCheck, tone: "text-emerald-400" },
    { label: "Tournaments", value: kpis.Tournaments ?? 0, hint: `${kpis.PendingTournaments || 0} awaiting approval`, icon: Trophy, tone: "text-amber-400" },
    { label: "Gear Units", value: kpis.EquipmentUnits ?? 0, hint: `${kpis.EquipmentOut || 0} checked out`, icon: Box, tone: "text-sky-400" },
    { label: "Avg Fitness", value: kpis.AvgFitness, hint: `${kpis.Evaluations || 0} evaluations`, icon: ClipboardCheck, tone: "text-emerald-400" },
    { label: "Avg Skill", value: kpis.AvgSkill, hint: `${kpis.Trainers || 0} trainers`, icon: UserCheck, tone: "text-violet-400" },
  ];

  return (
    <DashboardLayout role="coach">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="border border-zinc-800 bg-[#121215] p-6 shadow-xl no-print">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 size={22} className="text-orange-500" />
                <h1 className="text-xl font-extrabold uppercase tracking-tight text-white sm:text-2xl">
                  Coaching Reports &amp; Analytics
                </h1>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                {coach.SportName || "Sport"} · {coach.EmployeeCode || "COACH"} · generated{" "}
                {new Date(report.generatedAt).toLocaleString()}
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
          <h1 className="text-2xl font-black uppercase text-black">SPORTS HUB — COACHING REPORT</h1>
          <p className="text-xs text-zinc-600">
            {coach.FullName} · {coach.SportName} · generated {new Date().toLocaleString()}
          </p>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="border border-zinc-800 bg-[#121215] p-4 shadow-lg">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[9.5px] font-bold uppercase tracking-[0.16em]">{card.label}</span>
                  <Icon size={16} className={card.tone} />
                </div>
                <div className="mt-2 text-lg font-black text-white">{card.value}</div>
                <div className="mt-1 text-[10px] text-zinc-500">{card.hint}</div>
              </div>
            );
          })}
        </div>

        {/* ATTENDANCE TREND */}
        <div className="border border-zinc-800 bg-[#121215] p-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-tight text-white">
              <TrendingUp size={15} className="text-orange-500" /> 6-Month Attendance Trend
            </h3>
            <span className="text-[10px] font-bold uppercase text-zinc-400">
              {attendance.MissedSessions || 0} missed sessions recorded
            </span>
          </div>

          <div className="mt-6 flex h-44 items-end gap-3">
            {attendanceTrend.map((m) => (
              <div key={m.label} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[9.5px] font-bold text-zinc-300">{m.Sessions > 0 ? `${m.Rate}%` : "—"}</span>
                <div className="flex w-full flex-1 items-end gap-1">
                  <div
                    className="flex-1 bg-zinc-800"
                    style={{ height: `${Math.max(4, Math.round((m.Sessions / maxSessions) * 100))}%` }}
                    title={`${m.Sessions} sessions marked`}
                  />
                  <div
                    className="flex-1 bg-gradient-to-t from-emerald-700 to-emerald-400"
                    style={{ height: `${Math.max(4, Math.round((m.Present / maxSessions) * 100))}%` }}
                    title={`${m.Present} present`}
                  />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">{m.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 text-[9.5px] uppercase tracking-wider text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-3 bg-zinc-700" /> Marked
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-3 bg-emerald-500" /> Present
            </span>
          </div>
        </div>

        {/* STUDENT LEADERBOARD */}
        <div className="border border-zinc-800 bg-[#121215] p-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-tight text-white">
              <Users size={15} className="text-orange-500" /> Student Attendance &amp; Progress
            </h3>
            <span className="text-[10px] font-bold uppercase text-zinc-400">Top {students.length}</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[11.5px]">
              <thead>
                <tr className="border-b border-zinc-800 text-[9px] uppercase tracking-wider text-zinc-500">
                  <th className="py-2">Student</th>
                  <th className="py-2">Level</th>
                  <th className="py-2 text-center">Present</th>
                  <th className="py-2 text-center">Missed</th>
                  <th className="py-2 text-center">Rate</th>
                  <th className="py-2 text-right">Latest Score</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const total = Number(s.PresentSessions || 0) + Number(s.MissedSessions || 0);
                  const rate = total > 0 ? Math.round((Number(s.PresentSessions) / total) * 100) : 0;
                  return (
                    <tr key={s.UserID} className="border-b border-zinc-800/60">
                      <td className="py-2.5 font-bold text-zinc-200">{s.FullName}</td>
                      <td className="py-2.5 text-zinc-400">{s.SkillLevel || "—"}</td>
                      <td className="py-2.5 text-center font-bold text-emerald-400">{s.PresentSessions || 0}</td>
                      <td className="py-2.5 text-center font-bold text-red-400">{s.MissedSessions || 0}</td>
                      <td className="py-2.5 text-center font-bold text-zinc-300">{rate}%</td>
                      <td className="py-2.5 text-right font-bold text-orange-400">
                        {s.LatestScore != null ? Number(s.LatestScore).toFixed(1) : "—"}
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-zinc-500">
                      No students are enrolled in this sport yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TOURNAMENTS + TRAINERS */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="border border-zinc-800 bg-[#121215] p-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-tight text-white">
                <Trophy size={15} className="text-amber-400" /> Tournament Register
              </h3>
              <span className="text-[10px] font-bold uppercase text-zinc-400">{tournaments.length}</span>
            </div>

            <div className="mt-3 space-y-2">
              {tournaments.slice(0, 6).map((t) => (
                <div key={t.TournamentID} className="border border-zinc-800/70 bg-zinc-900/40 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-[11.5px] font-bold text-zinc-200">{t.TournamentName}</div>
                      <div className="text-[10px] text-zinc-500">
                        {new Date(t.StartDate).toLocaleDateString()} · {t.Venue || "Venue TBD"}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 border px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider ${
                        t.ApprovalStatus === "Approved"
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                          : t.ApprovalStatus === "Rejected"
                          ? "border-red-500/40 bg-red-500/10 text-red-400"
                          : "border-amber-500/40 bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {t.ApprovalStatus || "Pending"}
                    </span>
                  </div>
                  <div className="mt-1.5 flex gap-4 text-[10px] text-zinc-500">
                    <span>
                      Matches: <strong className="text-zinc-300">{t.Matches || 0}</strong>
                    </span>
                    <span>
                      Completed: <strong className="text-emerald-400">{t.CompletedMatches || 0}</strong>
                    </span>
                    <span className="uppercase tracking-wider">{t.Status}</span>
                  </div>
                </div>
              ))}
              {tournaments.length === 0 && (
                <div className="py-6 text-center text-[11px] text-zinc-500">No tournaments created yet.</div>
              )}
            </div>
          </div>

          <div className="border border-zinc-800 bg-[#121215] p-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-tight text-white">
                <UserCheck size={15} className="text-emerald-400" /> Trainer Attendance
              </h3>
              <span className="text-[10px] font-bold uppercase text-zinc-400">{trainers.length} staff</span>
            </div>

            <div className="mt-3 space-y-2">
              {trainers.map((t) => (
                <div
                  key={t.TrainerID}
                  className="flex items-center justify-between border border-zinc-800/70 bg-zinc-900/40 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[11.5px] font-bold text-zinc-200">{t.FullName}</div>
                    <div className="text-[10px] text-zinc-500">
                      {t.Shift || "Morning"} shift · {t.Specialization || "Assistant"}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-[10px]">
                    <span className="font-bold text-emerald-400">{t.PresentDays || 0}P</span>
                    <span className="font-bold text-red-400">{t.AbsentDays || 0}A</span>
                  </div>
                </div>
              ))}
              {trainers.length === 0 && (
                <div className="py-6 text-center text-[11px] text-zinc-500">No trainers assigned yet.</div>
              )}
            </div>

            <div className="mt-4 border-t border-zinc-800 pt-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Wallet size={12} className="text-orange-500" /> Salary ledger
                </span>
                <span className="text-zinc-300">
                  Paid <strong className="text-emerald-400">{money(payroll.PaidNet)}</strong> · Pending{" "}
                  <strong className="text-amber-400">{money(payroll.PendingNet)}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CoachReports;
