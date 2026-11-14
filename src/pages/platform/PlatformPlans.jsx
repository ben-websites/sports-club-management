import { useCallback, useEffect, useState } from "react";
import { BarChart3, Check, Loader2, Pencil, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import PageLoader from "../../components/dashboard/PageLoader";
import { PageHeading, Panel, Empty, money } from "../../components/platform/PlatformUI";

const BLANK = {
  planName: "",
  description: "",
  priceMonthly: "",
  priceYearly: "",
  maxMembers: 100,
  maxCoaches: 5,
  maxSports: 5,
  features: "",
};

/**
 * The software's own subscription tiers.
 *
 * These are what a club owner picks on /for-clubs - deliberately separate from
 * the membership plans each club sells to its own members.
 */
const PlatformPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/platform/plans");
      if (data.success) setPlans(data.data || []);
    } catch (error) {
      console.error("Could not load plans:", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing("new");
    setForm(BLANK);
  };

  const openEdit = (plan) => {
    setEditing(plan.PlanID);
    setForm({
      planName: plan.PlanName,
      description: plan.Description || "",
      priceMonthly: plan.PriceMonthly ?? "",
      priceYearly: plan.PriceYearly ?? "",
      maxMembers: plan.MaxMembers ?? 0,
      maxCoaches: plan.MaxCoaches ?? 0,
      maxSports: plan.MaxSports ?? 0,
      features: plan.Features || "",
      isActive: Number(plan.IsActive) === 1,
    });
  };

  const close = () => {
    setEditing(null);
    setForm(BLANK);
  };

  const change = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const toggleActive = (plan) => {
    const next = !(Number(plan.IsActive) === 1);
    save(
      plan.PlanID,
      {
        priceMonthly: plan.PriceMonthly,
        priceYearly: plan.PriceYearly,
        description: plan.Description,
        features: plan.Features,
        isActive: next,
      },
      next ? "Plan is on sale again." : "Plan hidden from new subscribers."
    );
  };

  const save = async (planId, payload, successMessage) => {
    setBusy(true);
    try {
      const { data } = planId
        ? await api.put(`/platform/plans/${planId}`, payload)
        : await api.post("/platform/plans", payload);

      if (data.success) {
        toast.success(successMessage || data.message);
        close();
        await load();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save the plan.");
    } finally {
      setBusy(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();

    const payload = {
      planName: form.planName,
      description: form.description || null,
      priceMonthly: Number(form.priceMonthly) || 0,
      priceYearly: Number(form.priceYearly) || 0,
      maxMembers: Number(form.maxMembers) || 0,
      maxCoaches: Number(form.maxCoaches) || 0,
      maxSports: Number(form.maxSports) || 0,
      features: form.features || null,
      isActive: form.isActive !== false,
    };

    if (!payload.planName.trim()) {
      toast.error("Give the plan a name.");
      return;
    }

    save(editing === "new" ? null : editing, payload);
  };

  return (
    <div>
      <PageHeading
        eyebrow="Software pricing"
        title="Platform plans"
        description="The tiers a club owner can buy. Prices here drive the /for-clubs page and every new subscription."
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-orange-500 px-4 py-2.5 text-[10.5px] font-black uppercase tracking-wider text-black transition hover:bg-white"
          >
            <Plus size={13} />
            New plan
          </button>
        }
      />

      <Panel>
        {loading ? (
          <div className="py-14">
            <PageLoader message="Loading plans..." />
          </div>
        ) : plans.length === 0 ? (
          <Empty
            icon={BarChart3}
            title="No plans yet"
            body="Create at least one plan, otherwise club owners have nothing to subscribe to."
          >
            <button
              onClick={openCreate}
              className="mt-5 inline-flex items-center gap-2 bg-orange-500 px-4 py-2.5 text-[10.5px] font-black uppercase tracking-wider text-black transition hover:bg-white"
            >
              <Plus size={13} />
              Create the first plan
            </button>
          </Empty>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {plans.map((plan) => {
              const active = Number(plan.IsActive) === 1;

              return (
                <li key={plan.PlanID} className="px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-bold text-white">{plan.PlanName}</span>
                        <span
                          className={`border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            active
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                              : "border-zinc-600 bg-zinc-800/50 text-zinc-400"
                          }`}
                        >
                          {active ? "On sale" : "Hidden"}
                        </span>
                      </div>

                      {plan.Description && (
                        <p className="mt-1 line-clamp-2 text-[11px] leading-6 text-zinc-500">
                          {plan.Description}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-zinc-500">
                        <span>
                          <b className="text-zinc-300">{money(plan.PriceMonthly)}</b> / month
                        </span>
                        <span>
                          <b className="text-zinc-300">{money(plan.PriceYearly)}</b> / year
                        </span>
                        <span>{plan.MaxMembers} members</span>
                        <span>{plan.MaxCoaches} coaches</span>
                        <span>{plan.MaxSports} sports</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => toggleActive(plan)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 border border-zinc-700 px-3 py-2 text-[10.5px] font-bold uppercase tracking-wider text-zinc-300 transition hover:border-orange-500 hover:text-white disabled:opacity-50"
                      >
                        {active ? <X size={12} /> : <Check size={12} />}
                        {active ? "Hide" : "Publish"}
                      </button>

                      <button
                        onClick={() => openEdit(plan)}
                        className="inline-flex items-center gap-1.5 border border-zinc-700 px-3 py-2 text-[10.5px] font-bold uppercase tracking-wider text-zinc-300 transition hover:border-orange-500 hover:text-white"
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <form
            onSubmit={submit}
            className="my-8 w-full max-w-xl border border-zinc-700 bg-[#0e0e11] p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-[15px] font-black text-white">
                {editing === "new" ? "New plan" : "Edit plan"}
              </h3>
              <button
                type="button"
                onClick={close}
                className="text-zinc-500 transition hover:text-white"
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Plan name
                </label>
                <input
                  value={form.planName}
                  onChange={change("planName")}
                  disabled={editing !== "new"}
                  placeholder="Starter, Pro, Elite..."
                  className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none disabled:opacity-60"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Monthly price
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.priceMonthly}
                    onChange={change("priceMonthly")}
                    className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Yearly price
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.priceYearly}
                    onChange={change("priceYearly")}
                    className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Max members
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.maxMembers}
                    onChange={change("maxMembers")}
                    disabled={editing !== "new"}
                    className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Max coaches
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.maxCoaches}
                    onChange={change("maxCoaches")}
                    disabled={editing !== "new"}
                    className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Max sports
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.maxSports}
                    onChange={change("maxSports")}
                    disabled={editing !== "new"}
                    className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Short description
                </label>
                <input
                  value={form.description}
                  onChange={change("description")}
                  placeholder="Who this tier is for"
                  className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Features (one per line)
                </label>
                <textarea
                  rows={5}
                  value={form.features}
                  onChange={change("features")}
                  placeholder={"Up to 200 members\nCourt scheduling\nFee vouchers"}
                  className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 font-mono text-[11px] leading-6 text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <p className="mt-4 text-[10.5px] leading-6 text-zinc-500">
              Limits and the name are fixed once created; price, description, features and
              visibility stay editable.
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 bg-orange-500 py-3 text-[11px] font-black uppercase tracking-wider text-black transition hover:bg-white disabled:opacity-50"
              >
                {busy && <Loader2 size={14} className="animate-spin" />}
                {editing === "new" ? "Create plan" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={close}
                className="border border-zinc-700 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-300 transition hover:border-zinc-500 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PlatformPlans;
