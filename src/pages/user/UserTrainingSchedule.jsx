import { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import { Calendar, Clock, MapPin, User, Dumbbell, Award, CheckCircle2 } from "lucide-react";

function UserTrainingSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [mySports, setMySports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' | sportId

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const [schedRes, myRes] = await Promise.all([
        api.get("/sports-management/schedules"),
        api.get("/sports-management/enrollments/my"),
      ]);

      if (schedRes.data.success) setSchedules(schedRes.data.data);
      if (myRes.data.success) setMySports(myRes.data.data);
    } catch (err) {
      console.error("Failed to load schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoader message="Loading Club Training Timetable..." />
      </DashboardLayout>
    );
  }

  const enrolledSportIds = new Set(mySports.map((s) => s.SportID));

  const filteredSchedules = schedules.filter((s) => {
    if (filter === "my") return enrolledSportIds.has(s.SportID);
    if (filter !== "all") return s.SportID === parseInt(filter);
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="border border-zinc-800 bg-[#121215] p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="text-orange-500" size={24} />
                <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-white">
                  Training Schedules & Sessions
                </h1>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                Weekly scheduled training sessions, court timings, and coach clinics across sports.
              </p>
            </div>

            {/* FILTER BUTTONS */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 text-xs font-bold uppercase transition ${
                  filter === "all"
                    ? "bg-orange-500 text-black"
                    : "bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white"
                }`}
              >
                All Sessions ({schedules.length})
              </button>
              <button
                onClick={() => setFilter("my")}
                className={`px-3 py-1.5 text-xs font-bold uppercase transition ${
                  filter === "my"
                    ? "bg-orange-500 text-black"
                    : "bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white"
                }`}
              >
                My Enrolled Sports ({mySports.length})
              </button>
            </div>
          </div>
        </div>

        {/* SESSIONS GRID */}
        {filteredSchedules.length === 0 ? (
          <div className="border border-zinc-800 bg-[#121215] p-12 text-center text-zinc-400">
            <Clock size={36} className="mx-auto text-zinc-600 mb-3" />
            <div className="text-sm font-bold text-white uppercase">No Sessions Match Filter</div>
            <p className="mt-1 text-xs">Switch to "All Sessions" to view the complete club timetable.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchedules.map((item) => {
              const isEnrolled = enrolledSportIds.has(item.SportID);

              return (
                <div
                  key={item.ScheduleID}
                  className={`border bg-[#121215] p-5 shadow-lg flex flex-col justify-between transition hover:border-zinc-700 ${
                    isEnrolled ? "border-orange-500/40" : "border-zinc-800"
                  }`}
                >
                  <div className="space-y-4">
                    {/* TOP BADGES */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-950/60 border border-orange-500/30 px-2 py-0.5">
                        {item.SportName}
                      </span>
                      {isEnrolled && (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={12} /> In Your Courses
                        </span>
                      )}
                    </div>

                    {/* TITLE */}
                    <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                      {item.SessionTitle}
                    </h3>

                    {/* TIME & DAYS */}
                    <div className="bg-zinc-900/80 border border-zinc-800 p-3 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <Calendar size={14} className="text-orange-500 shrink-0" />
                        <span className="font-semibold text-white">{item.DaysOfWeek}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-300">
                        <Clock size={14} className="text-orange-500 shrink-0" />
                        <span>{item.StartTime} - {item.EndTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-300">
                        <MapPin size={14} className="text-orange-500 shrink-0" />
                        <span className="truncate">{item.Venue}</span>
                      </div>
                    </div>

                    {/* COACH & CAPACITY */}
                    <div className="flex items-center justify-between text-xs pt-1 text-zinc-400">
                      <div className="flex items-center gap-1.5 truncate">
                        <User size={13} className="text-orange-500 shrink-0" />
                        <span className="truncate">{item.CoachName || "Head Faculty"}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase bg-zinc-800 text-zinc-300 px-2 py-0.5">
                        {item.SkillLevel}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[10px] text-zinc-400 flex items-center justify-between">
                    <span>Max Capacity: {item.MaxCapacity} athletes</span>
                    <span>Enrolled: {item.EnrolledCount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default UserTrainingSchedule;

