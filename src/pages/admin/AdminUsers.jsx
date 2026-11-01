import { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatusBadge from "../../components/dashboard/StatusBadge";
import PageLoader from "../../components/dashboard/PageLoader";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { Users, Search, Shield, UserCheck, CheckCircle2, XCircle } from "lucide-react";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

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

  const handleToggle = async (userId) => {
    const confirm = await Swal.fire({
      title: "Change Account Status?",
      text: "Are you sure you want to toggle this account between Active and Suspended?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#27272a",
      confirmButtonText: "Yes, Change Status",
      cancelButtonText: "Cancel",
      background: "#18181b",
      color: "#ffffff",
      allowOutsideClick: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await api.put(`/admin/users/${userId}/toggle`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchUsers();
      }
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.FullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.Email?.toLowerCase().includes(search.toLowerCase()) ||
      u.MembershipNumber?.toLowerCase().includes(search.toLowerCase());

    if (roleFilter === "ALL") return matchesSearch;
    return matchesSearch && u.Role === roleFilter;
  });

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <PageLoader message="Loading registered users..." />
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
              Registered Accounts & Roles
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Manage accounts, membership subscriptions, and toggle active status.
            </p>
          </div>

          <div className="text-xs font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-4 py-2">
            Total Users: <span className="text-orange-400 font-mono font-bold">{users.length}</span>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center justify-between border border-zinc-800 bg-[#121215] p-4">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search by name, email, or member #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2 pl-9 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-zinc-500" />
          </div>

          <div className="flex items-center gap-2">
            {["ALL", "user", "admin"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`rounded-none px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                  roleFilter === r
                    ? "bg-orange-500 text-black"
                    : "border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {r === "ALL" ? "All Roles" : r}
              </button>
            ))}
          </div>
        </div>

        {/* USERS TABLE */}
        <div className="border border-zinc-800 bg-[#121215] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <th className="p-3.5">User ID</th>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Member #</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Joined</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filtered.length > 0 ? (
                  filtered.map((u) => (
                    <tr key={u.UserID} className="hover:bg-zinc-900/40">
                      <td className="p-3.5 font-mono text-zinc-400">
                        #{String(u.UserID).padStart(3, "0")}
                      </td>
                      <td className="p-3.5 font-bold text-white">
                        {u.FullName}
                      </td>
                      <td className="p-3.5 text-zinc-300">
                        {u.Email}
                      </td>
                      <td className="p-3.5 text-zinc-400 font-mono">
                        {u.Phone || "—"}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`rounded-none px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                            u.Role === "admin"
                              ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                              : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                          }`}
                        >
                          {u.Role}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-orange-400 font-semibold">
                        {u.MembershipNumber || "—"}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`rounded-none px-2 py-0.5 text-[9px] font-bold uppercase ${
                            u.IsActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {u.IsActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-3.5 text-zinc-400">
                        {new Date(u.CreatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleToggle(u.UserID)}
                          className={`rounded-none px-2.5 py-1 text-[11px] font-bold transition ${
                            u.IsActive
                              ? "border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"
                              : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                          }`}
                        >
                          {u.IsActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="p-8 text-center text-xs text-zinc-500">
                      No users match your search.
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
