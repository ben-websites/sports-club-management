import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import startPolling from "../../services/polling";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatusBadge from "../../components/dashboard/StatusBadge";
import PageLoader from "../../components/dashboard/PageLoader";
import RestrictedFeature from "../../components/dashboard/RestrictedFeature";
import { Clock, UploadCloud, Eye, X, Image as ImageIcon, CheckCircle2 } from "lucide-react";

function PaymentsHistory() {
  const { isMemberActive } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchPayments(true);

    // Live auto-refresh (skipped while the tab is hidden)
    return startPolling(() => fetchPayments(false));
  }, []);

  const fetchPayments = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await api.get("/payments/my-payments");
      if (res.data.success) {
        setPayments(res.data.payments);
      }
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="user">
        <PageLoader message="Loading payment history..." />
      </DashboardLayout>
    );
  }

  if (!isMemberActive) {
    return (
      <RestrictedFeature
        title="Payment History Restricted"
        featureName="Payment transaction records, receipts, and admin review statuses"
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
                Transaction History
              </span>
            </div>
            <h1 className="mt-2 text-[22px] font-extrabold tracking-tight text-white md:text-[24px]">
              Payment History & Receipts
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Track submitted payment proofs, administrative approval status, and remarks.
            </p>
          </div>

          <button
            onClick={() => navigate("/user/upload-receipt")}
            className="inline-flex items-center gap-2 rounded-none bg-orange-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-white"
          >
            <UploadCloud size={15} />
            Submit New Payment
          </button>
        </div>

        {/* PAYMENTS TABLE */}
        <div className="border border-zinc-800 bg-[#121215] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <th className="p-3.5">Payment ID</th>
                  <th className="p-3.5">Voucher #</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Transaction Ref</th>
                  <th className="p-3.5">Submitted On</th>
                  <th className="p-3.5">Receipt Proof</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {payments.length > 0 ? (
                  payments.map((p) => (
                    <tr key={p.PaymentID} className="hover:bg-zinc-900/40 transition">
                      <td className="p-3.5 font-mono text-zinc-400">
                        #{String(p.PaymentID).padStart(4, "0")}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-orange-400">
                        {p.VoucherNumber}
                      </td>
                      <td className="p-3.5 font-mono font-extrabold text-white">
                        Rs. {Number(p.Amount).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-zinc-300 font-medium">
                        {p.PaymentMethod}
                      </td>
                      <td className="p-3.5 font-mono text-zinc-400">
                        {p.TransactionReference || "N/A"}
                      </td>
                      <td className="p-3.5 text-zinc-400">
                        {new Date(p.SubmittedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-3.5">
                        {p.ReceiptImageURL ? (
                          <button
                            onClick={() => setPreviewImage(p.ReceiptImageURL)}
                            className="inline-flex items-center gap-1.5 rounded-none border border-zinc-700 bg-zinc-900 px-2 py-1 text-[11px] font-semibold text-zinc-300 transition hover:border-orange-500 hover:text-white"
                          >
                            <ImageIcon size={13} className="text-orange-500" />
                            View Slip
                          </button>
                        ) : (
                          <span className="text-zinc-600">No slip</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={p.PaymentStatus} />
                      </td>
                      <td className="p-3.5 text-zinc-400 text-[11px] max-w-[160px] truncate">
                        {p.AdminRemarks || "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="p-10 text-center text-xs text-zinc-500">
                      No payments submitted yet. When you upload a fee voucher receipt, it will appear here.
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
              className="modal-content relative max-w-2xl w-full border border-zinc-700 bg-zinc-900 p-3 shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Payment Receipt Image Proof
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

              <div className="mt-3 text-right">
                <a
                  href={previewImage}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block rounded-none bg-orange-500 px-4 py-2 text-xs font-bold text-black hover:bg-white"
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

export default PaymentsHistory;
