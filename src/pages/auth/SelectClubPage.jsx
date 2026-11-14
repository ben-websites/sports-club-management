import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Building2, CheckCircle2, Loader2, MapPin } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AuthShell from "../../components/common/AuthShell";

const homeFor = (role) =>
  role === "admin" ? "/admin/dashboard" : role === "coach" ? "/coach/dashboard" : "/user/dashboard";

/**
 * The club chooser.
 *
 * A person can belong to more than one club (a member at two, or an admin who
 * also plays somewhere). The session token is scoped to exactly one club, so the
 * choice has to be explicit - and it is verified server-side against ClubUsers.
 */
const SelectClubPage = () => {
  const { isAuthenticated, loading, clubs, activeClub, selectClub } = useAuth();
  const navigate = useNavigate();
  const [busySlug, setBusySlug] = useState(null);

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const usable = clubs.filter((club) => club.isActive);
  const blocked = clubs.filter((club) => !club.isActive);

  const handleSelect = async (club) => {
    setBusySlug(club.slug);
    const result = await selectClub(club.slug);
    setBusySlug(null);

    if (result.success) navigate(homeFor(club.role), { replace: true });
  };

  return (
    <AuthShell
      eyebrow="Choose a club"
      title="Which club are you opening?"
      subtitle="Your account works with more than one club. Pick one to continue - you can switch at any time from the sidebar."
      maxWidth="max-w-xl"
      footer={
        <>
          Not a member of any club yet?{" "}
          <Link to="/clubs" className="font-bold text-orange-500 transition hover:text-white">
            Browse the club directory
          </Link>
        </>
      }
    >
      {usable.length === 0 ? (
        <div className="border border-zinc-800 bg-zinc-900/40 px-5 py-10 text-center">
          <Building2 size={30} className="mx-auto text-zinc-700" />
          <p className="mt-4 text-[13px] font-bold text-white">No club available yet</p>
          <p className="mx-auto mt-2 max-w-xs text-[11.5px] leading-6 text-zinc-500">
            Apply to a club and it will appear here as soon as the club approves you.
          </p>
          <Link
            to="/clubs"
            className="mt-6 inline-flex items-center gap-2 bg-orange-500 px-5 py-3 text-[11px] font-black uppercase tracking-wider text-black transition hover:bg-white"
          >
            Find a club
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {usable.map((club) => (
            <li key={club.slug}>
              <button
                onClick={() => handleSelect(club)}
                disabled={!!busySlug}
                className={`group flex w-full items-center gap-4 border p-4 text-left transition disabled:opacity-60 ${
                  activeClub?.slug === club.slug
                    ? "border-orange-500 bg-orange-500/5"
                    : "border-zinc-800 bg-[#0e0e11] hover:border-zinc-600"
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900">
                  {club.logoUrl ? (
                    <img src={club.logoUrl} alt="" className="h-8 w-8 object-contain" />
                  ) : (
                    <Building2 size={17} className="text-zinc-600" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[13px] font-bold text-white">{club.name}</span>
                    {club.status !== "Active" && (
                      <span className="shrink-0 border border-amber-500/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">
                        {club.status}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
                    <span className="uppercase tracking-wider">{club.role}</span>
                    {club.city && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={11} />
                        {club.city}
                      </span>
                    )}
                  </div>
                </div>

                {busySlug === club.slug ? (
                  <Loader2 size={16} className="shrink-0 animate-spin text-orange-500" />
                ) : activeClub?.slug === club.slug ? (
                  <CheckCircle2 size={16} className="shrink-0 text-orange-500" />
                ) : (
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-zinc-600 transition group-hover:text-orange-500"
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {blocked.length > 0 && (
        <div className="mt-6 border-t border-zinc-800 pt-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
            Access removed
          </p>
          <ul className="mt-3 space-y-2 text-[11.5px] text-zinc-500">
            {blocked.map((club) => (
              <li key={club.slug}>
                {club.name} - ask the club administrator to restore your access.
              </li>
            ))}
          </ul>
        </div>
      )}
    </AuthShell>
  );
};

export default SelectClubPage;
