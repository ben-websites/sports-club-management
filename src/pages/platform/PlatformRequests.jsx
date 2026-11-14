import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardCopy,
  Clock,
  Eye,
  Loader2,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import PageLoader from "../../components/dashboard/PageLoader";
import {
  PageHeading,
  Panel,
  Empty,
  StatusPill,
  money,
  formatDate,
} from "../../components/platform/PlatformUI";

const FILTERS = ["Pending", "Approved", "Rejected", "All"];

/**
 * The approval queue.
 *
 * Approving is the moment a new club is born, so the response carries the
 * credentials that were issued - they are shown once, for the owner to hand over.
 */
const PlatformRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("Pending");
  const [loading, setLoading] = useState(true);

  const [active, setActive] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [busy, setBusy] = useState(false);
  const [gateway, setGateway] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = filter === "All" ? "" : `?status=${filter}`;
      const { data } = await api.get(`/platform/requests${query}`);
      if (data.success) setRequests(data.data || []);
    } catch (error) {
      console.error("Could not load requests:", error.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(
    () => ({
      pending: requests.filter((row) => row.Status === "Pending").length,
    }),
    [requests]
  );

  const review = async (action) => {
    if (!active) return;

    setBusy(true);
    try {
      const { data } = await api.put(`/platform/requests/${active.RequestID}/review`, {
        action,
        remarks: remarks || null,
      });

      if (data.success) {
        if (action === "approve" && data.credentials) {
          setGateway({ club: data.club, credentials: data.credentials });
        }
        setActive(null);
        setRemarks("");
        await load();
      }
    } catch (error) {
      console.error("Review failed:", error.message);
    } finally {
      setBusy(false);
    }
  };

  const copyAll = () => {
    if (!gateway) return;

    const text = [
      `Club: ${gateway.club?.ClubName}`,
      `Admin email: ${gateway.credentials.email}`,
      // A kept password is null on purpose; copying "null" over it was how the
      // platform owner ended up handing over a password that never existed.
      gateway.credentials.password
        ? `Temporary password: ${gateway.credentials.password}`
        : "Password: unchanged - the owner keeps the password they registered with.",
      `Sign-in: ${window.location.origin}/owner/login`,
    ].join("\n");

    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Credentials copied."))
      .catch(() => toast.error("Could not copy - select the text manually."));
  };

  return (
    <div>
      <PageHeading
        eyebrow="Subscriptions"
        title="Club requests"
        description="Approve to create the club and issue its admin identity, or reject with a note explaining why."
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
            {option === "Pending" && counts.pending > 0 && (
              <span className="ml-2 bg-orange-500 px-1.5 py-0.5 text-[9px] font-black text-black">
                {counts.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {gateway && (
        <div className="mb-4 border border-emerald-600/40 bg-emerald-500/10 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <h3 className="text-[13px] font-bold text-white">
                  {gateway.club?.ClubName} is live
                </h3>
              </div>
              <p className="mt-1 text-[11.5px] text-emerald-300/90">
                The owner signs in at /owner/login and lands straight in the club dashboard.
              </p>

              <div className="mt-4 space-y-1.5 font-mono text-[11.5px] text-emerald-100">
                <div>Email: {gateway.credentials.email}</div>
                {gateway.credentials.password ? (
                  <div>Password: {gateway.credentials.password}</div>
                ) : (
                  <div className="font-sans">
                    Password: unchanged - the owner keeps the one they registered with.
                  </div>
                )}
                <div>Club slug: {gateway.club?.Slug}</div>
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
            <PageLoader message="Loading requests..." />
          </div>
        ) : requests.length === 0 ? (
          <Empty
            icon={ShieldCheck}
            title={`No ${filter === "All" ? "" : filter.toLowerCase()} requests`}
            body="When a club owner submits a subscription request it appears here for review."
          />
        ) : (
          <ul className="divide-y divide-zinc-800">
            {requests.map((request) => (
              <li key={request.RequestID} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-bold text-white">
                        {request.CompanyName}
                      </span>
                      <StatusPill status={request.Status} />
                      <span className="text-[10.5px] text-zinc-600">#{request.RequestID}</span>
                    </div>

                    <div className="mt-1.5 grid gap-1 text-[11px] text-zinc-500 sm:grid-cols-2">
                      <span>
                        {request.ContactPerson} · {request.ContactEmail}
                      </span>
                      <span>
                        {request.PlanName} · {money(request.PriceMonthly)}/mo ·{" "}
                        {request.BillingCycle}
                      </span>
                      <span>
                        {[request.City, request.AddressLine].filter(Boolean).join(", ") || "-"}
                      </span>
                      <span>Requested {formatDate(request.RequestedAt)}</span>
                    </div>

                    {request.ClubDescription && (
                      <p className="mt-2 line-clamp-2 text-[11px] leading-6 text-zinc-500">
                        {request.ClubDescription}
                      </p>
                    )}

                    {request.PlatformRemarks && (
                      <p className="mt-2 border-l-2 border-zinc-700 pl-3 text-[11px] leading-6 text-zinc-400">
                        {request.PlatformRemarks}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {request.PaymentProofURL && (
                      <a
                        href={request.PaymentProofURL}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 border border-zinc-700 px-3 py-2 text-[10.5px] font-bold uppercase tracking-wider text-zinc-300 transition hover:border-orange-500 hover:text-white"
                      >
                        <Eye size={12} />
                        Receipt
                      </a>
                    )}

                    {request.Status === "Pending" && (
                      <button
                        onClick={() => {
                          setActive(request);
                          setRemarks("");
                        }}
                        className="inline-flex items-center gap-1.5 bg-orange-500 px-3.5 py-2 text-[10.5px] font-black uppercase tracking-wider text-black transition hover:bg-white"
                      >
                        Review
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* REVIEW DIALOG */}
      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg border border-zinc-700 bg-[#0e0e11] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[15px] font-black text-white">{active.CompanyName}</h3>
                <p className="mt-1 text-[11.5px] text-zinc-500">
                  {active.OwnerName} · {active.OwnerEmail} · {active.PlanName}
                </p>
              </div>
              <button
                onClick={() => setActive(null)}
                className="text-zinc-500 transition hover:text-white"
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-5 space-y-1.5 border border-zinc-800 bg-zinc-900/40 p-4 text-[11.5px] text-zinc-400">
              <div>Contact: {active.ContactPerson}</div>
              <div>Email: {active.ContactEmail}</div>
              <div>Phone: {active.ContactPhone || "-"}</div>
              <div>Location: {[active.City, active.AddressLine].filter(Boolean).join(", ") || "-"}</div>
              <div>Expected members: {active.ExpectedMembers || "-"}</div>
              <div>
                Price: {money(active.PriceMonthly)}/mo · {money(active.PriceYearly)}/yr ·{" "}
                {active.BillingCycle}
              </div>
              {active.PaymentReference && <div>Payment ref: {active.PaymentReference}</div>}
            </div>

            <div className="mt-4">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Note to the owner (optional)
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                placeholder="Stored on the request and shown to the club owner."
                className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs leading-6 text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                onClick={() => review("approve")}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 bg-emerald-500 py-3 text-[11px] font-black uppercase tracking-wider text-black transition hover:bg-white disabled:opacity-50"
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Approve & create club
              </button>

              <button
                onClick={() => review("reject")}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 border border-red-500/50 py-3 text-[11px] font-black uppercase tracking-wider text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                Reject
              </button>
            </div>

            <p className="mt-4 flex items-start gap-2 text-[10.5px] leading-6 text-zinc-500">
              <Clock size={12} className="mt-1 shrink-0" />
              Approving creates the club, a subscription, the owner's admin membership and
              starter settings in a single transaction.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformRequests;
