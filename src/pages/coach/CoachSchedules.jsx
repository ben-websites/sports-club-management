import { useEffect, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import Swal from "sweetalert2";
import { Calendar, Plus, Trash2, Clock, MapPin } from "lucide-react";

const inputClass =
  "w-full border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-xs text-white outline-none focus:border-orange-500";

const emptyForm = {
  sessionTitle: "",
  daysOfWeek: "Mon, Wed, Fri",
  startTime: "04:00 PM",
  endTime: "07:00 PM",
  venue: "",
  skillLevel: "All Levels",
  maxCapacity: 30,
};

function CoachSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchSchedules = async (initial = false) => {
    try {
      if (initial) setLoading(true);
      const res = await api.get("/coach/schedules");
      if (res.data.success) setSchedules(res.data.schedules || []);
    } catch (err) {
      console.error(err);
    } finally {
      if (initial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules(true);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/coach/schedules", form);
      setForm(emptyForm);
      fetchSchedules();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (schedule) => {
    const confirm = await Swal.fire({
      title: "Remove session?",
      text: schedule.SessionTitle,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#27272a",
      confirmButtonText: "Remove",
      background: "#18181b",
      color: "#ffffff",
    });
    if (!confirm.isConfirmed) return;
    try {
      await api.delete(`/coach/schedules/${schedule.ScheduleID}`);
      fetchSchedules();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="coach">
        <PageLoader message="Loading training timetable..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="coach">
      <div className="space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black text-white">
            <Calendar size={20} className="text-orange-500" /> Training Timetable
          </h1>
          <p className="mt-1 text-xs text-zinc-400">Publish the weekly sessions for your sport — members see them instantly.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="border border-zinc-800 bg-[#121215] p-5 lg:col-span-2">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-white">Active Sessions ({schedules.length})</div>
            {schedules.length === 0 ? (
              <div className="py-10 text-center text-xs text-zinc-500">No sessions scheduled.</div>
            ) : (
              <div className="divide-y divide-zinc-800/70">
                {schedules.map((s) => (
                  <div key={s.ScheduleID} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white">{s.SessionTitle}</div>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10.5px] text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {s.DaysOfWeek} • {s.StartTime} - {s.EndTime}
                        </span>
                        {s.Venue && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} /> {s.Venue}
                          </span>
                        )}
                        <span>{s.SkillLevel}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => remove(s)}
                      className="shrink-0 border border-zinc-700 p-2 text-zinc-300 transition hover:border-red-500 hover:text-red-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={submit} className="space-y-3 border border-zinc-800 bg-[#121215] p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-white">Add Session</div>
            <input
              required
              placeholder="Session title"
              value={form.sessionTitle}
              onChange={(e) => setForm({ ...form, sessionTitle: e.target.value })}
              className={inputClass}
            />
            <input
              required
              placeholder="Days (Mon, Wed, Fri)"
              value={form.daysOfWeek}
              onChange={(e) => setForm({ ...form, daysOfWeek: e.target.value })}
              className={inputClass}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                required
                placeholder="Start"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className={inputClass}
              />
              <input
                required
                placeholder="End"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className={inputClass}
              />
            </div>
            <input
              placeholder="Venue"
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              className={inputClass}
            />
            <select
              value={form.skillLevel}
              onChange={(e) => setForm({ ...form, skillLevel: e.target.value })}
              className={inputClass}
            >
              {["All Levels", "Beginner", "Intermediate", "Advanced", "Elite"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={form.maxCapacity}
              onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })}
              className={inputClass}
            />
            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 bg-orange-500 py-2.5 text-[11px] font-black uppercase tracking-wider text-black transition hover:bg-white disabled:opacity-50"
            >
              <Plus size={14} /> {saving ? "Saving..." : "Add to Timetable"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CoachSchedules;
