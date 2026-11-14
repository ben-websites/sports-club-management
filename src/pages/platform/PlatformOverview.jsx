import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CircleDollarSign,
  Clock,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import api from "../../services/api";
import PageLoader from "../../components/dashboard/PageLoader";
import {
  PageHeading,
  StatTile,
  Panel,
  Empty,
  StatusPill,
  money,
  formatDate,
} from "../../components/platform/PlatformUI";

/**
 * What the platform owner sees first: how many clubs exist, how many requests
 * are waiting for a decision, and what the platform is billing.
 */
const PlatformOverview = () => {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const [statsRes, requestsRes] = await Promise.all([
          api.get("/platform/stats"),
          api.get("/platform/requests"),
        ]);

        if (!alive) return;

        // The endpoint groups its counters ({clubs, requests, revenue, accounts});
        // the tiles below read a single flat object.
        if (statsRes.data.success) {
          const payload = statsRes.data;
          setStats({
            ...(payload.clubs || {}),
            ...(payload.requests || {}),
            ...(payload.revenue || {}),
            ...(payload.accounts || {}),
          });
        }

        if (requestsRes.data.success) {
          setRequests((requestsRes.data.data || []).filter((row) => row.Status === "Pending"));
        }
      } catch (error) {
        console.error("Platform overview failed:", error.message);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <PageLoader message="Loading platform..." />;

  return (
    <div>
      <PageHeading
        eyebrow="Overview"
        title="Platform health"
        description="Every club on the platform, the requests waiting for you, and the recurring revenue they generate."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Total clubs"
          value={stats?.TotalClubs ?? 0}
          hint={`${stats?.ActiveClubs ?? 0} active · ${stats?.SuspendedClubs ?? 0} suspended`}
          icon={Building2}
          accent
        />
        <StatTile
          label="Pending requests"
          value={stats?.PendingRequests ?? 0}
          hint="Awaiting your decision"
          icon={Clock}
        />
        <StatTile
          label="Monthly revenue"
          value={money(stats?.MonthlyRecurringRevenue ?? 0)}
          hint="Recurring, monthly plans"
          icon={TrendingUp}
        />
        <StatTile
          label="Accounts"
          value={stats?.TotalAccounts ?? 0}
          hint={`${stats?.TotalMembers ?? 0} members · ${stats?.ClubAdmins ?? 0} club admins`}
          icon={Users}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Approved requests" value={stats?.ApprovedRequests ?? 0} icon={ShieldCheck} />
        <StatTile label="Rejected requests" value={stats?.RejectedRequests ?? 0} />
        <StatTile label="Coaches" value={stats?.TotalCoaches ?? 0} icon={Users} />
        <StatTile
          label="Revenue to date"
          value={money(stats?.TotalRevenue ?? 0)}
          icon={CircleDollarSign}
        />
      </div>

      <Panel
        className="mt-6"
        title="Waiting for approval"
        description="Approving a request creates the club, its admin identity and its starter settings in one go."
        action={
          <Link
            to="/platform/requests"
            className="inline-flex items-center gap-2 border border-zinc-700 px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-wider text-zinc-300 transition hover:border-orange-500 hover:text-white"
          >
            All requests
            <ArrowRight size={12} />
          </Link>
        }
      >
        {requests.length === 0 ? (
          <Empty
            icon={Clock}
            title="Nothing waiting"
            body="Every subscription request has been reviewed. New ones appear here immediately."
          />
        ) : (
          <ul className="divide-y divide-zinc-800">
            {requests.slice(0, 5).map((request) => (
              <li key={request.RequestID} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[12.5px] font-bold text-white">
                      {request.CompanyName}
                    </span>
                    <StatusPill status={request.Status} />
                  </div>
                  <div className="mt-1 truncate text-[11px] text-zinc-500">
                    {request.PlanName} · {request.OwnerEmail} ·{" "}
                    {formatDate(request.RequestedAt)}
                  </div>
                </div>

                <Link
                  to="/platform/requests"
                  className="shrink-0 bg-orange-500 px-3.5 py-2 text-[10.5px] font-black uppercase tracking-wider text-black transition hover:bg-white"
                >
                  Review
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
};

export default PlatformOverview;
