import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  Mail,
  MapPin,
  Phone,
  Star,
  Trophy,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import PageLoader from "../../components/dashboard/PageLoader";

const money = (value) =>
  value === null || value === undefined ? "-" : `PKR ${Number(value).toLocaleString("en-PK")}`;

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

/**
 * One club's public page.
 *
 * Everything here comes from /api/public/clubs/:slug, which returns whitelisted
 * fields only - no internal ids that could be used to probe the club's data.
 * Applying posts to the same slug: the tenant is resolved from the URL, never
 * from the visitor's token.
 */
const ClubProfilePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, selectClub, activeClub, refreshUser } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [form, setForm] = useState({
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      try {
        const { data: payload } = await api.get(`/public/clubs/${slug}`);
        if (alive && payload.success) setData(payload);
      } catch (error) {
        if (alive) setNotFound(true);
        console.error("Could not load club:", error.message);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [slug]);

  const openEnrolment = (plan) => {
    if (!isAuthenticated) {
      // Sign in first, then come straight back to this club.
      toast("Sign in to apply for this club.", { icon: "🔐" });
      navigate(`/login?club=${slug}&next=/clubs/${slug}`);
      return;
    }
    setSelectedPlan(plan);
    setApplied(false);
  };

  const submitApplication = async (event) => {
    event.preventDefault();
    if (!selectedPlan) return;

    setSubmitting(true);
    try {
      const { data: payload } = await api.post(`/public/clubs/${slug}/apply`, {
        planId: selectedPlan.PlanID,
        address: form.address || null,
        emergencyContactName: form.emergencyContactName || null,
        emergencyContactPhone: form.emergencyContactPhone || null,
      });

      if (payload.success) {
        setApplied(true);
        setSelectedPlan(null);
        setForm({ address: "", emergencyContactName: "", emergencyContactPhone: "" });
        await refreshUser();
      }
    } catch (error) {
      // api.js already surfaced the message.
      console.error("Application failed:", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openClubWorkspace = async () => {
    const result = await selectClub(slug);
    if (!result.success) return;

    // This club may know the person as a coach rather than a member.
    const nextRole = result.club?.role;
    navigate(
      nextRole === "admin"
        ? "/admin/dashboard"
        : nextRole === "coach"
        ? "/coach/dashboard"
        : "/user/dashboard"
    );
  };

  if (loading) {
    return (
      <div className="py-24">
        <PageLoader message="Loading club..." />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <Trophy size={40} className="mx-auto text-zinc-700" />
        <h1 className="mt-6 text-2xl font-black text-white">This club is not available</h1>
        <p className="mt-3 text-[13px] leading-7 text-zinc-500">
          The club may have been suspended, or the link is out of date.
        </p>
        <Link
          to="/clubs"
          className="mt-8 inline-flex items-center gap-2 bg-orange-500 px-6 py-3 text-[11px] font-black uppercase tracking-wider text-black transition hover:bg-white"
        >
          <ArrowLeft size={14} />
          Back to all clubs
        </Link>
      </div>
    );
  }

  const { club, sports = [], services = [], plans = [], events = [], coaches = [] } = data;
  const alreadyMember = activeClub?.slug === slug;

  return (
    <div className="bg-[#0c0c0e]">
      {/* HERO */}
      <section className="relative">
        <div className="relative h-[280px] overflow-hidden bg-zinc-900 sm:h-[340px]">
          {club.coverImageUrl ? (
            <img src={club.coverImageUrl} alt={club.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/60 to-transparent" />
        </div>

        <div className="mx-auto -mt-24 max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="relative flex flex-col gap-6 border border-zinc-800 bg-[#0e0e11] p-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900">
                {club.logoUrl ? (
                  <img src={club.logoUrl} alt="" className="h-14 w-14 object-contain" />
                ) : (
                  <Trophy size={28} className="text-zinc-600" />
                )}
              </div>

              <div>
                <h1 className="text-[26px] font-black leading-tight text-white sm:text-[32px]">
                  {club.name}
                </h1>
                {club.tagline && (
                  <p className="mt-1 text-[13px] text-orange-400">{club.tagline}</p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-zinc-500">
                  {(club.city || club.country) && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={13} className="text-orange-500" />
                      {[club.address, club.city, club.country].filter(Boolean).join(", ")}
                    </span>
                  )}
                  {club.foundedYear && <span>Established {club.foundedYear}</span>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {club.contactEmail && (
                <a
                  href={`mailto:${club.contactEmail}`}
                  className="inline-flex items-center gap-2 border border-zinc-700 px-4 py-2.5 text-[11px] font-semibold text-zinc-300 transition hover:border-orange-500 hover:text-white"
                >
                  <Mail size={14} />
                  Email
                </a>
              )}
              {club.contactPhone && (
                <a
                  href={`tel:${club.contactPhone}`}
                  className="inline-flex items-center gap-2 border border-zinc-700 px-4 py-2.5 text-[11px] font-semibold text-zinc-300 transition hover:border-orange-500 hover:text-white"
                >
                  <Phone size={14} />
                  Call
                </a>
              )}
              {alreadyMember ? (
                <button
                  onClick={() => navigate("/user/dashboard")}
                  className="inline-flex items-center gap-2 bg-white px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-black transition hover:bg-orange-500"
                >
                  Open my dashboard
                  <ArrowRight size={14} />
                </button>
              ) : (
                <a
                  href="#plans"
                  className="inline-flex items-center gap-2 bg-orange-500 px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-black transition hover:bg-white"
                >
                  Join this club
                  <ArrowRight size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {applied && (
        <div className="mx-auto mt-8 max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 border border-emerald-600/40 bg-emerald-500/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-400" />
              <div>
                <p className="text-[13px] font-bold text-white">Application submitted</p>
                <p className="text-[12px] text-zinc-400">
                  {club.name} will review it. You can switch into their portal now to watch it.
                </p>
              </div>
            </div>

            <button
              onClick={openClubWorkspace}
              className="inline-flex items-center gap-2 bg-emerald-500 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-black transition hover:bg-white"
            >
              Open {club.name}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ABOUT + CONTACT */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">
              About the club
            </h2>
            <p className="mt-4 whitespace-pre-line text-[13.5px] leading-8 text-zinc-400">
              {club.description || "This club has not added a description yet."}
            </p>
          </div>

          <div className="border border-zinc-800 bg-[#0e0e11] p-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.18em] text-white">
              Contact
            </h3>
            <ul className="mt-5 space-y-4 text-[12.5px] text-zinc-400">
              {club.contactEmail && (
                <li className="flex items-start gap-3">
                  <Mail size={15} className="mt-0.5 shrink-0 text-orange-500" />
                  {club.contactEmail}
                </li>
              )}
              {club.contactPhone && (
                <li className="flex items-start gap-3">
                  <Phone size={15} className="mt-0.5 shrink-0 text-orange-500" />
                  {club.contactPhone}
                </li>
              )}
              {(club.address || club.city) && (
                <li className="flex items-start gap-3">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-orange-500" />
                  {[club.address, club.city, club.country].filter(Boolean).join(", ")}
                </li>
              )}
              {club.websiteUrl && (
                <li className="flex items-start gap-3">
                  <ArrowRight size={15} className="mt-0.5 shrink-0 text-orange-500" />
                  <a
                    href={club.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-zinc-700 hover:text-orange-400"
                  >
                    {club.websiteUrl}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* SPORTS + SERVICES */}
      {(sports.length > 0 || services.length > 0) && (
        <section className="border-y border-zinc-800 bg-[#09090b] py-14">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            {sports.length > 0 && (
              <>
                <h2 className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">
                  <Dumbbell size={16} />
                  Sports & facilities
                </h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {sports.map((sport) => (
                    <div
                      key={sport.SportID}
                      className="border border-zinc-800 bg-[#0e0e11] p-5 transition hover:border-orange-500/60"
                    >
                      <h4 className="text-[13px] font-bold text-white">{sport.SportName}</h4>
                      <p className="mt-2 line-clamp-3 text-[11.5px] leading-6 text-zinc-500">
                        {sport.Description || "Available at this club."}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {services.length > 0 && (
              <>
                <h2 className="mt-12 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">
                  <Star size={16} />
                  Services
                </h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {services.map((service) => (
                    <div
                      key={service.ServiceID}
                      className="border border-zinc-800 bg-[#0e0e11] p-5 transition hover:border-orange-500/60"
                    >
                      <h4 className="text-[13px] font-bold text-white">{service.ServiceName}</h4>
                      <p className="mt-2 line-clamp-3 text-[11.5px] leading-6 text-zinc-500">
                        {service.Description || "Offered at this club."}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* PLANS */}
      <section id="plans" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">
          Membership plans
        </h2>
        <p className="mt-3 max-w-2xl text-[13px] leading-7 text-zinc-400">
          Each club sets its own plans and prices. Pick one to apply - the club reviews
          every application before your membership starts.
        </p>

        {plans.length === 0 ? (
          <div className="mt-8 border border-zinc-800 bg-[#0e0e11] px-6 py-12 text-center text-[13px] text-zinc-500">
            This club has not published its plans yet.
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.PlanID}
                className="flex flex-col border border-zinc-800 bg-[#0e0e11] p-6 transition hover:border-orange-500"
              >
                <h3 className="text-[15px] font-black text-white">{plan.PlanName}</h3>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-[24px] font-black text-orange-500">
                    {money(plan.MonthlyFee)}
                  </span>
                  <span className="pb-1 text-[11px] text-zinc-500">/month</span>
                </div>

                <ul className="mt-5 space-y-2 text-[12px] text-zinc-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-orange-500" />
                    {plan.DurationMonths} month duration
                  </li>
                  {Number(plan.AdmissionFee) > 0 && (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-orange-500" />
                      One-time admission {money(plan.AdmissionFee)}
                    </li>
                  )}
                  {plan.AllowedSportsLimit ? (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-orange-500" />
                      Access to {plan.AllowedSportsLimit} sports
                    </li>
                  ) : null}
                </ul>

                {plan.Description && (
                  <p className="mt-4 text-[11.5px] leading-6 text-zinc-500">{plan.Description}</p>
                )}

                <button
                  onClick={() => openEnrolment(plan)}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-orange-500 px-5 py-3 text-[11px] font-black uppercase tracking-wider text-black transition hover:bg-white"
                >
                  Apply for this plan
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* EVENTS + COACHES */}
      {(events.length > 0 || coaches.length > 0) && (
        <section className="border-t border-zinc-800 bg-[#09090b] py-14">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
              {events.length > 0 && (
                <div>
                  <h2 className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">
                    <CalendarDays size={16} />
                    Upcoming events
                  </h2>

                  <ul className="mt-6 space-y-3">
                    {events.map((event) => (
                      <li
                        key={event.EventID}
                        className="border border-zinc-800 bg-[#0e0e11] p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="text-[13px] font-bold text-white">
                              {event.EventName}
                            </h4>
                            <p className="mt-1 text-[11.5px] text-zinc-500">
                              {formatDate(event.EventDate)}
                              {event.Venue ? ` · ${event.Venue}` : ""}
                            </p>
                          </div>
                          <span className="shrink-0 border border-orange-500/40 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-orange-400">
                            {event.EventStatus}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {coaches.length > 0 && (
                <div>
                  <h2 className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">
                    <Trophy size={16} />
                    Coaching highlights
                  </h2>

                  <ul className="mt-6 space-y-3">
                    {coaches.map((coach) => (
                      <li
                        key={coach.CoachID}
                        className="flex items-center gap-4 border border-zinc-800 bg-[#0e0e11] p-4"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-700 bg-zinc-900">
                          {coach.ImageURL ? (
                            <img src={coach.ImageURL} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Trophy size={18} className="text-zinc-600" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="truncate text-[13px] font-bold text-white">
                            {coach.FullName}
                          </h4>
                          <p className="truncate text-[11.5px] text-zinc-500">
                            {coach.Specialization}
                            {coach.ExperienceYears ? ` · ${coach.ExperienceYears} yrs` : ""}
                            {coach.Rating ? ` · ★ ${coach.Rating}` : ""}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ENROLMENT PANEL */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg border border-zinc-700 bg-[#0e0e11] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[16px] font-black text-white">Apply to {club.name}</h3>
                <p className="mt-1 text-[12px] text-zinc-500">
                  {selectedPlan.PlanName} · {money(selectedPlan.MonthlyFee)}/month
                </p>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="text-zinc-500 transition hover:text-white"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitApplication} className="mt-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                  Home address
                </label>
                <input
                  value={form.address}
                  onChange={(event) => setForm({ ...form, address: event.target.value })}
                  placeholder="House, street, area"
                  className="mt-2 w-full border border-zinc-800 bg-[#0c0c0e] px-4 py-3 text-[13px] text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                    Emergency contact
                  </label>
                  <input
                    value={form.emergencyContactName}
                    onChange={(event) =>
                      setForm({ ...form, emergencyContactName: event.target.value })
                    }
                    placeholder="Full name"
                    className="mt-2 w-full border border-zinc-800 bg-[#0c0c0e] px-4 py-3 text-[13px] text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                    Their phone
                  </label>
                  <input
                    value={form.emergencyContactPhone}
                    onChange={(event) =>
                      setForm({ ...form, emergencyContactPhone: event.target.value })
                    }
                    placeholder="+92 300 1234567"
                    className="mt-2 w-full border border-zinc-800 bg-[#0c0c0e] px-4 py-3 text-[13px] text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <p className="text-[11px] leading-6 text-zinc-500">
                The club reviews every application. Your membership starts once they
                approve it and your first voucher is paid.
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 bg-orange-500 px-5 py-3 text-[11px] font-black uppercase tracking-wider text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit application"}
                <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubProfilePage;
