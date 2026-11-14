import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { name: "Overview", path: "/platform", icon: LayoutDashboard, exact: true },
  { name: "Requests", path: "/platform/requests", icon: ShieldCheck },
  { name: "Clubs", path: "/platform/clubs", icon: Building2 },
  { name: "Plans", path: "/platform/plans", icon: BarChart3 },
  { name: "Revenue", path: "/platform/revenue", icon: Wallet },
];

/**
 * The software owner's console.
 *
 * This is the only place in the app that reads across clubs. It is gated by
 * `platformOnly` on the router and by a platform token on the API, so a club
 * session can never reach it.
 */
const PlatformLayout = () => {
  const { platformUser, platformLogout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const isActive = (item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  const handleLogout = () => {
    platformLogout();
    navigate("/platform/login", { replace: true });
  };

  const links = (
    <>
      {NAV.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 border-l-2 px-5 py-3 text-[12.5px] font-semibold transition ${
            isActive(item)
              ? "border-orange-500 bg-orange-500/10 text-white"
              : "border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white"
          }`}
        >
          <item.icon size={16} />
          {item.name}
        </Link>
      ))}
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#09090b] font-sans text-zinc-200">
      {/* SIDEBAR */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-800 bg-[#0c0c0f] md:flex">
        <div className="flex h-20 items-center gap-3 border-b border-zinc-800 px-5">
          <div className="flex h-10 w-10 items-center justify-center border border-orange-500/40 bg-zinc-900">
            <span className="text-[13px] font-black text-orange-500">SH</span>
          </div>
          <div>
            <div className="text-[13px] font-black text-white">Platform</div>
            <div className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Owner Console
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4">{links}</nav>

        <div className="border-t border-zinc-800 p-4">
          <div className="truncate text-[11.5px] font-bold text-white">
            {platformUser?.fullName || "Platform Owner"}
          </div>
          <div className="truncate text-[10.5px] text-zinc-500">{platformUser?.email}</div>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 border border-zinc-700 py-2.5 text-[11px] font-bold uppercase tracking-wider text-zinc-300 transition hover:border-red-500 hover:text-red-400"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-[#0c0c0f] px-4 md:hidden">
          <div className="text-[13px] font-black text-white">
            Platform <span className="text-orange-500">Console</span>
          </div>
          <button
            onClick={() => setOpen((value) => !value)}
            className="text-zinc-300"
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>

        {open && (
          <div className="border-b border-zinc-800 bg-[#0c0c0f] md:hidden">
            {links}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 border-l-2 border-transparent px-5 py-3 text-[12.5px] font-semibold text-zinc-400"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        )}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PlatformLayout;
