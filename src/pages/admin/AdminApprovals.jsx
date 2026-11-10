import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import toast from "react-hot-toast";
import {
  ShieldCheck,
  Trophy,
  Box,
  Check,
  X,
  MapPin,
  CalendarDays,
  User,
  Inbox,
  RefreshCw,
  Warehouse,
} from "lucide-react";

const fmtDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

function AdminApprovals() {
  const [data, setData] = useState({ tournaments: [], equipment: [] });
  const [tab, setTab] = useState("tournaments");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [remarks, setRemarks] = useState({});

  const fetchApprovals = useCallback(async (initial = false) => {
    try {
      if (initial) setLoading(true);
      const res = await api.get("/admin/staff/approvals");
      if (res.data.success) {
        setData({ tournaments: res.data.tournaments || [], equipment: res.data.equipment || [] });
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (initial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApprovals(true);
  }, [fetchApprovals]);

  const review = async (kind, id, action) => {
    setBusy(`${kind}-${id}`);
    try {
      const path = kind === "tournament" ? `/admin/staff/tournaments/${id}/review` : `/admin/staff/equipment/${id}/review`;
      await api.put(path, { action, remarks: remarks[`${kind}-${id}`] || "" });
      setRemarks((prev) => ({ ...prev, [`${kind}-${id}`]: "" }));
      fetchApprovals();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(null);
    }
  };

  const reject = (kind, id) => {
    const note = remarks[`${kind}-${id}`];
    if (!note || !note.trim()) {
      toast.error("Add a remark explaining the rejection.");
      return;
    }
    review(kind, id, "reject");
  };

  const total = data.tournaments.length + data.equipment.length;

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <PageLoader message="Loading approval queue..." />
      </DashboardLayout>
    );
  }

  const renderActions = (kind, id) => {
    const key = `${kind}-${id}`;
    return (
      <div className="mt-3 flex flex-col gap-2 border-t border-zinc-800 pt-3">
        <input
          value={remarks[key] || ""}
          onChange={(e) => setRemarks((prev) => ({ ...prev, [key]: e.target.value }))}
          placeholder="Admin remarks (required for rejection)"
          className="w-full border border-zinc-700 bg-zinc-900 px-3 py-2 text-[11px] text-white outline-none focus:border-orange-500"
        />
        <div className="flex gap-2">
          <button
            onClick={() => review(kind, id, "approve")}
            disabled={busy === key}
            className="flex flex-1 items-center justify-center gap-1.5 bg-emerald-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-black transition hover:bg-white disabled:opacity-40"
          >
            <Check size={12} /> Approve
          </button>
          <button
            onClick={() => reject(kind, id)}
            disabled={busy === key}
            className="flex flex-1 items-center justify-center gap-1.5 border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-red-400 transition hover:bg-red-500 hover:text-white disabled:opacity-40"
          >
            <X size={12} /> Reject
          </button>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-black text-white">
              <ShieldCheck size={20} className="text-orange-500" /> Coach Approvals
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Tournaments and equipment requests submitted by head coaches land here for monitoring and approval.
            </p>
          </div>
          <button
            onClick={() => fetchApprovals()}
            className="flex items-center gap-2 border border-zinc-700 px-3 py-2 text-[10.5px] font-bold uppercase tracking-wider text-zinc-300 hover:border-orange-500 hover:text-orange-400"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="border border-zinc-800 bg-[#121215] p-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">Pending Total</div>
            <div className="mt-1 text-xl font-black text-white">{total}</div>
          </div>
          <div className="border border-zinc-800 bg-[#121215] p-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">Tournaments</div>
            <div className="mt-1 text-xl font-black text-amber-400">{data.tournaments.length}</div>
          </div>
          <div className="border border-zinc-800 bg-[#121215] p-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">Equipment</div>
            <div className="mt-1 text-xl font-black text-sky-400">{data.equipment.length}</div>
          </div>
        </div>

        <div className="flex gap-1 border-b border-zinc-800">
          {[
            { key: "tournaments", label: `Tournaments (${data.tournaments.length})`, icon: Trophy },
            { key: "equipment", label: `Equipment (${data.equipment.length})`, icon: Box },
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

        {tab === "tournaments" && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.tournaments.map((t) => (
              <div key={t.TournamentID} className="border border-amber-500/30 bg-[#121215] p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-white">{t.TournamentName}</div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wider text-zinc-500">
                      {t.SportName || "Sport"} • {t.Status}
                    </div>
                  </div>
                  <span className="border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-400">
                    Pending
                  </span>
                </div>

                {t.Description && <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">{t.Description}</p>}

                <div className="mt-3 space-y-1 text-[10.5px] text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays size={11} className="text-zinc-500" /> {fmtDate(t.StartDate)} → {fmtDate(t.EndDate)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={11} className="text-zinc-500" /> {t.Venue || "Venue TBD"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User size={11} className="text-zinc-500" /> {t.CoachName || "Unassigned coach"}
                  </div>
                </div>

                {renderActions("tournament", t.TournamentID)}
              </div>
            ))}
            {data.tournaments.length === 0 && (
              <div className="col-span-full flex flex-col items-center gap-2 border border-zinc-800 bg-[#121215] px-5 py-12 text-center">
                <Inbox size={22} className="text-zinc-600" />
                <p className="text-[11.5px] text-zinc-500">No tournaments awaiting approval.</p>
              </div>
            )}
          </div>
        )}

        {tab === "equipment" && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.equipment.map((e) => (
              <div key={e.EquipmentID} className="border border-sky-500/30 bg-[#121215] p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-white">{e.ItemName}</div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wider text-zinc-500">
                      {e.SportName || "Sport"} • {e.Category || "General"}
                    </div>
                  </div>
                  <span className="border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-sky-400">
                    Pending
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-[10.5px] text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Box size={11} className="text-zinc-500" /> {e.TotalQuantity} units • {e.Condition || "Good"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Warehouse size={11} className="text-zinc-500" /> {e.StorageLocation || "Store room"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User size={11} className="text-zinc-500" /> {e.CoachName || "Unassigned coach"}
                  </div>
                </div>

                {renderActions("equipment", e.EquipmentID)}
              </div>
            ))}
            {data.equipment.length === 0 && (
              <div className="col-span-full flex flex-col items-center gap-2 border border-zinc-800 bg-[#121215] px-5 py-12 text-center">
                <Inbox size={22} className="text-zinc-600" />
                <p className="text-[11.5px] text-zinc-500">No equipment requests awaiting approval.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AdminApprovals;
