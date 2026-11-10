import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import { ClipboardCheck, Save, CalendarDays, Users, Award } from "lucide-react";

const STATUSES = ["Present", "Absent", "Late", "Leave"];

const statusClass = (status, active) => {
  if (!active) return "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500";
  switch (status) {
    case "Present":
      return "border-emerald-500 bg-emerald-500 text-black";
    case "Absent":
      return "border-red-500 bg-red-500 text-white";
    case "Late":
      return "border-amber-500 bg-amber-500 text-black";
    default:
      return "border-sky-500 bg-sky-500 text-black";
  }
};

function AdminStaffAttendance() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [coaches, setCoaches] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchRegister = useCallback(async (selectedDate, initial = false) => {
    try {
      if (initial) setLoading(true);
      const res = await api.get("/admin/staff/attendance", { params: { date: selectedDate } });
      if (res.data.success) {
        setCoaches(res.data.coaches.map((c) => ({ ...c, draft: c.Status || "" })));
        setTrainers(res.data.trainers.map((t) => ({ ...t, draft: t.Status || "" })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (initial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegister(date, true);
  }, [date, fetchRegister]);

  const setCoachStatus = (coachId, status) => {
    setCoaches((prev) => prev.map((c) => (c.CoachID === coachId ? { ...c, draft: status } : c)));
  };

  const setTrainerStatus = (trainerId, status) => {
    setTrainers((prev) => prev.map((t) => (t.TrainerID === trainerId ? { ...t, draft: status } : t)));
  };

  const markAll = (status) => {
    setCoaches((prev) => prev.map((c) => ({ ...c, draft: status })));
    setTrainers((prev) => prev.map((t) => ({ ...t, draft: status })));
  };

  const save = async () => {
    const records = [
      ...coaches.filter((c) => c.draft).map((c) => ({ staffType: "Coach", coachId: c.CoachID, status: c.draft })),
      ...trainers
        .filter((t) => t.draft)
        .map((t) => ({ staffType: "Trainer", coachId: t.CoachID, trainerId: t.TrainerID, status: t.draft })),
    ];

    if (records.length === 0) return;

    setSaving(true);
    try {
      await api.post("/admin/staff/attendance", { date, records });
      fetchRegister(date, false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <PageLoader message="Loading staff attendance register..." />
      </DashboardLayout>
    );
  }

  const renderRow = (person, keyField, onChange) => (
    <div key={person[keyField]} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="text-[11.5px] font-bold text-zinc-100">
          {person.FullName}
          {person.EmployeeCode && <span className="ml-2 text-[9px] text-zinc-500">{person.EmployeeCode}</span>}
        </div>
        <div className="text-[10px] text-zinc-500">
          {person.SportName || "-"}
          {person.CoachName ? ` • ${person.CoachName}` : ""} • Present {person.PresentDays}d / Absent {person.AbsentDays}d
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => onChange(person[keyField], status)}
            className={`border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition ${statusClass(
              status,
              person.draft === status
            )}`}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-black text-white">
              <ClipboardCheck size={20} className="text-orange-500" /> Staff Attendance
            </h1>
            <p className="mt-1 text-xs text-zinc-400">Daily attendance register for every head coach and trainer.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 border border-zinc-700 bg-zinc-900 px-3 py-2">
              <CalendarDays size={14} className="text-orange-500" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-white outline-none"
              />
            </div>
            <button
              onClick={() => markAll("Present")}
              className="border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-[10.5px] font-bold uppercase tracking-wider text-emerald-400 hover:bg-emerald-500 hover:text-black"
            >
              All Present
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 bg-orange-500 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-black hover:bg-white disabled:opacity-50"
            >
              <Save size={13} /> {saving ? "Saving..." : "Save Register"}
            </button>
          </div>
        </div>

        <div className="border border-zinc-800 bg-[#121215]">
          <div className="flex items-center gap-2 border-b border-zinc-800 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white">
            <Award size={14} className="text-orange-500" /> Head Coaches ({coaches.length})
          </div>
          <div className="divide-y divide-zinc-800/70">
            {coaches.map((coach) => renderRow(coach, "CoachID", setCoachStatus))}
            {coaches.length === 0 && <div className="px-5 py-6 text-[11px] text-zinc-500">No active coaches.</div>}
          </div>
        </div>

        <div className="border border-zinc-800 bg-[#121215]">
          <div className="flex items-center gap-2 border-b border-zinc-800 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white">
            <Users size={14} className="text-orange-500" /> Trainers ({trainers.length})
          </div>
          <div className="divide-y divide-zinc-800/70">
            {trainers.map((trainer) => renderRow(trainer, "TrainerID", setTrainerStatus))}
            {trainers.length === 0 && <div className="px-5 py-6 text-[11px] text-zinc-500">No active trainers.</div>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminStaffAttendance;
