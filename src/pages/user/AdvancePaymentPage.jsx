import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatusBadge from "../../components/dashboard/StatusBadge";
import PageLoader from "../../components/dashboard/PageLoader";
import RestrictedFeature from "../../components/dashboard/RestrictedFeature";
import Swal from "sweetalert2";
import { Zap, ShieldCheck, CheckCircle2, ArrowRight, ReceiptText, AlertCircle } from "lucide-react";

function AdvancePaymentPage() {
  const { isMemberActive } = useAuth();
  const navigate = useNavigate();

  const [monthsCount, setMonthsCount] = useState(3);
  const [membershipData, setMembershipData] = useState(null);
  const [advanceVouchers, setAdvanceVouchers] = useState([]);
  const [prepaidMonths, setPrepaidMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdvanceData();
  }, []);

  const fetchAdvanceData = async () => {
    try {
      setLoading(true);
      const [memberRes, summaryRes, vouchersRes] = await Promise.all([
        api.get("/membership/my-status"),
        api.get("/vouchers/my-summary"),
        api.get("/vouchers/my-vouchers"),
      ]);

      if (memberRes.data.success) setMembershipData(memberRes.data.membership);
      if (summaryRes.data.success) setPrepaidMonths(summaryRes.data.summary?.prepaidMonths || []);
      if (vouchersRes.data.success) {
        const adv = vouchersRes.data.vouchers.filter((v) => v.VoucherType === "Advance");
        setAdvanceVouchers(adv);
      }
    } catch (err) {
      console.error("Advance data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const monthlyFee = Number(membershipData?.MonthlyFee || 0);
  const totalAmount = monthsCount * monthlyFee;

  const handleGenerateAdvance = async () => {
    if (!membershipData) {
      setError("Active membership required to request advance payment.");
      return;
    }

    const confirm = await Swal.fire({
      title: "Generate Advance Payment Voucher?",
      html: `
        <div class="text-left text-xs space-y-2 mt-2 p-3 bg-zinc-900 border border-zinc-800">
          <p><b>Package:</b> ${membershipData.PlanName}</p>
          <p><b>Prepay Duration:</b> ${monthsCount} Month(s)</p>
          <p><b>Monthly Subscription:</b> Rs. ${monthlyFee.toLocaleString()} / mo</p>
          <p><b>Total Amount:</b> <span class="text-orange-400 font-bold">Rs. ${totalAmount.toLocaleString()}</span></p>
        </div>
        <p class="text-xs text-zinc-400 mt-3">Confirm generation of this advance payment slip?</p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#27272a",
      confirmButtonText: "Yes, Generate Voucher",
      cancelButtonText: "Cancel",
      background: "#18181b",
      color: "#ffffff",
      allowOutsideClick: true,
    });

    if (!confirm.isConfirmed) return;

    setGenerating(true);
    setError("");

    try {
      const res = await api.post("/vouchers/advance-request", { monthsCount });
      if (res.data.success) {
        const { voucherId, voucherNumber, totalAmount: amt } = res.data;

        await Swal.fire({
          icon: "success",
          title: "Advance Voucher Generated!",
          html: `<p>Advance Voucher <b>#${voucherNumber}</b> for ${monthsCount} month(s) (Rs. ${amt.toLocaleString()}) has been created.</p><p class="text-sm mt-2 text-zinc-400">Please proceed to upload your payment receipt slip to finalize admin verification.</p>`,
          confirmButtonColor: "#f97316",
          confirmButtonText: "Upload Receipt Now",
          showCancelButton: true,
          cancelButtonText: "Later",
          background: "#18181b",
          color: "#ffffff",
          allowOutsideClick: true,
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/user/upload-receipt", { state: { voucherId } });
          } else {
            fetchAdvanceData();
          }
        });
      }
    } catch (err) {
      console.error("Advance voucher error:", err);
      setError(err.response?.data?.message || "Failed to generate advance voucher.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="user">
        <PageLoader message="Loading advance prepayment module..." />
      </DashboardLayout>
    );
  }

  if (!isMemberActive) {
    return (
      <RestrictedFeature
        title="Advance Payments Restricted"
        featureName="Multi-month advance payments and prepayment fine protection ledger"
      />
    );
  }

  return (
    <DashboardLayout role="user">
      <div className="w-full">
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="h-px w-5 bg-orange-500" />
            <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-orange-500">
              Prepayment Ledger
            </span>
          </div>
          <h1 className="mt-2 text-[22px] font-extrabold tracking-tight text-white md:text-[24px]">
            Advance Membership Payments
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Pay multiple months ahead to bypass monthly hassle and prevent late payment fines.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-semibold text-red-400">
            <AlertCircle size={16} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,1fr)] mb-8">
          {/* CALCULATOR & GENERATOR */}
          <div className="border border-zinc-800 bg-[#121215] p-6 space-y-6">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Zap size={16} className="text-orange-500" />
                Select Advance Billing Period
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                Choose how many consecutive billing months you wish to prepay.
              </p>
            </div>

            {/* PRESET MONTH BUTTONS */}
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 6, 12].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setMonthsCount(num)}
                  className={`rounded-none py-3 text-xs font-black uppercase tracking-wider transition ${
                    monthsCount === num
                      ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20"
                      : "border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-orange-500"
                  }`}
                >
                  {num} {num === 1 ? "Mo" : "Mos"}
                </button>
              ))}
            </div>

            {/* SLIDER FOR CUSTOM MONTHS */}
            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-2">
                <span>Custom Duration:</span>
                <span className="font-bold text-white">{monthsCount} Months</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={monthsCount}
                onChange={(e) => setMonthsCount(parseInt(e.target.value, 10))}
                className="w-full accent-orange-500 bg-zinc-800 h-2 cursor-pointer"
              />
            </div>

            {/* LIVE CALCULATION BOX */}
            <div className="border border-zinc-800 bg-zinc-900/60 p-4 space-y-3 text-xs">
              <div className="flex justify-between text-zinc-300">
                <span>Package Monthly Rate:</span>
                <span className="font-mono font-bold text-white">
                  Rs. {monthlyFee.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-zinc-300">
                <span>Selected Advance Months:</span>
                <span className="font-bold text-white">× {monthsCount}</span>
              </div>

              <div className="flex justify-between border-t border-zinc-800 pt-3 text-sm">
                <span className="font-extrabold uppercase text-white">Total Advance Amount:</span>
                <span className="font-mono font-black text-orange-400 text-lg">
                  Rs. {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={handleGenerateAdvance}
              disabled={generating || !monthlyFee}
              className="flex w-full items-center justify-center gap-2 rounded-none bg-orange-500 py-3.5 text-xs font-black uppercase tracking-wider text-black transition hover:bg-white disabled:opacity-50"
            >
              {generating ? "Generating Voucher..." : `Generate Advance Voucher (Rs. ${totalAmount.toLocaleString()})`}
              <ArrowRight size={14} />
            </button>
          </div>

          {/* ADVANCE POLICY EXPLANATION */}
          <div className="border border-zinc-800 bg-[#121215] p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-zinc-800 pb-3">
              How Advance Payments Work
            </h3>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-orange-500 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Zero Duplicate Vouchers:</strong> Once your advance receipt is verified and approved by the admin, the system automatically marks those months prepaid. No new monthly vouchers will be generated for those months.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-orange-500 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Late Fine Immunity:</strong> Prepaying months guarantees you will not incur any late payment penalties or overdue fees for the prepaid period.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-orange-500 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Admin Verification:</strong> Advance months are only activated in the database after the administrator verifies your uploaded payment receipt slip.
                </p>
              </div>
            </div>

            {/* PREPAID MONTHS LIST */}
            <div className="border-t border-zinc-800 pt-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-orange-400 mb-2">
                Currently Approved Prepaid Months:
              </div>

              <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                {prepaidMonths.length > 0 ? (
                  prepaidMonths.map((pm) => (
                    <div
                      key={pm.PrepaymentID}
                      className="flex items-center justify-between border border-zinc-800 bg-zinc-900/60 p-2.5 text-xs"
                    >
                      <span className="font-bold text-white">
                        Cycle: {pm.BillingMonth}/{pm.BillingYear}
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">
                        Rs. {Number(pm.Amount).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500 italic">No approved prepaid months on record.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ADVANCE VOUCHERS HISTORY */}
        <section className="border border-zinc-800 bg-[#121215] overflow-hidden">
          <div className="border-b border-zinc-800 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              My Advance Payment Requests & Vouchers
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <th className="p-3.5">Voucher #</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Created Date</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {advanceVouchers.length > 0 ? (
                  advanceVouchers.map((v) => (
                    <tr key={v.VoucherID} className="hover:bg-zinc-900/40">
                      <td className="p-3.5 font-mono font-bold text-orange-400">
                        {v.VoucherNumber}
                      </td>
                      <td className="p-3.5 font-mono font-extrabold text-white">
                        Rs. {Number(v.BaseAmount).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-zinc-400">
                        {new Date(v.CreatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-zinc-400">
                        {new Date(v.DueDate).toLocaleDateString()}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={v.VoucherStatus} />
                      </td>
                      <td className="p-3.5 text-right">
                        {(v.VoucherStatus === "Unpaid" || v.VoucherStatus === "Pending_Approval") && (
                          <button
                            onClick={() =>
                              navigate("/user/upload-receipt", {
                                state: { voucherId: v.VoucherID },
                              })
                            }
                            className="rounded-none bg-orange-500 px-3 py-1.5 text-xs font-bold text-black transition hover:bg-white"
                          >
                            Upload Slip
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-xs text-zinc-500">
                      No advance payment vouchers created yet. Use the calculator above to create one.
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

export default AdvancePaymentPage;
