import { X, CalendarDays, MapPin, Users, Trophy, Award, ShieldCheck, Clock, CheckCircle2, XCircle, AlertCircle, Sparkles, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";

function EventDetailsModal({
  event,
  isOpen,
  onClose,
  isRegistered = false,
  onRegister,
  onCancel,
  actionLoading = false,
  isAuthenticated = false,
  isMemberActive = true,
}) {
  if (!isOpen || !event) return null;

  const maxParticipants = event.MaximumParticipants || 32;
  const registeredCount = event.RegisteredCount || 0;
  const isFull = maxParticipants > 0 && registeredCount >= maxParticipants;
  const spotsLeft = Math.max(0, maxParticipants - registeredCount);
  const percentFilled = Math.min(100, Math.round((registeredCount / maxParticipants) * 100));

  const formattedDate = new Date(event.EventDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto cursor-pointer animate-fadeIn transition-opacity duration-300"

      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl border border-zinc-700 bg-[#121215] shadow-2xl my-8 overflow-hidden cursor-default animate-modalPop transition-all duration-300"

        onClick={(e) => e.stopPropagation()}
      >
        {/* HERO IMAGE HEADER */}
        <div className="keep-dark relative h-56 w-full overflow-hidden bg-zinc-900">
          <img
            src={
              event.EventImageURL ||
              "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1400&q=80"
            }
            alt={event.EventName}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-[#121215]/50 to-transparent" />

          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-black/60 p-2 text-white hover:bg-black transition backdrop-blur-md"
            title="Close"
          >
            <X size={18} />
          </button>

          {/* BADGES */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="bg-orange-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-black">
              {event.SportName || "Tournament"}
            </span>
            {isRegistered ? (
              <span className="bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase text-black flex items-center gap-1">
                <CheckCircle2 size={12} /> Registered
              </span>
            ) : isFull ? (
              <span className="bg-red-500 px-3 py-1 text-[10px] font-black uppercase text-white flex items-center gap-1">
                <AlertCircle size={12} /> Capacity Full
              </span>
            ) : (
              <span className="bg-white/20 px-3 py-1 text-[10px] font-bold uppercase text-white backdrop-blur-md">
                Registration Open
              </span>
            )}
          </div>

          {/* EVENT TITLE ON HERO */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
              Sports Hub Championship Series
            </div>
            <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl leading-tight">
              {event.EventName}
            </h2>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* QUICK FACTS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="border border-zinc-800 bg-zinc-900/60 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-zinc-400">
                <CalendarDays size={13} className="text-orange-500" /> Date
              </div>
              <div className="mt-1 text-xs font-bold text-white leading-snug">
                {new Date(event.EventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </div>
              <div className="text-[10px] text-zinc-500">Starts 09:00 AM</div>
            </div>

            <div className="border border-zinc-800 bg-zinc-900/60 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-zinc-400">
                <MapPin size={13} className="text-orange-500" /> Venue
              </div>
              <div className="mt-1 text-xs font-bold text-white truncate">
                {event.Venue || "Main Complex"}
              </div>
              <div className="text-[10px] text-zinc-500">Arena Ground</div>
            </div>

            <div className="border border-zinc-800 bg-zinc-900/60 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-zinc-400">
                <Users size={13} className="text-orange-500" /> Capacity
              </div>
              <div className="mt-1 text-xs font-bold text-white">
                {registeredCount} / {maxParticipants}
              </div>
              <div className="text-[10px] text-orange-400 font-semibold">{spotsLeft} spots left</div>
            </div>

            <div className="border border-zinc-800 bg-zinc-900/60 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-zinc-400">
                <Trophy size={13} className="text-orange-500" /> Entry
              </div>
              <div className="mt-1 text-xs font-bold text-emerald-400">Free</div>
              <div className="text-[10px] text-zinc-500">Club Members</div>
            </div>
          </div>

          {/* CAPACITY PROGRESS */}
          <div className="border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-white flex items-center gap-2">
                <Users size={14} className="text-orange-500" /> Tournament Roster Status
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                {percentFilled}% Filled ({registeredCount} of {maxParticipants} athletes)
              </span>
            </div>
            <div className="h-2 w-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${percentFilled >= 100 ? "bg-red-500" : percentFilled >= 75 ? "bg-orange-500" : "bg-emerald-500"
                  }`}
                style={{ width: `${percentFilled}%` }}
              />
            </div>
          </div>

          {/* FULL DESCRIPTION */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-orange-500 flex items-center gap-2">
              <Sparkles size={14} /> Tournament Overview & Details
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-zinc-300 whitespace-pre-line bg-zinc-900/30 p-4 border border-zinc-800/80">
              {event.Description || "Official club tournament. Compete against fellow athletic members, track official match scores, and climb the club leaderboard rankings."}
            </p>
          </div>

          {/* RULES & GUIDELINES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-zinc-800 bg-zinc-900/30 p-4">
              <h5 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                <ShieldCheck size={14} className="text-orange-500" /> Rules & Eligibility
              </h5>
              <ul className="mt-2 space-y-1.5 text-[11px] text-zinc-400">
                <li className="flex items-start gap-1.5">
                  <span className="text-orange-500 font-bold">•</span>
                  Active membership status verified at entry desk.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-orange-500 font-bold">•</span>
                  Standard regulation sports apparel and non-marking shoes.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-orange-500 font-bold">•</span>
                  Arrive 20 minutes prior to match schedule for warm-up.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-orange-500 font-bold">•</span>
                  Official referee calls and score adjudication are final.
                </li>
              </ul>
            </div>

            <div className="border border-zinc-800 bg-zinc-900/30 p-4">
              <h5 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Award size={14} className="text-orange-500" /> Prizes & Recognition
              </h5>
              <ul className="mt-2 space-y-1.5 text-[11px] text-zinc-400">
                <li className="flex items-start gap-1.5">
                  <span className="text-orange-500 font-bold">•</span>
                  <b>Winner:</b> Sports Hub Championship Gold Trophy.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-orange-500 font-bold">•</span>
                  <b>Runner-Up:</b> Silver Shield & Club Merit Certificate.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-orange-500 font-bold">•</span>
                  Official ranking points added to player profile.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-orange-500 font-bold">•</span>
                  High-res photography published on club showcase wall.
                </li>
              </ul>
            </div>
          </div>

          {/* CONTACT COORDINATOR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-800 pt-4 text-xs text-zinc-400">
            <span className="text-[11px] font-semibold text-zinc-400">Event Coordinator Desk:</span>
            <div className="flex items-center gap-4 text-[11px] text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Phone size={12} className="text-orange-500" /> +92 300 1234567
              </span>
              <span className="flex items-center gap-1.5">
                <Mail size={12} className="text-orange-500" /> events@sportshub.com
              </span>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="border-t border-zinc-800 bg-[#16161b] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-zinc-400">
            <span>Schedule: </span>
            <span className="text-white font-semibold">{formattedDate}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white transition"
            >
              Close
            </button>

            {isAuthenticated ? (
              isRegistered ? (
                <button
                  onClick={() => onCancel && onCancel(event.EventID)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/40 px-5 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition"
                >
                  <XCircle size={15} />
                  {actionLoading ? "Processing..." : "Cancel Registration"}
                </button>
              ) : isFull ? (
                <button
                  disabled
                  className="bg-zinc-800 px-5 py-2.5 text-xs font-bold text-zinc-500 cursor-not-allowed"
                >
                  Roster Full
                </button>
              ) : (
                <button
                  onClick={() => onRegister && onRegister(event.EventID, event.EventName)}
                  disabled={actionLoading || !isMemberActive}
                  className="inline-flex items-center gap-2 bg-orange-500 px-6 py-2.5 text-xs font-black uppercase text-black hover:bg-white transition disabled:opacity-50"
                >
                  <CheckCircle2 size={15} />
                  {actionLoading ? "Registering..." : "Confirm Registration"}
                </button>
              )
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-orange-500 px-6 py-2.5 text-xs font-black uppercase text-black hover:bg-white transition"
              >
                Login to Register
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetailsModal;
