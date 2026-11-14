import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Home, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../common/ThemeToggle";

/**
 * Shared public website navbar.
 *
 * Four destinations only - the club directory, the software offer, what the
 * platform does, and who we are. Everything else the old navbar carried
 * (Membership Plans, FAQ, portal links, a separate owner button) is either an
 * in-page section or reachable from one of these four pages, so the header no
 * longer competes with itself for attention.
 *
 * The header is wrapped in `keep-dark`, which means the light/dark theme switch
 * never restyles it - it always looks the way it does in the original (dark)
 * design.
 */
const NAV_LINKS = [
  { name: "Home", to: "/" },
  { name: "Clubs", to: "/clubs" },
  { name: "For Clubs", to: "/for-clubs" },
  { name: "Services", to: "/services" },
  { name: "About", to: "/about" },
];

function PublicNavbar() {
  const { isAuthenticated, role, logout, activeClub } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the drawer whenever we land on another page
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  // Scroll to in-page sections after navigating with a hash (e.g. /for-clubs#pricing)
  useEffect(() => {
    if (!location.hash) return undefined;
    const id = location.hash.replace("#", "");
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 160);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash]);

  const handleNav = (event, to) => {
    if (event) event.preventDefault();
    setIsMobileMenuOpen(false);

    const [rawPath, hash] = to.split("#");
    const path = rawPath || "/";

    if (hash && location.pathname === path) {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    navigate(to);
    if (!hash) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isActive = (to) => {
    const path = to.split("#")[0] || "/";
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const dashboardPath =
    role === "admin" ? "/admin/dashboard" : role === "coach" ? "/coach/dashboard" : "/user/dashboard";
  const portalLabel =
    role === "admin" ? "Admin Panel" : role === "coach" ? "Coach Portal" : "My Dashboard";
  const portalName = activeClub?.name ? activeClub.name : portalLabel;

  return (
    <>
      <header
        className={`keep-dark fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "border-b border-[#e8e1e8] bg-white/95 shadow-sm backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-[82px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          {/* LOGO */}
          <Link to="/" onClick={(event) => handleNav(event, "/")} className="group flex items-center gap-3">
            <div
              className={`flex h-12 w-[92px] items-center justify-center overflow-hidden rounded-lg border transition-all duration-300 ${
                isScrolled
                  ? "border-[#e4dce5] bg-[#0c0c0e] shadow-sm"
                  : "border-white/20 bg-black/40 backdrop-blur-md"
              }`}
            >
              <img
                src="/sports-hub-logo.svg"
                alt="Sports Hub Logo"
                className="h-8 w-auto object-contain"
              />
            </div>

            <div className="text-left">
              <div
                className={`text-lg font-extrabold leading-none tracking-tight transition-colors ${
                  isScrolled ? "text-[#18181b]" : "text-white"
                }`}
              >
                SPORTS
                <span
                  className={`ml-1 font-light ${
                    isScrolled ? "text-orange-500" : "text-orange-400"
                  }`}
                >
                  HUB
                </span>
              </div>
              <div
                className={`mt-1 text-[8px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                  isScrolled ? "text-[#71717a]" : "text-white/65"
                }`}
              >
                Sports Club Management
              </div>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-9 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                to={link.to}
                onClick={(event) => handleNav(event, link.to)}
                className={`relative text-[13px] font-semibold transition-colors after:absolute after:-bottom-2 after:left-0 after:h-[2px] after:bg-orange-500 after:transition-all after:duration-300 ${
                  isActive(link.to) ? "after:w-full" : "after:w-0 hover:after:w-full"
                } ${
                  isActive(link.to)
                    ? isScrolled
                      ? "text-orange-600"
                      : "text-white"
                    : isScrolled
                      ? "text-[#27272a] hover:text-orange-600"
                      : "text-white/85 hover:text-orange-400"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* DESKTOP ACTIONS */}
          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  className="inline-flex max-w-[220px] items-center gap-2 bg-orange-500 px-5 py-2.5 text-[12px] font-bold text-black transition-all hover:bg-black hover:text-white"
                >
                  <Home size={14} className="shrink-0" />
                  <span className="truncate">{portalName}</span>
                </Link>

                <button
                  onClick={logout}
                  className={`px-4 py-2.5 text-[12px] font-semibold transition ${
                    isScrolled
                      ? "border border-[#dcd2df] text-[#18181b] hover:bg-zinc-100"
                      : "border border-white/25 text-white hover:bg-white/10"
                  }`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={(event) => handleNav(event, "/login")}
                  className={`px-4 py-2.5 text-[12px] font-semibold transition ${
                    isScrolled
                      ? "text-[#27272a] hover:text-orange-600"
                      : "text-white/85 hover:text-orange-400"
                  }`}
                >
                  Sign in
                </Link>

                <Link
                  to="/clubs"
                  onClick={(event) => handleNav(event, "/clubs")}
                  className="inline-flex items-center gap-2 bg-orange-500 px-5 py-2.5 text-[12px] font-bold text-black transition-all hover:bg-black hover:text-white"
                >
                  Join a Club
                  <ArrowRight size={14} />
                </Link>
              </>
            )}

            <ThemeToggle variant={isScrolled ? "surface" : "overlay"} />
          </div>

          {/* MOBILE: THEME SWITCH + MENU */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <ThemeToggle variant={isScrolled ? "surface" : "overlay"} />
            <button
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className={`rounded-full p-2 transition ${
                isScrolled ? "text-[#18181b]" : "text-white"
              }`}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={25} /> : <Menu size={25} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`border-t border-[#e8e1e8] bg-[#0c0c0e] shadow-2xl transition-all duration-300 lg:hidden ${
            isMobileMenuOpen
              ? "max-h-[560px] opacity-100"
              : "pointer-events-none max-h-0 overflow-hidden opacity-0"
          }`}
        >
          <div className="px-5 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                to={link.to}
                onClick={(event) => handleNav(event, link.to)}
                className={`block w-full border-b border-white/10 py-3.5 text-left text-sm font-semibold transition-colors ${
                  isActive(link.to) ? "text-orange-500" : "text-white/90 hover:text-orange-400"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="mt-5 flex items-center gap-2.5 pb-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to={dashboardPath}
                    className="flex flex-1 items-center justify-center gap-2 bg-orange-500 py-3 text-[12px] font-bold text-black"
                  >
                    <Home size={14} />
                    <span className="truncate">{portalName}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="border border-white/25 px-4 py-3 text-[12px] font-semibold text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={(event) => handleNav(event, "/login")}
                    className="flex-1 border border-white/25 py-3 text-center text-[12px] font-semibold text-white"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/clubs"
                    onClick={(event) => handleNav(event, "/clubs")}
                    className="flex flex-1 items-center justify-center gap-1.5 bg-orange-500 py-3 text-[12px] font-bold text-black"
                  >
                    Join a Club
                    <ArrowRight size={13} />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OUTSIDE CLICK BACKDROP */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

export default PublicNavbar;
