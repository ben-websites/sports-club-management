import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import Swal from "sweetalert2";
import {
  Trophy,
  Plus,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  MapPin,
  Swords,
  Lock,
  Clock,
} from "lucide-react";

const toLocalInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const approvalBadge = (status) => {
  const map = {
    Approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    Rejected: "border-red-500/40 bg-red-500/10 text-red-400",
    Pending: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  };
  return map[status] || "border-zinc-700 bg-zinc-900 text-zinc-400";
};

const Field = ({ label, children, className = "" }) => (
  <div className={className}>
    <label className="block text-[9.5px] font-bold uppercase tracking-[0.16em] text-zinc-400">{label}</label>
    <div className="mt-1">{children}</div>
  </div>
);

const inputClass =
  "w-full border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-xs text-white outline-none focus:border-orange-500";

const Modal = ({ title, onClose, children, wide = false }) => (
  <div
    className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className={`mt-10 w-full ${wide ? "max-w-3xl" : "max-w-xl"} border border-zinc-700 bg-[#121215] p-6 shadow-2xl`}
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

const emptyTournament = {
  tournamentName: "",
  tournamentType: "Knockout",
  startDate: "",
  endDate: "",
  venue: "",
  prizePool: "",
  maxTeams: 16,
  description: "",
  status: "Upcoming",
};

const emptyMatch = {
  tournamentId: "",
  matchTitle: "",
  team1Id: "",
  team2Id: "",
  participant1Name: "",
  participant2Name: "",
  matchDate: "",
  venue: "",
  stage: "Group Stage",
  status: "Scheduled",
  scoreTeam1: "",
  scoreTeam2: "",
  winnerTeamId: "",
  winnerName: "",
};

function CoachTournaments() {
  const [data, setData] = useState({ tournaments: [], matches: [], teams: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("tournaments");

  const [tournamentModal, setTournamentModal] = useState(false);
  const [tournamentForm, setTournamentForm] = useState(emptyTournament);
  const [editingTournament, setEditingTournament] = useState(null);

  const [matchModal, setMatchModal] = useState(false);
  const [matchForm, setMatchForm] = useState(emptyMatch);
  const [editingMatch, setEditingMatch] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchAll = async (initial = false) => {
    try {
      if (initial) setLoading(true);
      const res = await api.get("/coach/tournaments");
      if (res.data.success) {
        setData({
          tournaments: res.data.tournaments || [],
          matches: res.data.matches || [],
          teams: res.data.teams || [],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (initial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(true);
  }, []);

  const editableTournaments = useMemo(
    () => data.tournaments.filter((t) => t.IsMine && t.ApprovalStatus !== "Approved"),
    [data.tournaments]
  );

  const openCreateTournament = () => {
    setEditingTournament(null);
    setTournamentForm(emptyTournament);
    setTournamentModal(true);
  };

  const openEditTournament = (t) => {
    setEditingTournament(t);
    setTournamentForm({
      tournamentName: t.TournamentName,
      tournamentType: t.TournamentType || "Knockout",
      startDate: toLocalInput(t.StartDate),
      endDate: toLocalInput(t.EndDate),
      venue: t.Venue || "",
      prizePool: t.PrizePool || "",
      maxTeams: t.MaxTeams || 16,
      description: t.Description || "",
      status: t.Status || "Upcoming",
    });
    setTournamentModal(true);
  };

  const submitTournament = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingTournament) {
        await api.put(`/coach/tournaments/${editingTournament.TournamentID}`, tournamentForm);
      } else {
        await api.post("/coach/tournaments", tournamentForm);
      }
      setTournamentModal(false);
      fetchAll();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const removeTournament = async (t) => {
    const confirm = await Swal.fire({
      title: "Delete tournament?",
      text: `${t.TournamentName} and all of its matches will be removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#27272a",
      confirmButtonText: "Delete",
      background: "#18181b",
      color: "#ffffff",
    });
    if (!confirm.isConfirmed) return;
    try {
      await api.delete(`/coach/tournaments/${t.TournamentID}`);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const openCreateMatch = () => {
    setEditingMatch(null);
    setMatchForm({ ...emptyMatch, tournamentId: editableTournaments[0]?.TournamentID || "" });
    setMatchModal(true);
  };

  const openEditMatch = (m) => {
    setEditingMatch(m);
    setMatchForm({
      tournamentId: m.TournamentID || "",
      matchTitle: m.MatchTitle || "",
      team1Id: m.Team1ID || "",
      team2Id: m.Team2ID || "",
      participant1Name: m.Participant1Name || "",
      participant2Name: m.Participant2Name || "",
      matchDate: toLocalInput(m.MatchDate),
      venue: m.Venue || "",
      stage: m.Stage || "Group Stage",
      status: m.Status || "Scheduled",
      scoreTeam1: m.ScoreTeam1 || "",
      scoreTeam2: m.ScoreTeam2 || "",
      winnerTeamId: m.WinnerTeamID || "",
      winnerName: m.WinnerName || "",
    });
    setMatchModal(true);
  };

  const submitMatch = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingMatch) {
        await api.put(`/coach/matches/${editingMatch.MatchID}`, matchForm);
      } else {
        await api.post("/coach/matches", matchForm);
      }
      setMatchModal(false);
      fetchAll();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const removeMatch = async (m) => {
    const confirm = await Swal.fire({
      title: "Delete match?",
      text: m.MatchTitle,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#27272a",
      confirmButtonText: "Delete",
      background: "#18181b",
      color: "#ffffff",
    });
    if (!confirm.isConfirmed) return;
    try {
      await api.delete(`/coach/matches/${m.MatchID}`);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="coach">
        <PageLoader message="Loading tournament desk..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="coach">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-black text-white">
              <Trophy size={20} className="text-orange-500" /> Tournaments & Matches
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Coaches create and run fixtures — every submission is queued for admin approval.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={tab === "tournaments" ? openCreateTournament : openCreateMatch}
              className="flex items-center gap-2 bg-orange-500 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-black transition hover:bg-white"
            >
              <Plus size={14} /> {tab === "tournaments" ? "New Tournament" : "New Match"}
            </button>
          </div>
        </div>

        <div className="flex gap-1 border-b border-zinc-800">
          {[
            { key: "tournaments", label: `Tournaments (${data.tournaments.length})`, icon: Trophy },
            { key: "matches", label: `Matches (${data.matches.length})`, icon: Swords },
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

        {tab === "tournaments" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {data.tournaments.length === 0 && (
              <div className="border border-zinc-800 bg-[#121215] p-10 text-center text-xs text-zinc-500 lg:col-span-2">
                No tournaments yet. Create your first tournament for this sport.
              </div>
            )}
            {data.tournaments.map((t) => {
              const locked = !t.IsMine || t.ApprovalStatus === "Approved";
              return (
                <div key={t.TournamentID} className="border border-zinc-800 bg-[#121215] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-black text-white">{t.TournamentName}</h3>
                        <span className={`border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${approvalBadge(t.ApprovalStatus)}`}>
                          {t.ApprovalStatus}
                        </span>
                        {!t.IsMine && (
                          <span className="border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                            Read only
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10.5px] text-zinc-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={11} />
                          {new Date(t.StartDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          {t.EndDate ? ` - ${new Date(t.EndDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}
                        </span>
                        {t.Venue && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} /> {t.Venue}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Swords size={11} /> {t.MatchCount} matches
                        </span>
                      </div>
                      {t.Description && <p className="mt-2 line-clamp-2 text-[11px] text-zinc-400">{t.Description}</p>}
                      {t.ApprovalStatus === "Rejected" && t.AdminRemarks && (
                        <p className="mt-2 border border-red-500/30 bg-red-500/10 p-2 text-[10.5px] text-red-300">
                          Admin: {t.AdminRemarks}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        onClick={() => openEditTournament(t)}
                        disabled={locked}
                        title={locked ? "Approved tournaments are locked" : "Edit"}
                        className="border border-zinc-700 p-2 text-zinc-300 transition hover:border-orange-500 hover:text-white disabled:opacity-30"
                      >
                        {locked ? <Lock size={13} /> : <Pencil size={13} />}
                      </button>
                      <button
                        onClick={() => removeTournament(t)}
                        disabled={locked}
                        className="border border-zinc-700 p-2 text-zinc-300 transition hover:border-red-500 hover:text-red-400 disabled:opacity-30"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-3 text-[10px] uppercase tracking-wider text-zinc-500">
                    <span>{t.TournamentType} • {t.MaxTeams} teams</span>
                    <span className="font-bold text-zinc-400">{t.Status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border border-zinc-800 bg-[#121215]">
            {data.matches.length === 0 ? (
              <div className="p-10 text-center text-xs text-zinc-500">No match fixtures created yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#16161b] text-[9.5px] uppercase tracking-[0.16em] text-zinc-400">
                    <tr>
                      <th className="px-5 py-3">Match</th>
                      <th className="px-3 py-3">Stage</th>
                      <th className="px-3 py-3">Schedule</th>
                      <th className="px-3 py-3">Score</th>
                      <th className="px-3 py-3">Winner</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/70">
                    {data.matches.map((m) => (
                      <tr key={m.MatchID} className="hover:bg-zinc-800/20">
                        <td className="px-5 py-3">
                          <div className="font-bold text-zinc-100">{m.MatchTitle}</div>
                          <div className="text-[10px] text-zinc-500">
                            {m.Team1Name || m.Participant1Name || "TBD"} vs {m.Team2Name || m.Participant2Name || "TBD"}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-zinc-400">{m.Stage}</td>
                        <td className="px-3 py-3 text-[10.5px] text-zinc-400">
                          {new Date(m.MatchDate).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-3 py-3 font-mono text-[11px] text-white">
                          {m.ScoreTeam1 || "-"} : {m.ScoreTeam2 || "-"}
                        </td>
                        <td className="px-3 py-3 text-[10.5px] text-orange-400">{m.WinnerName || "-"}</td>
                        <td className="px-3 py-3">
                          <span className="border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-300">
                            {m.Status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => openEditMatch(m)}
                              className="border border-zinc-700 p-1.5 text-zinc-300 hover:border-orange-500 hover:text-white"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={() => removeMatch(m)}
                              className="border border-zinc-700 p-1.5 text-zinc-300 hover:border-red-500 hover:text-red-400"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {tournamentModal && (
        <Modal
          title={editingTournament ? "Edit Tournament" : "Create Tournament"}
          onClose={() => setTournamentModal(false)}
          wide
        >
          <form onSubmit={submitTournament} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Tournament Name *">
                <input
                  required
                  value={tournamentForm.tournamentName}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, tournamentName: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Format">
                <select
                  value={tournamentForm.tournamentType}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, tournamentType: e.target.value })}
                  className={inputClass}
                >
                  {["Knockout", "League", "Round Robin", "Group + Knockout", "Friendly"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Start Date & Time *">
                <input
                  required
                  type="datetime-local"
                  value={tournamentForm.startDate}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, startDate: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="End Date & Time">
                <input
                  type="datetime-local"
                  value={tournamentForm.endDate}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, endDate: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Venue">
                <input
                  value={tournamentForm.venue}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, venue: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Prize Pool">
                <input
                  value={tournamentForm.prizePool}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, prizePool: e.target.value })}
                  className={inputClass}
                  placeholder="Rs 250,000 + Trophy"
                />
              </Field>
              <Field label="Max Teams">
                <input
                  type="number"
                  min="2"
                  value={tournamentForm.maxTeams}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, maxTeams: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Status">
                <select
                  value={tournamentForm.status}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, status: e.target.value })}
                  className={inputClass}
                >
                  {["Upcoming", "Ongoing", "Completed", "Cancelled"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Description">
              <textarea
                rows="3"
                value={tournamentForm.description}
                onChange={(e) => setTournamentForm({ ...tournamentForm, description: e.target.value })}
                className={inputClass}
              />
            </Field>
            <div className="flex justify-end gap-2 border-t border-zinc-800 pt-3">
              <button
                type="button"
                onClick={() => setTournamentModal(false)}
                className="border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-orange-500 px-5 py-2 text-xs font-black uppercase tracking-wider text-black hover:bg-white disabled:opacity-50"
              >
                {saving ? "Saving..." : editingTournament ? "Update & Resubmit" : "Submit for Approval"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {matchModal && (
        <Modal title={editingMatch ? "Edit Match Details" : "Create Match Fixture"} onClose={() => setMatchModal(false)} wide>
          <form onSubmit={submitMatch} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Tournament">
                <select
                  value={matchForm.tournamentId}
                  onChange={(e) => setMatchForm({ ...matchForm, tournamentId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Independent fixture</option>
                  {data.tournaments.map((t) => (
                    <option key={t.TournamentID} value={t.TournamentID}>
                      {t.TournamentName} ({t.ApprovalStatus})
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Match Title *">
                <input
                  required
                  value={matchForm.matchTitle}
                  onChange={(e) => setMatchForm({ ...matchForm, matchTitle: e.target.value })}
                  className={inputClass}
                  placeholder="Semi Final - Falcons vs Titans"
                />
              </Field>
              <Field label="Team 1">
                <select
                  value={matchForm.team1Id}
                  onChange={(e) => setMatchForm({ ...matchForm, team1Id: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Use participant name</option>
                  {data.teams.map((t) => (
                    <option key={t.TeamID} value={t.TeamID}>
                      {t.TeamName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Team 2">
                <select
                  value={matchForm.team2Id}
                  onChange={(e) => setMatchForm({ ...matchForm, team2Id: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Use participant name</option>
                  {data.teams.map((t) => (
                    <option key={t.TeamID} value={t.TeamID}>
                      {t.TeamName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Participant 1 (custom)">
                <input
                  value={matchForm.participant1Name}
                  onChange={(e) => setMatchForm({ ...matchForm, participant1Name: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Participant 2 (custom)">
                <input
                  value={matchForm.participant2Name}
                  onChange={(e) => setMatchForm({ ...matchForm, participant2Name: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Match Date & Time *">
                <input
                  required
                  type="datetime-local"
                  value={matchForm.matchDate}
                  onChange={(e) => setMatchForm({ ...matchForm, matchDate: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Venue">
                <input
                  value={matchForm.venue}
                  onChange={(e) => setMatchForm({ ...matchForm, venue: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Stage">
                <select
                  value={matchForm.stage}
                  onChange={(e) => setMatchForm({ ...matchForm, stage: e.target.value })}
                  className={inputClass}
                >
                  {["Group Stage", "Round of 16", "Quarter Final", "Semi Final", "Third Place", "Final", "League Round"].map(
                    (s) => (
                      <option key={s}>{s}</option>
                    )
                  )}
                </select>
              </Field>
              <Field label="Match Status">
                <select
                  value={matchForm.status}
                  onChange={(e) => setMatchForm({ ...matchForm, status: e.target.value })}
                  className={inputClass}
                >
                  {["Scheduled", "Live", "Completed", "Postponed", "Cancelled"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Score Team 1">
                <input
                  value={matchForm.scoreTeam1}
                  onChange={(e) => setMatchForm({ ...matchForm, scoreTeam1: e.target.value })}
                  className={inputClass}
                  placeholder="185/6"
                />
              </Field>
              <Field label="Score Team 2">
                <input
                  value={matchForm.scoreTeam2}
                  onChange={(e) => setMatchForm({ ...matchForm, scoreTeam2: e.target.value })}
                  className={inputClass}
                  placeholder="172/9"
                />
              </Field>
              <Field label="Winner Team">
                <select
                  value={matchForm.winnerTeamId}
                  onChange={(e) => setMatchForm({ ...matchForm, winnerTeamId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Not decided</option>
                  {data.teams.map((t) => (
                    <option key={t.TeamID} value={t.TeamID}>
                      {t.TeamName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Winner Name (custom)">
                <input
                  value={matchForm.winnerName}
                  onChange={(e) => setMatchForm({ ...matchForm, winnerName: e.target.value })}
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
              <Clock size={12} /> Match details (stage, scores, winner and status) are visible to members and admins.
            </div>
            <div className="flex justify-end gap-2 border-t border-zinc-800 pt-3">
              <button
                type="button"
                onClick={() => setMatchModal(false)}
                className="border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-orange-500 px-5 py-2 text-xs font-black uppercase tracking-wider text-black hover:bg-white disabled:opacity-50"
              >
                {saving ? "Saving..." : editingMatch ? "Update Match" : "Add Match"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}

export default CoachTournaments;
