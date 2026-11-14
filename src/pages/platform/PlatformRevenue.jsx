import { useEffect, useMemo, useState } from "react";
import { CircleDollarSign, Repeat, TrendingUp, Wallet } from "lucide-react";
import api from "../../services/api";
import PageLoader from "../../components/dashboard/PageLoader";
import {
  PageHeading,
  Panel,
  Empty,
  StatTile,
  StatusPill,
  money,
  formatDate,
} from "../../components/platform/PlatformUI";

const FILTERS = ["All", "Active", "PastDue", "Cancelled"];

/**
 * What the platform is billing.
 *
 * The endpoint returns one row per subscription; the totals below are derived
 * from it so the console never shows a number the list cannot justify.
 */
const PlatformRevenue = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const { data } = await api.get("/platform/subscriptions");
        if (alive && data.success) setSubscriptions(data.data || []);
      } catch (error) {
        console.error("Could not load subscriptions:", error.message);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  const totals = useMemo(() => {
    return subscriptions.reduce(
      (acc, row) => {
        const amount = Number(row.Amount) || 0;
        const isActive = row.Status === "Active";

        if (row.Status !== "Cancelled") acc.collected += amount;
        if (isActive) acc.active += 1;
        if (isActive && row.BillingCycle === "Monthly") acc.monthly += amount;
        if (isActive && row.BillingCycle === "Yearly") acc.yearly += amount;

        return acc;
      },
      { collected: 0, active: 0, monthly: 0, yearly: 0 }
    );
  }, [subscriptions]);

  const visible = useMemo(
    () =>
      filter === "All"
        ? subscriptions
        : subscriptions.filter((row) => row.Status === filter),
    [subscriptions, filter]
  );

  if (loading) return <PageLoader message="Loading revenue..." />;

  return (
    <div>
      <PageHeading
        eyebrow="Revenue"
        title="Subscriptions"
        description="Every software subscription sold, what it bills, and when it renews."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Revenue to date"
          value={money(totals.collected)}
          hint="All non-cancelled subscriptions"
          icon={CircleDollarSign}
          accent
        />
        <StatTile
          label="Monthly recurring"
          value={money(totals.monthly)}
          hint={`${totals.active} active subscriptions`}
          icon={TrendingUp}
        />
        <StatTile
          label="Yearly recurring"
          value={money(totals.yearly)}
          hint="Billed annually"
          icon={Repeat}
        />
        <StatTile
          label="Active clubs"
          value={totals.active}
          hint={`${subscriptions.length} subscriptions on record`}
          icon={Wallet}
        />
      </div>

      <div className="mb-4 mt-6 flex flex-wrap items-center gap-2">
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
      </div>

      <Panel>
        {visible.length === 0 ? (
          <Empty
            icon={Wallet}
            title="No subscriptions"
            body="Approving a club request creates its subscription and it shows up here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-[9.5px] font-black uppercase tracking-[0.16em] text-zinc-500">
                  <th className="px-5 py-3">Club</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Cycle</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Started</th>
                  <th className="px-5 py-3">Renews</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {visible.map((row) => (
                  <tr key={row.SubscriptionID} className="text-[11.5px] text-zinc-400">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white">{row.ClubName}</div>
                      <div className="font-mono text-[10px] text-zinc-600">/{row.Slug}</div>
                    </td>
                    <td className="px-5 py-3.5">{row.PlanName || "-"}</td>
                    <td className="px-5 py-3.5">{row.BillingCycle}</td>
                    <td className="px-5 py-3.5 font-bold text-zinc-200">{money(row.Amount)}</td>
                    <td className="px-5 py-3.5">{formatDate(row.StartDate)}</td>
                    <td className="px-5 py-3.5">{row.EndDate ? formatDate(row.EndDate) : "-"}</td>
                    <td className="px-5 py-3.5">
                      <StatusPill status={row.Status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
};

export default PlatformRevenue;
