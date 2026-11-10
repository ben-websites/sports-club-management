import { useEffect, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import { Wallet, CalendarDays } from "lucide-react";

function CoachSalary() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async (initial = false) => {
      try {
        if (initial) setLoading(true);
        const res = await api.get("/coach/salary", { params: { month, year } });
        if (res.data.success) setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (initial) setLoading(false);
      }
    };
    load(true);
  }, [month, year]);

  if (loading) {
    return (
      <DashboardLayout role="coach">
        <PageLoader message="Loading salary ledger..." />
      </DashboardLayout>
    );
  }

  const attendance = data?.attendance || {};
  const payments = data?.payments || [];
  const monthName = new Date(year, month - 1, 1).toLocaleString("default", { month: "long" });

  return (
    <DashboardLayout role="coach">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-black text-white">
              <Wallet size={20} className="text-orange-500" /> Salary & Payroll
            </h1>
            <p className="mt-1 text-xs text-zinc-400">Attendance driven payroll ledger maintained by the administration.</p>
          </div>
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
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="border border-zinc-800 bg-[#121215] p-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">Monthly Package</div>
            <div className="mt-1.5 text-xl font-black text-white">
              Rs {Number(data?.monthlySalary || 0).toLocaleString()}
            </div>
          </div>
          <div className="border border-zinc-800 bg-[#121215] p-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">Present Days</div>
            <div className="mt-1.5 text-xl font-black text-emerald-400">{attendance.PresentDays || 0}</div>
          </div>
          <div className="border border-zinc-800 bg-[#121215] p-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">Absent Days</div>
            <div className="mt-1.5 text-xl font-black text-red-400">{attendance.AbsentDays || 0}</div>
          </div>
          <div className="border border-zinc-800 bg-[#121215] p-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">Leave Days</div>
            <div className="mt-1.5 text-xl font-black text-sky-400">{attendance.LeaveDays || 0}</div>
          </div>
        </div>

        <div className="border border-zinc-800 bg-[#121215]">
          <div className="border-b border-zinc-800 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white">
            Payment History
          </div>
          {payments.length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-zinc-500">No salary payments recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#16161b] text-[9.5px] uppercase tracking-[0.16em] text-zinc-400">
                  <tr>
                    <th className="px-5 py-3">Period</th>
                    <th className="px-3 py-3">Staff</th>
                    <th className="px-3 py-3">Base</th>
                    <th className="px-3 py-3">Deductions</th>
                    <th className="px-3 py-3">Net Paid</th>
                    <th className="px-3 py-3">Days</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {payments.map((p) => (
                    <tr key={p.SalaryPaymentID} className="hover:bg-zinc-800/20">
                      <td className="px-5 py-2.5 font-bold text-zinc-200">
                        {new Date(p.SalaryYear, p.SalaryMonth - 1, 1).toLocaleString("default", {
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-3 py-2.5 text-zinc-400">{p.StaffType === "Trainer" ? p.TrainerName : "Me"}</td>
                      <td className="px-3 py-2.5 font-mono text-zinc-300">Rs {Number(p.BaseSalary).toLocaleString()}</td>
                      <td className="px-3 py-2.5 font-mono text-red-400">-Rs {Number(p.Deductions).toLocaleString()}</td>
                      <td className="px-3 py-2.5 font-mono font-bold text-emerald-400">
                        Rs {Number(p.NetSalary).toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-[10.5px] text-zinc-500">
                        {p.DaysPresent}P / {p.DaysAbsent}A
                      </td>
                      <td className="px-5 py-2.5">
                        <span
                          className={`border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                            p.Status === "Paid"
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                              : "border-amber-500/40 bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {p.Status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-[10.5px] text-zinc-500">
          Showing attendance summary for {monthName} {year}. Deductions are calculated per absent day by the payroll
          module.
        </p>
      </div>
    </DashboardLayout>
  );
}

export default CoachSalary;
