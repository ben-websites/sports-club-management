import { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatusBadge from "../../components/dashboard/StatusBadge";
import PageLoader from "../../components/dashboard/PageLoader";
import VoucherModal from "../../components/vouchers/VoucherModal";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { ReceiptText, Search, Plus, Printer, Eye, Zap, AlertCircle, X, ShieldAlert } from "lucide-react";

function AdminVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const currentDate = new Date();
  const [genData, setGenData] = useState({
    billingMonth: currentDate.getMonth() + 1,
    billingYear: currentDate.getFullYear(),
    dueDay: 10,
  });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchVouchers(true);

    // Live auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchVouchers(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchVouchers = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await api.get("/admin/vouchers");
      if (res.data.success) {
        setVouchers(res.data.vouchers);
      }
    } catch (err) {
      console.error("Failed to load vouchers:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    const confirm = await Swal.fire({
      title: "Generate Monthly Fee Vouchers?",
      text: `Are you sure you want to run batch voucher generation for ${genData.billingMonth}/${genData.billingYear}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#27272a",
      confirmButtonText: "Yes, Generate Vouchers",
      cancelButtonText: "Cancel",
      background: "#18181b",
      color: "#ffffff",
      allowOutsideClick: true,
    });

    if (!confirm.isConfirmed) return;

    setGenerating(true);

    try {
      const res = await api.post("/admin/vouchers/generate-monthly", genData);
      if (res.data.success) {
        const sum = res.data.summary;
        setIsGenerateModalOpen(false);

        await Swal.fire({
          icon: "success",
          title: "Vouchers Generation Completed!",
          html: `
            <div class="text-left text-xs space-y-2 mt-3 p-3 bg-zinc-900 border border-zinc-800">
              <p><b>Total Active Members:</b> ${sum.totalActiveMembers}</p>
              <p class="text-orange-400 font-bold"><b>New Vouchers Created:</b> ${sum.generatedCount}</p>
              <p class="text-emerald-400 font-bold"><b>Skipped (Prepaid in Advance):</b> ${sum.skippedPrepaidCount}</p>
              <p class="text-zinc-400"><b>Already Generated Previously:</b> ${sum.alreadyGeneratedCount}</p>
            </div>
          `,
          confirmButtonColor: "#f97316",
          background: "#18181b",
          color: "#ffffff",
        });

        fetchVouchers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate vouchers.");
    } finally {
      setGenerating(false);
    }
  };

  const filtered = vouchers.filter((v) => {
    const matchesSearch =
      v.VoucherNumber?.toLowerCase().includes(search.toLowerCase()) ||
      v.FullName?.toLowerCase().includes(search.toLowerCase()) ||
      v.MembershipNumber?.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === "ALL") return matchesSearch;
    return matchesSearch && v.VoucherStatus?.toUpperCase() === statusFilter;
  });

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <PageLoader message="Loading monthly fee vouchers..." />
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
                Fee Management
              </span>
            </div>
            <h1 className="mt-2 text-[22px] font-extrabold tracking-tight text-white md:text-[24px]">
              Monthly & Advance Fee Vouchers
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Generate monthly fee batches, apply advance prepayment skip checks, and view all slips.
            </p>
          </div>

          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-none bg-orange-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-orange-500/10 transition hover:bg-white"
          >
            <Plus size={15} />
            Generate Monthly Batch
          </button>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center justify-between border border-zinc-800 bg-[#121215] p-4">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search member, voucher # or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2 pl-9 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-zinc-500" />
          </div>

          <div className="flex items-center gap-2">
            {["ALL", "UNPAID", "PENDING_APPROVAL", "PAID"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-none px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                  statusFilter === st
                    ? "bg-orange-500 text-black"
                    : "border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {st === "PENDING_APPROVAL" ? "Pending Approval" : st}
              </button>
            ))}
          </div>
        </div>

        {/* VOUCHERS TABLE */}
        <div className="border border-zinc-800 bg-[#121215] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <th className="p-3.5">Voucher #</th>
                  <th className="p-3.5">Member</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Cycle</th>
                  <th className="p-3.5">Base Amount</th>
                  <th className="p-3.5">Late Penalty</th>
                  <th className="p-3.5">Total Payable</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filtered.length > 0 ? (
                  filtered.map((v) => (
                    <tr key={v.VoucherID} className="hover:bg-zinc-900/40">
                      <td className="p-3.5 font-mono font-bold text-orange-400">
                        {v.VoucherNumber}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-white">{v.FullName}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {v.MembershipNumber} · {v.PlanName}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="rounded-none bg-zinc-800 px-2 py-0.5 text-[9px] font-bold uppercase text-zinc-300">
                          {v.VoucherType}
                        </span>
                      </td>
                      <td className="p-3.5 text-zinc-300">
                        {v.VoucherType === "Advance" ? "Advance" : `${v.BillingMonth}/${v.BillingYear}`}
                      </td>
                      <td className="p-3.5 font-mono text-zinc-300">
                        Rs. {Number(v.BaseAmount).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-mono">
                        {v.daysLate > 0 ? (
                          <span className="text-red-400 font-bold">
                            + Rs. {v.calculatedFine.toLocaleString()} ({v.daysLate}d)
                          </span>
                        ) : (
                          <span className="text-zinc-500">Rs. 0</span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono font-black text-white text-sm">
                        Rs. {Number(v.totalPayable || v.BaseAmount).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-zinc-300">
                        {new Date(v.DueDate).toLocaleDateString()}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={v.VoucherStatus} />
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedVoucher(v);
                            setIsViewModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-none border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-[11px] font-bold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
                        >
                          <Eye size={12} className="text-orange-500" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="p-8 text-center text-xs text-zinc-500">
                      No vouchers match your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* GENERATE MONTHLY BATCH MODAL */}
        {isGenerateModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md cursor-pointer animate-fadeIn transition-opacity duration-300"
            onClick={() => setIsGenerateModalOpen(false)}
          >
            <div
              className="w-full max-w-lg border border-zinc-700 bg-[#121215] p-6 shadow-2xl cursor-default animate-modalPop transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-none bg-orange-500 text-black flex items-center justify-center font-bold">
                    <ReceiptText size={16} />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Generate Monthly Fee Vouchers
                  </h3>
                </div>
                <button
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                      Billing Month (1 - 12) *
                    </label>
                    <select
                      value={genData.billingMonth}
                      onChange={(e) => setGenData({ ...genData, billingMonth: parseInt(e.target.value, 10) })}
                      className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                        <option key={m} value={m}>
                          Month {m} ({new Date(2000, m - 1, 1).toLocaleString("default", { month: "long" })})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                      Billing Year *
                    </label>
                    <input
                      type="number"
                      required
                      min="2020"
                      max="2035"
                      value={genData.billingYear}
                      onChange={(e) => setGenData({ ...genData, billingYear: parseInt(e.target.value, 10) })}
                      className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                    Due Day of Month *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="28"
                    value={genData.dueDay}
                    onChange={(e) => setGenData({ ...genData, dueDay: parseInt(e.target.value, 10) })}
                    className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-400 mt-0.5 block">
                    Vouchers will be due on day {genData.dueDay} of month {genData.billingMonth}.
                  </span>
                </div>

                {/* ADVANCE PREPAYMENT SKIP NOTICE */}
                <div className="border border-orange-500/30 bg-orange-500/10 p-3.5 text-xs text-zinc-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-orange-400">
                    <Zap size={14} />
                    Advance Payment Skip Protocol
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    The system automatically consults the <span className="font-mono text-white">MemberPrepayments</span> ledger. Any member who has already paid for Month {genData.billingMonth}/{genData.billingYear} in advance will be <strong>strictly skipped</strong> and will not receive a duplicate voucher.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsGenerateModalOpen(false)}
                    className="rounded-none border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generating}
                    className="rounded-none bg-orange-500 px-6 py-2 text-xs font-bold uppercase text-black hover:bg-white disabled:opacity-50"
                  >
                    {generating ? "Generating Batch..." : "Generate Vouchers"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW VOUCHER SLIP MODAL */}
        <VoucherModal
          voucher={selectedVoucher}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedVoucher(null);
          }}
        />
      </div>
    </DashboardLayout>
  );
}

export default AdminVouchers;
