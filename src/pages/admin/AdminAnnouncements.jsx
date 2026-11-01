import { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { Megaphone, Plus, Trash2, X } from "lucide-react";

function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    audience: "All",
    isPublished: true,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/announcements");
      if (res.data.success) {
        setAnnouncements(res.data.announcements);
      }
    } catch (err) {
      console.error("Failed to load announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/admin/announcements", formData);
      if (res.data.success) {
        toast.success("Announcement published!");
        setIsModalOpen(false);
        setFormData({ title: "", message: "", audience: "All", isPublished: true });
        fetchAnnouncements();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish notice.");
    }
  };

  const handleDelete = async (id, title) => {
    const confirm = await Swal.fire({
      title: "Delete Announcement?",
      text: `Are you sure you want to remove "${title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, Delete",
      background: "#18181b",
      color: "#ffffff",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await api.delete(`/admin/announcements/${id}`);
        if (res.data.success) {
          toast.success("Announcement deleted.");
          fetchAnnouncements();
        }
      } catch (err) {
        toast.error("Failed to delete.");
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <PageLoader message="Loading club notices..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="w-full">
        {/* HEADER */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-px w-5 bg-orange-500" />
              <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-orange-500">
                Member Communications
              </span>
            </div>
            <h1 className="mt-2 text-[22px] font-extrabold tracking-tight text-white md:text-[24px]">
              Announcements & Notices
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Publish official club broadcasts, tournament alerts, and maintenance updates.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-none bg-orange-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-orange-500/10 transition hover:bg-white"
          >
            <Plus size={15} />
            New Announcement
          </button>
        </div>

        {/* ANNOUNCEMENTS LIST */}
        <div className="space-y-4">
          {announcements.map((a) => (
            <div
              key={a.AnnouncementID}
              className="flex flex-col justify-between gap-4 border border-zinc-800 bg-[#121215] p-5 sm:flex-row sm:items-start transition hover:border-orange-500/40"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-none bg-orange-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-orange-400 border border-orange-500/20">
                    {a.Audience} Broadcast
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {new Date(a.CreatedAt).toLocaleDateString()} · By {a.AuthorName}
                  </span>
                </div>

                <h3 className="mt-2 text-base font-extrabold text-white">{a.Title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-zinc-300">{a.Message}</p>
              </div>

              <button
                onClick={() => handleDelete(a.AnnouncementID, a.Title)}
                className="rounded-none border border-red-500/30 bg-red-500/10 p-2 text-red-400 hover:bg-red-500 hover:text-white shrink-0"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        {/* MODAL */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md cursor-pointer animate-fadeIn transition-opacity duration-300"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="w-full max-w-md border border-zinc-700 bg-[#121215] p-6 shadow-2xl cursor-default animate-modalPop transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Publish New Announcement
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Turnstiles Maintenance This Weekend"
                    className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                    Target Audience *
                  </label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="All">All Website Visitors & Members</option>
                    <option value="Members">Enrolled Members Only</option>
                    <option value="Public">Public Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                    Message Content *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Enter complete announcement details..."
                    className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-none border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-none bg-orange-500 px-6 py-2 text-xs font-bold uppercase text-black hover:bg-white"
                  >
                    Publish Notice
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

export default AdminAnnouncements;
