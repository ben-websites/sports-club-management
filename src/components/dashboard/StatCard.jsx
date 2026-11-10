import { ArrowUp, ArrowDown, Minus } from "lucide-react";

function ChangeBadge({ type, text }) {
  if (type === "up") {
    return (
      <span className="inline-flex items-center gap-1 rounded-none bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-400 border border-orange-500/20">
        <ArrowUp size={11} />
        {text}
      </span>
    );
  }

  if (type === "down") {
    return (
      <span className="inline-flex items-center gap-1 rounded-none bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/20">
        <ArrowDown size={11} />
        {text}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-none bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-400 border border-zinc-700">
      <Minus size={11} />
      {text}
    </span>
  );
}

function StatCard({
  title,
  value,
  label,
  icon: Icon,
  tone = "orange",
  change,
  changeType = "neutral",
}) {
  const styles = {
    orange: {
      icon: "bg-orange-500/10 text-orange-500 border border-orange-500/20",
      glow: "bg-orange-500",
    },
    black: {
      icon: "bg-zinc-800 text-zinc-200 border border-zinc-700",
      glow: "bg-zinc-600",
    },
    red: {
      icon: "bg-red-500/10 text-red-500 border border-red-500/20",
      glow: "bg-red-500",
    },
    emerald: {
      icon: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
      glow: "bg-emerald-500",
    },
  };

  const current = styles[tone] || styles.orange;

  return (
    <div className="relative overflow-hidden rounded-none border border-zinc-800 bg-[#121215] p-4 shadow-[0_5px_25px_rgba(0,0,0,0.4)] transition-all duration-200 hover:border-orange-500/50 sm:p-5">
      <div
        className={`absolute -right-5 -top-5 h-20 w-20 rounded-none opacity-10 blur-xl ${current.glow}`}
      />

      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-none sm:mb-4 sm:h-11 sm:w-11 ${current.icon}`}
      >
        <Icon size={18} />
      </div>

      <div className="text-[22px] font-extrabold leading-none tracking-tight text-white sm:text-[28px]">
        {value}
      </div>

      <div className="mt-1 text-[11.5px] font-bold text-zinc-300 sm:text-[12.5px]">
        {title}
      </div>

      <div className="mt-1 text-[10px] font-medium text-zinc-400 sm:text-[10.5px]">
        {label}
      </div>

      {change && (
        <div className="mt-3">
          <ChangeBadge type={changeType} text={change} />
        </div>
      )}
    </div>
  );
}

export default StatCard;
