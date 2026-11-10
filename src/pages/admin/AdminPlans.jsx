import { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { Gem, Plus, Edit2, Trash2, CheckCircle2, XCircle, X } from "lucide-react";

function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [formData, setFormData] = useState({
    planName: "",
    monthlyFee: "",
    admissionFee: "3000",
    durationMonths: "6",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/plans");
      if (res.data.success) {
        setPlans(res.data.plans);
      }
    } catch (err) {
      console.error("Failed to load plans:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      planName: "",
      monthlyFee: "",
      admissionFee: "3000",
      durationMonths: "6",
      description: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingPlan(p);
    setFormData({
      planName: p.PlanName,
      monthlyFee: p.MonthlyFee,
      admissionFee: p.AdmissionFee ?? 3000,
      durationMonths: p.DurationMonths,
      description: p.Description || "",
      isActive: p.IsActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        const res = await api.put(`/admin/plans/${editingPlan.PlanID}`, formData);
        if (res.data.success) {
          toast.success("Membership plan updated successfully!");
        }
      } else {
        const res = await api.post("/admin/plans", formData);
        if (res.data.success) {
          toast.success("New membership plan created!");
        }
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed.");
    }
  };

  const handleDelete = async (planId, planName) => {
    const confirm = await Swal.fire({
      title: `Delete ${planName}?`,
      text: "If applications exist for this plan, it will be deactivated rather than deleted to preserve database integrity.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, Proceed",
      background: "#18181b",
      color: "#ffffff",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await api.delete(`/admin/plans/${planId}`);
        if (res.data.success) {
          toast.success(res.data.message);
          fetchPlans();
        }
      } catch (err) {
        toast.error("Failed to delete plan.");
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <PageLoader message="Loading membership plans..." />
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
                Package Configurations
              </span>
            </div>
            <h1 className="mt-2 text-[22px] font-extrabold tracking-tight text-white md:text-[24px]">
              Membership Packages & Fees
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Create, configure duration, monthly pricing, and privileges for club tiers.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-none bg-orange-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-orange-500/10 transition hover:bg-white"
          >
            <Plus size={15} />
            Create New Plan
          </button>
        </div>

        {/* PLANS GRID */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <div
              key={p.PlanID}
              className={`flex flex-col justify-between border bg-[#121215] p-5 transition ${
                p.IsActive ? "border-zinc-800 hover:border-orange-500/50" : "border-red-500/30 opacity-70"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">
                    Tier #{p.PlanID}
                  </span>
                  <span
                    className={`rounded-none px-2 py-0.5 text-[9px] font-bold uppercase ${
                      p.IsActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {p.IsActive ? "Active" : "Disabled"}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-black text-white">{p.PlanName}</h3>

                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white font-mono">
                    Rs. {Number(p.MonthlyFee).toLocaleString()}
                  </span>
                  <span className="text-xs text-zinc-500">/ mo</span>
                </div>

                <div className="mt-1 text-xs text-zinc-400">
                  Duration: <span className="font-bold text-zinc-200">{p.DurationMonths} Months</span>
                </div>

                <div className="mt-1 text-xs text-zinc-400">
                  Admission Fee:{" "}
                  <span className="font-bold text-orange-400">Rs. {Number(p.AdmissionFee ?? 0).toLocaleString()}</span>
                </div>

                <p className="mt-3 text-xs leading-5 text-zinc-400 line-clamp-3">
                  {p.Description || "Standard club membership privileges."}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 border-t border-zinc-800 pt-4">
                <button
                  onClick={() => openEditModal(p)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-none border border-zinc-700 bg-zinc-800 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-700"
                >
                  <Edit2 size={13} className="text-orange-500" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.PlanID, p.PlanName)}
                  className="rounded-none border border-red-500/30 bg-red-500/10 p-2 text-red-400 hover:bg-red-500 hover:text-white"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CREATE / EDIT MODAL */}
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
                  {editingPlan ? "Edit Membership Plan" : "Create New Membership Plan"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.planName}
                    onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                    placeholder="e.g. Gold Champion"
                    className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                      Monthly Fee (PKR) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.monthlyFee}
                      onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                      placeholder="e.g. 3500"
                      className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                      Admission Fee (PKR) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.admissionFee}
                      onChange={(e) => setFormData({ ...formData, admissionFee: e.target.value })}
                      placeholder="e.g. 5000"
                      className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                      Duration (Months) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="60"
                      value={formData.durationMonths}
                      onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                      placeholder="e.g. 6"
                      className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                    Plan Privileges & Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe sports facility access, personal trainer sessions, locker amenities..."
                    className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                {editingPlan && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="planActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="accent-orange-500 h-4 w-4"
                    />
                    <label htmlFor="planActive" className="text-xs text-zinc-300 font-bold">
                      Active (Visible on Website)
                    </label>
                  </div>
                )}

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
                    {editingPlan ? "Save Changes" : "Create Plan"}
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

export default AdminPlans;
