import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import toast from "react-hot-toast";
import { ClipboardCheck, Save, CalendarDays, History, UserCheck } from "lucide-react";

const STATUSES = ["Present", "Absent", "Late", "Leave"];

const statusStyle = (status) => {
  switch (status) {
    case "Present":
      return "bg-emerald-500 text-black border-emerald-500";
    case "Absent":
      return "bg-red-500 text-white border-red-500";
    case "Late":
      return "bg-amber-500 text-black border-amber-500";
    case "Leave":
      return "bg-sky-500 text-black border-sky-500";
    default:
      return "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500";
  }
};

function CoachAttendance() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [sportName, setSportName] = useState("");

  const fetchSheet = useCallback(async (selectedDate, initial = false) => {
    try {
      if (initial) setLoading(true);
      const res = await api.get("/coach/students", { params: { date: selectedDate } });
      if (res.data.success) {
        setStudents(
          res.data.students.map((s) => ({ ...s, draftStatus: s.AttendanceStatus || "" }))
        );
        setSummary(res.data.summary || {});
        setSportName(res.data.sport?.SportName || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (initial) setLoading(false);
    }
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/coach/attendance/history");
      if (res.data.success) setHistory(res.data.history || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSheet(date, true);
  }, [date, fetchSheet]);

  const setStatus = (userId, status) => {
    setStudents((prev) => prev.map((s) => (s.UserID === userId ? { ...s, draftStatus: status } : s)));
  };

  const markAllPresent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, draftStatus: "Present" })));
  };

  const save = async () => {
    const records = students
      .filter((s) => s.draftStatus)
      .map((s) => ({ userId: s.UserID, status: s.draftStatus }));

    if (records.length === 0) {
      toast.error("Select at least one attendance status before saving.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/coach/attendance", { date, records });
      await fetchSheet(date, false);
      fetchHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="coach">
        <PageLoader message="Loading attendance sheet..." />
      </DashboardLayout>
    );
  }

  const pending = students.filter((s) => !s.draftStatus).length;

  return (
    <DashboardLayout role="coach">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-black text-white">
              <ClipboardCheck size={20} className="text-orange-500" /> Students & Attendance
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Marking register for <span className="font-bold text-orange-400">{sportName}</span>
            </p>
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
              onClick={markAllPresent}
              className="flex items-center gap-2 border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-emerald-400 transition hover:bg-emerald-500 hover:text-black"
            >
              <UserCheck size={13} /> All Present
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 bg-orange-500 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-black transition hover:bg-white disabled:opacity-50"
            >
              <Save size={13} /> {saving ? "Saving..." : "Save Sheet"}
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-5">
          {[
            { label: "Total", value: summary.total ?? students.length, tone: "text-white" },
            { label: "Present", value: summary.present ?? 0, tone: "text-emerald-400" },
            { label: "Absent", value: summary.absent ?? 0, tone: "text-red-400" },
            { label: "Late", value: summary.late ?? 0, tone: "text-amber-400" },
            { label: "Unmarked", value: pending, tone: "text-zinc-400" },
          ].map((chip) => (
            <div key={chip.label} className="border border-zinc-800 bg-[#121215] px-4 py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">{chip.label}</div>
              <div className={`mt-1 text-lg font-black ${chip.tone}`}>{chip.value}</div>
            </div>
          ))}
        </div>

        <div className="border border-zinc-800 bg-[#121215]">
          <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3.5">
            <div className="text-xs font-bold uppercase tracking-wider text-white">
              Athletes on {new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </div>
            <button
              onClick={() => {
                setShowHistory((v) => !v);
                if (!showHistory) fetchHistory();
              }}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-400 hover:text-white"
            >
              <History size={13} /> {showHistory ? "Hide History" : "View History"}
            </button>
          </div>

          {students.length === 0 ? (
            <div className="px-5 py-12 text-center text-xs text-zinc-500">
              No members are enrolled in your sport yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#16161b] text-[9.5px] uppercase tracking-[0.16em] text-zinc-400">
                  <tr>
                    <th className="px-5 py-3">Athlete</th>
                    <th className="px-3 py-3">Skill</th>
                    <th className="px-3 py-3">Enrolled</th>
                    <th className="px-5 py-3 text-right">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {students.map((s) => (
                    <tr key={s.EnrollmentID} className="hover:bg-zinc-800/20">
                      <td className="px-5 py-3">
                        <div className="font-bold text-zinc-100">{s.FullName}</div>
                        <div className="text-[10px] text-zinc-500">{s.Email}</div>
                      </td>
                      <td className="px-3 py-3 text-zinc-400">{s.SkillLevel}</td>
                      <td className="px-3 py-3 text-[10.5px] text-zinc-500">
                        {new Date(s.EnrolledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {STATUSES.map((status) => (
                            <button
                              key={status}
                              onClick={() => setStatus(s.UserID, status)}
                              className={`border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
                                s.draftStatus === status
                                  ? statusStyle(status)
                                  : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500"
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showHistory && (
          <div className="border border-zinc-800 bg-[#121215]">
            <div className="border-b border-zinc-800 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white">
              Session History
            </div>
            {history.length === 0 ? (
              <div className="px-5 py-8 text-center text-xs text-zinc-500">No sessions recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#16161b] text-[9.5px] uppercase tracking-[0.16em] text-zinc-400">
                    <tr>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-3 py-3">Present</th>
                      <th className="px-3 py-3">Absent</th>
                      <th className="px-3 py-3">Late</th>
                      <th className="px-3 py-3">Leave</th>
                      <th className="px-5 py-3">Marked</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/70">
                    {history.map((row) => (
                      <tr key={row.SessionDate} className="hover:bg-zinc-800/20">
                        <td className="px-5 py-2.5 font-bold text-zinc-200">
                          {new Date(row.SessionDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-3 py-2.5 text-emerald-400 font-bold">{row.Present}</td>
                        <td className="px-3 py-2.5 text-red-400 font-bold">{row.Absent}</td>
                        <td className="px-3 py-2.5 text-amber-400 font-bold">{row.Late}</td>
                        <td className="px-3 py-2.5 text-sky-400 font-bold">{row.Leave}</td>
                        <td className="px-5 py-2.5 text-zinc-400">{row.Marked}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default CoachAttendance;
