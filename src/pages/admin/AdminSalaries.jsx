import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import toast from "react-hot-toast";
import { Wallet, CalendarDays, BadgeDollarSign } from "lucide-react";

function AdminSalaries() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({ payroll: 0, paid: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchRegister = useCallback(async (initial = false) => {
    try {
      if (initial) setLoading(true);
      const res = await api.get("/admin/staff/salaries", { params: { month, year } });
      if (res.data.success) {
        setRows(res.data.rows.map((r) => ({ ...r, Deductions: r.Deductions ?? 0 })));
        setTotals(res.data.totals || { payroll: 0, paid: 0, pending: 0 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (initial) setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchRegister(true);
  }, [fetchRegister]);

  const updateDeduction = (key, value) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, Deductions: value } : r)));
  };

  const rowKey = (r) => `${r.StaffType}-${r.CoachID}-${r.TrainerID || 0}`;
  const enriched = rows.map((r) => ({ ...r, key: rowKey(r) }));

  const pay = async (selected) => {
    if (selected.length === 0) {
      toast.error("Nothing to pay.");
      return;
    }
    setProcessing(true);
    try {
      await api.post("/admin/staff/salaries", {
        month,
        year,
        records: selected.map((r) => ({
          staffType: r.StaffType,
          coachId: r.CoachID,
          trainerId: r.TrainerID,
          deductions: r.Deductions,
        })),
      });
      fetchRegister(false);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <PageLoader message="Loading payroll register..." />
      </DashboardLayout>
    );
  }

  const pendingRows = enriched.filter((r) => r.PaymentStatus !== "Paid");

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-black text-white">
              <Wallet size={20} className="text-orange-500" /> Salary & Payroll
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Payroll is derived from the staff attendance register — absent days deduct automatically.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 border border-zinc-700 bg-zinc-900 px-3 py-2">
              <CalendarDays size={14} className="text-orange-500" />
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                className="bg-transparent text-xs font-bold text-white outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m} className="bg-zinc-900">
                    {new Date(2000, m - 1, 1).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
                className="w-20 bg-transparent text-xs font-bold text-white outline-none"
              />
            </div>
            <button
              onClick={() => pay(pendingRows)}
              disabled={processing || pendingRows.length === 0}
              className="flex items-center gap-2 bg-orange-500 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-black hover:bg-white disabled:opacity-40"
            >
              <BadgeDollarSign size={14} /> {processing ? "Processing..." : `Pay All (${pendingRows.length})`}
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="border border-zinc-800 bg-[#121215] p-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">Total Payroll</div>
            <div className="mt-1 text-xl font-black text-white">Rs {Number(totals.payroll || 0).toLocaleString()}</div>
          </div>
          <div className="border border-emerald-500/30 bg-emerald-500/5 p-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-400/80">Paid Staff</div>
            <div className="mt-1 text-xl font-black text-emerald-400">{totals.paid}</div>
          </div>
          <div className="border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-amber-400/80">Pending Staff</div>
            <div className="mt-1 text-xl font-black text-amber-400">{totals.pending}</div>
          </div>
        </div>

        <div className="border border-zinc-800 bg-[#121215]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#16161b] text-[9.5px] uppercase tracking-[0.16em] text-zinc-400">
                <tr>
                  <th className="px-5 py-3">Staff</th>
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3">Base</th>
                  <th className="px-3 py-3">Present</th>
                  <th className="px-3 py-3">Absent</th>
                  <th className="px-3 py-3">Deductions</th>
                  <th className="px-3 py-3">Net</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {enriched.map((r) => {
                  const net = Math.max(0, Number(r.BaseSalary) - (Number(r.Deductions) || 0));
                  return (
                    <tr key={r.key} className="hover:bg-zinc-800/20">
                      <td className="px-5 py-3">
                        <div className="font-bold text-zinc-100">{r.FullName}</div>
                        <div className="text-[10px] text-zinc-500">
                          {r.SportName}
                          {r.CoachName ? ` • under ${r.CoachName}` : ""}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                            r.StaffType === "Coach"
                              ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
                              : "border-sky-500/40 bg-sky-500/10 text-sky-400"
                          }`}
                        >
                          {r.StaffType}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-zinc-300">Rs {Number(r.BaseSalary).toLocaleString()}</td>
                      <td className="px-3 py-3 font-bold text-emerald-400">{r.PresentDays}</td>
                      <td className="px-3 py-3 font-bold text-red-400">{r.AbsentDays}</td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          min="0"
                          value={r.Deductions}
                          disabled={r.PaymentStatus === "Paid"}
                          onChange={(e) => updateDeduction(r.key, e.target.value)}
                          className="w-24 border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-white outline-none focus:border-orange-500 disabled:opacity-50"
                        />
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-white">Rs {net.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right">
                        {r.PaymentStatus === "Paid" ? (
                          <span className="border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-400">
                            Paid
                          </span>
                        ) : (
                          <button
                            onClick={() => pay([r])}
                            disabled={processing}
                            className="border border-orange-500/40 bg-orange-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-400 hover:bg-orange-500 hover:text-black disabled:opacity-50"
                          >
                            Pay
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {enriched.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-5 py-10 text-center text-xs text-zinc-500">
                      No active staff for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminSalaries;
