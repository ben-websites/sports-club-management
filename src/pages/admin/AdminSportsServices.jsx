import { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { Dumbbell, Plus, Trash2, X, Compass, CheckCircle2 } from "lucide-react";

function AdminSportsServices() {
  const [activeTab, setActiveTab] = useState("sports"); // 'sports' | 'services'
  const [sports, setSports] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isSportModalOpen, setIsSportModalOpen] = useState(false);
  const [sportForm, setSportForm] = useState({ sportName: "", description: "", imageUrl: "" });

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({ serviceName: "", description: "", imageUrl: "" });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const [spRes, svRes] = await Promise.all([
        api.get("/admin/sports"),
        api.get("/admin/services"),
      ]);

      if (spRes.data.success) setSports(spRes.data.sports);
      if (svRes.data.success) setServices(svRes.data.services);
    } catch (err) {
      console.error("Content fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSport = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/admin/sports", sportForm);
      if (res.data.success) {
        toast.success("Sport facility added!");
        setIsSportModalOpen(false);
        setSportForm({ sportName: "", description: "", imageUrl: "" });
        fetchContent();
      }
    } catch (err) {
      toast.error("Failed to add sport.");
    }
  };

  const handleDeleteSport = async (id, name) => {
    const confirm = await Swal.fire({
      title: `Delete ${name}?`,
      text: "This arena will be removed from the public website.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, Delete",
      background: "#18181b",
      color: "#ffffff",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await api.delete(`/admin/sports/${id}`);
        if (res.data.success) {
          toast.success("Sport deleted.");
          fetchContent();
        }
      } catch (err) {
        toast.error("Failed to delete sport.");
      }
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/admin/services", serviceForm);
      if (res.data.success) {
        toast.success("Service added!");
        setIsServiceModalOpen(false);
        setServiceForm({ serviceName: "", description: "", imageUrl: "" });
        fetchContent();
      }
    } catch (err) {
      toast.error("Failed to add service.");
    }
  };

  const handleDeleteService = async (id, name) => {
    const confirm = await Swal.fire({
      title: `Delete ${name}?`,
      text: "This service will be removed from the public website.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, Delete",
      background: "#18181b",
      color: "#ffffff",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await api.delete(`/admin/services/${id}`);
        if (res.data.success) {
          toast.success("Service deleted.");
          fetchContent();
        }
      } catch (err) {
        toast.error("Failed to delete service.");
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <PageLoader message="Loading sports facilities & amenities..." />
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
                Website Content CMS
              </span>
            </div>
            <h1 className="mt-2 text-[22px] font-extrabold tracking-tight text-white md:text-[24px]">
              Sports Arenas & Club Services
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Manage live sports courts, coaching academies, spas, and facilities displayed across the platform.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "sports" ? (
              <button
                onClick={() => setIsSportModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-none bg-orange-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-orange-500/10 transition hover:bg-white"
              >
                <Plus size={15} />
                Add Sports Arena
              </button>
            ) : (
              <button
                onClick={() => setIsServiceModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-none bg-orange-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-orange-500/10 transition hover:bg-white"
              >
                <Plus size={15} />
                Add Club Service
              </button>
            )}
          </div>
        </div>

        {/* TABS */}
        <div className="mb-6 flex items-center gap-2 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab("sports")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === "sports"
                ? "border-orange-500 text-orange-500 bg-orange-500/5"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Compass size={15} />
            Sports Arenas ({sports.length})
          </button>

          <button
            onClick={() => setActiveTab("services")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === "services"
                ? "border-orange-500 text-orange-500 bg-orange-500/5"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Dumbbell size={15} />
            Club Amenities & Services ({services.length})
          </button>
        </div>

        {/* TAB CONTENT: SPORTS */}
        {activeTab === "sports" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sports.map((sp) => (
              <div
                key={sp.SportID}
                className="group flex flex-col justify-between overflow-hidden border border-zinc-800 bg-[#121215] transition hover:border-orange-500/50"
              >
                <div>
                  <div className="h-44 overflow-hidden relative bg-zinc-900">
                    <img
                      src={sp.ImageURL || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"}
                      alt={sp.SportName}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-extrabold text-white">{sp.SportName}</h3>
                    <p className="mt-2 text-xs leading-5 text-zinc-400">{sp.Description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end border-t border-zinc-800 p-4">
                  <button
                    onClick={() => handleDeleteSport(sp.SportID, sp.SportName)}
                    className="inline-flex items-center gap-1.5 rounded-none border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB CONTENT: SERVICES */}
        {activeTab === "services" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((sv) => (
              <div
                key={sv.ServiceID}
                className="group flex flex-col justify-between overflow-hidden border border-zinc-800 bg-[#121215] transition hover:border-orange-500/50"
              >
                <div>
                  <div className="h-40 overflow-hidden relative bg-zinc-900">
                    <img
                      src={sv.ImageURL || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"}
                      alt={sv.ServiceName}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-extrabold text-white">{sv.ServiceName}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-400">{sv.Description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end border-t border-zinc-800 p-3">
                  <button
                    onClick={() => handleDeleteService(sv.ServiceID, sv.ServiceName)}
                    className="inline-flex items-center gap-1 rounded-none border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 size={13} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL: ADD SPORT */}
        {isSportModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md cursor-pointer animate-fadeIn transition-opacity duration-300"
            onClick={() => setIsSportModalOpen(false)}
          >
            <div
              className="w-full max-w-md border border-zinc-700 bg-[#121215] p-6 shadow-2xl cursor-default animate-modalPop transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Add New Sports Facility Arena
                </h3>
                <button onClick={() => setIsSportModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddSport} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                    Sport Arena Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={sportForm.sportName}
                    onChange={(e) => setSportForm({ ...sportForm, sportName: e.target.value })}
                    placeholder="e.g. Futsal Arena 1"
                    className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={sportForm.imageUrl}
                    onChange={(e) => setSportForm({ ...sportForm, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                    Description & Specifications
                  </label>
                  <textarea
                    rows={3}
                    value={sportForm.description}
                    onChange={(e) => setSportForm({ ...sportForm, description: e.target.value })}
                    placeholder="Court specs, lighting, turf type..."
                    className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsSportModalOpen(false)}
                    className="rounded-none border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-none bg-orange-500 px-6 py-2 text-xs font-bold uppercase text-black hover:bg-white"
                  >
                    Add Sport Arena
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD SERVICE */}
        {isServiceModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md cursor-pointer animate-fadeIn transition-opacity duration-300"
            onClick={() => setIsServiceModalOpen(false)}
          >
            <div
              className="w-full max-w-md border border-zinc-700 bg-[#121215] p-6 shadow-2xl cursor-default animate-modalPop transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Add New Club Amenity / Service
                </h3>
                <button onClick={() => setIsServiceModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddService} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceForm.serviceName}
                    onChange={(e) => setServiceForm({ ...serviceForm, serviceName: e.target.value })}
                    placeholder="e.g. Physiotherapy & Sports Massage"
                    className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={serviceForm.imageUrl}
                    onChange={(e) => setServiceForm({ ...serviceForm, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    placeholder="Service offerings, benefits for members..."
                    className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsServiceModalOpen(false)}
                    className="rounded-none border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-none bg-orange-500 px-6 py-2 text-xs font-bold uppercase text-black hover:bg-white"
                  >
                    Add Service
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

export default AdminSportsServices;
