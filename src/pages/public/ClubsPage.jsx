import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Search, Trophy, Users } from "lucide-react";
import api from "../../services/api";
import PageLoader from "../../components/dashboard/PageLoader";

const money = (value) =>
  value === null || value === undefined
    ? "-"
    : `PKR ${Number(value).toLocaleString("en-PK")}`;

/**
 * The club directory: every club that has been approved onto the platform and
 * is currently accepting members. This is the page the brief calls "a page
 * where different companies who have bought our system are shown".
 */
const ClubsPage = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const { data } = await api.get("/public/clubs");
        if (alive && data.success) setClubs(data.data || []);
      } catch (error) {
        console.error("Could not load clubs:", error.message);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clubs;

    return clubs.filter((club) =>
      [club.ClubName, club.City, club.Country, club.Tagline]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term))
    );
  }, [clubs, search]);

  return (
    <div className="bg-[#0c0c0e]">
      <section className="relative overflow-hidden border-b border-zinc-800 py-20">
        <div className="absolute -right-24 top-0 h-[420px] w-[420px] rounded-full bg-orange-500/10 blur-[130px]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
            <span className="h-px w-8 bg-orange-500" />
            Club Directory
          </div>

          <h1 className="mt-5 max-w-3xl text-[36px] font-black leading-tight text-white sm:text-[48px]">
            Find the club
            <span className="block font-normal text-orange-500">that fits you.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-[14px] leading-7 text-zinc-400">
            Every club below runs on Sports Hub. Open a club to see its facilities,
            coaches, upcoming events and membership plans, then apply online.
          </p>

          <div className="mt-9 flex max-w-xl items-center gap-3 border border-zinc-800 bg-[#0e0e11] px-4 py-3">
            <Search size={17} className="text-zinc-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by club name or city..."
              className="w-full bg-transparent text-[13px] text-white placeholder:text-zinc-600 focus:outline-none"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
        {loading ? (
          <PageLoader message="Loading clubs..." />
        ) : filtered.length === 0 ? (
          <div className="border border-zinc-800 bg-[#0e0e11] px-6 py-16 text-center">
            <Trophy size={34} className="mx-auto text-zinc-700" />
            <h3 className="mt-5 text-lg font-bold text-white">
              {clubs.length === 0 ? "No clubs are listed yet" : "No club matches that search"}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-zinc-500">
              {clubs.length === 0
                ? "As soon as a club is approved onto the platform it appears here."
                : "Try a different name or city."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((club) => (
              <Link
                key={club.ClubID || club.Slug}
                to={`/clubs/${club.Slug}`}
                className="group flex flex-col overflow-hidden border border-zinc-800 bg-[#0e0e11] transition hover:border-orange-500"
              >
                <div className="relative h-40 overflow-hidden bg-zinc-900">
                  {club.CoverImageURL ? (
                    <img
                      src={club.CoverImageURL}
                      alt={club.ClubName}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800">
                      <Trophy size={34} className="text-zinc-700" />
                    </div>
                  )}

                  {club.LogoURL && (
                    <div className="absolute -bottom-6 left-5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-zinc-700 bg-[#0c0c0e]">
                      <img src={club.LogoURL} alt="" className="h-10 w-10 object-contain" />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5 pt-9">
                  <h3 className="text-[15px] font-black text-white group-hover:text-orange-400">
                    {club.ClubName}
                  </h3>

                  {club.Tagline && (
                    <p className="mt-1 line-clamp-2 text-[12px] leading-6 text-zinc-500">
                      {club.Tagline}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-zinc-500">
                    {(club.City || club.Country) && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={13} className="text-orange-500" />
                        {[club.City, club.Country].filter(Boolean).join(", ")}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Users size={13} className="text-orange-500" />
                      {club.PlanCount || 0} plan{Number(club.PlanCount) === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-zinc-800 pt-4">
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                        From
                      </div>
                      <div className="text-[13px] font-black text-white">
                        {money(club.FromPrice)}
                        <span className="ml-1 text-[10px] font-medium text-zinc-500">/mo</span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-500">
                      View club
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ClubsPage;
