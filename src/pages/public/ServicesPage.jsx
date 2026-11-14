import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  CalendarDays,
  ClipboardCheck,
  Coins,
  CreditCard,
  Dumbbell,
  FileBarChart,
  GraduationCap,
  LineChart,
  MapPin,
  Receipt,
  ShieldCheck,
  Trophy,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import api from "../../services/api";
import Reveal from "../../components/common/Reveal";

/**
 * What the platform actually does - grouped by who uses it.
 *
 * This page used to be a catalogue of one club's facilities (Olympic pool, ICC
 * pavilion, ...) with a large hard-coded list of amenities. Facilities belong to
 * a club, so they live on that club's page; what is genuinely platform-wide is
 * listed here, and the counters at the bottom are read from /public/stats.
 */
const MEMBER_SERVICES = [
  {
    icon: BadgeCheck,
    title: "Digital membership card",
    body: "Your club, plan, membership number and status - always current, always on your phone.",
  },
  {
    icon: Receipt,
    title: "Monthly fee vouchers",
    body: "Every voucher shows the amount, the due date and the deposit details. Download it or pay it in a few taps.",
  },
  {
    icon: CreditCard,
    title: "Receipt upload",
    body: "Paid at the bank or by mobile transfer? Upload a photo of the slip and follow its verification status.",
  },
  {
    icon: Wallet,
    title: "Advance payments",
    body: "Pay several months ahead and the platform records the prepaid period instead of billing you again.",
  },
  {
    icon: CalendarDays,
    title: "Training & events",
    body: "Your sessions, schedules and the club's upcoming events and tournaments, in the same dashboard.",
  },
  {
    icon: LineChart,
    title: "Progress & history",
    body: "Attendance, performance notes, and a complete record of every payment you have ever made.",
  },
];

const ADMIN_SERVICES = [
  {
    icon: Users,
    title: "Member approvals",
    body: "Review applications, approve or reject them, and suspend access for a member without touching their account elsewhere.",
  },
  {
    icon: BadgeCheck,
    title: "Plans & pricing",
    body: "Publish tiers with a monthly fee, admission fee, duration and sport allowance - the public page updates with them.",
  },
  {
    icon: Receipt,
    title: "Vouchers & fines",
    body: "Generate monthly vouchers for the whole club and let overdue ones collect a per-day fine automatically.",
  },
  {
    icon: CreditCard,
    title: "Payments & verifications",
    body: "Approve or reject uploaded receipts, track collected and pending amounts, and handle advance payments.",
  },
  {
    icon: GraduationCap,
    title: "Coaches & teams",
    body: "Add coaches with specialisations, assign members to teams, and keep tournament fixtures in order.",
  },
  {
    icon: ClipboardCheck,
    title: "Attendance",
    body: "Member and staff attendance, coach sessions and a salary register, all on one calendar.",
  },
  {
    icon: Wrench,
    title: "Equipment",
    body: "Track club equipment, what is issued, what is out and what needs replacing.",
  },
  {
    icon: FileBarChart,
    title: "Reports & analytics",
    body: "Revenue, dues, attendance, membership growth and payroll - exportable views for the committee.",
  },
];

const COACH_SERVICES = [
  {
    icon: CalendarDays,
    title: "Schedules",
    body: "See the sessions you are running and the members enrolled in each one.",
  },
  {
    icon: ClipboardCheck,
    title: "Attendance",
    body: "Mark attendance on the spot instead of handing a sheet back to the front desk.",
  },
  {
    icon: Trophy,
    title: "Training groups",
    body: "Track the members assigned to your groups, their performance notes and upcoming competitions.",
  },
  {
    icon: Bell,
    title: "Notices",
    body: "Get the club's announcements and equipment updates where you actually look.",
  },
];

function ServicesPage() {
  const [stats, setStats] = useState(null);
  const [clubs, setClubs] = useState([]);

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
        console.error("Could not load the services overview:", error.message);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  const counters = [
    { value: stats?.TotalClubs ?? 0, label: "Clubs live", icon: ShieldCheck },
    { value: stats?.SportCount ?? 0, label: "Sports offered", icon: Dumbbell },
    { value: stats?.TotalServices ?? 0, label: "Club services listed", icon: Wrench },
    { value: stats?.PlanCount ?? 0, label: "Membership plans", icon: Coins },
  ];

  return (
    <div className="page-enter bg-[#0c0c0e] font-sans text-zinc-100">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-zinc-800 py-20 sm:py-24">
        <div className="pointer-events-none absolute -right-28 top-0 h-[440px] w-[440px] rounded-full bg-orange-500/10 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              Services
            </div>

            <h1 className="mt-6 max-w-4xl text-[36px] font-black leading-[1.08] tracking-tight text-white sm:text-[52px]">
              Everything a club runs on.
              <span className="block font-normal text-orange-500">In one workspace.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-[14px] leading-7 text-zinc-400 sm:text-[15px]">
              Members get their dues, receipts and card. Admins get approvals, vouchers,
              coaching, attendance and reports. Coaches get their sessions. The facilities
              themselves - the pool, the courts, the gym - are listed on each club's own
              page, because they belong to that club.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/clubs"
                className="inline-flex items-center gap-3 bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-wider text-black transition-all hover:bg-white"
              >
                Browse clubs
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/for-clubs"
                className="inline-flex items-center gap-3 border border-zinc-700 px-7 py-4 text-xs font-bold uppercase tracking-wider text-white transition hover:border-orange-500 hover:text-orange-400"
              >
                Software plans
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOR MEMBERS */}
      <section className="border-b border-zinc-800 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              For Members
            </div>

            <h2 className="mt-5 text-[32px] font-black leading-tight text-white sm:text-[42px]">
              Your membership,
              <span className="block font-normal text-orange-500">without the paperwork.</span>
            </h2>
          </Reveal>

          <Reveal group className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MEMBER_SERVICES.map((service) => (
              <div
                key={service.title}
                className="group border border-zinc-800 bg-[#0e0e11] p-6 transition hover:border-orange-500/60"
              >
                <div className="flex h-11 w-11 items-center justify-center border border-zinc-700 bg-zinc-900 transition group-hover:border-orange-500 group-hover:bg-orange-500">
                  <service.icon size={19} className="text-orange-500 group-hover:text-black" />
                </div>
                <h3 className="mt-5 text-[15px] font-black text-white">{service.title}</h3>
                <p className="mt-2 text-[12px] leading-6 text-zinc-400">{service.body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* FOR ADMINS */}
      <section className="border-b border-zinc-800 bg-[#09090b] py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
                <span className="h-px w-8 bg-orange-500" />
                For Club Admins
              </div>

              <h2 className="mt-5 text-[32px] font-black leading-tight text-white sm:text-[42px]">
                The whole back office,
                <span className="block font-normal text-orange-500">inside one login.</span>
              </h2>
            </div>

            <p className="max-w-md text-[13px] leading-7 text-zinc-400">
              Every admin sees only their own club: members who hold a membership there,
              that club's vouchers, that club's money.
            </p>
          </Reveal>

          <Reveal group className="mt-12 grid border-l border-t border-zinc-800 sm:grid-cols-2 lg:grid-cols-4">
            {ADMIN_SERVICES.map((service) => (
              <div
                key={service.title}
                className="group border-b border-r border-zinc-800 p-6 transition hover:border-orange-500/40 hover:bg-orange-500/5"
              >
                <service.icon size={19} className="text-orange-500" />
                <h3 className="mt-5 text-[14px] font-black text-white">{service.title}</h3>
                <p className="mt-2 text-[11.5px] leading-6 text-zinc-400">{service.body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* FOR COACHES */}
      <section className="border-b border-zinc-800 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              For Coaches
            </div>

            <h2 className="mt-5 text-[32px] font-black leading-tight text-white sm:text-[42px]">
              Coaching tools, not
              <span className="block font-normal text-orange-500">admin clutter.</span>
            </h2>
          </Reveal>

          <Reveal group className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {COACH_SERVICES.map((service) => (
              <div key={service.title} className="border border-zinc-800 bg-[#0e0e11] p-6">
                <service.icon size={19} className="text-orange-500" />
                <h3 className="mt-5 text-[14px] font-black text-white">{service.title}</h3>
                <p className="mt-2 text-[11.5px] leading-6 text-zinc-400">{service.body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* LIVE NUMBERS */}
      <section className="border-b border-zinc-800 bg-[#09090b] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">
              What is live on the platform right now
            </h2>
            <p className="text-[11px] text-zinc-500">
              Counted from the clubs that have been approved and are accepting members.
            </p>
          </Reveal>

          <Reveal group className="mt-8 grid border-l border-t border-zinc-800 sm:grid-cols-2 lg:grid-cols-4">
            {counters.map((counter) => (
              <div key={counter.label} className="border-b border-r border-zinc-800 p-6">
                <counter.icon size={18} className="text-orange-500" />
                <div className="mt-5 text-3xl font-black text-white">
                  {Number(counter.value).toLocaleString()}
                </div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  {counter.label}
                </div>
              </div>
            ))}
          </Reveal>

          {clubs.length > 0 && (
            <Reveal className="mt-10">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                Facilities and services by club
              </div>

              <div className="mt-4 flex flex-wrap gap-2.5">
                {clubs.map((club) => (
                  <Link
                    key={club.ClubID || club.Slug}
                    to={`/clubs/${club.Slug}`}
                    className="inline-flex items-center gap-2 border border-zinc-800 bg-[#0e0e11] px-4 py-2.5 text-[12px] font-semibold text-zinc-300 transition hover:border-orange-500 hover:text-white"
                  >
                    <MapPin size={13} className="text-orange-500" />
                    {club.ClubName}
                    <span className="text-[10px] text-zinc-500">
                      {club.SportCount || 0} sport{Number(club.SportCount) === 1 ? "" : "s"}
                    </span>
                  </Link>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-24">
        <div className="pointer-events-none absolute left-0 top-0 h-[420px] w-[420px] rounded-full bg-orange-500/10 blur-[130px]" />

        <div className="relative mx-auto flex max-w-7xl flex-col justify-between gap-10 px-5 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <Reveal variant="left" className="max-w-2xl">
            <h2 className="text-[32px] font-black leading-tight text-white sm:text-[44px]">
              Pick a club and see
              <span className="block font-normal text-orange-500">what it offers.</span>
            </h2>

            <p className="mt-5 max-w-xl text-[14px] leading-7 text-zinc-400">
              Each club page lists its facilities, coaches, upcoming events and the exact
              membership plans you can apply for.
            </p>
          </Reveal>

          <Reveal variant="right" delay={120} className="flex flex-wrap gap-3">
            <Link
              to="/clubs"
              className="inline-flex items-center gap-3 bg-orange-500 px-8 py-4 text-xs font-black uppercase tracking-wider text-black transition-all hover:bg-white"
            >
              Find a club
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/about"
              className="inline-flex items-center gap-3 border border-zinc-700 px-8 py-4 text-xs font-black uppercase tracking-wider text-white transition hover:border-orange-500 hover:text-orange-400"
            >
              About the platform
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

export default ServicesPage;
