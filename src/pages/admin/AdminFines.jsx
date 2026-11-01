import { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatusBadge from "../../components/dashboard/StatusBadge";
import PageLoader from "../../components/dashboard/PageLoader";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { AlertCircle, ShieldAlert, DollarSign, Settings, Save, CheckCircle2 } from "lucide-react";

function AdminFines() {
  const [finesData, setFinesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lateFinePerDay, setLateFinePerDay] = useState("100");
  const [defaultDueDay, setDefaultDueDay] = useState("10");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/fines");
      if (res.data.success) {
        setFinesData(res.data);
        if (res.data.policy) {
          setLateFinePerDay(String(res.data.policy.lateFinePerDay));
          setDefaultDueDay(String(res.data.policy.defaultDueDay));
        }
      }
    } catch (err) {
      console.error("Failed to load fines data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePolicy = async (e) => {
    e.preventDefault();

    const confirm = await Swal.fire({
      title: "Update Late Fine Policy?",
      text: `Set due date to day ${defaultDueDay} of every month with Rs. ${lateFinePerDay}/day overdue penalty for all members?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#27272a",
      confirmButtonText: "Yes, Update Policy",
      cancelButtonText: "Cancel",
      background: "#18181b",
      color: "#ffffff",
      allowOutsideClick: true,
    });

    if (!confirm.isConfirmed) return;

    setSaving(true);
    try {
      const res = await api.put("/admin/fines/policy", {
        lateFinePerDay: Number(lateFinePerDay),
        defaultDueDay: Number(defaultDueDay),
      });

      if (res.data.success) {
        toast.success("Fine policy updated successfully!");
        fetchFines();
      }
    } catch (err) {
      toast.error("Failed to update fine policy.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <PageLoader message="Loading overdue fees & penalty policies..." />
      </DashboardLayout>
    );
  }

  const stats = finesData?.stats || {};
  const overdueVouchers = finesData?.overdueVouchers || [];

  return (
    <DashboardLayout role="admin">
      <div className="w-full">
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="h-px w-5 bg-orange-500" />
            <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-orange-500">
              Penalty System
            </span>
          </div>
          <h1 className="mt-2 text-[22px] font-extrabold tracking-tight text-white md:text-[24px]">
            Late Payment Fines & Policy Controls
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Configure dynamic daily overdue penalties, default billing due days, and track overdue receivables.
          </p>
        </div>

        {/* METRICS */}
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <div className="border border-zinc-800 bg-[#121215] p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Overdue Vouchers
            </span>
            <div className="mt-2 text-2xl font-black text-red-500">
              {stats.totalOverdueCount || 0}
            </div>
            <div className="mt-1 text-[11px] text-zinc-500">Unpaid past due date</div>
          </div>

          <div className="border border-zinc-800 bg-[#121215] p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Accumulated Fines
            </span>
            <div className="mt-2 text-2xl font-black text-orange-400 font-mono">
              Rs. {(stats.totalOverdueFines || 0).toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-zinc-500">Total penalties owed</div>
          </div>

          <div className="border border-zinc-800 bg-[#121215] p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Base Fees Overdue
            </span>
            <div className="mt-2 text-2xl font-black text-white font-mono">
              Rs. {(stats.totalOverdueBase || 0).toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-zinc-500">Principal monthly dues</div>
          </div>

          <div className="border border-zinc-800 bg-[#121215] p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Total Overdue Receivable
            </span>
            <div className="mt-2 text-2xl font-black text-red-400 font-mono">
              Rs. {(stats.totalOutstanding || 0).toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-zinc-500">Principal + Fines</div>
          </div>
        </div>

        {/* POLICY CONFIGURATION FORM */}
        <div className="mb-6 border border-zinc-800 bg-[#121215] p-6">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-4">
            <Settings size={16} className="text-orange-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              Configure Fine Policy & Due Date
            </h2>
          </div>

          <form onSubmit={handleSavePolicy} className="grid gap-4 sm:grid-cols-3 items-end">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                Late Fine Per Day (PKR) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={lateFinePerDay}
                onChange={(e) => setLateFinePerDay(e.target.value)}
                placeholder="e.g. 100"
                className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Charged for each calendar day past the due date.
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                Default Due Day of Month *
              </label>
              <input
                type="number"
                required
                min="1"
                max="28"
                value={defaultDueDay}
                onChange={(e) => setDefaultDueDay(e.target.value)}
                placeholder="e.g. 10"
                className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Default due date for new monthly fee vouchers.
              </span>
            </div>

            <div>
              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-none bg-orange-500 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-white disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? "Saving..." : "Save Policy Settings"}
              </button>
            </div>
          </form>
        </div>

        {/* OVERDUE VOUCHERS LIST */}
        <section className="border border-zinc-800 bg-[#121215] overflow-hidden">
          <div className="border-b border-zinc-800 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Currently Overdue Vouchers Requiring Follow-Up
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <th className="p-3.5">Voucher #</th>
                  <th className="p-3.5">Member Name</th>
                  <th className="p-3.5">Contact Phone</th>
                  <th className="p-3.5">Period</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5">Days Late</th>
                  <th className="p-3.5">Base Fee</th>
                  <th className="p-3.5">Fine Amount</th>
                  <th className="p-3.5">Total Payable</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {overdueVouchers.length > 0 ? (
                  overdueVouchers.map((v) => (
                    <tr key={v.VoucherID} className="hover:bg-zinc-900/40">
                      <td className="p-3.5 font-mono font-bold text-orange-400">
                        {v.VoucherNumber}
                      </td>
                      <td className="p-3.5 font-bold text-white">
                        {v.FullName}
                      </td>
                      <td className="p-3.5 font-mono text-zinc-400">
                        {v.Phone || "—"}
                      </td>
                      <td className="p-3.5 text-zinc-300">
                        {v.VoucherType === "Advance" ? "Advance" : `${v.BillingMonth}/${v.BillingYear}`}
                      </td>
                      <td className="p-3.5 text-zinc-400">
                        {new Date(v.DueDate).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 font-bold text-red-400">
                        {v.daysLate} day{v.daysLate > 1 ? "s" : ""}
                      </td>
                      <td className="p-3.5 font-mono text-zinc-300">
                        Rs. {Number(v.BaseAmount).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-mono text-red-400 font-bold">
                        Rs. {Number(v.calculatedFine).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-mono font-black text-white">
                        Rs. {Number(v.totalPayable).toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status="Overdue" />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="p-8 text-center text-xs text-zinc-500">
                      Zero overdue vouchers at present. All active members are up to date!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default AdminFines;
