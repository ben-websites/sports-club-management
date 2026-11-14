import { Link, Outlet, useLocation } from "react-router-dom";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import PublicNavbar from "../components/public/PublicNavbar";

const FOOTER_LINKS = [
  {
    heading: "Explore",
    links: [
      { name: "Home", to: "/" },
      { name: "About Us", to: "/about" },
      { name: "Services", to: "/services" },
      { name: "Find a Club", to: "/clubs" },
    ],
  },
  {
    heading: "For Members",
    links: [
      { name: "Create an account", to: "/register" },
      { name: "Member sign in", to: "/login" },
      { name: "Browse clubs", to: "/clubs" },
    ],
  },
  {
    heading: "For Club Owners",
    links: [
      { name: "Get the software", to: "/for-clubs" },
      { name: "Owner sign in", to: "/owner/login" },
      { name: "Check my request", to: "/sell/status" },
    ],
  },
];

/**
 * The public website's shell.
 *
 * One React app, two independent shells: this one is the website (marketing,
 * directory, sign-up for the software) and it deliberately has no navigation
 * into the workspace - the workspace has its own layout. That separation is
 * what lets the two halves be split into separate builds later on.
 */
const PublicSiteLayout = ({ children }) => {
  const location = useLocation();

  // The landing page's hero sits behind the transparent navbar; every other
  // public page starts below it.
  const isHome = location.pathname === "/";

  return (
    <div className="flex min-h-screen flex-col bg-[#0c0c0e] font-sans text-zinc-300">
      <PublicNavbar />

      {/* The navbar is fixed and 82px tall. */}
      <main className={`flex-1 ${isHome ? "" : "pt-[82px]"}`}>
        {children || <Outlet />}
      </main>

      <footer className="border-t border-zinc-800 bg-[#09090b] text-zinc-400">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 border-b border-zinc-800 pb-14 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-[86px] items-center justify-center overflow-hidden rounded-lg border border-orange-500/40 bg-zinc-900 px-1.5">
                  <img
                    src="/sports-hub-logo.svg"
                    alt="Sports Hub Logo"
                    className="h-7 w-auto object-contain"
                  />
                </div>

                <div>
                  <div className="text-xl font-black text-white">
                    SPORTS <span className="text-orange-500">HUB</span>
                  </div>
                  <div className="mt-0.5 text-[8.5px] uppercase tracking-[0.22em] text-zinc-400">
                    Club Management Platform
                  </div>
                </div>
              </div>

              <p className="mt-6 max-w-sm text-[13px] leading-7">
                One platform, every club. Sports Hub runs memberships, fees, coaching,
                events and payroll for clubs across the country - and gives members a
                single place to find the club that fits them.
              </p>

              <ul className="mt-7 space-y-3 text-[13px]">
                <li className="flex items-center gap-3">
                  <Mail size={15} className="text-orange-500" />
                  support@sportshub.com
                </li>
                <li className="flex items-center gap-3">
                  <ShieldCheck size={15} className="text-orange-500" />
                  Each club runs in its own isolated workspace
                </li>
              </ul>
            </div>

            {FOOTER_LINKS.map((group) => (
              <div key={group.heading} className="md:col-span-2">
                <h4 className="text-[11px] font-black uppercase tracking-[0.18em] text-white">
                  {group.heading}
                </h4>
                <ul className="mt-5 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.to}
                        className="text-[12.5px] transition-colors hover:text-orange-400"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="md:col-span-1">
              <h4 className="text-[11px] font-black uppercase tracking-[0.18em] text-white">
                Start
              </h4>
              <Link
                to="/for-clubs"
                className="mt-5 inline-flex items-center gap-2 bg-orange-500 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-black transition hover:bg-white"
              >
                Pricing
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 pt-8 text-[11px] sm:flex-row">
            <p>
              © {new Date().getFullYear()} Sports Hub. All rights reserved.
            </p>
            <p className="text-zinc-500">
              Every club's data is isolated and private.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicSiteLayout;
