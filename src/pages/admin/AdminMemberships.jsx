import { useState, useEffect } from "react";
import api from "../../services/api";
import startPolling from "../../services/polling";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatusBadge from "../../components/dashboard/StatusBadge";
import PageLoader from "../../components/dashboard/PageLoader";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { UserCheck, Search, ShieldCheck, CheckCircle2, XCircle, Clock, Eye, AlertCircle } from "lucide-react";

function AdminMemberships() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    fetchApplications(true);

    // Live auto-refresh (skipped while the tab is hidden)
    return startPolling(() => fetchApplications(false));
  }, []);

  const fetchApplications = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await api.get("/admin/applications");
      if (res.data.success) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const handleReview = async (appId, action) => {
    let remarks = "";

    if (action === "reject") {
      const { value: text, isConfirmed } = await Swal.fire({
        title: "Reject Membership Application",
        input: "textarea",
        inputLabel: "Provide reason or remarks for rejection:",
        inputPlaceholder: "e.g. Incomplete address verification or invalid emergency contact",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Confirm Rejection",
        background: "#18181b",
        color: "#ffffff",
      });

      if (!isConfirmed) return;
      remarks = text || "Application rejected by administration.";
    } else {
      const confirm = await Swal.fire({
        title: "Approve Membership Application?",
        text: "This will officially activate the membership, generate an official membership ID number, and grant full club privileges.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#f97316",
        confirmButtonText: "Yes, Approve",
        background: "#18181b",
        color: "#ffffff",
      });

      if (!confirm.isConfirmed) return;
    }

    try {
      const res = await api.put(`/admin/applications/${appId}/review`, {
        action,
        remarks,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        fetchApplications();
        setSelectedApp(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process review.");
    }
  };

  const filtered = applications.filter((a) => {
    const matchesSearch =
      a.FullName?.toLowerCase().includes(search.toLowerCase()) ||
      a.Email?.toLowerCase().includes(search.toLowerCase()) ||
      a.PlanName?.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === "ALL") return matchesSearch;
    return matchesSearch && a.ApplicationStatus?.toUpperCase() === statusFilter;
  });

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <PageLoader message="Loading membership applications..." />
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
                Enrollment Review
              </span>
            </div>
            <h1 className="mt-2 text-[22px] font-extrabold tracking-tight text-white md:text-[24px]">
              Membership Applications
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Review applicant details, verify contact records, and approve or reject subscriptions.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-4 py-2">
            Pending:{" "}
            <span className="text-orange-400 font-mono font-bold">
              {applications.filter((a) => a.ApplicationStatus === "Pending").length}
            </span>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center justify-between border border-zinc-800 bg-[#121215] p-4">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search by name, email, or plan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2 pl-9 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-zinc-500" />
          </div>

          <div className="flex items-center gap-2">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-none px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                  statusFilter === st
                    ? "bg-orange-500 text-black"
                    : "border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* APPLICATIONS TABLE */}
        <div className="border border-zinc-800 bg-[#121215] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <th className="p-3.5">App ID</th>
                  <th className="p-3.5">Applicant Details</th>
                  <th className="p-3.5">Emergency Contact</th>
                  <th className="p-3.5">Plan Tier</th>
                  <th className="p-3.5">Monthly Fee</th>
                  <th className="p-3.5">Applied Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filtered.length > 0 ? (
                  filtered.map((a) => (
                    <tr key={a.ApplicationID} className="hover:bg-zinc-900/40">
                      <td className="p-3.5 font-mono font-bold text-orange-400">
                        #{String(a.ApplicationID).padStart(4, "0")}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-white">{a.FullName}</div>
                        <div className="text-[10px] text-zinc-400">{a.Email} · {a.Phone || "No phone"}</div>
                        <div className="text-[10px] text-zinc-500 truncate max-w-xs">{a.Address || "No address"}</div>
                      </td>
                      <td className="p-3.5 text-zinc-300">
                        <div>{a.EmergencyContactName || "—"}</div>
                        <div className="text-[10px] text-zinc-500">{a.EmergencyContactPhone || "—"}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-white">{a.PlanName}</span>
                        <div className="text-[10px] text-zinc-400">{a.DurationMonths} Mos</div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-white">
                        Rs. {Number(a.MonthlyFee).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-zinc-400">
                        {new Date(a.AppliedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={a.ApplicationStatus} />
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {a.ApplicationStatus === "Pending" ? (
                          <>
                            <button
                              onClick={() => handleReview(a.ApplicationID, "approve")}
                              className="rounded-none bg-orange-500 px-2.5 py-1 text-[11px] font-bold text-black transition hover:bg-white"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReview(a.ApplicationID, "reject")}
                              className="rounded-none border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] font-bold text-red-400 transition hover:bg-red-500 hover:text-white"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-zinc-500">
                            Reviewed by {a.ReviewerName || "Admin"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-xs text-zinc-500">
                      No membership applications match your filter.
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

export default AdminMemberships;
