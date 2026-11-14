import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Check, ChevronDown, Loader2, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const ROLE_LABEL = { admin: "Admin", coach: "Coach", member: "Member" };

/**
 * Which club this session is working in.
 *
 * The club is not a display preference: it is baked into the token and enforced
 * by row level security. Switching therefore asks the server for a new token
 * and then reloads, so nothing from the previous club stays on screen.
 */
const ClubSwitcher = ({ compact = false }) => {
  const { activeClub, clubs, selectClub } = useAuth();
  const [open, setOpen] = useState(false);
  const [busySlug, setBusySlug] = useState(null);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const handleSwitch = async (club) => {
    if (club.slug === activeClub?.slug) {
      setOpen(false);
      return;
    }

    setBusySlug(club.slug);
    const result = await selectClub(club.slug);

    if (result.success) {
      const nextRole = result.club?.role;
      const home =
        nextRole === "admin"
          ? "/admin/dashboard"
          : nextRole === "coach"
          ? "/coach/dashboard"
          : "/user/dashboard";

      // A hard navigation drops every cached screen from the previous tenant.
      window.location.assign(home);
      return;
    }

    setBusySlug(null);
  };

  const name = activeClub?.name || "Select a club";
  const role = ROLE_LABEL[activeClub?.role] || null;

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`flex w-full items-center gap-2.5 border border-zinc-800 bg-zinc-900/70 px-3 py-2.5 text-left transition hover:border-orange-500/60 ${
          compact ? "" : ""
        }`}
      >
        {activeClub?.logoUrl ? (
          <img
            src={activeClub.logoUrl}
            alt={name}
            className="h-7 w-7 shrink-0 border border-zinc-700 bg-black object-contain"
          />
        ) : (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-orange-500/40 bg-zinc-950 text-[10px] font-black text-orange-500">
            {(activeClub?.name || "?").slice(0, 2).toUpperCase()}
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[11.5px] font-bold text-white">{name}</span>
          <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-500">
            {role || "Club workspace"}
          </span>
        </span>

        <ChevronDown
          size={14}
          className={`shrink-0 text-zinc-500 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 border border-zinc-700 bg-[#0e0e11] shadow-2xl shadow-black/60">
          <div className="border-b border-zinc-800 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            Your clubs
          </div>

          <ul className="max-h-64 overflow-y-auto">
            {clubs.length === 0 && (
              <li className="px-3 py-3 text-[11px] text-zinc-500">No clubs yet.</li>
            )}

            {clubs.map((club) => {
              const isActive = club.slug === activeClub?.slug;

              return (
                <li key={club.slug}>
                  <button
                    type="button"
                    onClick={() => handleSwitch(club)}
                    disabled={!!busySlug}
                    className={`flex w-full items-center gap-2 px-3 py-2.5 text-left transition ${
                      isActive ? "bg-orange-500/10" : "hover:bg-zinc-900"
                    } disabled:opacity-60`}
                  >
                    <Building2 size={13} className={isActive ? "text-orange-500" : "text-zinc-600"} />

                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-[11.5px] font-semibold ${
                          isActive ? "text-white" : "text-zinc-300"
                        }`}
                      >
                        {club.name}
                      </span>
                      <span className="block text-[9.5px] uppercase tracking-wider text-zinc-500">
                        {ROLE_LABEL[club.role] || club.role}
                        {club.status && club.status !== "Active" ? ` · ${club.status}` : ""}
                      </span>
                    </span>

                    {busySlug === club.slug ? (
                      <Loader2 size={13} className="animate-spin text-orange-500" />
                    ) : isActive ? (
                      <Check size={13} className="text-orange-500" />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>

          <Link
            to="/clubs"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 border-t border-zinc-800 px-3 py-2.5 text-[10.5px] font-bold uppercase tracking-wider text-zinc-400 transition hover:text-white"
          >
            <Plus size={12} />
            Join another club
          </Link>
        </div>
      )}
    </div>
  );
};

export default ClubSwitcher;
