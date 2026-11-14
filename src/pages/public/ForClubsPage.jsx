import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Rocket,
  ShieldCheck,
  Users,
} from "lucide-react";
import api from "../../services/api";
import PageLoader from "../../components/dashboard/PageLoader";
import { useAuth } from "../../context/AuthContext";

const money = (value) =>
  value === null || value === undefined ? "-" : `PKR ${Number(value).toLocaleString("en-PK")}`;

const STEPS = [
  {
    icon: ClipboardList,
    title: "Tell us about your club",
    body: "Create your owner account and fill in your company name, contact details and expected members.",
  },
  {
    icon: CreditCard,
    title: "Pick a plan and pay",
    body: "Choose Starter, Growth or Enterprise, transfer the fee and attach a photo of the receipt.",
  },
  {
    icon: BadgeCheck,
    title: "We approve your request",
    body: "The platform owner reviews the request and creates your club's own admin login - separate from every other club.",
  },
  {
    icon: Rocket,
    title: "Run your club",
    body: "Add your plans, sports, coaches and members. Your public page goes live on the club directory.",
  },
];

const FEATURES = [
  "Member applications, memberships and renewals",
  "Monthly fee vouchers with late-fine calculation",
  "Payment uploads with admin verification",
  "Coaches, trainers, staff attendance and salary register",
  "Teams, tournaments, fixtures and equipment",
  "Announcements, events and notifications",
  "Reports and analytics for every module",
  "A public club page on the platform directory",
];

/**
 * The software's own marketing/pricing page - the page a club owner sees when
 * they arrive to buy the system. Deliberately separate from the club directory:
 * one sells the software, the other sells club memberships.
 */
const ForClubsPage = () => {
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const { data } = await api.get("/public/pricing");
        if (alive && data.success) setPlans(data.data || []);
      } catch (error) {
        console.error("Could not load pricing:", error.message);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  const startLink = "/sell/subscribe";

  return (
    <div className="bg-[#0c0c0e]">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-zinc-800 py-24">
        <div className="absolute -left-32 top-0 h-[480px] w-[480px] rounded-full bg-orange-500/10 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
            <span className="h-px w-8 bg-orange-500" />
            For Club Owners
          </div>

          <h1 className="mt-6 max-w-3xl text-[38px] font-black leading-tight text-white sm:text-[54px]">
            Run your whole club
            <span className="block font-normal text-orange-500">from one dashboard.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-[14px] leading-7 text-zinc-400">
            Sports Hub is the software behind the club: memberships, monthly fees,
            coaching staff, payroll, tournaments and a public page that brings new
            members to you. Each club gets its own private workspace - no other club
            can see your members, your money or your reports.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to={startLink}
              className="inline-flex items-center gap-2 bg-orange-500 px-7 py-4 text-[11px] font-black uppercase tracking-wider text-black transition hover:bg-white"
            >
              Start your request
              <ArrowRight size={15} />
            </Link>

            <a
              href="#pricing"
              className="inline-flex items-center gap-2 border border-zinc-700 px-7 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-300 transition hover:border-orange-500 hover:text-white"
            >
              See pricing
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-[11px] text-zinc-500">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={14} className="text-orange-500" />
              Club data is isolated
            </span>
            <span className="inline-flex items-center gap-2">
              <Users size={14} className="text-orange-500" />
              Unlimited member logins
            </span>
            <span className="inline-flex items-center gap-2">
              <Building2 size={14} className="text-orange-500" />
              One admin account per club
            </span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8">
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">
          How it works
        </h2>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <div key={step.title} className="border border-zinc-800 bg-[#0e0e11] p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center border border-orange-500/40 bg-orange-500/10">
                  <step.icon size={17} className="text-orange-500" />
                </div>
                <span className="text-[26px] font-black text-zinc-800">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <h3 className="mt-5 text-[13.5px] font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-[11.5px] leading-6 text-zinc-500">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-y border-zinc-800 bg-[#09090b] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">
            Software pricing
          </h2>
          <p className="mt-3 max-w-2xl text-[13px] leading-7 text-zinc-400">
            The fee is for the software, not for your members. Pick a tier that matches
            your club's size - you can move up at any time.
          </p>

          {loading ? (
            <div className="mt-10">
              <PageLoader message="Loading plans..." />
            </div>
          ) : plans.length === 0 ? (
            <div className="mt-10 border border-zinc-800 bg-[#0e0e11] px-6 py-12 text-center text-[13px] text-zinc-500">
              Pricing has not been published yet. Contact us for a quote.
            </div>
          ) : (
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {plans.map((plan, index) => {
                const featured = plans.length === 3 ? index === 1 : plans.length > 1 && index === 0;

                return (
                  <div
                    key={plan.PlanID}
                    className={`relative flex flex-col border p-7 transition ${
                      featured
                        ? "border-orange-500 bg-[#121215]"
                        : "border-zinc-800 bg-[#0e0e11] hover:border-zinc-700"
                    }`}
                  >
                    {featured && (
                      <span className="absolute -top-3 left-7 bg-orange-500 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-black">
                        Most popular
                      </span>
                    )}

                    <h3 className="text-[15px] font-black text-white">{plan.PlanName}</h3>
                    {plan.Description && (
                      <p className="mt-2 text-[11.5px] leading-6 text-zinc-500">
                        {plan.Description}
                      </p>
                    )}

                    <div className="mt-6">
                      <div className="flex items-end gap-1">
                        <span className="text-[28px] font-black text-white">
                          {money(plan.PriceMonthly)}
                        </span>
                        <span className="pb-1.5 text-[11px] text-zinc-500">/month</span>
                      </div>
                      <p className="mt-1 text-[11px] text-zinc-500">
                        or {money(plan.PriceYearly)} per year
                      </p>
                    </div>

                    <ul className="mt-6 space-y-2.5 text-[12px] text-zinc-400">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={13} className="shrink-0 text-orange-500" />
                        Up to {plan.MaxMembers} members
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={13} className="shrink-0 text-orange-500" />
                        Up to {plan.MaxCoaches} coaches
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={13} className="shrink-0 text-orange-500" />
                        Up to {plan.MaxSports} sports
                      </li>
                    </ul>

                    {plan.Features && (
                      <p className="mt-5 border-t border-zinc-800 pt-4 text-[11.5px] leading-6 text-zinc-500">
                        {plan.Features}
                      </p>
                    )}

                    <Link
                      to={`${startLink}?plan=${plan.PlanID}`}
                      className={`mt-7 inline-flex items-center justify-center gap-2 px-5 py-3 text-[11px] font-black uppercase tracking-wider transition ${
                        featured
                          ? "bg-orange-500 text-black hover:bg-white"
                          : "border border-zinc-700 text-zinc-200 hover:border-orange-500 hover:text-white"
                      }`}
                    >
                      Choose {plan.PlanName}
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">
              Everything included
            </h2>
            <h3 className="mt-4 text-[28px] font-black leading-tight text-white sm:text-[34px]">
              One system for the front desk,
              <span className="block font-normal text-orange-500">the coaches and the accounts.</span>
            </h3>
            <p className="mt-5 text-[13px] leading-7 text-zinc-400">
              No spreadsheets, no WhatsApp groups for fee reminders. Every module below is
              part of the platform - nothing is sold as an add-on.
            </p>

            <Link
              to={startLink}
              className="mt-8 inline-flex items-center gap-2 bg-orange-500 px-7 py-4 text-[11px] font-black uppercase tracking-wider text-black transition hover:bg-white"
            >
              <LayoutDashboard size={15} />
              {isAuthenticated ? "Continue your request" : "Create your club workspace"}
            </Link>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 border border-zinc-800 bg-[#0e0e11] px-4 py-3.5 text-[12px] text-zinc-300"
              >
                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-orange-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default ForClubsPage;
