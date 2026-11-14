import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  ClipboardCopy,
  KeyRound,
  Loader2,
  PauseCircle,
  PlayCircle,
  Search,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import PageLoader from "../../components/dashboard/PageLoader";
import {
  PageHeading,
  Panel,
  Empty,
  StatusPill,
  formatDate,
} from "../../components/platform/PlatformUI";

const FILTERS = ["All", "Active", "Suspended"];

/**
 * Every club the platform hosts.
 *
 * Suspending is the platform owner's kill switch: the club keeps its data, but
 * its owner, staff and members are refused a session. Issuing credentials is
 * the recovery path when a club admin loses their temporary password.
 */
const PlatformClubs = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [gateway, setGateway] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/platform/clubs");
      if (data.success) setClubs(data.data || []);
    } catch (error) {
      console.error("Could not load clubs:", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    return clubs.filter((club) => {
      if (filter !== "All" && club.Status !== filter) return false;
      if (!term) return true;

      return [club.ClubName, club.Slug, club.OwnerEmail, club.OwnerName, club.City]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term));
    });
  }, [clubs, filter, search]);

  const toggleStatus = async (club) => {
    const next = club.Status === "Active" ? "Suspended" : "Active";

    if (next === "Suspended" && !window.confirm(`Suspend ${club.ClubName}? Its members will be locked out.`)) {
      return;
    }

    setBusyId(club.ClubID);
    try {
      const { data } = await api.put(`/platform/clubs/${club.ClubID}/status`, { status: next });
      if (data.success) {
        toast.success(data.message);
        await load();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update the club.");
    } finally {
      setBusyId(null);
    }
  };

  const issueCredentials = async (club) => {
    const confirmed = window.confirm(
      `Issue a new admin password for ${club.ClubName}?\n\n` +
        "The password they have right now stops working immediately - including one they chose themselves when subscribing. Copy the new one before you leave this screen."
    );

    if (!confirmed) return;

    setBusyId(club.ClubID);
    try {
      const { data } = await api.post(`/platform/clubs/${club.ClubID}/credentials`);
      if (data.success) setGateway({ club, credentials: data.credentials });
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not issue credentials.");
    } finally {
      setBusyId(null);
    }
  };

  const copyAll = () => {
    if (!gateway) return;

    const text = [
      `Club: ${gateway.club.ClubName}`,
      `Admin email: ${gateway.credentials.email}`,
      `Temporary password: ${gateway.credentials.tempPassword}`,
      `Sign-in: ${window.location.origin}/login`,
    ].join("\n");

    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Credentials copied."))
      .catch(() => toast.error("Could not copy - select the text manually."));
  };

  return (
    <div>
      <PageHeading
        eyebrow="Tenants"
        title="Clubs"
        description="Every organisation on the platform, its subscription and its people. Suspend a club to lock its workspace without deleting anything."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`border px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-wider transition ${
              filter === option
                ? "border-orange-500 bg-orange-500/10 text-white"
                : "border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
            }`}
          >
            {option}
          </button>
        ))}

        <div className="relative ml-auto">
          <Search
            size={13}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search clubs"
            className="w-52 border border-zinc-800 bg-[#0e0e11] py-2 pl-8 pr-3 text-[11.5px] text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
          />
        </div>
      </div>

      {gateway && (
        <div className="mb-4 border border-emerald-600/40 bg-emerald-500/10 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-[13px] font-bold text-white">
                New credentials for {gateway.club.ClubName}
              </h3>
              <p className="mt-1 text-[11.5px] text-emerald-300/90">
                Share privately. The owner signs in at /owner/login with this email
                and password.
              </p>
              <div className="mt-4 space-y-1.5 font-mono text-[11.5px] text-emerald-100">
                <div>Email: {gateway.credentials.email}</div>
                <div>Password: {gateway.credentials.tempPassword}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyAll}
                className="inline-flex items-center gap-2 border border-emerald-500/50 px-3.5 py-2.5 text-[10.5px] font-bold uppercase tracking-wider text-emerald-200 transition hover:bg-emerald-500/20"
              >
                <ClipboardCopy size={13} />
                Copy
              </button>
              <button
                onClick={() => setGateway(null)}
                className="text-emerald-300/70 transition hover:text-white"
                aria-label="Dismiss"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <Panel>
        {loading ? (
          <div className="py-14">
            <PageLoader message="Loading clubs..." />
          </div>
        ) : visible.length === 0 ? (
          <Empty
            icon={Building2}
            title="No clubs match"
            body="Approve a subscription request and the club appears here with its own workspace."
          />
        ) : (
          <ul className="divide-y divide-zinc-800">
            {visible.map((club) => (
              <li key={club.ClubID} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-bold text-white">{club.ClubName}</span>
                      <StatusPill status={club.Status} />
                      {club.SubscriptionStatus && (
                        <StatusPill status={club.SubscriptionStatus} />
                      )}
                      <span className="font-mono text-[10.5px] text-zinc-600">/{club.Slug}</span>
                    </div>

                    <div className="mt-1.5 grid gap-1 text-[11px] text-zinc-500 sm:grid-cols-2">
                      <span>
                        {club.OwnerName || "No owner"} · {club.OwnerEmail || "-"}
                      </span>
                      <span>
                        {club.PlanName || "No plan"}
                        {club.SubscriptionEndDate
                          ? ` · renews ${formatDate(club.SubscriptionEndDate)}`
                          : ""}
                      </span>
                      <span>{club.City || "No city"}</span>
                      <span>
                        {Number(club.MemberCount) || 0} members ·{" "}
                        {Number(club.CoachCount) || 0} coaches
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button
                      onClick={() => issueCredentials(club)}
                      disabled={busyId === club.ClubID}
                      className="inline-flex items-center gap-1.5 border border-zinc-700 px-3 py-2 text-[10.5px] font-bold uppercase tracking-wider text-zinc-300 transition hover:border-orange-500 hover:text-white disabled:opacity-50"
                    >
                      <KeyRound size={12} />
                      Credentials
                    </button>

                    <button
                      onClick={() => toggleStatus(club)}
                      disabled={busyId === club.ClubID}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-[10.5px] font-black uppercase tracking-wider transition disabled:opacity-50 ${
                        club.Status === "Active"
                          ? "border border-red-500/50 text-red-400 hover:bg-red-500/10"
                          : "bg-emerald-500 text-black hover:bg-white"
                      }`}
                    >
                      {busyId === club.ClubID ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : club.Status === "Active" ? (
                        <PauseCircle size={12} />
                      ) : (
                        <PlayCircle size={12} />
                      )}
                      {club.Status === "Active" ? "Suspend" : "Reactivate"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
};

export default PlatformClubs;
