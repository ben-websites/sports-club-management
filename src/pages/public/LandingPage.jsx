import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Coins,
  CreditCard,
  Dumbbell,
  Lock,
  MapPin,
  Receipt,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import api from "../../services/api";
import startPolling from "../../services/polling";
import Reveal from "../../components/common/Reveal";

/**
 * The platform's front page.
 *
 * Everything shown here comes from the database: the counters read
 * /public/stats, the club cards read /public/clubs, and the plans/prices are
 * whatever each club has published. Nothing on this page is a hard-coded
 * single-club claim any more - the old "35+ arenas / 275 members" copy belonged
 * to the one-club version of the product.
 */
const money = (value) =>
  value === null || value === undefined ? "-" : `PKR ${Number(value).toLocaleString("en-PK")}`;

function CountUp({ value, suffix = "", duration = 1600 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let animationFrame;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easedProgress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    setCount(0);
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <>
      {count.toLocaleString()}
      {suffix}
    </>
  );
}

const MEMBER_STEPS = [
  {
    number: "01",
    title: "Create one free account",
    body: "One login for the whole platform. It is not tied to a single club, so you can join one, or several.",
  },
  {
    number: "02",
    title: "Open a club's page",
    body: "Browse the directory and read a club's facilities, coaches, upcoming events and membership plans.",
  },
  {
    number: "03",
    title: "Apply for a plan",
    body: "Pick the plan you want and send the application. The club's admin reviews every request before it starts.",
  },
  {
    number: "04",
    title: "Pay and get your card",
    body: "A monthly voucher appears in your dashboard. Pay it, upload the receipt, and your digital card stays active.",
  },
];

const MODULES = [
  {
    icon: BadgeCheck,
    title: "Memberships & plans",
    body: "Each club publishes its own tiers, admission fees and monthly rates. Applications, approvals, renewals and suspensions are all in one place.",
  },
  {
    icon: Receipt,
    title: "Monthly vouchers",
    body: "Fee vouchers are generated per member with a serial number, due date and deposit details - no paper slips at the front desk.",
  },
  {
    icon: Coins,
    title: "Late fines & dues",
    body: "Overdue vouchers collect a per-day fine automatically, so the amount owed is always current and never argued about.",
  },
  {
    icon: CreditCard,
    title: "Receipt verification",
    body: "Members upload a photo of the bank slip. Admins approve or reject it, and the voucher flips to paid with an audit trail.",
  },
  {
    icon: Wallet,
    title: "Advance payments",
    body: "Pay several months up front. The system records the prepaid months and skips those months when generating vouchers.",
  },
  {
    icon: ClipboardCheck,
    title: "Attendance & payroll",
    body: "Mark member and staff attendance, track coach sessions, and run a salary register from the same records.",
  },
  {
    icon: Trophy,
    title: "Teams & tournaments",
    body: "Teams, fixtures, tournaments and equipment issue - with member registration and live participant counts.",
  },
  {
    icon: CalendarDays,
    title: "Events & notices",
    body: "Publish events and announcements to the right audience, and notify members the moment something changes.",
  },
];

const FAQ = [
  {
    question: "How do I join a club?",
    answer:
      "Create a free account, open the club's page from the directory, choose a membership plan and submit the application. The club's admin reviews it, and once approved a monthly fee voucher appears in your dashboard. You pay it and upload the receipt - your digital membership card stays active from there on.",
  },
  {
    question: "Can one account belong to more than one club?",
    answer:
      "Yes. Your login is a platform account, and each club you join keeps its own membership, vouchers and history under that account. Switching between clubs takes one click from the dashboard - and what happens in one club never affects your standing in another.",
  },
  {
    question: "Are membership fees the same at every club?",
    answer:
      "No. Every club sets its own plans, monthly fees, admission charges and due dates. The plan cards you see are the ones that club publishes right now, priced in PKR.",
  },
  {
    question: "How do I pay my monthly fee?",
    answer:
      "Your dashboard shows the current voucher with its due date. Pay by bank transfer or the payment method the club lists, then upload a photo of the slip. The club's admin verifies it and the voucher is marked paid - you keep the full payment history either way.",
  },
  {
    question: "Can another club see my details?",
    answer:
      "No. Each club works inside its own private workspace, and the database separates clubs at the row level. A club's admin only ever sees the members who hold a membership with that club - never the account list of the platform.",
  },
  {
    question: "I run a club - how do I get it onto Sports Hub?",
    answer:
      "Send a subscription request from the For Clubs page: company details, expected member volume and a payment receipt for the plan you picked. The platform owner reviews it, sets up your own admin login and your club's public page goes live on the directory.",
  },
];

function LandingPage() {
  const [stats, setStats] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [openFAQ, setOpenFAQ] = useState(0);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const [statsRes, clubsRes] = await Promise.all([
          api.get("/public/stats"),
          api.get("/public/clubs"),
        ]);

        if (!alive) return;
        if (statsRes.data.success) setStats(statsRes.data.stats || {});
        if (clubsRes.data.success) setClubs(clubsRes.data.data || []);
      } catch (error) {
        console.error("Could not load the platform overview:", error.message);
      }
    };

    load();
    const stop = startPolling(load, 60000);

    return () => {
      alive = false;
      if (typeof stop === "function") stop();
    };
  }, []);

  const counters = [
    { value: stats?.TotalClubs || 0, label: "Clubs on the platform", icon: Building2 },
    { value: stats?.SportCount || 0, label: "Sports offered", icon: Dumbbell },
    { value: stats?.MemberCount || 0, label: "Active memberships", icon: Users },
    { value: stats?.UpcomingEvents || 0, label: "Upcoming events", icon: Trophy },
  ];

  const featured = clubs.slice(0, 3);

  return (
    <div className="page-enter min-h-screen overflow-x-clip bg-[#0c0c0e] font-sans text-zinc-100">
      {/* =========================================================
          HERO
      ========================================================= */}
      <section id="home" className="keep-dark relative overflow-hidden bg-[#09090b]">
        {/* Deliberately not a stock photograph: a lit gradient plus a faint grid
            renders identically everywhere and can never show a broken image. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(120% 120% at 12% 0%, rgba(249,115,22,0.22), transparent 55%), radial-gradient(90% 90% at 92% 8%, rgba(249,115,22,0.12), transparent 50%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(85% 80% at 50% 15%, black, transparent)",
            WebkitMaskImage: "radial-gradient(85% 80% at 50% 15%, black, transparent)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-black/60" />
        <div className="pointer-events-none absolute right-10 top-1/4 h-96 w-96 rounded-full bg-orange-500/10 blur-[130px]" />

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-5 pb-36 pt-32 sm:px-6 lg:grid-cols-12 lg:px-8 lg:pb-40 lg:pt-40">
          <Reveal variant="left" className="lg:col-span-7">
            <div className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em] text-orange-500">
              <span className="h-px w-10 bg-orange-500" />
              Sports Club Management Platform
            </div>

            <h1 className="text-[42px] font-black leading-[1.03] tracking-[-0.03em] text-white sm:text-[58px] lg:text-[70px]">
              Every club.
              <br />
              <span className="font-normal text-orange-500">One platform.</span>
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-8 text-zinc-300 sm:text-[16px]">
              Sports Hub runs the memberships, monthly fees, coaching, attendance and
              tournaments of every club on the platform - and gives members one login to
              find the right club, join it and manage everything from their phone.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/clubs"
                className="inline-flex items-center gap-3 bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-wider text-black transition-all hover:bg-white hover:shadow-2xl"
              >
                Find a Club
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/for-clubs"
                className="inline-flex items-center gap-3 border border-zinc-700 bg-zinc-900/80 px-7 py-4 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm transition hover:border-orange-500 hover:text-orange-400"
              >
                For Club Owners
                <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-zinc-400">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={14} className="text-orange-500" />
                Each club's data is isolated
              </span>
              <span className="inline-flex items-center gap-2">
                <CreditCard size={14} className="text-orange-500" />
                Fees, receipts and fines in one ledger
              </span>
            </div>
          </Reveal>

          <Reveal variant="zoom" delay={150} className="lg:col-span-5">
            <div className="relative flex items-center justify-center">
              <div className="pointer-events-none absolute h-80 w-80 animate-pulse rounded-full bg-orange-500/25 blur-[100px]" />

              <div className="relative flex w-full max-w-md flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex h-40 w-full items-center justify-center">
                  <img
                    src="/sports-hub-logo.svg"
                    alt="Sports Hub"
                    className="h-full w-auto object-contain drop-shadow-[0_0_35px_rgba(249,115,22,0.4)]"
                  />
                </div>

                <div className="mt-5 w-full divide-y divide-white/10 border border-white/10 bg-black/30">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                      Live clubs
                    </span>
                    <span className="text-sm font-black text-white">
                      {stats?.TotalClubs ?? "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                      Membership plans
                    </span>
                    <span className="text-sm font-black text-white">
                      {stats?.PlanCount ?? "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                      Cities
                    </span>
                    <span className="text-sm font-black text-white">
                      {stats?.CityCount ?? "-"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 px-4 py-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">
                    Reading live data
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* LIVE COUNTERS */}
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-zinc-800 bg-[#0c0c0f]/85 backdrop-blur-xl">
          <Reveal group className="mx-auto grid max-w-7xl grid-cols-2 px-4 sm:grid-cols-4 sm:px-0">
            {counters.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className={`group relative overflow-hidden px-5 py-5 transition-colors duration-300 hover:bg-orange-500/5 sm:px-7 sm:py-6 ${
                    index !== 0 ? "sm:border-l sm:border-zinc-800" : ""
                  }`}
                >
                  <div className="absolute left-0 top-0 h-[2px] w-0 bg-orange-500 transition-all duration-500 group-hover:w-full" />

                  <div className="relative flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-black tracking-tight text-white transition-colors duration-300 group-hover:text-orange-400 sm:text-3xl">
                        <CountUp value={Number(stat.value) || 0} />
                      </div>
                      <div className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500 transition-colors duration-300 group-hover:text-orange-400">
                        {stat.label}
                      </div>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-zinc-800 bg-zinc-900 text-zinc-500 transition-all duration-300 group-hover:border-orange-500/50 group-hover:bg-orange-500 group-hover:text-black">
                      <Icon size={19} />
                    </div>
                  </div>
                </div>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* =========================================================
          CLUBS ON THE PLATFORM
      ========================================================= */}
      <section className="border-b border-zinc-800 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
                <span className="h-px w-8 bg-orange-500" />
                Club Directory
              </div>

              <h2 className="mt-5 text-[34px] font-black leading-tight text-white sm:text-[44px]">
                Clubs running on
                <span className="block font-normal text-orange-500">Sports Hub right now.</span>
              </h2>
            </div>

            <Link
              to="/clubs"
              className="inline-flex w-fit items-center gap-2 border border-zinc-700 px-5 py-3 text-[11px] font-black uppercase tracking-wider text-zinc-200 transition hover:border-orange-500 hover:text-white"
            >
              View all clubs
              <ArrowRight size={14} />
            </Link>
          </Reveal>

          {featured.length === 0 ? (
            <div className="mt-12 border border-zinc-800 bg-[#0e0e11] px-6 py-14 text-center">
              <Building2 size={32} className="mx-auto text-zinc-700" />
              <h3 className="mt-4 text-lg font-bold text-white">No clubs are listed yet</h3>
              <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-zinc-500">
                As soon as a club is approved onto the platform it appears here with its
                facilities, coaches and membership plans.
              </p>
              <Link
                to="/for-clubs"
                className="mt-6 inline-flex items-center gap-2 bg-orange-500 px-6 py-3 text-[11px] font-black uppercase tracking-wider text-black transition hover:bg-white"
              >
                List your club
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <Reveal group className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((club) => (
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
                        <Trophy size={32} className="text-zinc-700" />
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
                        <Dumbbell size={13} className="text-orange-500" />
                        {club.SportCount || 0} sport{Number(club.SportCount) === 1 ? "" : "s"}
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
            </Reveal>
          )}
        </div>
      </section>

      {/* =========================================================
          HOW MEMBERS JOIN
      ========================================================= */}
      <section className="border-b border-zinc-800 bg-[#09090b] py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              For Members
            </div>

            <h2 className="mt-5 text-[34px] font-black leading-tight text-white sm:text-[44px]">
              Joining a club takes
              <span className="block font-normal text-orange-500">four short steps.</span>
            </h2>

            <p className="mt-4 text-[14px] leading-7 text-zinc-400">
              No paperwork at the front desk, no phone calls to check whether your payment
              arrived. Everything happens in your own dashboard.
            </p>
          </Reveal>

          <Reveal group className="mt-14 grid border-l border-t border-zinc-800 md:grid-cols-2 lg:grid-cols-4">
            {MEMBER_STEPS.map((step) => (
              <div
                key={step.number}
                className="border-b border-r border-zinc-800 p-7 transition hover:bg-zinc-900/40 sm:p-8"
              >
                <div className="text-5xl font-black text-orange-500/30">{step.number}</div>
                <h3 className="mt-6 text-[16px] font-black text-white">{step.title}</h3>
                <p className="mt-2 text-[12px] leading-6 text-zinc-400">{step.body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* =========================================================
          WHAT'S INSIDE
      ========================================================= */}
      <section className="border-b border-zinc-800 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
                <span className="h-px w-8 bg-orange-500" />
                What is inside
              </div>

              <h2 className="mt-5 text-[34px] font-black leading-tight text-white sm:text-[44px]">
                One system for the front desk,
                <span className="block font-normal text-orange-500">
                  the coaches and the accounts.
                </span>
              </h2>
            </div>

            <p className="text-[14px] leading-7 text-zinc-400">
              Every module below is part of the platform - nothing is sold as an add-on,
              and every club gets all of it inside its own workspace.
            </p>
          </Reveal>

          <Reveal group className="mt-14 grid border-l border-t border-zinc-800 sm:grid-cols-2 lg:grid-cols-4">
            {MODULES.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.title}
                  className="group border-b border-r border-zinc-800 p-7 transition hover:border-orange-500/40 hover:bg-orange-500/5"
                >
                  <div className="flex h-11 w-11 items-center justify-center border border-zinc-700 bg-zinc-900 text-orange-500 transition group-hover:border-orange-500 group-hover:bg-orange-500 group-hover:text-black">
                    <Icon size={20} />
                  </div>

                  <h3 className="mt-6 text-[15px] font-bold text-white">{module.title}</h3>
                  <p className="mt-2 text-[11.5px] leading-6 text-zinc-400">{module.body}</p>
                </div>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* =========================================================
          FOR CLUB OWNERS
      ========================================================= */}
      <section className="border-b border-zinc-800 bg-[#09090b] py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Reveal variant="left">
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              For Club Owners
            </div>

            <h2 className="mt-5 text-[34px] font-black leading-tight text-white sm:text-[44px]">
              Bring your club onto
              <span className="block font-normal text-orange-500">the platform.</span>
            </h2>

            <p className="mt-5 text-[14px] leading-7 text-zinc-400">
              You get a private admin workspace, a public page on the directory that brings
              members to you, and a member portal that answers "did my payment arrive?"
              without a phone call.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                "Your own workspace, separate from every club",
                "Public club page with plans and events",
                "Member, staff and coach roles built in",
                "Reports across fees, attendance and payroll",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 border-b border-zinc-800 pb-3">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-orange-500" />
                  <span className="text-[12px] font-semibold leading-5 text-zinc-200">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/for-clubs"
                className="inline-flex items-center gap-2 bg-orange-500 px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-black transition hover:bg-white"
              >
                See plans & get started
                <ArrowRight size={15} />
              </Link>

              <Link
                to="/owner/login"
                className="inline-flex items-center gap-2 border-b-2 border-orange-500 pb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-white transition hover:text-orange-400"
              >
                Owner sign in
              </Link>
            </div>
          </Reveal>

          <Reveal variant="right" delay={120} className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Building2, value: stats?.TotalClubs ?? 0, label: "Clubs live" },
              { icon: Users, value: stats?.MemberCount ?? 0, label: "Active memberships" },
              { icon: Sparkles, value: stats?.CoachCount ?? 0, label: "Coaches on staff" },
              { icon: Trophy, value: stats?.UpcomingEvents ?? 0, label: "Events scheduled" },
            ].map((card) => (
              <div key={card.label} className="border border-zinc-800 bg-[#0e0e11] p-6">
                <card.icon size={20} className="text-orange-500" />
                <div className="mt-5 text-3xl font-black text-white">
                  <CountUp value={Number(card.value) || 0} />
                </div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  {card.label}
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* =========================================================
          ISOLATION
      ========================================================= */}
      <section className="border-b border-zinc-800 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              Privacy by design
            </div>

            <h2 className="mt-5 text-[34px] font-black leading-tight text-white sm:text-[44px]">
              Every club keeps its
              <span className="block font-normal text-orange-500">own books.</span>
            </h2>
          </Reveal>

          <Reveal group className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Lock,
                title: "Separated in the database",
                body: "Clubs are isolated at row level inside the database itself, not just hidden in the interface. A query issued for one club cannot return another club's members, vouchers or receipts.",
              },
              {
                icon: ShieldCheck,
                title: "Roles decide what you see",
                body: "Admins, coaches and members each get their own view. A club admin sees only the people who hold a membership with that club - never the account list of the platform.",
              },
              {
                icon: Receipt,
                title: "Every payment has a trail",
                body: "Vouchers, uploaded receipts, approvals and fines are stored as records with dates and status, so disputes are settled by the history rather than memory.",
              },
            ].map((card) => (
              <div key={card.title} className="border border-zinc-800 bg-[#0e0e11] p-7">
                <div className="flex h-11 w-11 items-center justify-center border border-orange-500/40 bg-orange-500/10">
                  <card.icon size={19} className="text-orange-500" />
                </div>
                <h3 className="mt-5 text-[15px] font-black text-white">{card.title}</h3>
                <p className="mt-2 text-[12px] leading-6 text-zinc-400">{card.body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* =========================================================
          FAQ
      ========================================================= */}
      <section id="faq" className="scroll-mt-24 border-b border-zinc-800 bg-[#09090b] py-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <div className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              Frequently Asked Questions
              <span className="h-px w-8 bg-orange-500" />
            </div>

            <h2 className="mt-5 text-[34px] font-black leading-tight text-white sm:text-[44px]">
              Questions members
              <span className="block font-normal text-orange-500">usually ask first.</span>
            </h2>
          </Reveal>

          <Reveal group className="mt-12 space-y-3">
            {FAQ.map((item, index) => {
              const isOpen = openFAQ === index;

              return (
                <div
                  key={item.question}
                  className={`border bg-[#0e0e11] transition duration-200 ${
                    isOpen ? "border-orange-500" : "border-zinc-800"
                  }`}
                >
                  <button
                    onClick={() => setOpenFAQ(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-5 px-6 py-5 text-left"
                  >
                    <span className="text-[13.5px] font-bold text-white sm:text-[15px]">
                      {item.question}
                    </span>

                    {isOpen ? (
                      <ChevronUp size={19} className="shrink-0 text-orange-500" />
                    ) : (
                      <ChevronDown size={19} className="shrink-0 text-zinc-500" />
                    )}
                  </button>

                  <div
                    className={`grid transition-all duration-300 ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 text-[13px] leading-7 text-zinc-400">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="relative overflow-hidden py-24">
        <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[130px]" />

        <div className="relative mx-auto flex max-w-7xl flex-col justify-between gap-10 px-5 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <Reveal variant="left" className="max-w-2xl">
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              Start today
            </div>

            <h2 className="mt-5 text-[34px] font-black leading-tight text-white sm:text-[46px]">
              Find your club, or
              <span className="block font-normal text-orange-500">bring yours online.</span>
            </h2>

            <p className="mt-5 max-w-xl text-[14px] leading-7 text-zinc-400">
              Members join a club in minutes. Club owners get a complete management system
              and a public page that keeps bringing in new members.
            </p>
          </Reveal>

          <Reveal variant="right" delay={120} className="flex flex-wrap gap-3">
            <Link
              to="/clubs"
              className="inline-flex items-center gap-3 bg-orange-500 px-8 py-4 text-xs font-black uppercase tracking-wider text-black transition-all hover:bg-white"
            >
              Browse clubs
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center gap-3 border border-zinc-700 px-8 py-4 text-xs font-black uppercase tracking-wider text-white transition hover:border-orange-500 hover:text-orange-400"
            >
              Create an account
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
