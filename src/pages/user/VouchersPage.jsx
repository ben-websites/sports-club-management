import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatusBadge from "../../components/dashboard/StatusBadge";
import PageLoader from "../../components/dashboard/PageLoader";
import RestrictedFeature from "../../components/dashboard/RestrictedFeature";
import VoucherModal from "../../components/vouchers/VoucherModal";
import { ReceiptText, Search, Printer, UploadCloud, Eye, AlertCircle } from "lucide-react";

function VouchersPage() {
  const { isMemberActive } = useAuth();
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      const res = await api.get("/vouchers/my-vouchers");
      if (res.data.success) {
        setVouchers(res.data.vouchers);
        setSelectedVoucher((prev) => {
          if (!prev) return null;
          return res.data.vouchers.find((v) => v.VoucherID === prev.VoucherID) || prev;
        });
      }
    } catch (err) {
      console.error("Failed to load vouchers:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const handleOpenVoucher = (v) => {
    setSelectedVoucher(v);
    setIsModalOpen(true);
  };

  const filtered = vouchers.filter((v) => {
    const matchesSearch =
      v.VoucherNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.VoucherType?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "ALL") return matchesSearch;
    if (filterStatus === "UNPAID") return matchesSearch && (v.VoucherStatus === "Unpaid" || v.VoucherStatus === "Pending_Approval");
    if (filterStatus === "PAID") return matchesSearch && v.VoucherStatus === "Paid";
    return matchesSearch;
  });

  if (loading) {
    return (
      <DashboardLayout role="user">
        <PageLoader message="Loading membership vouchers..." />
      </DashboardLayout>
    );
  }

  if (!isMemberActive) {
    return (
      <RestrictedFeature
        title="Fee Vouchers Restricted"
        featureName="Official deposit slips, voucher printing, and bank payment invoices"
      />
    );
  }

  return (
    <DashboardLayout role="user">
      <div className="w-full">
        {/* HEADER */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-px w-5 bg-orange-500" />
              <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-orange-500">
                Fee Records
              </span>
            </div>
            <h1 className="mt-2 text-[22px] font-extrabold tracking-tight text-white md:text-[24px]">
              Fee Vouchers & Slips
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              View, download, and print official club monthly and advance payment vouchers.
            </p>
          </div>

          <button
            onClick={() => navigate("/user/upload-receipt")}
            className="inline-flex items-center gap-2 rounded-none bg-orange-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-white"
          >
            <UploadCloud size={15} />
            Upload Payment Receipt
          </button>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center justify-between border border-zinc-800 bg-[#121215] p-4">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search voucher # or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2 pl-9 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-zinc-500" />
          </div>

          <div className="flex items-center gap-2">
            {["ALL", "UNPAID", "PAID"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`rounded-none px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                  filterStatus === st
                    ? "bg-orange-500 text-black"
                    : "border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* VOUCHERS LIST / TABLE */}
        <div className="border border-zinc-800 bg-[#121215] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <th className="p-3.5">Voucher Number</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Billing Period</th>
                  <th className="p-3.5">Base Fee</th>
                  <th className="p-3.5">Late Fine</th>
                  <th className="p-3.5">Total Payable</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filtered.length > 0 ? (
                  filtered.map((v) => (
                    <tr key={v.VoucherID} className="hover:bg-zinc-900/40 transition">
                      <td className="p-3.5 font-mono font-bold text-orange-400">
                        {v.VoucherNumber}
                      </td>
                      <td className="p-3.5">
                        <span className="rounded-none bg-zinc-800 px-2 py-0.5 text-[9px] font-bold uppercase text-zinc-300">
                          {v.VoucherType}
                        </span>
                      </td>
                      <td className="p-3.5 text-zinc-300 font-medium">
                        {v.VoucherType === "Advance" ? (
                          <span>
                            {v.advanceMonths?.length || "Multiple"} Month(s) Advance
                          </span>
                        ) : v.VoucherType === "Admission" ? (
                          <span>One-time Admission Fee</span>
                        ) : (
                          <span>
                            {v.BillingMonth}/{v.BillingYear}
                          </span>
                        )}
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
                      <td className="p-3.5 font-mono font-extrabold text-white text-sm">
                        Rs. {Number(v.totalPayable || v.BaseAmount).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-zinc-300">
                        {new Date(v.DueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={v.VoucherStatus} />
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenVoucher(v)}
                          className="inline-flex items-center gap-1 rounded-none border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-[11px] font-bold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
                        >
                          <Eye size={13} className="text-orange-500" />
                          View Slip
                        </button>

                        {(v.VoucherStatus === "Unpaid" || v.VoucherStatus === "Pending_Approval") && (
                          <button
                            onClick={() =>
                              navigate("/user/upload-receipt", {
                                state: { voucherId: v.VoucherID },
                              })
                            }
                            className="inline-flex items-center gap-1 rounded-none bg-orange-500 px-2.5 py-1.5 text-[11px] font-bold text-black transition hover:bg-white"
                          >
                            <UploadCloud size={13} />
                            Pay
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="p-10 text-center text-xs text-zinc-500">
                      No vouchers match your filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PRINTABLE VOUCHER MODAL */}
        <VoucherModal
          voucher={selectedVoucher}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedVoucher(null);
          }}
        />
      </div>
    </DashboardLayout>
  );
}

export default VouchersPage;
