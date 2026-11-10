import { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import {
  Award,
  Plus,
  Users,
  Search,
  Phone,
  Mail,
  Edit2,
  Trash2,
  X,
  Dumbbell,
  Star,
  DollarSign,
  Briefcase,
  Eye,
} from "lucide-react";

function AdminCoaches() {
  const [coaches, setCoaches] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoachForStudents, setSelectedCoachForStudents] = useState(null);
  const [coachStudents, setCoachStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [editingCoach, setEditingCoach] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    sportId: "",
    specialization: "",
    experienceYears: 5,
    bio: "",
    imageUrl: "",
    monthlySalary: 75000,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coachRes, sportRes] = await Promise.all([
        api.get("/sports-management/coaches"),
        api.get("/sports-management/sports"),
      ]);

      if (coachRes.data.success) setCoaches(coachRes.data.data);
      if (sportRes.data.success) setSports(sportRes.data.data);
    } catch (err) {
      console.error("Failed to load coaches data:", err);
      toast.error("Could not fetch coaches list.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCoach(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      sportId: sports[0]?.SportID || "",
      specialization: "Head Faculty Coach",
      experienceYears: 5,
      bio: "",
      imageUrl: "",
      monthlySalary: 75000,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coach) => {
    setEditingCoach(coach);
    setFormData({
      fullName: coach.FullName,
      email: coach.Email || "",
      phone: coach.Phone || "",
      sportId: coach.SportID || "",
      specialization: coach.Specialization || "",
      experienceYears: coach.ExperienceYears || 5,
      bio: coach.Bio || "",
      imageUrl: coach.ImageURL || "",
      monthlySalary: coach.MonthlySalary || 75000,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCoach) {
        const res = await api.put(`/sports-management/coaches/${editingCoach.CoachID}`, formData);
        if (res.data.success) {
          toast.success("Coach profile updated successfully.");
          setIsModalOpen(false);
          fetchData();
        }
      } else {
        const res = await api.post("/sports-management/coaches", formData);
        if (res.data.success) {
          toast.success("Coach appointed successfully.");
          setIsModalOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save coach profile.");
    }
  };

  const handleViewStudents = async (coach) => {
    setSelectedCoachForStudents(coach);
    setLoadingStudents(true);
    try {
      const res = await api.get(`/sports-management/coaches/${coach.CoachID}`);
      if (res.data.success) {
        setCoachStudents(res.data.data.students || []);
      }
    } catch (err) {
      toast.error("Failed to fetch enrolled students.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleDeleteCoach = async (coachId, name) => {
    const result = await Swal.fire({
      title: `Deactivate Coach ${name}?`,
      text: "The coach will be archived and removed from active schedules.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#27272a",
      confirmButtonText: "Yes, Deactivate",
      background: "#18181b",
      color: "#ffffff",
    });

    if (result.isConfirmed) {
      try {
        const res = await api.delete(`/sports-management/coaches/${coachId}`);
        if (res.data.success) {
          toast.success(res.data.message);
          fetchData();
        }
      } catch (err) {
        toast.error("Failed to deactivate coach.");
      }
    }
  };

  const filteredCoaches = coaches.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.FullName.toLowerCase().includes(q) ||
      (c.SportName && c.SportName.toLowerCase().includes(q)) ||
      (c.Specialization && c.Specialization.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoader message="Loading Faculty & Coach Directorate..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="border border-zinc-800 bg-[#121215] p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Award className="text-orange-500" size={24} />
                <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-white">
                  Coach Faculty Management
                </h1>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                Appoint, monitor, and assign dedicated certified coaches across all 20 club sports arenas.
              </p>
            </div>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-black px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition self-start md:self-auto"
            >
              <Plus size={16} /> Appoint New Coach
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input
            type="text"
            placeholder="Search coaches by name, sport arena, or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#121215] border border-zinc-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* COACHES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoaches.map((c) => (
            <div
              key={c.CoachID}
              className="border border-zinc-800 bg-[#121215] shadow-lg flex flex-col justify-between overflow-hidden group hover:border-zinc-700 transition"
            >
              <div>
                {/* PHOTO & BADGE */}
                <div className="relative h-48 overflow-hidden bg-zinc-950">
                  <img
                    src={c.ImageURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"}
                    alt={c.FullName}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 bg-orange-500 text-black text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1">
                    {c.SportName || "General Athletics"}
                  </span>
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/80 px-2 py-0.5 border border-amber-400/30 text-amber-300 text-xs font-bold">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span>{c.Rating || "4.9"}</span>
                  </div>
                </div>

                {/* INFO */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white uppercase tracking-tight">
                      {c.FullName}
                    </h3>
                    <div className="text-xs font-semibold text-orange-400">
                      {c.Specialization}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2">
                    {c.Bio || "Dedicated club faculty specializing in athlete development and competition tactics."}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-zinc-800/80 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-orange-500 shrink-0" />
                      <span>{c.Phone || "+92 300 0000000"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-orange-500 shrink-0" />
                      <span className="truncate">{c.Email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase size={13} className="text-orange-500 shrink-0" />
                      <span>{c.ExperienceYears || 5} Years Experience</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER & ACTIONS */}
              <div className="border-t border-zinc-800 p-4 bg-zinc-900/50 flex items-center justify-between">
                <button
                  onClick={() => handleViewStudents(c)}
                  className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 font-bold"
                >
                  <Eye size={14} /> Students ({c.ActiveStudentCount || 0})
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                    title="Edit Coach Profile"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteCoach(c.CoachID, c.FullName)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-zinc-800 transition"
                    title="Deactivate Coach"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ADD / EDIT MODAL */}
        {isModalOpen && (
          <div
            className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="modal-content w-full max-w-lg border border-zinc-700 bg-[#121215] p-6 shadow-2xl cursor-default overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Award className="text-orange-500" size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    {editingCoach ? "Edit Coach Profile" : "Appoint New Head Coach"}
                  </h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase text-zinc-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-zinc-300 mb-1">Assigned Sport</label>
                    <select
                      value={formData.sportId}
                      onChange={(e) => setFormData({ ...formData, sportId: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    >
                      {sports.map((sp) => (
                        <option key={sp.SportID} value={sp.SportID}>
                          {sp.SportName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-zinc-300 mb-1">Specialization</label>
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-zinc-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-zinc-300 mb-1">Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-zinc-300 mb-1">Experience (Years)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-zinc-300 mb-1">Monthly Salary (PKR)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.monthlySalary}
                      onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-zinc-300 mb-1">Profile Photo Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-zinc-300 mb-1">Faculty Biography</label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 p-3 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-zinc-700 uppercase font-bold text-zinc-400 hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-black font-bold uppercase tracking-wider"
                  >
                    {editingCoach ? "Save Changes" : "Appoint Coach"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW STUDENTS MODAL */}
        {selectedCoachForStudents && (
          <div
            className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setSelectedCoachForStudents(null)}
          >
            <div
              className="modal-content w-full max-w-2xl border border-zinc-700 bg-[#121215] p-6 shadow-2xl cursor-default max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="text-orange-500" size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Enrolled Students: Coach {selectedCoachForStudents.FullName} ({coachStudents.length})
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedCoachForStudents(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {loadingStudents ? (
                <div className="py-8 text-center text-zinc-400">Loading student roster...</div>
              ) : coachStudents.length === 0 ? (
                <div className="py-8 text-center text-zinc-400">
                  No active students enrolled in this sport yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-zinc-800 bg-zinc-900 text-[10px] uppercase tracking-wider text-zinc-400">
                      <tr>
                        <th className="p-3">Student Name</th>
                        <th className="p-3">Email & Phone</th>
                        <th className="p-3">Skill Level</th>
                        <th className="p-3">Enrolled At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {coachStudents.map((st) => (
                        <tr key={st.EnrollmentID} className="hover:bg-zinc-900/40">
                          <td className="p-3 font-bold text-white">{st.FullName}</td>
                          <td className="p-3 text-zinc-400">
                            <div>{st.Email}</div>
                            <div className="text-[10px] text-zinc-500">{st.Phone}</div>
                          </td>
                          <td className="p-3">
                            <span className="bg-orange-950/70 text-orange-400 border border-orange-500/30 px-2 py-0.5 text-[10px] font-bold uppercase">
                              {st.SkillLevel}
                            </span>
                          </td>
                          <td className="p-3 text-zinc-400">
                            {new Date(st.EnrolledAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AdminCoaches;

