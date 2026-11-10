import { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import {
  Trophy,
  Plus,
  Calendar,
  Clock,
  MapPin,
  X,
  CheckCircle2,
  Edit2,
  Trash2,
  Shield,
  Zap,
} from "lucide-react";

function AdminTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [sports, setSports] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isTournModalOpen, setIsTournModalOpen] = useState(false);
  const [tournForm, setTournForm] = useState({
    tournamentName: "",
    sportId: "",
    description: "",
    tournamentType: "Knockout",
    startDate: "",
    endDate: "",
    venue: "Main Club Arena",
    prizePool: "PKR 100,000 + Trophy",
    maxTeams: 16,
  });

  const [selectedTournForMatches, setSelectedTournForMatches] = useState(null);
  const [tournMatches, setTournMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Match Schedule Form
  const [matchForm, setMatchForm] = useState({
    matchTitle: "",
    team1Id: "",
    team2Id: "",
    participant1Name: "",
    participant2Name: "",
    matchDate: "",
    venue: "Main Court",
    stage: "Quarter-Final",
  });

  // Score Update Modal
  const [editingMatch, setEditingMatch] = useState(null);
  const [scoreForm, setScoreForm] = useState({
    scoreTeam1: "",
    scoreTeam2: "",
    winnerTeamId: "",
    winnerName: "",
    status: "Completed",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [trRes, spRes, tmRes] = await Promise.all([
        api.get("/sports-management/tournaments"),
        api.get("/sports-management/sports"),
        api.get("/sports-management/teams"),
      ]);

      if (trRes.data.success) setTournaments(trRes.data.data);
      if (spRes.data.success) setSports(spRes.data.data);
      if (tmRes.data.success) setTeams(tmRes.data.data);
    } catch (err) {
      console.error("Failed to load tournament data:", err);
      toast.error("Could not fetch tournaments.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/sports-management/tournaments", tournForm);
      if (res.data.success) {
        toast.success("Tournament created and announced!");
        setIsTournModalOpen(false);
        setTournForm({
          tournamentName: "",
          sportId: "",
          description: "",
          tournamentType: "Knockout",
          startDate: "",
          endDate: "",
          venue: "Main Club Arena",
          prizePool: "PKR 100,000 + Trophy",
          maxTeams: 16,
        });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create tournament.");
    }
  };

  const handleOpenMatches = async (tourn) => {
    setSelectedTournForMatches(tourn);
    setLoadingMatches(true);
    try {
      const res = await api.get(`/sports-management/tournaments/${tourn.TournamentID}`);
      if (res.data.success) {
        setTournMatches(res.data.data.matches || []);
      }
    } catch (err) {
      toast.error("Failed to fetch tournament fixtures.");
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleScheduleMatch = async (e) => {
    e.preventDefault();
    if (!selectedTournForMatches) return;

    try {
      const res = await api.post("/sports-management/matches", {
        tournamentId: selectedTournForMatches.TournamentID,
        sportId: selectedTournForMatches.SportID,
        ...matchForm,
      });

      if (res.data.success) {
        toast.success("Fixture scheduled successfully!");
        setMatchForm({
          matchTitle: "",
          team1Id: "",
          team2Id: "",
          participant1Name: "",
          participant2Name: "",
          matchDate: "",
          venue: "Main Court",
          stage: "Quarter-Final",
        });
        handleOpenMatches(selectedTournForMatches);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to schedule match.");
    }
  };

  const handleOpenScoreUpdate = (match) => {
    setEditingMatch(match);
    setScoreForm({
      scoreTeam1: match.ScoreTeam1 || "",
      scoreTeam2: match.ScoreTeam2 || "",
      winnerTeamId: match.WinnerTeamID || "",
      winnerName: match.WinnerName || "",
      status: match.Status || "Completed",
    });
  };

  const handleUpdateScoreSubmit = async (e) => {
    e.preventDefault();
    if (!editingMatch) return;

    try {
      const res = await api.put(`/sports-management/matches/${editingMatch.MatchID}`, scoreForm);
      if (res.data.success) {
        toast.success("Match results saved.");
        setEditingMatch(null);
        handleOpenMatches(selectedTournForMatches);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update match.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoader message="Loading Tournaments & Match Schedules..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="border border-zinc-800 bg-[#121215] p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="text-orange-500" size={24} />
                <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-white">
                  Tournaments & Match Scheduling
                </h1>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                Organize championship tournaments, schedule match fixtures, and track live scores and winners.
              </p>
            </div>

            <button
              onClick={() => setIsTournModalOpen(true)}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-black px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition self-start md:self-auto"
            >
              <Plus size={16} /> Create Tournament
            </button>
          </div>
        </div>

        {/* TOURNAMENTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tourn) => (
            <div
              key={tourn.TournamentID}
              className="border border-zinc-800 bg-[#121215] p-6 shadow-lg flex flex-col justify-between hover:border-zinc-700 transition"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-950/60 border border-orange-500/30 px-2 py-0.5">
                    {tourn.SportName}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5">
                    {tourn.TournamentType} Format
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight">
                    {tourn.TournamentName}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                    {tourn.Description || "Annual club tournament featuring member divisions."}
                  </p>
                </div>

                <div className="bg-zinc-900/80 border border-zinc-800 p-3 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Calendar size={13} className="text-orange-500" />
                    <span>Starts: {new Date(tourn.StartDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <MapPin size={13} className="text-orange-500" />
                    <span>{tourn.Venue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Trophy size={13} />
                    <span>Prize: {tourn.PrizePool || "Trophy + Medals"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
                <button
                  onClick={() => handleOpenMatches(tourn)}
                  className="w-full py-2 bg-zinc-900 hover:bg-orange-600 hover:text-black border border-zinc-700 text-xs font-bold uppercase tracking-wider text-white transition flex items-center justify-center gap-2"
                >
                  <Trophy size={14} /> Fixtures & Scores ({tourn.TotalMatches || 0})
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CREATE TOURNAMENT MODAL */}
        {isTournModalOpen && (
          <div
            className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setIsTournModalOpen(false)}
          >
            <div
              className="modal-content w-full max-w-lg border border-zinc-700 bg-[#121215] p-6 shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="text-orange-500" size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Schedule New Tournament
                  </h3>
                </div>
                <button onClick={() => setIsTournModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateTournament} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase text-zinc-300 mb-1">Tournament Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Z Winter Tennis Open 2026"
                    value={tournForm.tournamentName}
                    onChange={(e) => setTournForm({ ...tournForm, tournamentName: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-zinc-300 mb-1">Sport</label>
                    <select
                      required
                      value={tournForm.sportId}
                      onChange={(e) => setTournForm({ ...tournForm, sportId: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="">Select sport...</option>
                      {sports.map((sp) => (
                        <option key={sp.SportID} value={sp.SportID}>
                          {sp.SportName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-zinc-300 mb-1">Format</label>
                    <select
                      value={tournForm.tournamentType}
                      onChange={(e) => setTournForm({ ...tournForm, tournamentType: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="Knockout">Single Elimination (Knockout)</option>
                      <option value="League">Round-Robin / League</option>
                      <option value="DoubleElimination">Double Elimination</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-zinc-300 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={tournForm.startDate}
                      onChange={(e) => setTournForm({ ...tournForm, startDate: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-zinc-300 mb-1">End Date</label>
                    <input
                      type="date"
                      value={tournForm.endDate}
                      onChange={(e) => setTournForm({ ...tournForm, endDate: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-zinc-300 mb-1">Venue / Arena</label>
                    <input
                      type="text"
                      value={tournForm.venue}
                      onChange={(e) => setTournForm({ ...tournForm, venue: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-zinc-300 mb-1">Prize Pool</label>
                    <input
                      type="text"
                      value={tournForm.prizePool}
                      onChange={(e) => setTournForm({ ...tournForm, prizePool: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-zinc-300 mb-1">Description / Rules</label>
                  <textarea
                    rows={3}
                    value={tournForm.description}
                    onChange={(e) => setTournForm({ ...tournForm, description: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 p-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsTournModalOpen(false)}
                    className="px-4 py-2 border border-zinc-700 uppercase font-bold text-zinc-400 hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-black font-bold uppercase tracking-wider"
                  >
                    Launch Tournament
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MATCHES MODAL */}
        {selectedTournForMatches && (
          <div
            className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setSelectedTournForMatches(null)}
          >
            <div
              className="modal-content w-full max-w-4xl border border-zinc-700 bg-[#121215] p-6 shadow-2xl cursor-default max-h-[90vh] overflow-y-auto space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-orange-500">
                    {selectedTournForMatches.SportName} Fixtures
                  </span>
                  <h3 className="text-base font-extrabold uppercase text-white">
                    {selectedTournForMatches.TournamentName} ({tournMatches.length} Matches)
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTournForMatches(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* SCHEDULE MATCH FORM */}
              <form onSubmit={handleScheduleMatch} className="bg-zinc-900/80 border border-zinc-800 p-4 space-y-3">
                <div className="text-xs font-bold uppercase text-white flex items-center gap-1.5">
                  <Plus size={14} className="text-orange-500" /> Schedule Match Fixture
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Match Title / Bracket
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Semi-Final 1"
                      value={matchForm.matchTitle}
                      onChange={(e) => setMatchForm({ ...matchForm, matchTitle: e.target.value })}
                      className="w-full bg-[#121215] border border-zinc-700 px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Side 1 (Team or Player)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Z Titans or Player A"
                      value={matchForm.participant1Name}
                      onChange={(e) => setMatchForm({ ...matchForm, participant1Name: e.target.value })}
                      className="w-full bg-[#121215] border border-zinc-700 px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Side 2 (Team or Player)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lahore Kings or Player B"
                      value={matchForm.participant2Name}
                      onChange={(e) => setMatchForm({ ...matchForm, participant2Name: e.target.value })}
                      className="w-full bg-[#121215] border border-zinc-700 px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Match Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={matchForm.matchDate}
                      onChange={(e) => setMatchForm({ ...matchForm, matchDate: e.target.value })}
                      className="w-full bg-[#121215] border border-zinc-700 px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Venue
                    </label>
                    <input
                      type="text"
                      value={matchForm.venue}
                      onChange={(e) => setMatchForm({ ...matchForm, venue: e.target.value })}
                      className="w-full bg-[#121215] border border-zinc-700 px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Stage
                    </label>
                    <select
                      value={matchForm.stage}
                      onChange={(e) => setMatchForm({ ...matchForm, stage: e.target.value })}
                      className="w-full bg-[#121215] border border-zinc-700 px-2.5 py-1.5 text-white"
                    >
                      <option value="Group Stage">Group Stage</option>
                      <option value="Round of 16">Round of 16</option>
                      <option value="Quarter-Final">Quarter-Final</option>
                      <option value="Semi-Final">Semi-Final</option>
                      <option value="Final">Championship Final</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-black font-bold uppercase text-xs"
                  >
                    Schedule Match
                  </button>
                </div>
              </form>

              {/* MATCHES LIST */}
              <div>
                <div className="text-xs font-bold uppercase text-zinc-400 mb-2">
                  Scheduled Fixtures & Results
                </div>
                {loadingMatches ? (
                  <div className="py-6 text-center text-xs text-zinc-400">Loading fixtures...</div>
                ) : tournMatches.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500 border border-zinc-800">
                    No matches scheduled for this tournament yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tournMatches.map((m) => (
                      <div
                        key={m.MatchID}
                        className="border border-zinc-800 bg-zinc-900/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold uppercase bg-zinc-800 text-orange-400 px-2 py-0.5">
                              {m.Stage}
                            </span>
                            <span className="text-xs font-bold text-white">{m.MatchTitle}</span>
                          </div>
                          <div className="text-sm font-black text-white flex items-center gap-3">
                            <span className="text-orange-400">{m.Participant1Name || m.Team1Name || "Team 1"}</span>
                            <span className="text-zinc-500 text-xs font-semibold">VS</span>
                            <span className="text-amber-400">{m.Participant2Name || m.Team2Name || "Team 2"}</span>
                          </div>
                          <div className="text-[10px] text-zinc-400 flex items-center gap-2">
                            <span>{new Date(m.MatchDate).toLocaleString()}</span>
                            <span>•</span>
                            <span>{m.Venue}</span>
                          </div>
                        </div>

                        {/* STATUS & SCORES */}
                        <div className="flex items-center gap-4">
                          {m.ScoreTeam1 ? (
                            <div className="text-right">
                              <div className="text-sm font-extrabold text-white">
                                {m.ScoreTeam1} - {m.ScoreTeam2}
                              </div>
                              {m.WinnerName && (
                                <div className="text-[10px] font-bold text-emerald-400">
                                  Winner: {m.WinnerName}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold uppercase bg-blue-950/80 text-blue-400 border border-blue-500/30 px-2.5 py-1">
                              {m.Status}
                            </span>
                          )}

                          <button
                            onClick={() => handleOpenScoreUpdate(m)}
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-orange-600 hover:text-black text-zinc-200 text-xs font-bold uppercase tracking-wider transition border border-zinc-700"
                          >
                            Update Score
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* UPDATE SCORE MODAL */}
        {editingMatch && (
          <div
            className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setEditingMatch(null)}
          >
            <div
              className="modal-content w-full max-w-md border border-zinc-700 bg-[#121215] p-6 shadow-2xl cursor-default space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Update Result: {editingMatch.MatchTitle}
                </h3>
                <button onClick={() => setEditingMatch(null)} className="text-zinc-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateScoreSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-zinc-300 mb-1">
                      {editingMatch.Participant1Name || "Side 1"} Score
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 3, 185/4, 21-18"
                      value={scoreForm.scoreTeam1}
                      onChange={(e) => setScoreForm({ ...scoreForm, scoreTeam1: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-zinc-300 mb-1">
                      {editingMatch.Participant2Name || "Side 2"} Score
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1, 182/9, 19-21"
                      value={scoreForm.scoreTeam2}
                      onChange={(e) => setScoreForm({ ...scoreForm, scoreTeam2: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-zinc-300 mb-1">Winner</label>
                  <input
                    type="text"
                    placeholder="Enter victorious team or participant name"
                    value={scoreForm.winnerName}
                    onChange={(e) => setScoreForm({ ...scoreForm, winnerName: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-zinc-300 mb-1">Match Status</label>
                  <select
                    value={scoreForm.status}
                    onChange={(e) => setScoreForm({ ...scoreForm, status: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white"
                  >
                    <option value="Live">Live / In-Play</option>
                    <option value="Completed">Completed</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Postponed">Postponed</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setEditingMatch(null)}
                    className="px-4 py-2 border border-zinc-700 uppercase font-bold text-zinc-400 hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-black font-bold uppercase tracking-wider"
                  >
                    Save Score
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AdminTournaments;

