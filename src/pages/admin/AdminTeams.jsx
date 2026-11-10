import { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import {
  Shield,
  Plus,
  Users,
  UserPlus,
  Trash2,
  X,
  Award,
  Search,
  Dumbbell,
  CheckCircle2,
} from "lucide-react";

function AdminTeams() {
  const [teams, setTeams] = useState([]);
  const [sports, setSports] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTeamForRoster, setSelectedTeamForRoster] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Form states
  const [teamForm, setTeamForm] = useState({
    teamName: "",
    sportId: "",
    coachId: "",
    captainUserId: "",
    maxMembers: 16,
  });

  const [memberForm, setMemberForm] = useState({
    userId: "",
    jerseyNumber: "",
    position: "Player",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamsRes, sportsRes, coachesRes, usersRes] = await Promise.all([
        api.get("/sports-management/teams"),
        api.get("/sports-management/sports"),
        api.get("/sports-management/coaches"),
        api.get("/admin/users"),
      ]);

      if (teamsRes.data.success) setTeams(teamsRes.data.data);
      if (sportsRes.data.success) setSports(sportsRes.data.data);
      if (coachesRes.data.success) setCoaches(coachesRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.users || []);
    } catch (err) {
      console.error("Failed to load teams data:", err);
      toast.error("Could not fetch team rosters.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/sports-management/teams", teamForm);
      if (res.data.success) {
        toast.success("Sports team created successfully.");
        setIsCreateModalOpen(false);
        setTeamForm({ teamName: "", sportId: "", coachId: "", captainUserId: "", maxMembers: 16 });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create team.");
    }
  };

  const handleOpenRoster = async (team) => {
    setSelectedTeamForRoster(team);
    setLoadingMembers(true);
    try {
      const res = await api.get(`/sports-management/teams/${team.TeamID}`);
      if (res.data.success) {
        setTeamMembers(res.data.data.members || []);
      }
    } catch (err) {
      toast.error("Failed to load team roster.");
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedTeamForRoster || !memberForm.userId) return;

    try {
      const res = await api.post(`/sports-management/teams/${selectedTeamForRoster.TeamID}/members`, memberForm);
      if (res.data.success) {
        toast.success("Athlete drafted into squad.");
        setMemberForm({ userId: "", jerseyNumber: "", position: "Player" });
        // Refresh team roster
        handleOpenRoster(selectedTeamForRoster);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member to team.");
    }
  };

  const handleRemoveMember = async (teamMemberId, name) => {
    const confirm = await Swal.fire({
      title: `Remove ${name}?`,
      text: "This player will be removed from the team lineup.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#27272a",
      confirmButtonText: "Yes, Remove",
      background: "#18181b",
      color: "#ffffff",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await api.delete(`/sports-management/teams/members/${teamMemberId}`);
        if (res.data.success) {
          toast.success(res.data.message);
          handleOpenRoster(selectedTeamForRoster);
          fetchData();
        }
      } catch (err) {
        toast.error("Failed to remove member.");
      }
    }
  };

  const filteredTeams = teams.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.TeamName.toLowerCase().includes(q) ||
      t.SportName.toLowerCase().includes(q) ||
      (t.CaptainName && t.CaptainName.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoader message="Loading Club Squads & Rosters..." />
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
                <Shield className="text-orange-500" size={24} />
                <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-white">
                  Sports Team Management
                </h1>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                Form sports squads, designate captains & coaches, and draft registered members into lineups.
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-black px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition self-start md:self-auto"
            >
              <Plus size={16} /> Create Club Team
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input
            type="text"
            placeholder="Search teams by name, sport, or captain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#121215] border border-zinc-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* TEAMS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <div
              key={team.TeamID}
              className="border border-zinc-800 bg-[#121215] p-6 shadow-lg flex flex-col justify-between hover:border-zinc-700 transition"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-950/60 border border-orange-500/30 px-2 py-0.5">
                    {team.SportName}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5">
                    {team.CurrentMemberCount} / {team.MaxMembers} Squad Slots
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">
                    {team.TeamName}
                  </h3>
                  <div className="mt-1 text-xs text-zinc-400">
                    Faculty Coach: <strong className="text-white">{team.CoachName || "Staff Coach"}</strong>
                  </div>
                  <div className="text-xs text-zinc-400">
                    Team Captain: <strong className="text-orange-400">{team.CaptainName || "TBD"}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
                <button
                  onClick={() => handleOpenRoster(team)}
                  className="w-full py-2 bg-zinc-900 hover:bg-orange-600 hover:text-black border border-zinc-700 text-xs font-bold uppercase tracking-wider text-white transition flex items-center justify-center gap-2"
                >
                  <Users size={14} /> Manage Team Lineup & Roster
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CREATE TEAM MODAL */}
        {isCreateModalOpen && (
          <div
            className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setIsCreateModalOpen(false)}
          >
            <div
              className="modal-content w-full max-w-md border border-zinc-700 bg-[#121215] p-6 shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="text-orange-500" size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Form New Sports Team
                  </h3>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateTeam} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase text-zinc-300 mb-1">Team Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Z Strikers FC, Z Titans Cricket"
                    value={teamForm.teamName}
                    onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-zinc-300 mb-1">Sport Arena</label>
                  <select
                    required
                    value={teamForm.sportId}
                    onChange={(e) => setTeamForm({ ...teamForm, sportId: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Select a sport...</option>
                    {sports.map((sp) => (
                      <option key={sp.SportID} value={sp.SportID}>
                        {sp.SportName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-zinc-300 mb-1">Coach</label>
                  <select
                    value={teamForm.coachId}
                    onChange={(e) => setTeamForm({ ...teamForm, coachId: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Select Coach (Optional)...</option>
                    {coaches.map((c) => (
                      <option key={c.CoachID} value={c.CoachID}>
                        {c.FullName} ({c.SportName || "Faculty"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-zinc-300 mb-1">Team Captain</label>
                  <select
                    value={teamForm.captainUserId}
                    onChange={(e) => setTeamForm({ ...teamForm, captainUserId: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Select Captain (Optional)...</option>
                    {users.map((u) => (
                      <option key={u.UserID} value={u.UserID}>
                        {u.FullName} ({u.Email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-zinc-300 mb-1">Max Squad Slots</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={teamForm.maxMembers}
                    onChange={(e) => setTeamForm({ ...teamForm, maxMembers: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 border border-zinc-700 uppercase font-bold text-zinc-400 hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-black font-bold uppercase tracking-wider"
                  >
                    Create Squad
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MANAGE ROSTER MODAL */}
        {selectedTeamForRoster && (
          <div
            className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setSelectedTeamForRoster(null)}
          >
            <div
              className="modal-content w-full max-w-3xl border border-zinc-700 bg-[#121215] p-6 shadow-2xl cursor-default max-h-[90vh] overflow-y-auto space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-orange-500">
                    {selectedTeamForRoster.SportName} Lineup
                  </span>
                  <h3 className="text-base font-extrabold uppercase text-white">
                    {selectedTeamForRoster.TeamName} Roster ({teamMembers.length} Athletes)
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTeamForRoster(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* DRAFT MEMBER FORM */}
              <form onSubmit={handleAddMember} className="bg-zinc-900/80 border border-zinc-800 p-4 space-y-3">
                <div className="text-xs font-bold uppercase text-white flex items-center gap-1.5">
                  <UserPlus size={14} className="text-orange-500" /> Draft Registered Member to Squad
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Member Athlete
                    </label>
                    <select
                      required
                      value={memberForm.userId}
                      onChange={(e) => setMemberForm({ ...memberForm, userId: e.target.value })}
                      className="w-full bg-[#121215] border border-zinc-700 px-2.5 py-1.5 text-white"
                    >
                      <option value="">Select Club Member...</option>
                      {users.map((u) => (
                        <option key={u.UserID} value={u.UserID}>
                          {u.FullName} ({u.Email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Jersey #
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 7, 10, 23"
                      value={memberForm.jerseyNumber}
                      onChange={(e) => setMemberForm({ ...memberForm, jerseyNumber: e.target.value })}
                      className="w-full bg-[#121215] border border-zinc-700 px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Role / Position
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Striker, Goalkeeper, Opener"
                      value={memberForm.position}
                      onChange={(e) => setMemberForm({ ...memberForm, position: e.target.value })}
                      className="w-full bg-[#121215] border border-zinc-700 px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-black font-bold uppercase text-xs"
                  >
                    Draft to Lineup
                  </button>
                </div>
              </form>

              {/* CURRENT ROSTER TABLE */}
              <div>
                <div className="text-xs font-bold uppercase text-zinc-400 mb-2">
                  Official Squad Roster
                </div>
                {loadingMembers ? (
                  <div className="py-6 text-center text-xs text-zinc-400">Loading squad...</div>
                ) : teamMembers.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500 border border-zinc-800">
                    No athletes drafted into this squad yet. Use the form above to add members.
                  </div>
                ) : (
                  <div className="border border-zinc-800 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-900 border-b border-zinc-800 text-[10px] uppercase text-zinc-400">
                        <tr>
                          <th className="p-3">#</th>
                          <th className="p-3">Athlete Name</th>
                          <th className="p-3">Contact</th>
                          <th className="p-3">Position</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800">
                        {teamMembers.map((m) => (
                          <tr key={m.TeamMemberID} className="hover:bg-zinc-900/40">
                            <td className="p-3 font-bold text-orange-500">
                              {m.JerseyNumber ? `#${m.JerseyNumber}` : "-"}
                            </td>
                            <td className="p-3 font-bold text-white">{m.FullName}</td>
                            <td className="p-3 text-zinc-400">{m.Email}</td>
                            <td className="p-3 text-zinc-300 font-semibold">{m.Position}</td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleRemoveMember(m.TeamMemberID, m.FullName)}
                                className="text-red-400 hover:text-red-300 p-1"
                                title="Remove from squad"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AdminTeams;

