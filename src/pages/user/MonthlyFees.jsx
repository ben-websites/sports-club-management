import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import startPolling from "../../services/polling";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatusBadge from "../../components/dashboard/StatusBadge";
import PageLoader from "../../components/dashboard/PageLoader";
import RestrictedFeature from "../../components/dashboard/RestrictedFeature";
import { ReceiptText, AlertCircle, Clock, Zap, UploadCloud, CheckCircle2, ArrowRight } from "lucide-react";

function MonthlyFees() {
  const { isMemberActive } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeeData(true);

    // Live auto-refresh (skipped while the tab is hidden)
    return startPolling(() => fetchFeeData(false));
  }, []);

  const fetchFeeData = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const [sumRes, vchRes] = await Promise.all([
        api.get("/vouchers/my-summary"),
        api.get("/vouchers/my-vouchers"),
      ]);

      if (sumRes.data.success) setSummary(sumRes.data.summary);
      if (vchRes.data.success) setVouchers(vchRes.data.vouchers);
    } catch (err) {
      console.error("Fee data load error:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="user">
        <PageLoader message="Loading fee schedules & fines..." />
      </DashboardLayout>
    );
  }

  if (!isMemberActive) {
    return (
      <RestrictedFeature
        title="Monthly Fees Restricted"
        featureName="Monthly fee schedules, automated overdue fine calculation, and fee ledger"
      />
    );
  }

  const membership = summary?.membership;
  const monthlyFee = Number(membership?.MonthlyFee || 0);
  const finePerDay = summary?.finePerDay || 100;
  const unpaidVouchers = vouchers.filter((v) => v.VoucherStatus === "Unpaid" || v.VoucherStatus === "Pending_Approval");

  return (
    <DashboardLayout role="user">
      <div className="w-full">
        {/* HEADER */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-px w-5 bg-orange-500" />
              <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-orange-500">
                Billing & Dues
              </span>
            </div>
            <h1 className="mt-2 text-[22px] font-extrabold tracking-tight text-white md:text-[24px]">
              Monthly Fees & Overdue Fines
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Track current billing cycle, upcoming due dates, and late payment penalties.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/user/advance-payment")}
              className="inline-flex items-center gap-2 rounded-none border border-orange-500/40 bg-orange-500/10 px-4 py-2.5 text-xs font-bold text-orange-400 transition hover:bg-orange-500 hover:text-black"
            >
              <Zap size={14} />
              Pay Advance (Save Fines)
            </button>
          </div>
        </div>

        {/* FEE OVERVIEW BANNER */}
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <div className="border border-zinc-800 bg-[#121215] p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Standard Monthly Fee
            </span>
            <div className="mt-2 text-2xl font-black text-white">
              Rs. {monthlyFee.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-zinc-400">
              Package: {membership?.PlanName || "Standard"}
            </div>
          </div>

          <div className="border border-zinc-800 bg-[#121215] p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Total Outstanding
            </span>
            <div className={`mt-2 text-2xl font-black ${summary?.totalOutstanding > 0 ? "text-orange-500" : "text-emerald-400"}`}>
              Rs. {(summary?.totalOutstanding || 0).toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-zinc-400">
              {summary?.unpaidVouchersCount || 0} unpaid voucher(s)
            </div>
          </div>

          <div className="border border-zinc-800 bg-[#121215] p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Late Payment Penalty Rate
            </span>
            <div className="mt-2 text-2xl font-black text-white">
              Rs. {finePerDay} <span className="text-xs font-normal text-zinc-400">/ day</span>
            </div>
            <div className="mt-1 text-[11px] text-red-400">
              Applied after due date
            </div>
          </div>
        </div>

        {/* LATE FINE POLICY BREAKDOWN TABLE (FROM USER REQUIREMENT 5) */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          <section className="border border-zinc-800 bg-[#121215] p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
              <AlertCircle size={15} className="text-orange-500" />
              Late Payment Fine Calculation Schedule
            </h3>

            <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
              Dues are payable on or before the due date printed on your voucher. In accordance with club bylaws, late penalties accumulate automatically on each overdue calendar day:
            </p>

            <table className="mt-4 w-full text-xs text-left border-collapse border border-zinc-800">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-400">
                  <th className="p-3">Payment Situation</th>
                  <th className="p-3 text-right">Applicable Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                <tr>
                  <td className="p-3 font-medium">Payment before due date</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-400">
                    Rs. {monthlyFee.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">1 day late overdue</td>
                  <td className="p-3 text-right font-mono font-bold text-orange-400">
                    Rs. {(monthlyFee + 1 * finePerDay).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">5 days late overdue</td>
                  <td className="p-3 text-right font-mono font-bold text-orange-400">
                    Rs. {(monthlyFee + 5 * finePerDay).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">10 days late overdue</td>
                  <td className="p-3 text-right font-mono font-bold text-red-400">
                    Rs. {(monthlyFee + 10 * finePerDay).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* ADVANCE PREPAYMENTS LEDGER */}
          <section className="border border-zinc-800 bg-[#121215] p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
              <Zap size={15} className="text-orange-500" />
              Advance Prepaid Months
            </h3>

            <p className="mt-3 text-xs text-zinc-400">
              Future months covered by approved advance payments. The system automatically skips voucher generation for these cycles:
            </p>

            <div className="mt-4 space-y-2 max-h-[190px] overflow-y-auto">
              {summary?.prepaidMonths && summary.prepaidMonths.length > 0 ? (
                summary.prepaidMonths.map((p) => (
                  <div
                    key={p.PrepaymentID}
                    className="flex items-center justify-between border border-zinc-800 bg-zinc-900/60 p-3 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-400" />
                      <span className="font-bold text-white">
                        Month {p.BillingMonth} / {p.BillingYear}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-400">
                        Rs. {Number(p.Amount).toLocaleString()}
                      </span>
                      <span className="block text-[9px] text-zinc-500">
                        Approved: {new Date(p.ApprovedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-zinc-500 border border-zinc-800/60 bg-zinc-900/20">
                  No advance prepayments on record.
                </div>
              )}
            </div>

            <button
              onClick={() => navigate("/user/advance-payment")}
              className="mt-4 w-full rounded-none border border-zinc-700 bg-zinc-800 py-2.5 text-xs font-bold text-white transition hover:bg-orange-500 hover:text-black"
            >
              Request Advance Months Payment →
            </button>
          </section>
        </div>

        {/* CURRENT UNPAID VOUCHERS */}
        <section className="border border-zinc-800 bg-[#121215] p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-zinc-800 pb-3 mb-4">
            Outstanding Fee Vouchers Requiring Payment
          </h3>

          <div className="space-y-3">
            {unpaidVouchers.length > 0 ? (
              unpaidVouchers.map((v) => (
                <div
                  key={v.VoucherID}
                  className="flex flex-col justify-between gap-4 border border-zinc-800 bg-zinc-900/40 p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-orange-400 text-sm">
                        #{v.VoucherNumber}
                      </span>
                      <StatusBadge status={v.VoucherStatus} />
                    </div>
                    <div className="mt-1 text-xs text-zinc-300">
                      {v.VoucherType === "Advance"
                        ? "Advance Payment Voucher"
                        : v.VoucherType === "Admission"
                        ? "One-time Admission Fee"
                        : `Billing Period: ${v.BillingMonth}/${v.BillingYear}`}
                      {" · "}
                      Due Date:{" "}
                      <span className="font-semibold text-white">
                        {new Date(v.DueDate).toLocaleDateString()}
                      </span>
                    </div>
                    {v.daysLate > 0 && (
                      <div className="mt-1 text-[11px] font-bold text-red-400">
                        ⚠️ Overdue by {v.daysLate} day{v.daysLate > 1 ? "s" : ""} (Late Fine: Rs. {v.calculatedFine.toLocaleString()})
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-400 uppercase">Total Payable</div>
                      <div className="text-base font-black text-white">
                        Rs. {Number(v.totalPayable || v.BaseAmount).toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate("/user/upload-receipt", { state: { voucherId: v.VoucherID } })}
                      className="rounded-none bg-orange-500 px-4 py-2 text-xs font-bold text-black transition hover:bg-white shrink-0"
                    >
                      Upload Slip
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-zinc-500">
                You have no pending unpaid vouchers. All club dues are current!
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default MonthlyFees;
