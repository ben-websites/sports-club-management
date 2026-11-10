import { useEffect, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import { Award, Info, Phone, Mail } from "lucide-react";

function CoachTrainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/coach/trainers");
        if (res.data.success) setTrainers(res.data.trainers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="coach">
        <PageLoader message="Loading trainer squad..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="coach">
      <div className="space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black text-white">
            <Award size={20} className="text-orange-500" /> Trainer Squad
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Every coach is provisioned with 5 trainer slots. The administration maintains the records and marks their
            daily attendance — you see the live summary here.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {trainers.map((t, index) => (
            <div key={t.TrainerID} className="border border-zinc-800 bg-[#121215] p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-orange-500 text-sm font-black text-black">
                    {t.FullName?.charAt(0) || index + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{t.FullName}</div>
                    <div className="text-[10px] text-zinc-500">{t.Specialization}</div>
                  </div>
                </div>
                <span
                  className={`border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                    t.IsActive
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      : "border-zinc-700 bg-zinc-900 text-zinc-500"
                  }`}
                >
                  {t.IsActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="border border-emerald-500/20 bg-emerald-500/5 py-2">
                  <div className="text-[9px] uppercase tracking-wider text-emerald-400/80">Present</div>
                  <div className="text-sm font-black text-emerald-400">{t.PresentDays}</div>
                </div>
                <div className="border border-red-500/20 bg-red-500/5 py-2">
                  <div className="text-[9px] uppercase tracking-wider text-red-400/80">Absent</div>
                  <div className="text-sm font-black text-red-400">{t.AbsentDays}</div>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-[10.5px] text-zinc-500">
                {t.Phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone size={11} /> {t.Phone}
                  </div>
                )}
                {t.Email && (
                  <div className="flex items-center gap-1.5">
                    <Mail size={11} /> {t.Email}
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-zinc-800 pt-2 text-zinc-400">
                  <span>{t.Shift} shift</span>
                  <span className="font-bold text-zinc-300">Rs {Number(t.MonthlySalary).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
          {trainers.length === 0 && (
            <div className="border border-zinc-800 bg-[#121215] p-10 text-center text-xs text-zinc-500 sm:col-span-2 xl:col-span-3">
              No trainers are linked to your squad yet.
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 border border-sky-500/20 bg-sky-500/5 p-4 text-[11px] text-sky-300">
          <Info size={15} className="mt-0.5 shrink-0" />
          <p>
            Trainer attendance and salary payments are processed by the administration from the Staff Attendance and
            Payroll modules.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CoachTrainers;
