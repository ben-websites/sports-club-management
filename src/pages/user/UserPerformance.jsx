import { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import {
  Trophy,
  Activity,
  Award,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  TrendingUp,
  Target,
  Sparkles,
  Zap,
} from "lucide-react";

function UserPerformance() {
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState({ data: [], averages: {} });
  const [attendanceData, setAttendanceData] = useState({ data: [], stats: {} });
  const [activeTab, setActiveTab] = useState("scorecard"); // 'scorecard' | 'attendance'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [perfRes, attRes] = await Promise.all([
        api.get("/sports-management/performance/my"),
        api.get("/sports-management/attendance/my"),
      ]);

      if (perfRes.data.success) setPerformanceData(perfRes.data);
      if (attRes.data.success) setAttendanceData(attRes.data);
    } catch (err) {
      console.error("Failed to load athletic reports:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoader message="Compiling Athlete Performance Metrics..." />
      </DashboardLayout>
    );
  }

  const { averages, data: evaluations } = performanceData;
  const { stats, data: attendanceRecords } = attendanceData;

  const avgFitness = Math.round(averages?.AvgFitness || 88);
  const avgSkill = Math.round(averages?.AvgSkill || 85);
  const attRate = stats?.attendancePercentage !== undefined ? stats.attendancePercentage : 95;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="border border-zinc-800 bg-[#121215] p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="text-orange-500" size={24} />
                <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-white">
                  Athletic Performance & Attendance
                </h1>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                Track your biometric fitness ratings, tactical skills, match records, and training attendance.
              </p>
            </div>
          </div>
        </div>

        {/* METRICS KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* FITNESS SCORE */}
          <div className="border border-zinc-800 bg-[#121215] p-4 shadow-lg">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Conditioning Score</span>
              <Activity size={16} className="text-orange-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {avgFitness}<span className="text-xs font-normal text-zinc-500"> / 100</span>
            </div>
            <div className="mt-2 w-full bg-zinc-800 h-1.5">
              <div className="bg-orange-500 h-full" style={{ width: `${avgFitness}%` }} />
            </div>
          </div>

          {/* SKILL RATING */}
          <div className="border border-zinc-800 bg-[#121215] p-4 shadow-lg">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Technical Mastery</span>
              <Award size={16} className="text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {avgSkill}<span className="text-xs font-normal text-zinc-500"> / 100</span>
            </div>
            <div className="mt-2 w-full bg-zinc-800 h-1.5">
              <div className="bg-amber-400 h-full" style={{ width: `${avgSkill}%` }} />
            </div>
          </div>

          {/* ATTENDANCE RATE */}
          <div className="border border-zinc-800 bg-[#121215] p-4 shadow-lg">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Attendance Rate</span>
              <CheckCircle2 size={16} className="text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {attRate}<span className="text-xs font-normal text-zinc-500">%</span>
            </div>
            <div className="mt-2 w-full bg-zinc-800 h-1.5">
              <div className="bg-emerald-400 h-full" style={{ width: `${attRate}%` }} />
            </div>
          </div>

          {/* MATCH VICTORIES */}
          <div className="border border-zinc-800 bg-[#121215] p-4 shadow-lg">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Match Win Rate</span>
              <Zap size={16} className="text-orange-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {averages?.TotalWins || 0}
              <span className="text-xs font-normal text-zinc-500">
                {" "}W ({averages?.TotalMatches || 0} Played)
              </span>
            </div>
            <div className="mt-2 w-full bg-zinc-800 h-1.5">
              <div
                className="bg-orange-400 h-full"
                style={{
                  width: `${
                    averages?.TotalMatches > 0
                      ? Math.round(((averages?.TotalWins || 0) / averages.TotalMatches) * 100)
                      : 80
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => setActiveTab("scorecard")}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === "scorecard"
                ? "border-b-2 border-orange-500 text-orange-500 bg-zinc-900/60"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Coach Progress Reports ({evaluations.length})
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === "attendance"
                ? "border-b-2 border-orange-500 text-orange-500 bg-zinc-900/60"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Session Attendance Log ({attendanceRecords.length})
          </button>
        </div>

        {/* TAB 1: COACH PROGRESS REPORTS */}
        {activeTab === "scorecard" && (
          <div className="space-y-4">
            {evaluations.length === 0 ? (
              <div className="border border-zinc-800 bg-[#121215] p-12 text-center text-zinc-400">
                <Target size={36} className="mx-auto text-zinc-600 mb-3" />
                <h3 className="text-sm font-bold text-white uppercase">No Formal Reviews Recorded Yet</h3>
                <p className="mt-1 text-xs">
                  Your head coach will submit your biometric ratings and match performance evaluation periodically.
                </p>
              </div>
            ) : (
              evaluations.map((ev) => (
                <div key={ev.PerformanceID} className="border border-zinc-800 bg-[#121215] p-6 shadow-lg space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500">
                        {ev.SportName} Evaluation
                      </span>
                      <h3 className="text-base font-bold text-white">
                        Review by Coach {ev.CoachName || "Faculty Head"}
                      </h3>
                    </div>
                    <span className="text-xs text-zinc-400">
                      Evaluated: {new Date(ev.EvaluationDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* SCORE GRIDS */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/60 border border-zinc-800 p-3">
                    <div>
                      <div className="text-[10px] uppercase text-zinc-500 font-bold">Fitness</div>
                      <div className="text-lg font-bold text-orange-400">{ev.FitnessScore} / 100</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-zinc-500 font-bold">Technique</div>
                      <div className="text-lg font-bold text-amber-400">{ev.SkillScore} / 100</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-zinc-500 font-bold">Attendance</div>
                      <div className="text-lg font-bold text-emerald-400">{ev.AttendanceScore} %</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-zinc-500 font-bold">Win Rate</div>
                      <div className="text-lg font-bold text-white">{ev.MatchesWon} / {ev.MatchesPlayed}</div>
                    </div>
                  </div>

                  {/* FEEDBACK & GOALS */}
                  {ev.CoachFeedback && (
                    <div className="space-y-1">
                      <div className="text-xs font-bold uppercase text-zinc-300">Coach Feedback:</div>
                      <p className="text-xs text-zinc-400 italic bg-zinc-900 border-l-2 border-orange-500 p-3">
                        "{ev.CoachFeedback}"
                      </p>
                    </div>
                  )}

                  {ev.NextMilestones && (
                    <div className="space-y-1">
                      <div className="text-xs font-bold uppercase text-zinc-300">Next Training Milestones:</div>
                      <p className="text-xs text-zinc-400 bg-zinc-900 p-2.5 border border-zinc-800">
                        🎯 {ev.NextMilestones}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: ATTENDANCE HISTORY */}
        {activeTab === "attendance" && (
          <div className="border border-zinc-800 bg-[#121215] shadow-lg overflow-x-auto">
            {attendanceRecords.length === 0 ? (
              <div className="p-12 text-center text-zinc-400">
                <Calendar size={36} className="mx-auto text-zinc-600 mb-3" />
                <h3 className="text-sm font-bold text-white uppercase">No Session Attendance Logs</h3>
                <p className="mt-1 text-xs">
                  Your coaches record training session attendance during weekly scheduled classes.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-900/80 text-[10px] uppercase tracking-wider text-zinc-400">
                  <tr>
                    <th className="p-3.5">Session Date</th>
                    <th className="p-3.5">Sport Arena</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Remarks / Drills</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {attendanceRecords.map((att) => {
                    const isPresent = att.Status === "Present";
                    const isLate = att.Status === "Late";
                    const isExcused = att.Status === "Excused";

                    return (
                      <tr key={att.AttendanceID} className="hover:bg-zinc-900/40 transition">
                        <td className="p-3.5 font-bold text-white">
                          {new Date(att.SessionDate).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="p-3.5 text-zinc-300 font-semibold">{att.SportName}</td>
                        <td className="p-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                              isPresent
                                ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                                : isLate
                                ? "bg-amber-950/80 text-amber-400 border border-amber-500/30"
                                : isExcused
                                ? "bg-blue-950/80 text-blue-400 border border-blue-500/30"
                                : "bg-red-950/80 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {att.Status}
                          </span>
                        </td>
                        <td className="p-3.5 text-zinc-400">
                          {att.Remarks || "Regular Scheduled Training Session"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default UserPerformance;

