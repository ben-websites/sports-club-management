import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

/**
 * Shared chrome for the standalone sign-in screens.
 *
 * These pages sit outside both shells on purpose: they are the doorway into the
 * workspace (or the owner's Google sign-in), so they carry only a small brand
 * mark and a way back to the website.
 */
const AuthShell = ({ eyebrow, title, subtitle, children, footer, maxWidth = "max-w-md" }) => (
  <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#09090b] px-4 py-14 text-zinc-100 sm:px-6">
    <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-orange-500/10 blur-[130px]" />

    <div className="absolute left-6 top-8 sm:left-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 transition hover:text-orange-500"
      >
        <ArrowLeft size={14} />
        Back to Website
      </Link>
    </div>

    <div className="absolute right-6 top-8 sm:right-8">
      <ThemeToggle variant="panel" className="h-10 w-10" />
    </div>

    <div className={`mx-auto w-full ${maxWidth}`}>
      <div className="text-center">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="flex h-12 w-[84px] items-center justify-center overflow-hidden rounded-lg border border-orange-500/40 bg-zinc-900 px-1.5">
            <img
              src="/sports-hub-logo.svg"
              alt="Sports Hub Logo"
              className="h-7 w-auto object-contain"
            />
          </div>
          <div className="text-left">
            <div className="text-xl font-black leading-none text-white">
              SPORTS <span className="text-orange-500">HUB</span>
            </div>
            <div className="mt-1 text-[8.5px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              Club Management Platform
            </div>
          </div>
        </Link>

        {eyebrow && (
          <div className="mt-7 text-[10px] font-black uppercase tracking-[0.22em] text-orange-500">
            {eyebrow}
          </div>
        )}

        <h2 className="mt-3 text-2xl font-black tracking-tight text-white">{title}</h2>
        {subtitle && <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-zinc-400">{subtitle}</p>}
      </div>

      <div className="mt-8 border border-zinc-800 bg-[#121215] p-5 shadow-2xl sm:p-7">{children}</div>

      {footer && <div className="mt-6 text-center text-xs text-zinc-400">{footer}</div>}
    </div>
  </div>
);

export default AuthShell;
