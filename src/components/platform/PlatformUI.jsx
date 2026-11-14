/**
 * Small building blocks for the platform console.
 * Kept separate so the five console screens share one visual language.
 */

export const money = (value) =>
  value === null || value === undefined
    ? "-"
    : `PKR ${Number(value).toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

export const PageHeading = ({ eyebrow, title, description, action }) => (
  <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
    <div>
      {eyebrow && (
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
          {eyebrow}
        </div>
      )}
      <h1 className="mt-2 text-[22px] font-black tracking-tight text-white sm:text-[26px]">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-2xl text-[12px] leading-6 text-zinc-500">{description}</p>
      )}
    </div>
    {action}
  </div>
);

export const StatTile = ({ label, value, hint, icon: Icon, accent = false }) => (
  <div
    className={`border p-5 ${
      accent ? "border-orange-500/50 bg-orange-500/5" : "border-zinc-800 bg-[#0e0e11]"
    }`}
  >
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </span>
      {Icon && <Icon size={15} className="text-orange-500" />}
    </div>
    <div className="mt-3 text-[24px] font-black text-white">{value}</div>
    {hint && <div className="mt-1 text-[11px] text-zinc-500">{hint}</div>}
  </div>
);

export const Panel = ({ title, description, action, children, className = "" }) => (
  <div className={`border border-zinc-800 bg-[#0e0e11] ${className}`}>
    {(title || action) && (
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-5 py-4">
        <div>
          {title && <h2 className="text-[13px] font-bold text-white">{title}</h2>}
          {description && <p className="mt-0.5 text-[11px] text-zinc-500">{description}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </div>
);

export const Empty = ({ icon: Icon, title, body, children }) => (
  <div className="px-6 py-14 text-center">
    {Icon && <Icon size={30} className="mx-auto text-zinc-700" />}
    <p className="mt-4 text-[13px] font-bold text-white">{title}</p>
    {body && <p className="mx-auto mt-2 max-w-sm text-[11.5px] leading-6 text-zinc-500">{body}</p>}
    {children}
  </div>
);

export const StatusPill = ({ status }) => {
  const map = {
    Pending: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    Active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    Approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    Suspended: "border-red-500/40 bg-red-500/10 text-red-300",
    Rejected: "border-red-500/40 bg-red-500/10 text-red-300",
    Cancelled: "border-zinc-600 bg-zinc-800/50 text-zinc-400",
    PastDue: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  };

  return (
    <span
      className={`inline-flex items-center border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
        map[status] || map.Cancelled
      }`}
    >
      {status}
    </span>
  );
};

export default { money, formatDate, PageHeading, StatTile, Panel, Empty, StatusPill };
