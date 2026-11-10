import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import {
  Dumbbell,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Search,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  X,
} from "lucide-react";

function UserSportsEnrollment() {
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrollmentInfo, setEnrollmentInfo] = useState({
    hasActiveMembership: false,
    planName: "",
    allowedLimit: 0,
    currentEnrolledCount: 0,
    remainingSlots: 0,
    data: [],
  });

  const [allSports, setAllSports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("my-sports"); // 'my-sports' | 'browse'
  const [selectedSportForEnroll, setSelectedSportForEnroll] = useState(null);
  const [skillLevel, setSkillLevel] = useState("Beginner");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData(true);

    const interval = setInterval(() => {
      fetchData(false);
      refreshUser?.();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const [myRes, allRes] = await Promise.all([
        api.get("/sports-management/enrollments/my"),
        api.get("/sports-management/sports"),
      ]);

      if (myRes.data.success) {
        setEnrollmentInfo(myRes.data);
        if (myRes.data.data.length === 0 && isInitial) {
          setActiveTab("browse");
        }
      }

      if (allRes.data.success) {
        setAllSports(allRes.data.data);
      }
    } catch (err) {
      console.error("Failed to load sports data:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSportForEnroll) return;

    try {
      setSubmitting(true);
      const res = await api.post("/sports-management/enroll", {
        sportId: selectedSportForEnroll.SportID,
        skillLevel,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setSelectedSportForEnroll(null);
        await fetchData();
        setActiveTab("my-sports");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Enrollment failed.";
      Swal.fire({
        title: "Enrollment Notice",
        text: msg,
        icon: "warning",
        confirmButtonColor: "#f97316",
        background: "#18181b",
        color: "#ffffff",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDrop = async (enrollmentId, sportName) => {
    const result = await Swal.fire({
      title: `Drop ${sportName}?`,
      text: "Dropping this sport will free up a slot in your membership quota.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#27272a",
      confirmButtonText: "Yes, Drop Course",
      cancelButtonText: "Cancel",
      background: "#18181b",
      color: "#ffffff",
    });

    if (result.isConfirmed) {
      try {
        const res = await api.delete(`/sports-management/enrollments/${enrollmentId}`);
        if (res.data.success) {
          toast.success(res.data.message);
          fetchData();
        }
      } catch (err) {
        toast.error("Failed to drop sport.");
      }
    }
  };

  const enrolledSportIds = new Set(enrollmentInfo.data.map((e) => e.SportID));

  const filteredSports = allSports.filter((s) => {
    const matchesSearch = s.SportName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.Description && s.Description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.CoachName && s.CoachName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoader message="Loading Sports Faculty & Course Limits..." />
      </DashboardLayout>
    );
  }

  const limitReached = enrollmentInfo.currentEnrolledCount >= enrollmentInfo.allowedLimit;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="border border-zinc-800 bg-[#121215] p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Dumbbell className="text-orange-500" size={24} />
                <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-white">
                  Sports & Course Enrollment
                </h1>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                Enroll in club sports arenas according to your tiered membership quota.
              </p>
            </div>

            {/* QUOTA BADGE */}
            <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-700/80 p-3 px-4">
              <Award className="text-orange-500" size={22} />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {enrollmentInfo.planName || "Membership Quota"}
                </div>
                <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <span className="text-orange-500">{enrollmentInfo.currentEnrolledCount}</span>
                  <span className="text-zinc-500">/</span>
                  <span>{enrollmentInfo.allowedLimit} Sports Selected</span>
                </div>
              </div>
            </div>
          </div>

          {/* QUOTA PROGRESS BAR */}
          {enrollmentInfo.hasActiveMembership && (
            <div className="mt-5 pt-4 border-t border-zinc-800">
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-zinc-400">Membership Sports Allocation</span>
                <span className={limitReached ? "text-orange-400 font-bold" : "text-zinc-300"}>
                  {enrollmentInfo.remainingSlots} Slot(s) Remaining
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-2.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    limitReached ? "bg-orange-500" : "bg-gradient-to-r from-orange-500 to-amber-400"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (enrollmentInfo.currentEnrolledCount / Math.max(1, enrollmentInfo.allowedLimit)) * 100
                    )}%`,
                  }}
                />
              </div>

              {limitReached && (
                <div className="mt-3 flex items-center justify-between bg-orange-950/30 border border-orange-500/30 p-2.5 px-3 text-xs text-orange-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-orange-500 shrink-0" />
                    <span>
                      You have utilized all <strong>{enrollmentInfo.allowedLimit}</strong> sports allowed by your{" "}
                      <strong>{enrollmentInfo.planName}</strong> plan.
                    </span>
                  </div>
                  <Link
                    to="/user/membership"
                    className="text-xs font-bold text-orange-400 hover:text-orange-300 underline shrink-0 ml-2"
                  >
                    Upgrade Tier →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* TABS */}
        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => setActiveTab("my-sports")}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === "my-sports"
                ? "border-b-2 border-orange-500 text-orange-500 bg-zinc-900/60"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            My Enrolled Sports ({enrollmentInfo.currentEnrolledCount})
          </button>
          <button
            onClick={() => setActiveTab("browse")}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === "browse"
                ? "border-b-2 border-orange-500 text-orange-500 bg-zinc-900/60"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Explore All 20 Sports ({allSports.length})
          </button>
        </div>

        {/* TAB 1: MY ENROLLED SPORTS */}
        {activeTab === "my-sports" && (
          <div>
            {enrollmentInfo.data.length === 0 ? (
              <div className="border border-zinc-800 bg-[#121215] p-12 text-center">
                <Dumbbell size={40} className="mx-auto text-zinc-600 mb-3" />
                <h3 className="text-base font-bold text-white uppercase">No Sports Selected Yet</h3>
                <p className="mt-1 text-xs text-zinc-400 max-w-md mx-auto">
                  You have not enrolled in any sports courses. Browse all 20 club arenas to select your sport and begin training!
                </p>
                <button
                  onClick={() => setActiveTab("browse")}
                  className="mt-5 inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-black px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition"
                >
                  <Plus size={16} /> Browse 20 Sports Arenas
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollmentInfo.data.map((item) => (
                  <div
                    key={item.EnrollmentID}
                    className="border border-zinc-800 bg-[#121215] shadow-lg flex flex-col justify-between overflow-hidden group hover:border-zinc-700 transition"
                  >
                    <div>
                      {/* IMAGE BANNER */}
                      <div className="relative h-44 overflow-hidden bg-zinc-950">
                        <img
                          src={item.SportImage || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80"}
                          alt={item.SportName}
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-transparent" />
                        <span className="absolute top-3 left-3 bg-emerald-950/90 border border-emerald-500/40 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1">
                          Enrolled • {item.SkillLevel}
                        </span>
                      </div>

                      {/* CONTENT */}
                      <div className="p-5 space-y-4">
                        <div>
                          <h3 className="text-base font-bold text-white uppercase tracking-tight">
                            {item.SportName}
                          </h3>
                          <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                            {item.SportDesc}
                          </p>
                        </div>

                        {/* COACH CARD */}
                        {item.CoachName && (
                          <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 p-3">
                            <img
                              src={item.CoachImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                              alt={item.CoachName}
                              className="h-10 w-10 object-cover border border-zinc-700"
                            />
                            <div className="overflow-hidden">
                              <div className="text-[10px] font-bold uppercase text-orange-500">
                                Assigned Faculty
                              </div>
                              <div className="text-xs font-bold text-white truncate">
                                {item.CoachName}
                              </div>
                              <div className="text-[10px] text-zinc-400 truncate">
                                {item.CoachSpecialization}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ACTION FOOTER */}
                    <div className="border-t border-zinc-800 p-4 bg-zinc-900/50 flex items-center justify-between">
                      <div className="text-[10px] text-zinc-400">
                        Enrolled: {new Date(item.EnrolledAt).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => handleDrop(item.EnrollmentID, item.SportName)}
                        className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-bold transition"
                      >
                        <Trash2 size={13} /> Drop Course
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BROWSE ALL 20 CLUB SPORTS */}
        {activeTab === "browse" && (
          <div className="space-y-6">
            {/* SEARCH */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="text"
                placeholder="Search across all 20 sports arenas, facilities, or coaches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121215] border border-zinc-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition"
              />
            </div>

            {/* SPORTS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSports.map((sport) => {
                const isEnrolled = enrolledSportIds.has(sport.SportID);

                return (
                  <div
                    key={sport.SportID}
                    className="border border-zinc-800 bg-[#121215] shadow-lg flex flex-col justify-between overflow-hidden group hover:border-zinc-700 transition"
                  >
                    <div>
                      {/* IMAGE */}
                      <div className="relative h-44 overflow-hidden bg-zinc-950">
                        <img
                          src={sport.ImageURL || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80"}
                          alt={sport.SportName}
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-transparent" />
                        {isEnrolled && (
                          <span className="absolute top-3 right-3 bg-emerald-950/90 border border-emerald-500/40 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1">
                            ✓ Currently Enrolled
                          </span>
                        )}
                      </div>

                      {/* DETAILS */}
                      <div className="p-5 space-y-4">
                        <div>
                          <h3 className="text-base font-bold text-white uppercase tracking-tight">
                            {sport.SportName}
                          </h3>
                          <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                            {sport.Description}
                          </p>
                        </div>

                        {/* COACH PREVIEW */}
                        {sport.CoachName ? (
                          <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800/80 p-2.5">
                            <img
                              src={sport.CoachImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                              alt={sport.CoachName}
                              className="h-9 w-9 object-cover border border-zinc-700"
                            />
                            <div className="overflow-hidden">
                              <div className="text-[9px] font-bold uppercase text-orange-500">
                                Head Coach
                              </div>
                              <div className="text-xs font-bold text-white truncate">
                                {sport.CoachName}
                              </div>
                              <div className="text-[10px] text-zinc-400 truncate">
                                {sport.CoachSpecialization}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2 border border-amber-500/30 bg-amber-500/5 p-2.5">
                            <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-400" />
                            <div>
                              <div className="text-[9px] font-bold uppercase tracking-wider text-amber-400">
                                Coach Vacancy
                              </div>
                              <div className="text-[11px] font-bold text-amber-200">
                                We don't have a coach right now.
                              </div>
                              <div className="text-[10px] text-amber-400/70">
                                Administration will appoint a head coach for this sport soon.
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ENROLL BUTTON */}
                    <div className="border-t border-zinc-800 p-4 bg-zinc-900/40">
                      {isEnrolled ? (
                        <div className="text-center text-xs font-bold text-emerald-400 py-1">
                          ✓ Already in Your Roster
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (!enrollmentInfo.hasActiveMembership) {
                              Swal.fire({
                                title: "Active Membership Required",
                                text: "You must have an approved and active club membership to enroll in sports arenas.",
                                icon: "info",
                                confirmButtonColor: "#f97316",
                                background: "#18181b",
                                color: "#ffffff",
                              });
                              return;
                            }
                            if (limitReached) {
                              Swal.fire({
                                title: "Plan Quota Full",
                                text: `Your ${enrollmentInfo.planName} plan only permits up to ${enrollmentInfo.allowedLimit} sport(s). Please upgrade your plan tier to add more sports!`,
                                icon: "warning",
                                confirmButtonColor: "#f97316",
                                background: "#18181b",
                                color: "#ffffff",
                              });
                              return;
                            }
                            setSelectedSportForEnroll(sport);
                          }}
                          className={`w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider transition ${
                            limitReached
                              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                              : "bg-orange-600 hover:bg-orange-500 text-black shadow-lg"
                          }`}
                        >
                          {limitReached ? "Quota Reached (Upgrade Plan)" : "Enroll in this Sport →"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ENROLLMENT MODAL */}
        {selectedSportForEnroll && (
          <div
            className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setSelectedSportForEnroll(null)}
          >
            <div
              className="modal-content w-full max-w-md border border-zinc-700 bg-[#121215] p-6 shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Dumbbell className="text-orange-500" size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Confirm Sport Enrollment
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedSportForEnroll(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleEnrollSubmit} className="space-y-4">
                <div className="bg-zinc-900 border border-zinc-800 p-3.5 space-y-1">
                  <div className="text-[10px] font-bold uppercase text-orange-500">
                    Selected Arena
                  </div>
                  <div className="text-base font-extrabold text-white">
                    {selectedSportForEnroll.SportName}
                  </div>
                  {selectedSportForEnroll.CoachName && (
                    <div className="text-xs text-zinc-400">
                      Assigned Coach: <strong>{selectedSportForEnroll.CoachName}</strong>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                    Your Skill / Experience Level
                  </label>
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Beginner">Beginner (Foundational training & basics)</option>
                    <option value="Intermediate">Intermediate (Match play & tactical conditioning)</option>
                    <option value="Advanced">Advanced (High-performance drills)</option>
                    <option value="Elite">Elite / Tournament Squad</option>
                  </select>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 p-3 text-xs text-zinc-400">
                  Quota impact: Utilizing slot{" "}
                  <strong className="text-white">
                    {enrollmentInfo.currentEnrolledCount + 1}
                  </strong>{" "}
                  of <strong className="text-white">{enrollmentInfo.allowedLimit}</strong> under{" "}
                  <strong className="text-orange-400">{enrollmentInfo.planName}</strong>.
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSportForEnroll(null)}
                    className="px-4 py-2 border border-zinc-700 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-black text-xs font-bold uppercase tracking-wider transition disabled:opacity-50"
                  >
                    {submitting ? "Processing..." : "Confirm & Enroll"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default UserSportsEnrollment;

