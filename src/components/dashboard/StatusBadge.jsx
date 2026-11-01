function StatusBadge({ status }) {
  const norm = (status || "").toLowerCase();

  if (
    norm === "pending" ||
    norm === "pending_approval" ||
    norm === "pendingverification" ||
    norm === "pendingpayment"
  ) {
    let label = "Pending";
    if (norm === "pendingverification") label = "Pending Verification";
    else if (norm === "pendingpayment") label = "Pending Payment";
    else if (norm === "pending_approval") label = "Pending Approval";

    return (
      <span className="inline-flex items-center gap-1.5 rounded-none border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
        <span className="h-1.5 w-1.5 rounded-none bg-amber-400" />
        {label}
      </span>
    );
  }

  if (norm === "approved" || norm === "active" || norm === "paid" || norm === "resolved" || norm === "upcoming") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-none border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-none bg-emerald-400" />
        {status}
      </span>
    );
  }

  if (norm === "rejected" || norm === "overdue" || norm === "suspended" || norm === "expired" || norm === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-none border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-400">
        <span className="h-1.5 w-1.5 rounded-none bg-red-400" />
        {status}
      </span>
    );
  }

  if (norm === "unpaid") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-none border border-orange-500/40 bg-orange-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-400">
        <span className="h-1.5 w-1.5 rounded-none bg-orange-500" />
        Unpaid
      </span>
    );
  }

  if (norm === "in progress" || norm === "ongoing") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-none border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-400">
        <span className="h-1.5 w-1.5 rounded-none bg-sky-400" />
        {status}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-none border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
      <span className="h-1.5 w-1.5 rounded-none bg-zinc-400" />
      {status || "N/A"}
    </span>
  );
}

export default StatusBadge;
