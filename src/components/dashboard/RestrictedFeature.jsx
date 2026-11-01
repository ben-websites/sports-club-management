import { Link } from "react-router-dom";
import { Lock, ShieldCheck, Clock, ArrowRight } from "lucide-react";
import DashboardLayout from "./DashboardLayout";

function RestrictedFeature({ title = "Feature Restricted", featureName = "This feature" }) {
  return (
    <DashboardLayout role="user">
      <div className="w-full max-w-2xl mx-auto py-12">
        <div className="border border-orange-500/30 bg-[#121215] p-8 md:p-10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-48 w-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* LOCK ICON */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-none bg-orange-500/10 text-orange-500 border border-orange-500/30">
            <Lock size={32} />
          </div>

          {/* TITLE & NOTICE */}
          <div className="mt-5 inline-flex items-center gap-1.5 rounded-none border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-400">
            <Clock size={12} />
            Active Membership Required
          </div>

          <h2 className="mt-3 text-2xl font-black uppercase tracking-tight text-white">
            {title}
          </h2>

          <p className="mt-3 text-xs md:text-sm text-zinc-300 leading-relaxed max-w-lg mx-auto">
            {featureName} is reserved exclusively for verified club members. Your account will have full access as soon as the club administration reviews and approves your membership application.
          </p>

          {/* STATUS BREAKDOWN */}
          <div className="mt-6 border border-zinc-800 bg-zinc-900/60 p-4 text-left max-w-md mx-auto space-y-2 text-xs">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Account Status:</span>
              <span className="font-bold text-amber-400 uppercase">Under Administrative Review</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Next Step:</span>
              <span className="font-bold text-white">Admin ID Assignment & Card Activation</span>
            </div>
          </div>

          {/* ACTION BUTTON (INSIDE PANEL) */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/user/membership"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-none bg-orange-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-white"
            >
              <ShieldCheck size={16} />
              View My Membership
              <ArrowRight size={14} />
            </Link>

            <Link
              to="/user/announcements"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-none border border-zinc-700 bg-zinc-800 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-zinc-700"
            >
              View Club Notices
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default RestrictedFeature;
