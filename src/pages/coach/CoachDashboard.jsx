import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import startPolling from "../../services/polling";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import {
  Users,
  ClipboardCheck,
  Trophy,
  Box,
  Award,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

const StatCard = ({ label, value, hint, icon: Icon, tone = "orange" }) => (
  <div className="border border-zinc-800 bg-[#121215] p-4">
    <div className="flex items-start justify-between">
      <div>
        <div className="text-[9.5px] font-bold uppercase tracking-[0.18em] text-zinc-400">{label}</div>
        <div className="mt-2 text-2xl font-black text-white leading-none">{value}</div>
        {hint && <div className="mt-1.5 text-[10.5px] text-zinc-500">{hint}</div>}
      </div>
      <div
        className={`flex h-9 w-9 items-center justify-center border ${
          tone === "emerald"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            : tone === "sky"
            ? "border-sky-500/30 bg-sky-500/10 text-sky-400"
            : "border-orange-500/30 bg-orange-500/10 text-orange-400"
        }`}
      >
        <Icon size={17} />
      </div>
    </div>
  </div>
);

const approvalTone = (status) =>
  status === "Approved"
    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
    : status === "Rejected"
    ? "border-red-500/40 bg-red-500/10 text-red-400"
    : "border-amber-500/40 bg-amber-500/10 text-amber-400";

function CoachDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async (initial = false) => {
      try {
        if (initial) setLoading(true);
        const res = await api.get("/coach/overview");
        if (res.data.success) setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (initial) setLoading(false);
      }
    };
    load(true);
    // Live auto-refresh (skipped while the tab is hidden)
    return startPolling(() => load(false), 15000);
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="coach">
        <PageLoader message="Loading coach command centre..." />
      </DashboardLayout>
    );
  }

  const stats = data?.stats || {};
  const coach = data?.coach || {};

  return (
    <DashboardLayout role="coach">
      <div className="space-y-6">
        <div className="keep-dark flex flex-col gap-4 border border-zinc-800 bg-gradient-to-r from-[#141418] to-[#0d0d10] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-500">
              Head Coach Workspace
            </div>
            <h1 className="mt-1.5 text-2xl font-black text-white">
              {coach.FullName || "Coach"}
              <span className="ml-2 text-sm font-bold text-zinc-500">({coach.EmployeeCode})</span>
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              {coach.SportName} • {coach.Specialization}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/coach/attendance"
              className="flex items-center gap-2 bg-orange-500 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-black transition hover:bg-white"
            >
              <ClipboardCheck size={14} /> Mark Attendance
            </Link>
            <Link
              to="/coach/tournaments"
              className="flex items-center gap-2 border border-zinc-700 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-zinc-200 transition hover:border-orange-500 hover:text-white"
            >
              <Trophy size={14} /> Tournaments
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Enrolled Athletes"
            value={stats.ActiveStudents ?? 0}
            hint={`${stats.MarkedToday ?? 0} marked today`}
            icon={Users}
          />
          <StatCard
            label="Present Today"
            value={stats.PresentToday ?? 0}
            hint={`${data?.today || ""}`}
            icon={ClipboardCheck}
            tone="emerald"
          />
          <StatCard
            label="My Tournaments"
            value={stats.TotalTournaments ?? 0}
            hint={`${stats.PendingTournaments ?? 0} awaiting admin approval`}
            icon={Trophy}
          />
          <StatCard
            label="Gear Register"
            value={stats.EquipmentItems ?? 0}
            hint={`${stats.PendingEquipment ?? 0} pending approval`}
            icon={Box}
            tone="sky"
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="border border-zinc-800 bg-[#121215] lg:col-span-2">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                <Trophy size={14} className="text-orange-500" /> Tournaments & Approval Status
              </div>
              <Link to="/coach/tournaments" className="text-[10px] font-bold uppercase text-orange-400 hover:text-white">
                Manage
              </Link>
            </div>
            {data?.tournaments?.length ? (
              <div className="divide-y divide-zinc-800/70">
                {data.tournaments.map((t) => (
                  <div key={t.TournamentID} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-white">{t.TournamentName}</div>
                      <div className="mt-0.5 text-[10.5px] text-zinc-500">
                        {new Date(t.StartDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {t.Venue ? ` • ${t.Venue}` : ""}
                      </div>
                    </div>
                    <span className={`shrink-0 border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${approvalTone(t.ApprovalStatus)}`}>
                      {t.ApprovalStatus}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-10 text-center text-xs text-zinc-500">No tournaments created yet.</div>
            )}
          </div>

          <div className="space-y-5">
            <div className="border border-zinc-800 bg-[#121215]">
              <div className="flex items-center gap-2 border-b border-zinc-800 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white">
                <Award size={14} className="text-orange-500" /> Trainer Squad ({data?.trainers?.length || 0})
              </div>
              <div className="divide-y divide-zinc-800/70">
                {(data?.trainers || []).slice(0, 5).map((t) => (
                  <div key={t.TrainerID} className="flex items-center justify-between px-5 py-2.5">
                    <div>
                      <div className="text-[11.5px] font-bold text-zinc-200">{t.FullName}</div>
                      <div className="text-[10px] text-zinc-500">{t.Specialization}</div>
                    </div>
                    <div className="text-[10px] font-bold text-zinc-400">{t.Shift}</div>
                  </div>
                ))}
                {!data?.trainers?.length && (
                  <div className="px-5 py-6 text-center text-[11px] text-zinc-500">No trainers assigned.</div>
                )}
              </div>
            </div>

            <div className="border border-zinc-800 bg-[#121215]">
              <div className="flex items-center gap-2 border-b border-zinc-800 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white">
                <CalendarDays size={14} className="text-orange-500" /> Weekly Timetable
              </div>
              <div className="divide-y divide-zinc-800/70">
                {(data?.schedules || []).map((s) => (
                  <div key={s.ScheduleID} className="px-5 py-2.5">
                    <div className="text-[11.5px] font-bold text-zinc-200">{s.SessionTitle}</div>
                    <div className="text-[10px] text-zinc-500">
                      {s.DaysOfWeek} • {s.StartTime} - {s.EndTime}
                    </div>
                  </div>
                ))}
                {!data?.schedules?.length && (
                  <div className="px-5 py-6 text-center text-[11px] text-zinc-500">No sessions scheduled.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            to="/coach/equipment"
            className="group flex items-center justify-between border border-zinc-800 bg-[#121215] p-4 transition hover:border-orange-500/50"
          >
            <div className="flex items-center gap-3">
              <Box size={16} className="text-orange-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">Gear & Equipment</span>
            </div>
            <ArrowRight size={14} className="text-zinc-500 group-hover:text-orange-500" />
          </Link>
          <Link
            to="/coach/trainers"
            className="group flex items-center justify-between border border-zinc-800 bg-[#121215] p-4 transition hover:border-orange-500/50"
          >
            <div className="flex items-center gap-3">
              <Award size={16} className="text-orange-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">Trainer Attendance</span>
            </div>
            <ArrowRight size={14} className="text-zinc-500 group-hover:text-orange-500" />
          </Link>
          <Link
            to="/coach/salary"
            className="group flex items-center justify-between border border-zinc-800 bg-[#121215] p-4 transition hover:border-orange-500/50"
          >
            <div className="flex items-center gap-3">
              <TrendingUp size={16} className="text-orange-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">Salary Ledger</span>
            </div>
            <ArrowRight size={14} className="text-zinc-500 group-hover:text-orange-500" />
          </Link>
        </div>

        <div className="flex items-start gap-2 border border-sky-500/20 bg-sky-500/5 p-4 text-[11px] text-sky-300">
          <ShieldCheck size={15} className="mt-0.5 shrink-0" />
          <p>
            Tournaments and equipment you create stay in <strong>Pending</strong> state until the administration reviews and
            approves them. Approved records become read-only for coaches.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CoachDashboard;
