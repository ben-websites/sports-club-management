import { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { Activity, TrendingUp, Dumbbell, Award, Save, ChevronDown, Users } from "lucide-react";

export default function AdminPerformance() {
  const [loading, setLoading] = useState(true);
  const [sports, setSports] = useState([]);
  const [members, setMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [sessionDate, setSessionDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // Form fields
  const [fitnessScore, setFitnessScore] = useState(50);
  const [skillScore, setSkillScore] = useState(50);
  const [coachFeedback, setCoachFeedback] = useState("");

  // Local session records
  const [submittedRecords, setSubmittedRecords] = useState([]);

  // Stats (derived / estimated)
  const totalSports = sports.length;
  const avgFitness =
    submittedRecords.length > 0
      ? Math.round(
          submittedRecords.reduce((acc, r) => acc + r.fitnessScore, 0) /
            submittedRecords.length
        )
      : "--";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sportsRes, usersRes] = await Promise.all([
          api.get("/sports-management/sports"),
          api.get("/admin/users"),
        ]);

        if (sportsRes.data?.success) {
          setSports(sportsRes.data.data || []);
        }
        if (usersRes.data?.success) {
          setMembers(usersRes.data.users || []);
        }
      } catch (err) {
        toast.error("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const resetForm = () => {
    setFitnessScore(50);
    setSkillScore(50);
    setCoachFeedback("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSport || !selectedMember || !sessionDate) {
      toast.error("Please select a sport, member, and session date.");
      return;
    }

    const sport = sports.find((s) => String(s.SportID) === String(selectedSport));
    const member = members.find((m) => String(m.UserID) === String(selectedMember));

    const result = await Swal.fire({
      title: "Record Performance?",
      html: `
        <div style="text-align:left;font-size:14px;line-height:1.6;">
          <strong>Member:</strong> ${member?.FullName ?? "Unknown"}<br/>
          <strong>Sport:</strong> ${sport?.SportName ?? "Unknown"}<br/>
          <strong>Date:</strong> ${sessionDate}<br/>
          <strong>Fitness Score:</strong> ${fitnessScore}<br/>
          <strong>Skill Score:</strong> ${skillScore}<br/>
          <strong>Feedback:</strong> ${coachFeedback || "—"}
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Submit",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#f97316",
      background: "#1c1c1f",
      color: "#fff",
    });

    if (!result.isConfirmed) return;

    setSubmitting(true);
    try {
      await api.post("/sports-management/performance", {
        memberId: selectedMember,
        sportId: selectedSport,
        sessionDate,
        fitnessScore,
        skillScore,
        coachFeedback,
      });

      const newRecord = {
        id: Date.now(),
        memberName: member?.FullName ?? "Unknown",
        sportName: sport?.SportName ?? "Unknown",
        sessionDate,
        fitnessScore,
        skillScore,
        coachFeedback,
      };

      setSubmittedRecords((prev) => [newRecord, ...prev]);
      toast.success("Performance recorded successfully!");
      resetForm();
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Failed to record performance.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const showForm = selectedSport && selectedMember && sessionDate;

  if (loading) return <PageLoader />;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#121215] text-white px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 bg-orange-500 rounded-full" />
            <span className="text-orange-500 text-sm font-medium uppercase tracking-widest">
              Admin Panel
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white">
            Performance Evaluations
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Record and review member athletic performance assessments.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Total Sports */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
            <div className="bg-orange-500/10 p-3 rounded-lg">
              <Dumbbell className="text-orange-500 w-6 h-6" />
            </div>
            <div>
              <p className="text-zinc-400 text-xs uppercase tracking-wider mb-0.5">
                Total Sports
              </p>
              <p className="text-2xl font-bold text-white">{totalSports}</p>
            </div>
          </div>

          {/* Total Members */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
            <div className="bg-orange-500/10 p-3 rounded-lg">
              <Users className="text-orange-500 w-6 h-6" />
            </div>
            <div>
              <p className="text-zinc-400 text-xs uppercase tracking-wider mb-0.5">
                Total Members
              </p>
              <p className="text-2xl font-bold text-white">{members.length}</p>
            </div>
          </div>

          {/* Avg Fitness Score */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
            <div className="bg-orange-500/10 p-3 rounded-lg">
              <TrendingUp className="text-orange-500 w-6 h-6" />
            </div>
            <div>
              <p className="text-zinc-400 text-xs uppercase tracking-wider mb-0.5">
                Avg Fitness Score (Session)
              </p>
              <p className="text-2xl font-bold text-white">{avgFitness}</p>
            </div>
          </div>
        </div>

        {/* Filter Row */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-500" />
            Filter &amp; Select
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Sport Dropdown */}
            <div className="relative">
              <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
                Sport
              </label>
              <div className="relative">
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="w-full appearance-none bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="">— Select Sport —</option>
                  {sports.map((s) => (
                    <option key={s.SportID} value={s.SportID}>
                      {s.SportName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              </div>
            </div>

            {/* Member Dropdown */}
            <div className="relative">
              <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
                Member
              </label>
              <div className="relative">
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="w-full appearance-none bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="">— Select Member —</option>
                  {members.map((m) => (
                    <option key={m.UserID} value={m.UserID}>
                      {m.FullName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              </div>
            </div>

            {/* Session Date */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
                Session Date
              </label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* Performance Form */}
        {showForm && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-500" />
              Record Evaluation
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Fitness Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-zinc-300 font-medium">
                    Fitness Score
                  </label>
                  <span className="text-orange-500 font-bold text-sm bg-orange-500/10 px-2.5 py-0.5 rounded-full">
                    {fitnessScore}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={fitnessScore}
                  onChange={(e) => setFitnessScore(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-orange-500 bg-zinc-700"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>

              {/* Skill Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-zinc-300 font-medium">
                    Skill Score
                  </label>
                  <span className="text-orange-500 font-bold text-sm bg-orange-500/10 px-2.5 py-0.5 rounded-full">
                    {skillScore}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skillScore}
                  onChange={(e) => setSkillScore(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-orange-500 bg-zinc-700"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>

              {/* Score Visual Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-800 rounded-lg p-4 text-center">
                  <p className="text-xs text-zinc-400 mb-1 uppercase tracking-wide">Fitness</p>
                  <div className="relative h-2 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-orange-500 rounded-full transition-all duration-200"
                      style={{ width: `${fitnessScore}%` }}
                    />
                  </div>
                  <p className="text-orange-400 font-bold mt-2">{fitnessScore} / 100</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-4 text-center">
                  <p className="text-xs text-zinc-400 mb-1 uppercase tracking-wide">Skill</p>
                  <div className="relative h-2 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-orange-500 rounded-full transition-all duration-200"
                      style={{ width: `${skillScore}%` }}
                    />
                  </div>
                  <p className="text-orange-400 font-bold mt-2">{skillScore} / 100</p>
                </div>
              </div>

              {/* Coach Feedback */}
              <div>
                <label className="block text-sm text-zinc-300 font-medium mb-2">
                  Coach Feedback
                </label>
                <textarea
                  value={coachFeedback}
                  onChange={(e) => setCoachFeedback(e.target.value)}
                  rows={4}
                  placeholder="Enter detailed feedback for the member..."
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {submitting ? "Saving..." : "Save Evaluation"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Placeholder hint when form not shown */}
        {!showForm && (
          <div className="border border-dashed border-zinc-700 rounded-xl p-10 text-center mb-8">
            <Dumbbell className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">
              Select a <span className="text-zinc-300">sport</span>, a{" "}
              <span className="text-zinc-300">member</span>, and a{" "}
              <span className="text-zinc-300">session date</span> above to record an evaluation.
            </p>
          </div>
        )}

        {/* Submitted Records Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-500" />
              Session Records
            </h2>
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2.5 py-1 rounded-full">
              {submittedRecords.length} record{submittedRecords.length !== 1 ? "s" : ""} this session
            </span>
          </div>

          {submittedRecords.length === 0 ? (
            <div className="py-16 text-center">
              <Award className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">
                No evaluations recorded yet in this session.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">
                    <th className="text-left px-6 py-3 font-medium">#</th>
                    <th className="text-left px-6 py-3 font-medium">Member</th>
                    <th className="text-left px-6 py-3 font-medium">Sport</th>
                    <th className="text-left px-6 py-3 font-medium">Date</th>
                    <th className="text-left px-6 py-3 font-medium">Fitness</th>
                    <th className="text-left px-6 py-3 font-medium">Skill</th>
                    <th className="text-left px-6 py-3 font-medium">Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {submittedRecords.map((record, index) => (
                    <tr
                      key={record.id}
                      className="hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-zinc-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-white font-medium">
                        {record.memberName}
                      </td>
                      <td className="px-6 py-4 text-zinc-300">
                        {record.sportName}
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        {record.sessionDate}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500 rounded-full"
                              style={{ width: `${record.fitnessScore}%` }}
                            />
                          </div>
                          <span className="text-orange-400 font-semibold">
                            {record.fitnessScore}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500 rounded-full"
                              style={{ width: `${record.skillScore}%` }}
                            />
                          </div>
                          <span className="text-orange-400 font-semibold">
                            {record.skillScore}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 max-w-xs">
                        <span className="line-clamp-2">
                          {record.coachFeedback || (
                            <span className="text-zinc-600 italic">No feedback</span>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
