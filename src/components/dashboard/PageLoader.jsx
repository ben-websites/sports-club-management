import { Loader2 } from "lucide-react";

function PageLoader({ message = "Loading information..." }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8">
      <div className="relative flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
        <div className="absolute h-6 w-6 rounded-full bg-orange-500/20 animate-pulse" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
        {message}
      </p>
    </div>
  );
}

export default PageLoader;
