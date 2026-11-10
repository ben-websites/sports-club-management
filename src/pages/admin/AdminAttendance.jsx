import { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import {
  ClipboardCheck,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Save,
  Dumbbell,
  Users,
} from "lucide-react";

function AdminAttendance() {
  const [sports, setSports] = useState([]);
  const [selectedSportId, setSelectedSportId] = useState("");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [enrolledMembers, setEnrolledMembers] = useState([]);
  const [loadingSports, setLoadingSports] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      setLoadingSports(true);
      const res = await api.get("/sports-management/sports");
      if (res.data.success) {
        setSports(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedSportId(res.data.data[0].SportID);
        }
      }
    } catch (err) {
      console.error("Failed to load sports:", err);
      toast.error("Could not fetch sports list.");
    } finally {
      setLoadingSports(false);
    }
  };

  useEffect(() => {
    if (selectedSportId && sessionDate) {
      fetchAttendance();
    }
  }, [selectedSportId, sessionDate]);

  const fetchAttendance = async () => {
    try {
      setLoadingMembers(true);
      const res = await api.get(`/sports-management/attendance/sport/${selectedSportId}?date=${sessionDate}`);
      if (res.data.success) {
        // Prepopulate records
        const data = res.data.data.map((m) => ({
          userId: m.UserID,
          fullName: m.FullName,
          email: m.Email,
          phone: m.Phone,
          skillLevel: m.SkillLevel,
          status: m.AttendanceStatus === "Unmarked" ? "Present" : m.AttendanceStatus,
          remarks: m.Remarks || "",
        }));
        setEnrolledMembers(data);
      }
    } catch (err) {
      console.error("Failed to load attendance:", err);
      toast.error("Could not load member roster for this session.");
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleStatusChange = (userId, newStatus) => {
    setEnrolledMembers((prev) =>
      prev.map((m) => (m.userId === userId ? { ...m, status: newStatus } : m))
    );
  };

  const handleRemarksChange = (userId, remarks) => {
    setEnrolledMembers((prev) =>
      prev.map((m) => (m.userId === userId ? { ...m, remarks } : m))
    );
  };

  const handleMarkAll = (status) => {
    setEnrolledMembers((prev) => prev.map((m) => ({ ...m, status })));
    toast.success(`Marked all members as ${status}.`);
  };

  const handleSaveAttendance = async () => {
    if (!selectedSportId || enrolledMembers.length === 0) return;

    try {
      setSaving(true);
      const records = enrolledMembers.map((m) => ({
        userId: m.userId,
        status: m.status,
        remarks: m.remarks,
      }));

      const res = await api.post("/sports-management/attendance/mark", {
        sportId: selectedSportId,
        sessionDate,
        records,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        fetchAttendance();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingSports) {
    return (
      <DashboardLayout>
        <PageLoader message="Loading Club Arenas & Attendance Registry..." />
      </DashboardLayout>
    );
  }

  const selectedSport = sports.find((s) => s.SportID === parseInt(selectedSportId));
  const presentCount = enrolledMembers.filter((m) => m.status === "Present" || m.status === "Late").length;
  const attendanceRate = enrolledMembers.length > 0 ? Math.round((presentCount / enrolledMembers.length) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="border border-zinc-800 bg-[#121215] p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ClipboardCheck className="text-orange-500" size={24} />
                <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-white">
                  Training Session Attendance
                </h1>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                Log and maintain member attendance for sports training clinics, drills, and sessions.
              </p>
            </div>

            {/* SAVE BUTTON */}
            <button
              onClick={handleSaveAttendance}
              disabled={saving || enrolledMembers.length === 0}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-black px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 self-start md:self-auto"
            >
              <Save size={16} /> {saving ? "Saving Log..." : "Save Attendance"}
            </button>
          </div>
        </div>

        {/* SELECTORS & CONTROLS */}
        <div className="border border-zinc-800 bg-[#121215] p-5 shadow-lg grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold uppercase text-zinc-300 mb-1">
              Select Sport Arena (20 Total)
            </label>
            <select
              value={selectedSportId}
              onChange={(e) => setSelectedSportId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
            >
              {sports.map((sp) => (
                <option key={sp.SportID} value={sp.SportID}>
                  {sp.SportName} ({sp.ActiveEnrollmentCount || 0} enrolled)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold uppercase text-zinc-300 mb-1">Session Date</label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* BULK ACTIONS */}
          <div>
            <label className="block font-bold uppercase text-zinc-300 mb-1">Bulk Shortcuts</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleMarkAll("Present")}
                className="flex-1 py-2 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 font-bold uppercase text-[10px]"
              >
                All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll("Absent")}
                className="flex-1 py-2 bg-red-950/70 hover:bg-red-900 border border-red-500/30 text-red-300 font-bold uppercase text-[10px]"
              >
                All Absent
              </button>
            </div>
          </div>
        </div>

        {/* STATS OVERVIEW */}
        <div className="border border-zinc-800 bg-zinc-900/60 p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <Users size={16} className="text-orange-500" />
            <span>
              Total Enrolled in {selectedSport?.SportName || "Sport"}:{" "}
              <strong className="text-white">{enrolledMembers.length} athletes</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-bold">
              Present: {presentCount}
            </span>
            <span className="text-red-400 font-bold">
              Absent: {enrolledMembers.length - presentCount}
            </span>
            <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 font-bold uppercase text-[10px]">
              Rate: {attendanceRate}%
            </span>
          </div>
        </div>

        {/* ROSTER TABLE */}
        <div className="border border-zinc-800 bg-[#121215] shadow-lg overflow-x-auto">
          {loadingMembers ? (
            <div className="py-12 text-center text-xs text-zinc-400">Loading roster...</div>
          ) : enrolledMembers.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              No athletes are actively enrolled in this sport arena yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 bg-zinc-900 text-[10px] uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="p-3.5">Athlete Name</th>
                  <th className="p-3.5">Contact Details</th>
                  <th className="p-3.5">Skill Level</th>
                  <th className="p-3.5">Attendance Status</th>
                  <th className="p-3.5">Coach Session Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {enrolledMembers.map((m) => (
                  <tr key={m.userId} className="hover:bg-zinc-900/40 transition">
                    <td className="p-3.5 font-bold text-white">{m.fullName}</td>
                    <td className="p-3.5 text-zinc-400">
                      <div>{m.email}</div>
                      <div className="text-[10px] text-zinc-500">{m.phone}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 text-[10px] font-bold uppercase">
                        {m.skillLevel}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        {["Present", "Late", "Absent", "Excused"].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleStatusChange(m.userId, st)}
                            className={`px-2.5 py-1 text-[10px] font-bold uppercase transition ${
                              m.status === st
                                ? st === "Present"
                                  ? "bg-emerald-600 text-black font-extrabold"
                                  : st === "Late"
                                  ? "bg-amber-500 text-black font-extrabold"
                                  : st === "Absent"
                                  ? "bg-red-600 text-white font-extrabold"
                                  : "bg-blue-600 text-white font-extrabold"
                                : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-700"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <input
                        type="text"
                        placeholder="Session notes or drill feedback..."
                        value={m.remarks}
                        onChange={(e) => handleRemarksChange(m.userId, e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 px-2.5 py-1 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminAttendance;

