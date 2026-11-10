import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import RestrictedFeature from "../../components/dashboard/RestrictedFeature";
import Swal from "sweetalert2";
import {
  UploadCloud,
  ReceiptText,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ImageIcon,
  X,
} from "lucide-react";

function UploadReceiptPage() {
  const { isMemberActive } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [unpaidVouchers, setUnpaidVouchers] = useState([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState(location.state?.voucherId || "");
  const [paymentMethod, setPaymentMethod] = useState("Online Bank Transfer");
  const [transactionReference, setTransactionReference] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUnpaidVouchers();
  }, []);

  const fetchUnpaidVouchers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/vouchers/my-vouchers");
      if (res.data.success) {
        const unpaid = res.data.vouchers.filter(
          (v) => v.VoucherStatus === "Unpaid" || v.VoucherStatus === "Pending_Approval"
        );
        setUnpaidVouchers(unpaid);
        if (!selectedVoucherId && unpaid.length > 0) {
          setSelectedVoucherId(unpaid[0].VoucherID);
        }
      }
    } catch (err) {
      console.error("Failed to load unpaid vouchers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please choose a valid image file (JPG, PNG, WEBP).");
        return;
      }
      setReceiptFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const selectedVoucher = unpaidVouchers.find((v) => String(v.VoucherID) === String(selectedVoucherId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedVoucherId) {
      setError("Please select a voucher to pay.");
      return;
    }

    if (!receiptFile) {
      setError("Please upload an image of your payment deposit receipt or transfer screenshot.");
      return;
    }

    const confirm = await Swal.fire({
      title: "Submit Payment Proof?",
      html: `
        <div class="text-left text-xs space-y-2 mt-2 p-3 bg-zinc-900 border border-zinc-800">
          <p><b>Voucher:</b> #${selectedVoucher?.VoucherNumber || selectedVoucherId}</p>
          <p><b>Payable Amount:</b> Rs. ${Number(selectedVoucher?.totalPayable || selectedVoucher?.BaseAmount || 0).toLocaleString()}</p>
          <p><b>Payment Channel:</b> ${paymentMethod}</p>
          <p><b>Receipt File:</b> ${receiptFile.name}</p>
        </div>
        <p class="text-xs text-zinc-400 mt-3">Submit this receipt for official administrator verification?</p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#27272a",
      confirmButtonText: "Yes, Submit Proof",
      cancelButtonText: "Cancel",
      background: "#18181b",
      color: "#ffffff",
      allowOutsideClick: true,
    });

    if (!confirm.isConfirmed) return;

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("voucherId", selectedVoucherId);
      formData.append("paymentMethod", paymentMethod);
      formData.append("transactionReference", transactionReference);
      formData.append("receiptImage", receiptFile);

      const res = await api.post("/payments/submit", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        await Swal.fire({
          icon: "success",
          title: "Payment Receipt Submitted!",
          text: "Your receipt has been securely saved and submitted for administrator verification. The voucher status is now 'Pending Verification'.",
          confirmButtonColor: "#f97316",
          background: "#18181b",
          color: "#ffffff",
          allowOutsideClick: true,
        });

        navigate("/user/payments");
      }
    } catch (err) {
      console.error("Receipt submission error:", err);
      setError(err.response?.data?.message || "Failed to submit receipt. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="user">
        <PageLoader message="Loading payment portal..." />
      </DashboardLayout>
    );
  }

  if (!isMemberActive) {
    return (
      <RestrictedFeature
        title="Receipt Upload Restricted"
        featureName="Payment proof slip submission and Cloudinary receipt verification"
      />
    );
  }

  return (
    <DashboardLayout role="user">
      <div className="w-full max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="h-px w-5 bg-orange-500" />
            <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-orange-500">
              Payment Verification
            </span>
          </div>
          <h1 className="mt-2 text-[22px] font-extrabold tracking-tight text-white md:text-[24px]">
            Upload Fee Voucher Receipt
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Submit your external payment slip or bank transaction screenshot for admin approval.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-semibold text-red-400">
            <AlertCircle size={16} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-12">
          {/* UPLOAD FORM (8 cols) */}
          <div className="md:col-span-7 border border-zinc-800 bg-[#121215] p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* SELECT VOUCHER */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                  Select Unpaid Voucher *
                </label>
                {unpaidVouchers.length > 0 ? (
                  <select
                    value={selectedVoucherId}
                    onChange={(e) => setSelectedVoucherId(e.target.value)}
                    className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                  >
                    {unpaidVouchers.map((v) => (
                      <option key={v.VoucherID} value={v.VoucherID}>
                        #{v.VoucherNumber} ({v.VoucherType === "Advance"
                          ? "Advance"
                          : v.VoucherType === "Admission"
                          ? "Admission Fee"
                          : `${v.BillingMonth}/${v.BillingYear}`}) — Rs. {Number(v.totalPayable || v.BaseAmount).toLocaleString()}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-1 border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-500">
                    No unpaid vouchers found. All your fees are currently settled.
                  </div>
                )}
              </div>

              {/* PAYMENT METHOD */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="Online Bank Transfer">Online Bank Transfer (HBL / Any Bank)</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Direct Cashier Deposit">Direct Cashier Deposit</option>
                  <option value="ATM Transfer">ATM Funds Transfer</option>
                </select>
              </div>

              {/* TRANSACTION REFERENCE / SLIP NUMBER */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                  Transaction ID / Reference Number (Optional)
                </label>
                <input
                  type="text"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  placeholder="e.g. TRX-987654321 or Bank Slip #"
                  className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                />
              </div>

              {/* FILE UPLOAD DROPZONE */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                  Receipt Image Proof *
                </label>

                {!previewUrl ? (
                  <label className="mt-1 flex flex-col items-center justify-center rounded-none border-2 border-dashed border-zinc-700 bg-zinc-900/40 p-6 text-center cursor-pointer transition hover:border-orange-500 hover:bg-orange-500/5">
                    <UploadCloud size={32} className="text-orange-500 mb-2" />
                    <span className="text-xs font-bold text-white">
                      Click to choose or drag & drop receipt
                    </span>
                    <span className="mt-1 text-[10px] text-zinc-400">
                      PNG, JPG, JPEG up to 10MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="mt-1 relative border border-zinc-700 bg-zinc-900 p-2">
                    <img
                      src={previewUrl}
                      alt="Receipt preview"
                      className="h-44 w-full object-contain bg-black"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute top-3 right-3 rounded-none bg-red-600 p-1.5 text-white hover:bg-red-700"
                    >
                      <X size={15} />
                    </button>
                    <div className="mt-2 text-center text-[10px] text-zinc-400 truncate">
                      {receiptFile?.name}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || !unpaidVouchers.length}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-none bg-orange-500 py-3 text-xs font-black uppercase tracking-wider text-black transition hover:bg-white disabled:opacity-50"
              >
                {submitting ? "Uploading & Submitting..." : "Submit Receipt for Approval"}
                <ArrowRight size={14} />
              </button>
            </form>
          </div>

          {/* VOUCHER & BANK SUMMARY (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            {/* VOUCHER BREAKDOWN */}
            {selectedVoucher && (
              <div className="border border-zinc-800 bg-[#121215] p-5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-orange-400 mb-2">
                  Voucher Details
                </div>
                <div className="font-mono text-sm font-bold text-white">
                  #{selectedVoucher.VoucherNumber}
                </div>

                <div className="mt-3 space-y-2 text-xs border-t border-zinc-800 pt-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Base Fee:</span>
                    <span className="font-mono font-bold text-white">
                      Rs. {Number(selectedVoucher.BaseAmount).toLocaleString()}
                    </span>
                  </div>

                  {selectedVoucher.daysLate > 0 && (
                    <div className="flex justify-between text-red-400">
                      <span>Late Fine ({selectedVoucher.daysLate}d):</span>
                      <span className="font-mono font-bold">
                        + Rs. {selectedVoucher.calculatedFine.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-zinc-800 pt-2 text-sm">
                    <span className="font-bold text-white">Total Due:</span>
                    <span className="font-mono font-black text-orange-400">
                      Rs. {Number(selectedVoucher.totalPayable || selectedVoucher.BaseAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* BANK ACCOUNT CARD */}
            <div className="border border-zinc-800 bg-[#16161c] p-5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-3 flex items-center gap-1.5">
                <CreditCard size={14} />
                Club Bank Account
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="text-[9px] uppercase text-zinc-400">Bank</div>
                  <div className="font-bold text-white">Habib Bank Limited (HBL)</div>
                </div>

                <div>
                  <div className="text-[9px] uppercase text-zinc-400">Account Number</div>
                  <div className="font-mono font-bold text-orange-400 text-sm">
                    0123-45678901-03
                  </div>
                </div>

                <div>
                  <div className="text-[9px] uppercase text-zinc-400">Account Title</div>
                  <div className="font-semibold text-white">
                    Sports Hub Management
                  </div>
                </div>
              </div>

              <p className="mt-4 text-[10px] text-zinc-400 italic">
                * Upload clear screenshots containing the Transaction ID and deposit timestamp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default UploadReceiptPage;
