import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  Dumbbell,
  Eye,
  HeartHandshake,
  Lock,
  Scale,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import api from "../../services/api";
import Reveal from "../../components/common/Reveal";

/**
 * About the platform (not about one club).
 *
 * The previous version of this page described a single physical club - a fake
 * founding team, a fictional address and invented athlete counts. The numbers
 * below are read from /public/stats, so they always describe the clubs that are
 * actually running on Sports Hub today.
 */
const PRINCIPLES = [
  {
    icon: Eye,
    title: "Nothing hidden",
    body: "A member can see the voucher, the amount, the due date and whether the payment was verified. An admin can see which member sent what and when. Both sides work from the same records.",
  },
  {
    icon: Scale,
    title: "Rules applied the same way",
    body: "Late fines, admission fees and prepaid months are calculated by the system, not by whoever is at the desk that day - so two members in the same situation are treated identically.",
  },
  {
    icon: Lock,
    title: "Clubs stay separate",
    body: "Every club works inside its own workspace, and the separation is enforced in the database itself. One club's admin never sees another club's members, money or reports.",
  },
  {
    icon: HeartHandshake,
    title: "Built for the front desk",
    body: "The people who actually run clubs helped shape the flow: approve an application, generate vouchers, verify a receipt, mark attendance. Few clicks, no spreadsheets.",
  },
];

const PILLARS = [
  {
    icon: Users,
    title: "Membership lifecycle",
    body: "Applications, approvals, renewals, suspensions and club switching - with each club's own plans and prices.",
  },
  {
    icon: CreditCard,
    title: "The money trail",
    body: "Monthly vouchers, uploaded bank receipts, admin verification, late fines and prepaid months in one ledger.",
  },
  {
    icon: Dumbbell,
    title: "Coaching & operations",
    body: "Coaches, sessions, attendance, teams, tournaments, equipment and a salary register for staff.",
  },
  {
    icon: Building2,
    title: "A public presence",
    body: "Each club gets a page on the directory with its facilities, coaches, events and plans, so new members can find it.",
  },
];

const AUDIENCES = [
  {
    icon: Users,
    title: "For members",
    body: "One account for every club you belong to. See your vouchers, upload receipts, book into events and keep your digital membership card in your pocket.",
    to: "/clubs",
    cta: "Browse the directory",
  },
  {
    icon: Building2,
    title: "For club owners",
    body: "A complete back office for members, fees, coaching, attendance and payroll - plus a public page that brings new members to your door.",
    to: "/for-clubs",
    cta: "See the software plans",
  },
  {
    icon: Sparkles,
    title: "For coaches",
    body: "See the members assigned to you, run your sessions, mark attendance and keep an eye on progress without chasing paperwork.",
    to: "/for-clubs",
    cta: "How clubs get started",
  },
];

function AboutPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const { data } = await api.get("/public/stats");
        if (alive && data.success) setStats(data.stats || {});
      } catch (error) {
        console.error("Could not load platform stats:", error.message);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  const counters = [
    { value: stats?.TotalClubs ?? 0, label: "Clubs on the platform", icon: Building2 },
    { value: stats?.SportCount ?? 0, label: "Sports offered", icon: Dumbbell },
    { value: stats?.MemberCount ?? 0, label: "Active memberships", icon: Users },
    { value: stats?.CoachCount ?? 0, label: "Coaches on staff", icon: Trophy },
  ];

  return (
    <div className="page-enter bg-[#0c0c0e] font-sans text-zinc-100">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-zinc-800 py-20 sm:py-24">
        <div className="pointer-events-none absolute -left-32 top-0 h-[460px] w-[460px] rounded-full bg-orange-500/10 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              About Sports Hub
            </div>

            <h1 className="mt-6 max-w-4xl text-[36px] font-black leading-[1.08] tracking-tight text-white sm:text-[52px]">
              The operating system
              <span className="block font-normal text-orange-500">for sports clubs.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-[14px] leading-7 text-zinc-400 sm:text-[15px]">
              Sports Hub is software, not a gym. Clubs subscribe to it to run their
              memberships, fees, coaching and events; members use it to join a club, pay
              their dues and keep their membership card in one place. Every club gets its
              own private workspace under one roof.
            </p>
          </Reveal>

          <Reveal group className="mt-14 grid border-l border-t border-zinc-800 sm:grid-cols-2 lg:grid-cols-4">
            {counters.map((stat) => (
              <div key={stat.label} className="border-b border-r border-zinc-800 p-6">
                <stat.icon size={19} className="text-orange-500" />
                <div className="mt-5 text-3xl font-black text-white">
                  {Number(stat.value).toLocaleString()}
                </div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* WHY IT EXISTS */}
      <section className="border-b border-zinc-800 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Reveal variant="left" className="relative">
            <div className="relative overflow-hidden border border-zinc-800 bg-[#0e0e11] p-8 sm:p-10">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-orange-500/15 blur-[80px]" />

              <div className="relative">
                <img
                  src="/sports-hub-logo.svg"
                  alt="Sports Hub"
                  className="h-14 w-auto object-contain"
                />

                <div className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Live platform totals
                </div>

                <div className="mt-4 divide-y divide-zinc-800 border-y border-zinc-800">
                  {[
                    { label: "Clubs live", value: stats?.TotalClubs ?? 0 },
                    { label: "Active memberships", value: stats?.MemberCount ?? 0 },
                    { label: "Membership plans", value: stats?.PlanCount ?? 0 },
                    { label: "Coaches on staff", value: stats?.CoachCount ?? 0 },
                    { label: "Cities", value: stats?.CityCount ?? 0 },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between py-3">
                      <span className="text-[12px] font-semibold text-zinc-400">{row.label}</span>
                      <span className="text-lg font-black text-white">
                        {Number(row.value).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mt-5 text-[11.5px] leading-6 text-zinc-500">
                  Counted from the clubs that are approved and accepting members right now.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal variant="right" delay={120}>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              Why it exists
            </div>

            <h2 className="mt-5 text-[32px] font-black leading-[1.1] tracking-tight text-white sm:text-[42px]">
              Clubs were running
              <span className="block font-normal text-orange-500">on paper and memory.</span>
            </h2>

            <p className="mt-6 text-[14px] leading-8 text-zinc-300">
              A register at the front desk, a receipt book, a WhatsApp group for fee
              reminders and a spreadsheet that only one person understands. Ask "how much
              does this member owe?" and the answer depended on who you asked.
            </p>

            <p className="mt-4 text-[14px] leading-8 text-zinc-400">
              Sports Hub replaces that with one record per member, per plan, per payment.
              The admin sees the whole club, the coach sees their sessions, the member sees
              their own card and dues - and the numbers always match.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Memberships instead of registers",
                "Vouchers instead of receipt books",
                "Verified payments instead of phone calls",
                "One history per member, per club",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 border-b border-zinc-800 pb-3">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-orange-500" />
                  <span className="text-[12px] font-semibold leading-5 text-zinc-200">{item}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* WHAT IT DOES */}
      <section className="border-b border-zinc-800 bg-[#09090b] py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              What the platform covers
            </div>

            <h2 className="mt-5 text-[32px] font-black leading-tight text-white sm:text-[42px]">
              Four things every club
              <span className="block font-normal text-orange-500">has to get right.</span>
            </h2>
          </Reveal>

          <Reveal group className="mt-12 grid gap-5 sm:grid-cols-2">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="group border border-zinc-800 bg-[#0e0e11] p-7 transition hover:border-orange-500/60"
              >
                <div className="flex h-11 w-11 items-center justify-center border border-orange-500/40 bg-orange-500/10 transition group-hover:bg-orange-500 group-hover:text-black">
                  <pillar.icon size={19} className="text-orange-500 group-hover:text-black" />
                </div>
                <h3 className="mt-5 text-[16px] font-black text-white">{pillar.title}</h3>
                <p className="mt-2 text-[12.5px] leading-6 text-zinc-400">{pillar.body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="border-b border-zinc-800 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              How we build it
            </div>

            <h2 className="mt-5 text-[32px] font-black leading-tight text-white sm:text-[42px]">
              Four principles the
              <span className="block font-normal text-orange-500">product is held to.</span>
            </h2>
          </Reveal>

          <Reveal group className="mt-12 grid border-l border-t border-zinc-800 sm:grid-cols-2">
            {PRINCIPLES.map((principle, index) => (
              <div
                key={principle.title}
                className="border-b border-r border-zinc-800 p-7 transition hover:bg-orange-500/5 sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <principle.icon size={20} className="text-orange-500" />
                  <span className="text-2xl font-black text-zinc-800">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-5 text-[15px] font-black text-white">{principle.title}</h3>
                <p className="mt-2 text-[12px] leading-6 text-zinc-400">{principle.body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* AUDIENCES */}
      <section className="border-b border-zinc-800 bg-[#09090b] py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              Who it is for
            </div>

            <h2 className="mt-5 text-[32px] font-black leading-tight text-white sm:text-[42px]">
              Three people open
              <span className="block font-normal text-orange-500">Sports Hub every day.</span>
            </h2>
          </Reveal>

          <Reveal group className="mt-12 grid gap-6 md:grid-cols-3">
            {AUDIENCES.map((audience) => (
              <div
                key={audience.title}
                className="flex flex-col border border-zinc-800 bg-[#0e0e11] p-7 transition hover:border-orange-500/60"
              >
                <div className="flex h-11 w-11 items-center justify-center border border-zinc-700 bg-zinc-900">
                  <audience.icon size={19} className="text-orange-500" />
                </div>

                <h3 className="mt-5 text-[16px] font-black text-white">{audience.title}</h3>
                <p className="mt-2 flex-1 text-[12.5px] leading-6 text-zinc-400">
                  {audience.body}
                </p>

                <Link
                  to={audience.to}
                  className="mt-6 inline-flex items-center gap-2 border-b-2 border-orange-500 pb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-white transition hover:text-orange-400"
                >
                  {audience.cta}
                  <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-24">
        <div className="pointer-events-none absolute right-0 top-0 h-[420px] w-[420px] rounded-full bg-orange-500/10 blur-[130px]" />

        <div className="relative mx-auto flex max-w-7xl flex-col justify-between gap-10 px-5 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <Reveal variant="left" className="max-w-2xl">
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              Get involved
            </div>

            <h2 className="mt-5 text-[32px] font-black leading-tight text-white sm:text-[44px]">
              Join a club, or put
              <span className="block font-normal text-orange-500">your club on the map.</span>
            </h2>

            <p className="mt-5 max-w-xl text-[14px] leading-7 text-zinc-400">
              Membership takes minutes and costs nothing to start. Club owners can request
              the platform from the same website.
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
              to="/for-clubs"
              className="inline-flex items-center gap-3 border border-zinc-700 px-8 py-4 text-xs font-black uppercase tracking-wider text-white transition hover:border-orange-500 hover:text-orange-400"
            >
              For club owners
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
