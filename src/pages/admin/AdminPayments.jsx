import { useState, useEffect } from "react";
import api from "../../services/api";
import startPolling from "../../services/polling";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatusBadge from "../../components/dashboard/StatusBadge";
import PageLoader from "../../components/dashboard/PageLoader";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { CreditCard, Search, CheckCircle2, XCircle, Eye, Image as ImageIcon, X } from "lucide-react";

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchPayments(true);

    // Live auto-refresh (skipped while the tab is hidden)
    return startPolling(() => fetchPayments(false));
  }, []);

  const fetchPayments = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await api.get("/admin/payments");
      if (res.data.success) {
        setPayments(res.data.payments);
      }
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const handleReview = async (paymentId, action) => {
    let remarks = "";

    if (action === "reject") {
      const { value: text, isConfirmed } = await Swal.fire({
        title: "Reject Payment Proof",
        input: "textarea",
        inputLabel: "Remarks or reason for rejection:",
        inputPlaceholder: "e.g. Unreadable receipt screenshot or mismatched transaction ID",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Confirm Rejection",
        background: "#18181b",
        color: "#ffffff",
      });

      if (!isConfirmed) return;
      remarks = text || "Payment receipt rejected by administration.";
    } else {
      const confirm = await Swal.fire({
        title: "Approve Payment Proof?",
        text: "This will mark the voucher as Paid. If this is an Advance voucher, prepaid months will automatically be activated in the prepayment ledger.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#f97316",
        confirmButtonText: "Yes, Approve Payment",
        background: "#18181b",
        color: "#ffffff",
      });

      if (!confirm.isConfirmed) return;
    }

    try {
      const res = await api.put(`/admin/payments/${paymentId}/review`, {
        action,
        remarks,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        fetchPayments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process payment review.");
    }
  };

  const filtered = payments.filter((p) => {
    const matchesSearch =
      p.FullName?.toLowerCase().includes(search.toLowerCase()) ||
      p.VoucherNumber?.toLowerCase().includes(search.toLowerCase()) ||
      p.TransactionReference?.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === "ALL") return matchesSearch;
    return matchesSearch && p.PaymentStatus?.toUpperCase() === statusFilter;
  });

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <PageLoader message="Loading payment submissions..." />
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
                Payment Verification
              </span>
            </div>
            <h1 className="mt-2 text-[22px] font-extrabold tracking-tight text-white md:text-[24px]">
              Fee Receipts & Verification
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Inspect uploaded Cloudinary proof slips, verify bank transaction IDs, and approve vouchers.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-4 py-2">
            Pending Review:{" "}
            <span className="text-orange-400 font-mono font-bold">
              {payments.filter((p) => p.PaymentStatus === "Pending").length}
            </span>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center justify-between border border-zinc-800 bg-[#121215] p-4">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search member, voucher #, or transaction ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2 pl-9 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-zinc-500" />
          </div>

          <div className="flex items-center gap-2">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-none px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                  statusFilter === st
                    ? "bg-orange-500 text-black"
                    : "border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* PAYMENTS TABLE */}
        <div className="border border-zinc-800 bg-[#121215] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Member</th>
                  <th className="p-3.5">Voucher #</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Transaction ID</th>
                  <th className="p-3.5">Proof Slip</th>
                  <th className="p-3.5">Submitted</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filtered.length > 0 ? (
                  filtered.map((p) => (
                    <tr key={p.PaymentID} className="hover:bg-zinc-900/40">
                      <td className="p-3.5 font-mono text-zinc-400">
                        #{String(p.PaymentID).padStart(4, "0")}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-white">{p.FullName}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {p.MembershipNumber}
                        </div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-orange-400">
                        {p.VoucherNumber}
                      </td>
                      <td className="p-3.5 font-mono font-extrabold text-white text-sm">
                        Rs. {Number(p.Amount).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-zinc-300 font-medium">
                        {p.PaymentMethod}
                      </td>
                      <td className="p-3.5 font-mono text-zinc-400">
                        {p.TransactionReference || "—"}
                      </td>
                      <td className="p-3.5">
                        {p.ReceiptImageURL ? (
                          <button
                            onClick={() => setPreviewImage(p.ReceiptImageURL)}
                            className="inline-flex items-center gap-1.5 rounded-none border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-[11px] font-bold text-orange-400 hover:bg-orange-500 hover:text-black"
                          >
                            <ImageIcon size={13} />
                            View Receipt
                          </button>
                        ) : (
                          <span className="text-zinc-600">No Image</span>
                        )}
                      </td>
                      <td className="p-3.5 text-zinc-400">
                        {new Date(p.SubmittedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={p.PaymentStatus} />
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {p.PaymentStatus === "Pending" ? (
                          <>
                            <button
                              onClick={() => handleReview(p.PaymentID, "approve")}
                              className="rounded-none bg-orange-500 px-2.5 py-1 text-[11px] font-bold text-black hover:bg-white"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReview(p.PaymentID, "reject")}
                              className="rounded-none border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] font-bold text-red-400 hover:bg-red-500 hover:text-white"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-zinc-500">
                            Verified by {p.ReviewerName || "Admin"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="p-8 text-center text-xs text-zinc-500">
                      No payment records match your search filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* IMAGE PREVIEW MODAL */}
        {previewImage && (
          <div
            className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="modal-content relative max-w-2xl w-full border border-zinc-700 bg-zinc-900 p-4 shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Payment Deposit Slip Proof (Cloudinary / Storage)
                </span>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="rounded-none bg-zinc-800 p-1 text-zinc-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-black p-2">
                <img
                  src={previewImage}
                  alt="Payment receipt proof"
                  className="max-h-[70vh] object-contain"
                />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 truncate max-w-sm">
                  {previewImage}
                </span>
                <a
                  href={previewImage}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block rounded-none bg-orange-500 px-4 py-1.5 text-xs font-bold text-black hover:bg-white"
                >
                  Open in New Tab
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AdminPayments;
