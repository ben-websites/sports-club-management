import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock,
  ImagePlus,
  Loader2,
  XCircle,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import AuthShell from "../../components/common/AuthShell";

const money = (value) =>
  value === null || value === undefined ? "-" : `PKR ${Number(value).toLocaleString("en-PK")}`;

const date = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-";

const STATUS_STYLES = {
  Pending: { icon: Clock, className: "border-amber-500/40 bg-amber-500/10 text-amber-300" },
  Approved: {
    icon: CheckCircle2,
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  },
  Rejected: { icon: XCircle, className: "border-red-500/40 bg-red-500/10 text-red-300" },
  Cancelled: { icon: XCircle, className: "border-zinc-600/60 bg-zinc-800/40 text-zinc-400" },
};

/**
 * Where a club owner watches their subscription request.
 *
 * Approval is what creates the club, its admin identity and its first settings,
 * so this page is the hand-off point: once approved it points the owner at the
 * sign-in screen that opens the new dashboard.
 */
const SubscriptionStatusPage = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get("/public/subscriptions/my");
      if (data.success) setRequests(data.data || []);
    } catch (error) {
      console.error("Could not load requests:", error.message);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const attachProof = async (requestId, file) => {
    if (!file) return;

    setBusyId(requestId);
    try {
      const body = new FormData();
      body.append("proof", file);

      await api.post(`/public/subscriptions/${requestId}/proof`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await load();
    } catch (error) {
      console.error("Receipt upload failed:", error.message);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return null;

  if (!isAuthenticated) {
    return (
      <AuthShell
        eyebrow="For Club Owners"
        title="Sign in to see your request"
        subtitle="Your subscription requests are tied to the email address you applied with."
        footer={
          <>
            <Link to="/owner/login" className="font-bold text-orange-500 hover:text-white">
              Owner sign in
            </Link>
          </>
        }
      >
        <p className="text-center text-[11.5px] leading-6 text-zinc-500">
          Nothing to sign in with yet? Start a request from the pricing page.
        </p>
        <Link
          to="/for-clubs"
          className="mt-5 flex w-full items-center justify-center gap-2 border border-zinc-700 px-5 py-3 text-[11px] font-black uppercase tracking-wider text-zinc-300 transition hover:border-orange-500 hover:text-white"
        >
          See pricing
          <ArrowRight size={14} />
        </Link>
      </AuthShell>
    );
  }

  const approved = requests.find((row) => row.Status === "Approved");

  return (
    <AuthShell
      eyebrow="For Club Owners"
      title="Subscription requests"
      subtitle={`Signed in as ${user?.email || "your account"}. Every request you have made is listed here.`}
      maxWidth="max-w-2xl"
      footer={
        <>
          Need another club?{" "}
          <Link to="/sell/subscribe" className="font-bold text-orange-500 hover:text-white">
            Start a new request
          </Link>
        </>
      }
    >
      {fetching ? (
        <div className="flex items-center justify-center gap-3 py-8 text-xs text-zinc-400">
          <Loader2 size={16} className="animate-spin text-orange-500" />
          Loading your requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="border border-zinc-800 bg-zinc-900/40 px-5 py-10 text-center">
          <Building2 size={30} className="mx-auto text-zinc-700" />
          <p className="mt-4 text-[13px] font-bold text-white">No requests yet</p>
          <p className="mx-auto mt-2 max-w-xs text-[11.5px] leading-6 text-zinc-500">
            Pick a plan and tell us about your club - approval usually takes one working day.
          </p>
          <Link
            to="/sell/subscribe"
            className="mt-6 inline-flex items-center gap-2 bg-orange-500 px-5 py-3 text-[11px] font-black uppercase tracking-wider text-black transition hover:bg-white"
          >
            Start a request
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {requests.map((request) => {
            const style = STATUS_STYLES[request.Status] || STATUS_STYLES.Pending;
            const Icon = style.icon;

            return (
              <li key={request.RequestID} className="border border-zinc-800 bg-[#0e0e11]">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[13.5px] font-bold text-white">
                        {request.CompanyName}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${style.className}`}
                      >
                        <Icon size={10} />
                        {request.Status}
                      </span>
                    </div>

                    <p className="mt-1 text-[11px] text-zinc-500">
                      {request.PlanName} · {money(request.PriceMonthly)}/mo ·{" "}
                      {request.BillingCycle} · requested {date(request.RequestedAt)}
                    </p>
                  </div>

                  <span className="text-[11px] text-zinc-500">#{request.RequestID}</span>
                </div>

                <div className="space-y-3 p-4">
                  {request.Status === "Approved" && (
                    <div className="flex flex-col gap-3 border border-emerald-600/40 bg-emerald-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <BadgeCheck size={18} className="mt-0.5 shrink-0 text-emerald-400" />
                        <div className="text-[11.5px] leading-6 text-emerald-200">
                          <p className="font-bold">Your club is live</p>
                          <p className="text-emerald-300/90">
                            Sign in with the email and password the platform owner sent you to
                            open the admin dashboard.
                          </p>
                        </div>
                      </div>

                      <Link
                        to="/owner/login"
                        className="inline-flex shrink-0 items-center gap-2 bg-emerald-500 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-black transition hover:bg-white"
                      >
                        Open my club
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  )}

                  {request.PlatformRemarks && (
                    <div className="border border-zinc-800 bg-zinc-900/60 p-3 text-[11.5px] leading-6 text-zinc-400">
                      <span className="font-bold text-zinc-300">Platform note: </span>
                      {request.PlatformRemarks}
                    </div>
                  )}

                  {request.PaymentProofURL ? (
                    <a
                      href={request.PaymentProofURL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-[11px] font-semibold text-zinc-400 hover:text-orange-400"
                    >
                      <ImagePlus size={13} />
                      View attached receipt
                    </a>
                  ) : request.Status === "Pending" ? (
                    <label className="inline-flex cursor-pointer items-center gap-2 border border-dashed border-zinc-700 px-3.5 py-2.5 text-[11px] font-semibold text-zinc-400 transition hover:border-orange-500 hover:text-white">
                      {busyId === request.RequestID ? (
                        <Loader2 size={13} className="animate-spin text-orange-500" />
                      ) : (
                        <ImagePlus size={13} className="text-orange-500" />
                      )}
                      {busyId === request.RequestID ? "Uploading..." : "Attach payment receipt"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={busyId === request.RequestID}
                        onChange={(event) =>
                          attachProof(request.RequestID, event.target.files?.[0] || null)
                        }
                      />
                    </label>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {approved?.ClubSlug && (
        <p className="mt-5 text-center text-[11px] text-zinc-500">
          Your public page:{" "}
          <Link
            to={`/clubs/${approved.ClubSlug}`}
            className="font-bold text-orange-500 hover:text-white"
          >
            /clubs/{approved.ClubSlug}
          </Link>
        </p>
      )}
    </AuthShell>
  );
};

export default SubscriptionStatusPage;
