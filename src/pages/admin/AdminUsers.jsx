import { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { Search, Users } from "lucide-react";

const STATUS_FILTERS = ["ALL", "Active", "PendingPayment", "Expired", "Suspended"];

const MEMBERSHIP_TONE = {
  Active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PendingPayment: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  Suspended: "bg-red-500/10 text-red-400 border-red-500/20",
  Expired: "bg-zinc-800 text-zinc-400 border-zinc-700",
};

/**
 * The club's own members.
 *
 * The server sends only people who joined THIS club and took a membership
 * plan, so another club's members, staff and admins can never appear here.
 */
function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (member) => {
    const turningOff = Boolean(member.IsActive);

    const confirm = await Swal.fire({
      title: turningOff ? "Remove club access?" : "Restore club access?",
      text: turningOff
        ? `${member.FullName} will not be able to sign in to this club until you switch it back on. Their account and any other club they belong to are not affected.`
        : `${member.FullName} will be able to sign in to this club again.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#27272a",
      confirmButtonText: turningOff ? "Yes, Remove Access" : "Yes, Restore Access",
      cancelButtonText: "Cancel",
      background: "#18181b",
      color: "#ffffff",
      allowOutsideClick: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await api.put(`/admin/users/${member.UserID}/toggle`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update member access.");
    }
  };

  const filtered = users.filter((u) => {
    const term = search.toLowerCase();
    const matchesSearch =
      u.FullName?.toLowerCase().includes(term) ||
      u.Email?.toLowerCase().includes(term) ||
      u.Phone?.toLowerCase().includes(term) ||
      u.MembershipNumber?.toLowerCase().includes(term) ||
      u.PlanName?.toLowerCase().includes(term);

    if (statusFilter === "ALL") return matchesSearch;
    return matchesSearch && u.MembershipStatus === statusFilter;
  });

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <PageLoader message="Loading club members..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="w-full">
        {/* HEADER */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-px w-5 bg-orange-500" />
              <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-orange-500">
                User Management
              </span>
            </div>
            <h1 className="mt-2 text-[22px] font-extrabold tracking-tight text-white md:text-[24px]">
              Club Members
            </h1>
            <p className="mt-1 max-w-2xl text-xs text-zinc-400">
              Only people who joined this club and took a membership plan. Members, staff and
              admins of other clubs never appear here.
            </p>
          </div>

          <div className="text-xs font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-4 py-2">
            Total Members: <span className="text-orange-400 font-mono font-bold">{users.length}</span>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center justify-between border border-zinc-800 bg-[#121215] p-4">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search by name, email, phone, plan or member #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2 pl-9 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-zinc-500" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-none px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider transition ${
                  statusFilter === status
                    ? "bg-orange-500 text-black"
                    : "border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {status === "ALL"
                  ? "All"
                  : status === "PendingPayment"
                  ? "Pending"
                  : status}
              </button>
            ))}
          </div>
        </div>

        {/* MEMBERS TABLE */}
        <div className="border border-zinc-800 bg-[#121215] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <th className="p-3.5">Member</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">Plan</th>
                  <th className="p-3.5">Member #</th>
                  <th className="p-3.5">Membership</th>
                  <th className="p-3.5">Club Access</th>
                  <th className="p-3.5">Joined</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filtered.length > 0 ? (
                  filtered.map((u) => (
                    <tr key={u.UserID} className="hover:bg-zinc-900/40">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{u.FullName}</div>
                        <div className="font-mono text-[10px] text-zinc-500">
                          #{String(u.UserID).padStart(3, "0")}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-zinc-300">{u.Email}</div>
                        <div className="font-mono text-[10px] text-zinc-500">
                          {u.Phone || "—"}
                        </div>
                      </td>
                      <td className="p-3.5">
                        {u.PlanName ? (
                          <>
                            <div className="font-semibold text-zinc-200">{u.PlanName}</div>
                            <div className="font-mono text-[10px] text-zinc-500">
                              PKR {Number(u.MonthlyFee || 0).toLocaleString()}/mo
                            </div>
                          </>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-orange-400 font-semibold">
                        {u.MembershipNumber || "—"}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`rounded-none border px-2 py-0.5 text-[9px] font-bold uppercase ${
                            MEMBERSHIP_TONE[u.MembershipStatus] || MEMBERSHIP_TONE.Expired
                          }`}
                        >
                          {u.MembershipStatus === "PendingPayment"
                            ? "Pending"
                            : u.MembershipStatus || "Unknown"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`rounded-none border px-2 py-0.5 text-[9px] font-bold uppercase ${
                            u.IsActive
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {u.IsActive ? "Active" : "Blocked"}
                        </span>
                      </td>
                      <td className="p-3.5 text-zinc-400">
                        {u.JoinedAt
                          ? new Date(u.JoinedAt).toLocaleDateString()
                          : new Date(u.CreatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleToggle(u)}
                          className={`rounded-none px-2.5 py-1 text-[11px] font-bold transition ${
                            u.IsActive
                              ? "border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"
                              : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                          }`}
                        >
                          {u.IsActive ? "Block" : "Restore"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-10 text-center">
                      <Users size={22} className="mx-auto text-zinc-700" />
                      <p className="mt-3 text-xs font-bold text-zinc-400">
                        {users.length === 0
                          ? "No members yet."
                          : "No members match your filters."}
                      </p>
                      {users.length === 0 && (
                        <p className="mx-auto mt-1 max-w-sm text-[11px] leading-6 text-zinc-600">
                          Someone appears here once they join this club and choose a membership
                          plan. Applications waiting for approval are on Membership Applications.
                        </p>
                      )}
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

export default AdminUsers;
