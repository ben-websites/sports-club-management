import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Home, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../common/ThemeToggle";

/**
 * Shared public website navbar.
 * Used by the landing page, the About page and the Services page so all three
 * stay pixel-identical. The header is wrapped in `keep-dark`, which means the
 * light/dark theme switch never restyles it - it always looks the way it does
 * in the original (dark) design.
 */
const NAV_LINKS = [
  { name: "Home", to: "/" },
  { name: "About Us", to: "/about" },
  { name: "Services", to: "/services" },
  { name: "Sports Arenas", to: "/#sports" },
  { name: "Membership Plans", to: "/#plans" },
  { name: "Tournaments", to: "/#events" },
  { name: "FAQ", to: "/#faq" },
];

function PublicNavbar() {
  const { isAuthenticated, role, logout } = useAuth();
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

  // Scroll to in-page sections after navigating with a hash (e.g. /#plans)
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

  const dashboardPath = role === "admin" ? "/admin/dashboard" : "/user/dashboard";

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
          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                to={link.to}
                onClick={(event) => handleNav(event, link.to)}
                className={`relative text-[13px] font-semibold transition-colors ${
                  isScrolled
                    ? "text-[#27272a] hover:text-orange-600"
                    : "text-white/90 hover:text-orange-400"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* DESKTOP CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={dashboardPath}
                  className="inline-flex items-center gap-2 bg-orange-500 px-6 py-3 text-[12px] font-bold text-black transition-all hover:bg-black hover:text-white hover:shadow-lg"
                >
                  <Home size={15} />
                  {role === "admin" ? "Admin Panel" : "Members Dashboard"}
                </Link>

                <button
                  onClick={logout}
                  className={`px-4 py-3 text-[12px] font-semibold transition ${
                    isScrolled
                      ? "border border-[#dcd2df] text-[#18181b] hover:bg-zinc-100"
                      : "border border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                  }`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className={`border px-5 py-3 text-[12px] font-semibold transition ${
                    isScrolled
                      ? "border-[#dcd2df] text-[#18181b] hover:bg-zinc-100"
                      : "border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                  }`}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-orange-500 px-6 py-3 text-[12px] font-bold text-black transition-all hover:bg-black hover:text-white hover:shadow-lg"
                >
                  Get Started
                  <ArrowRight size={15} />
                </Link>
              </div>
            )}

            <ThemeToggle variant={isScrolled ? "surface" : "overlay"} />
          </div>

          {/* MOBILE THEME SWITCH + MENU */}
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

        {/* MOBILE AUTH BAR (always visible under the navbar) */}
        <div
          className={`flex items-center gap-2.5 border-t px-4 py-2.5 transition-colors duration-500 lg:hidden ${
            isScrolled
              ? "border-[#eee9ee] bg-white/95 backdrop-blur-xl"
              : "border-white/10 bg-black/60 backdrop-blur-md"
          }`}
        >
          {isAuthenticated ? (
            <>
              <Link
                to={dashboardPath}
                className="flex flex-1 items-center justify-center gap-2 bg-orange-500 py-2.5 text-[12px] font-bold text-black transition hover:bg-black hover:text-white"
              >
                <Home size={14} />
                {role === "admin" ? "Admin Panel" : "Members Dashboard"}
              </Link>
              <button
                onClick={logout}
                className={`border px-4 py-2.5 text-[12px] font-semibold transition ${
                  isScrolled
                    ? "border-[#dcd2df] text-[#18181b] hover:bg-zinc-100"
                    : "border-white/30 text-white hover:bg-white/10"
                }`}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`flex-1 border py-2.5 text-center text-[12px] font-semibold transition ${
                  isScrolled
                    ? "border-[#dcd2df] text-[#18181b] hover:bg-zinc-100"
                    : "border-white/30 text-white hover:bg-white/10"
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="flex flex-1 items-center justify-center gap-1.5 bg-orange-500 py-2.5 text-[12px] font-bold text-black transition hover:bg-black hover:text-white"
              >
                Get Started
                <ArrowRight size={13} />
              </Link>
            </>
          )}
        </div>

        {/* MOBILE MENU */}
        <div
          className={`border-t border-[#e8e1e8] bg-white shadow-2xl transition-all duration-300 lg:hidden ${
            isMobileMenuOpen
              ? "max-h-[600px] opacity-100"
              : "pointer-events-none max-h-0 overflow-hidden opacity-0"
          }`}
        >
          <div className="space-y-1 px-5 py-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                to={link.to}
                onClick={(event) => handleNav(event, link.to)}
                className="block w-full border-b border-[#eee9ee] py-4 text-left text-sm font-semibold text-[#18181b] transition-colors hover:text-orange-500"
              >
                {link.name}
              </Link>
            ))}
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
