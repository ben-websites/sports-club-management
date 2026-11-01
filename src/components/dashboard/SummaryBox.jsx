function SummaryBox({ label, value, subtext }) {
  return (
    <div className="rounded-none border border-zinc-800 bg-[#16161a] px-4 py-3 transition hover:border-orange-500/40">
      <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-zinc-400">
        {label}
      </p>

      <p className="mt-1 text-[21px] font-black text-white">
        {value}
      </p>

      {subtext && (
        <p className="mt-0.5 text-[10px] font-medium text-orange-400">
          {subtext}
        </p>
      )}
    </div>
  );
}

export default SummaryBox;
