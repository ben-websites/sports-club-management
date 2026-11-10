import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import Swal from "sweetalert2";
import {
  Award,
  Plus,
  X,
  KeyRound,
  Pencil,
  Users,
  AlertTriangle,
  ShieldCheck,
  Dumbbell,
} from "lucide-react";

const inputClass =
  "w-full border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-xs text-white outline-none focus:border-orange-500";

const Field = ({ label, children, className = "" }) => (
  <div className={className}>
    <label className="block text-[9.5px] font-bold uppercase tracking-[0.16em] text-zinc-400">{label}</label>
    <div className="mt-1">{children}</div>
  </div>
);

const Modal = ({ title, onClose, children, wide = false }) => (
  <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm" onClick={onClose}>
    <div
      className={`mt-10 w-full ${wide ? "max-w-3xl" : "max-w-lg"} border border-zinc-700 bg-[#121215] p-6 shadow-2xl`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">{title}</h3>
        <button onClick={onClose} className="text-zinc-400 hover:text-white">
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

function AdminStaff() {
  const [data, setData] = useState({ coaches: [], coverage: [], trainers: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("coverage");

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    sportId: "",
    specialization: "",
    experienceYears: 5,
    monthlySalary: 75000,
  });

  const [loginCoach, setLoginCoach] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  const [editingCoach, setEditingCoach] = useState(null);
  const [coachForm, setCoachForm] = useState({ specialization: "", monthlySalary: 75000, phone: "", isActive: true });

  const [editingTrainer, setEditingTrainer] = useState(null);
  const [trainerForm, setTrainerForm] = useState({
    fullName: "",
    specialization: "",
    phone: "",
    email: "",
    monthlySalary: 45000,
    shift: "Morning",
    isActive: true,
  });

  const [saving, setSaving] = useState(false);

  const fetchDirectory = async (initial = false) => {
    try {
      if (initial) setLoading(true);
      const res = await api.get("/admin/staff");
      if (res.data.success) setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      if (initial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory(true);
  }, []);

  const vacantSports = useMemo(() => data.coverage.filter((s) => s.CoachCount === 0), [data.coverage]);

  const openCreate = () => {
    setCreateForm({
      fullName: "",
      email: "",
      password: "",
      phone: "",
      sportId: vacantSports[0]?.SportID || "",
      specialization: "",
      experienceYears: 5,
      monthlySalary: 75000,
    });
    setCreateOpen(true);
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/staff/coaches", createForm);
      setCreateOpen(false);
      fetchDirectory();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const openLogin = (coach) => {
    setLoginCoach(coach);
    setLoginForm({ email: coach.Email || "", password: "" });
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/admin/staff/coaches/${loginCoach.CoachID}/account`, loginForm);
      setLoginCoach(null);
      fetchDirectory();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const openCoachEdit = (coach) => {
    setEditingCoach(coach);
    setCoachForm({
      specialization: coach.Specialization || "",
      monthlySalary: coach.MonthlySalary || 0,
      phone: coach.Phone || "",
      isActive: !!coach.IsActive,
    });
  };

  const submitCoachEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/admin/staff/coaches/${editingCoach.CoachID}`, coachForm);
      setEditingCoach(null);
      fetchDirectory();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const openTrainerEdit = (trainer) => {
    setEditingTrainer(trainer);
    setTrainerForm({
      fullName: trainer.FullName || "",
      specialization: trainer.Specialization || "",
      phone: trainer.Phone || "",
      email: trainer.Email || "",
      monthlySalary: trainer.MonthlySalary || 45000,
      shift: trainer.Shift || "Morning",
      isActive: !!trainer.IsActive,
    });
  };

  const submitTrainerEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/admin/staff/trainers/${editingTrainer.TrainerID}`, trainerForm);
      setEditingTrainer(null);
      fetchDirectory();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const removeTrainer = async (trainer) => {
    const confirm = await Swal.fire({
      title: "Remove trainer?",
      text: `${trainer.FullName} — ${trainer.CoachName}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#27272a",
      confirmButtonText: "Remove",
      background: "#18181b",
      color: "#ffffff",
    });
    if (!confirm.isConfirmed) return;
    try {
      await api.delete(`/admin/staff/trainers/${trainer.TrainerID}`);
      fetchDirectory();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <PageLoader message="Loading coaching staff directory..." />
      </DashboardLayout>
    );
  }

  const groupedTrainers = data.coaches.map((coach) => ({
    coach,
    trainers: data.trainers.filter((t) => t.CoachID === coach.CoachID),
  }));

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-black text-white">
              <Award size={20} className="text-orange-500" /> Coaching Staff & Trainers
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              One dedicated head coach per sport, each provisioned with 5 trainer slots and a portal login.
            </p>
          </div>
          <button
            onClick={openCreate}
            disabled={vacantSports.length === 0}
            className="flex items-center gap-2 bg-orange-500 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-black transition hover:bg-white disabled:opacity-40"
            title={vacantSports.length === 0 ? "All sports already have a head coach" : "Appoint a coach"}
          >
            <Plus size={14} /> Appoint Coach
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="border border-zinc-800 bg-[#121215] p-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">Sports</div>
            <div className="mt-1 text-xl font-black text-white">{data.coverage.length}</div>
          </div>
          <div className="border border-zinc-800 bg-[#121215] p-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">Head Coaches</div>
            <div className="mt-1 text-xl font-black text-orange-400">{data.coaches.length}</div>
          </div>
          <div className="border border-zinc-800 bg-[#121215] p-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">Trainers</div>
            <div className="mt-1 text-xl font-black text-sky-400">{data.trainers.filter((t) => t.IsActive).length}</div>
          </div>
          <div className={`border p-4 ${data.missingCoachCount ? "border-amber-500/40 bg-amber-500/10" : "border-emerald-500/30 bg-emerald-500/5"}`}>
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400">Vacant Sports</div>
            <div className={`mt-1 text-xl font-black ${data.missingCoachCount ? "text-amber-400" : "text-emerald-400"}`}>
              {data.missingCoachCount}
            </div>
          </div>
        </div>

        <div className="flex gap-1 border-b border-zinc-800">
          {[
            { key: "coverage", label: "Sport Coverage", icon: Dumbbell },
            { key: "coaches", label: `Coaches (${data.coaches.length})`, icon: ShieldCheck },
            { key: "trainers", label: `Trainers (${data.trainers.length})`, icon: Users },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider transition ${
                tab === t.key
                  ? "border-b-2 border-orange-500 text-white"
                  : "border-b-2 border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>

        {tab === "coverage" && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.coverage.map((sport) => (
              <div
                key={sport.SportID}
                className={`border p-4 ${sport.CoachCount === 0 ? "border-amber-500/40 bg-amber-500/5" : "border-zinc-800 bg-[#121215]"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-white">{sport.SportName}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">
                      Sport #{sport.SportID}
                    </div>
                  </div>
                  {sport.CoachCount === 0 ? (
                    <AlertTriangle size={16} className="text-amber-400" />
                  ) : (
                    <ShieldCheck size={16} className="text-emerald-400" />
                  )}
                </div>

                {sport.CoachCount === 0 ? (
                  <div className="mt-3">
                    <p className="text-[11px] font-bold text-amber-300">We don't have a coach right now.</p>
                    <button
                      onClick={() => {
                        setCreateForm((f) => ({ ...f, sportId: sport.SportID }));
                        setCreateOpen(true);
                      }}
                      className="mt-2 w-full border border-amber-500/50 bg-amber-500/10 py-1.5 text-[10px] font-black uppercase tracking-wider text-amber-300 transition hover:bg-amber-500 hover:text-black"
                    >
                      Appoint Coach
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 border-t border-zinc-800 pt-2 text-[11px]">
                    <div className="font-bold text-zinc-200">{sport.CoachName}</div>
                    <div className="text-[10px] text-zinc-500">Head Coach</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "coaches" && (
          <div className="border border-zinc-800 bg-[#121215]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#16161b] text-[9.5px] uppercase tracking-[0.16em] text-zinc-400">
                  <tr>
                    <th className="px-5 py-3">Coach</th>
                    <th className="px-3 py-3">Sport</th>
                    <th className="px-3 py-3">Salary</th>
                    <th className="px-3 py-3">Trainers</th>
                    <th className="px-3 py-3">Students</th>
                    <th className="px-3 py-3">Portal Login</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {data.coaches.map((coach) => (
                    <tr key={coach.CoachID} className="hover:bg-zinc-800/20">
                      <td className="px-5 py-3">
                        <div className="font-bold text-zinc-100">{coach.FullName}</div>
                        <div className="text-[10px] text-zinc-500">
                          {coach.EmployeeCode} • {coach.Specialization}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-zinc-400">{coach.SportName || "Unassigned"}</td>
                      <td className="px-3 py-3 font-mono text-zinc-300">Rs {Number(coach.MonthlySalary || 0).toLocaleString()}</td>
                      <td className="px-3 py-3 text-zinc-400">{coach.TrainerCount}/5</td>
                      <td className="px-3 py-3 text-zinc-400">{coach.Students}</td>
                      <td className="px-3 py-3">
                        {coach.HasLogin ? (
                          <span className="border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-400">
                            Active
                          </span>
                        ) : (
                          <span className="border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-400">
                            Not created
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1.5">
                          {!coach.HasLogin && (
                            <button
                              onClick={() => openLogin(coach)}
                              title="Create portal login"
                              className="border border-zinc-700 p-1.5 text-zinc-300 hover:border-emerald-500 hover:text-emerald-400"
                            >
                              <KeyRound size={12} />
                            </button>
                          )}
                          <button
                            onClick={() => openCoachEdit(coach)}
                            className="border border-zinc-700 p-1.5 text-zinc-300 hover:border-orange-500 hover:text-white"
                          >
                            <Pencil size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "trainers" && (
          <div className="space-y-4">
            {groupedTrainers.map(({ coach, trainers }) => (
              <div key={coach.CoachID} className="border border-zinc-800 bg-[#121215]">
                <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
                  <div>
                    <div className="text-xs font-bold text-white">{coach.FullName}</div>
                    <div className="text-[10px] text-zinc-500">{coach.SportName}</div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    {trainers.length}/5 trainers
                  </span>
                </div>
                <div className="divide-y divide-zinc-800/70">
                  {trainers.map((trainer) => (
                    <div key={trainer.TrainerID} className="flex items-center justify-between gap-3 px-5 py-2.5">
                      <div className="min-w-0">
                        <div className="text-[11.5px] font-bold text-zinc-200">
                          {trainer.FullName}
                          {!trainer.IsActive && <span className="ml-2 text-[9px] uppercase text-zinc-500">inactive</span>}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {trainer.Specialization} • {trainer.Shift} • Rs {Number(trainer.MonthlySalary).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1.5">
                        <button
                          onClick={() => openTrainerEdit(trainer)}
                          className="border border-zinc-700 p-1.5 text-zinc-300 hover:border-orange-500 hover:text-white"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => removeTrainer(trainer)}
                          className="border border-zinc-700 p-1.5 text-zinc-300 hover:border-red-500 hover:text-red-400"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {trainers.length === 0 && (
                    <div className="px-5 py-4 text-[11px] text-zinc-500">No trainers assigned to this coach.</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {createOpen && (
        <Modal title="Appoint Head Coach" onClose={() => setCreateOpen(false)} wide>
          <form onSubmit={submitCreate} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full Name *">
                <input required value={createForm.fullName} onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Sport *">
                <select
                  required
                  value={createForm.sportId}
                  onChange={(e) => setCreateForm({ ...createForm, sportId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select sport</option>
                  {vacantSports.map((s) => (
                    <option key={s.SportID} value={s.SportID}>
                      {s.SportName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Login Email *">
                <input required type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Password * (min 8 chars)">
                <input required minLength={8} type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Phone">
                <input value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Specialization">
                <input value={createForm.specialization} onChange={(e) => setCreateForm({ ...createForm, specialization: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Experience (years)">
                <input type="number" min="0" value={createForm.experienceYears} onChange={(e) => setCreateForm({ ...createForm, experienceYears: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Monthly Salary">
                <input type="number" min="0" value={createForm.monthlySalary} onChange={(e) => setCreateForm({ ...createForm, monthlySalary: e.target.value })} className={inputClass} />
              </Field>
            </div>
            <p className="border border-sky-500/20 bg-sky-500/5 p-2.5 text-[10.5px] text-sky-300">
              5 trainer slots and the coach portal login are created automatically.
            </p>
            <div className="flex justify-end gap-2 border-t border-zinc-800 pt-3">
              <button type="button" onClick={() => setCreateOpen(false)} className="border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-orange-500 px-5 py-2 text-xs font-black uppercase tracking-wider text-black hover:bg-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Appoint Coach"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {loginCoach && (
        <Modal title={`Create Portal Login — ${loginCoach.FullName}`} onClose={() => setLoginCoach(null)}>
          <form onSubmit={submitLogin} className="space-y-3">
            <Field label="Login Email">
              <input required type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Temporary Password (min 8 chars)">
              <input required minLength={8} type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className={inputClass} />
            </Field>
            <div className="flex justify-end gap-2 border-t border-zinc-800 pt-3">
              <button type="button" onClick={() => setLoginCoach(null)} className="border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-orange-500 px-5 py-2 text-xs font-black uppercase tracking-wider text-black hover:bg-white disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create Login"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {editingCoach && (
        <Modal title={`Edit Coach — ${editingCoach.FullName}`} onClose={() => setEditingCoach(null)}>
          <form onSubmit={submitCoachEdit} className="space-y-3">
            <Field label="Specialization">
              <input value={coachForm.specialization} onChange={(e) => setCoachForm({ ...coachForm, specialization: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Phone">
              <input value={coachForm.phone} onChange={(e) => setCoachForm({ ...coachForm, phone: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Monthly Salary">
              <input type="number" value={coachForm.monthlySalary} onChange={(e) => setCoachForm({ ...coachForm, monthlySalary: e.target.value })} className={inputClass} />
            </Field>
            <label className="flex items-center gap-2 text-[11px] font-bold text-zinc-300">
              <input
                type="checkbox"
                checked={coachForm.isActive}
                onChange={(e) => setCoachForm({ ...coachForm, isActive: e.target.checked })}
              />
              Active head coach for this sport
            </label>
            <div className="flex justify-end gap-2 border-t border-zinc-800 pt-3">
              <button type="button" onClick={() => setEditingCoach(null)} className="border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-orange-500 px-5 py-2 text-xs font-black uppercase tracking-wider text-black hover:bg-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {editingTrainer && (
        <Modal title={`Edit Trainer — ${editingTrainer.FullName}`} onClose={() => setEditingTrainer(null)}>
          <form onSubmit={submitTrainerEdit} className="space-y-3">
            <Field label="Full Name">
              <input value={trainerForm.fullName} onChange={(e) => setTrainerForm({ ...trainerForm, fullName: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Specialization">
              <input value={trainerForm.specialization} onChange={(e) => setTrainerForm({ ...trainerForm, specialization: e.target.value })} className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone">
                <input value={trainerForm.phone} onChange={(e) => setTrainerForm({ ...trainerForm, phone: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Email">
                <input value={trainerForm.email} onChange={(e) => setTrainerForm({ ...trainerForm, email: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Monthly Salary">
                <input type="number" value={trainerForm.monthlySalary} onChange={(e) => setTrainerForm({ ...trainerForm, monthlySalary: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Shift">
                <select value={trainerForm.shift} onChange={(e) => setTrainerForm({ ...trainerForm, shift: e.target.value })} className={inputClass}>
                  {["Morning", "Evening", "Both"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>
            <label className="flex items-center gap-2 text-[11px] font-bold text-zinc-300">
              <input
                type="checkbox"
                checked={trainerForm.isActive}
                onChange={(e) => setTrainerForm({ ...trainerForm, isActive: e.target.checked })}
              />
              Active trainer
            </label>
            <div className="flex justify-end gap-2 border-t border-zinc-800 pt-3">
              <button type="button" onClick={() => setEditingTrainer(null)} className="border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-orange-500 px-5 py-2 text-xs font-black uppercase tracking-wider text-black hover:bg-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}

export default AdminStaff;
