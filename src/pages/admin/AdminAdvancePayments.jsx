import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatusBadge from "../../components/dashboard/StatusBadge";
import PageLoader from "../../components/dashboard/PageLoader";
import { Zap, CheckCircle2, ShieldCheck, Eye, Clock } from "lucide-react";

function AdminAdvancePayments() {
  const navigate = useNavigate();
  const [advanceData, setAdvanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvanceData();
  }, []);

  const fetchAdvanceData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/advance-payments");
      if (res.data.success) {
        setAdvanceData(res.data);
      }
    } catch (err) {
      console.error("Failed to load advance data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <PageLoader message="Loading advance prepayments ledger..." />
      </DashboardLayout>
    );
  }

  const advanceVouchers = advanceData?.advanceVouchers || [];
  const prepaidMonths = advanceData?.prepaidMonths || [];

  return (
    <DashboardLayout role="admin">
      <div className="w-full">
        {/* HEADER */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-px w-5 bg-orange-500" />
              <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-orange-500">
                Prepayment Ledger
              </span>
            </div>
            <h1 className="mt-2 text-[22px] font-extrabold tracking-tight text-white md:text-[24px]">
              Advance Payments & Prepaid Months
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Audit advance vouchers, verify receipt slips, and inspect months exempt from voucher generation.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/payments")}
            className="inline-flex items-center gap-2 rounded-none bg-orange-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-white"
          >
            Review Pending Receipts
          </button>
        </div>

        {/* 1. ADVANCE PAYMENT VOUCHERS */}
        <section className="mb-8 border border-zinc-800 bg-[#121215] overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800 p-4 bg-[#16161b]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Zap size={15} className="text-orange-500" />
              Advance Fee Payment Requests
            </h3>
            <span className="text-xs text-zinc-400">
              Total: <span className="font-bold text-white">{advanceVouchers.length}</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <th className="p-3.5">Voucher #</th>
                  <th className="p-3.5">Member Name</th>
                  <th className="p-3.5">Covered Months</th>
                  <th className="p-3.5">Total Amount</th>
                  <th className="p-3.5">Created Date</th>
                  <th className="p-3.5">Voucher Status</th>
                  <th className="p-3.5">Payment Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {advanceVouchers.length > 0 ? (
                  advanceVouchers.map((v) => (
                    <tr key={v.VoucherID} className="hover:bg-zinc-900/40">
                      <td className="p-3.5 font-mono font-bold text-orange-400">
                        {v.VoucherNumber}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-white">{v.FullName}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{v.MembershipNumber}</div>
                      </td>
                      <td className="p-3.5 text-zinc-300 font-medium">
                        {v.CoveredMonths || "Advance"}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-white">
                        Rs. {Number(v.BaseAmount).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-zinc-400">
                        {new Date(v.CreatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={v.VoucherStatus} />
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={v.PaymentStatus || "Not Submitted"} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-xs text-zinc-500">
                      No advance payment requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. APPROVED PREPAID MONTHS (SQL SERVER TABLE: MemberPrepayments) */}
        <section className="border border-zinc-800 bg-[#121215] overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800 p-4 bg-[#16161b]">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400" />
                Active Prepayment Database Ledger (MemberPrepayments)
              </h3>
              <p className="mt-0.5 text-[11px] text-zinc-400">
                These months are already approved and paid. When generating monthly vouchers, the system automatically skips these members for these cycles.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <th className="p-3.5">Prepayment ID</th>
                  <th className="p-3.5">Member Name</th>
                  <th className="p-3.5">Membership #</th>
                  <th className="p-3.5">Prepaid Month</th>
                  <th className="p-3.5">Prepaid Year</th>
                  <th className="p-3.5">Amount Allocated</th>
                  <th className="p-3.5">Approved Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {prepaidMonths.length > 0 ? (
                  prepaidMonths.map((p) => (
                    <tr key={p.PrepaymentID} className="hover:bg-zinc-900/40">
                      <td className="p-3.5 font-mono text-zinc-400">
                        #{String(p.PrepaymentID).padStart(4, "0")}
                      </td>
                      <td className="p-3.5 font-bold text-white">
                        {p.FullName}
                      </td>
                      <td className="p-3.5 font-mono text-orange-400">
                        {p.MembershipNumber}
                      </td>
                      <td className="p-3.5 font-bold text-emerald-400">
                        Month {p.BillingMonth}
                      </td>
                      <td className="p-3.5 text-zinc-300">
                        {p.BillingYear}
                      </td>
                      <td className="p-3.5 font-mono text-white font-bold">
                        Rs. {Number(p.Amount).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-zinc-400">
                        {new Date(p.ApprovedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-xs text-zinc-500">
                      No active prepaid months currently recorded in the database.
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

export default AdminAdvancePayments;
