import { useState, useEffect } from "react";
import api from "../../services/api";
import startPolling from "../../services/polling";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatusBadge from "../../components/dashboard/StatusBadge";
import PageLoader from "../../components/dashboard/PageLoader";
import RestrictedFeature from "../../components/dashboard/RestrictedFeature";
import EventDetailsModal from "../../components/events/EventDetailsModal";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { Trophy, CalendarDays, MapPin, Users, CheckCircle2, XCircle, Info, Sparkles } from "lucide-react";

function EventsPage() {
  const { isMemberActive, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [selectedEventModal, setSelectedEventModal] = useState(null);

  useEffect(() => {
    fetchEventsData(true);

    // Live screen auto-refresh (skipped while the tab is hidden)
    return startPolling(() => fetchEventsData(false));
  }, []);

  const fetchEventsData = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const [eventsRes, regRes] = await Promise.all([
        // The workspace reads its own club only - /public/* is platform-scoped
        // and would resolve whichever club the website happens to feature.
        api.get("/club/events"),
        api.get("/events/my-registrations"),
      ]);

      if (eventsRes.data.success) {
        setEvents(eventsRes.data.data);
        // keep open modal data fresh in real-time
        setSelectedEventModal((prev) => {
          if (!prev) return null;
          return eventsRes.data.data.find((e) => e.EventID === prev.EventID) || prev;
        });
      }
      if (regRes.data.success) setMyRegistrations(regRes.data.registrations);
    } catch (err) {
      console.error("Events fetch error:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const registeredEventIds = new Set(
    myRegistrations
      .filter((r) => r.RegistrationStatus === "Registered")
      .map((r) => r.EventID)
  );

  const handleRegister = async (eventId, eventName) => {
    const confirm = await Swal.fire({
      title: "Confirm Tournament Entry?",
      html: `Do you want to register for <b>${eventName}</b>?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#27272a",
      confirmButtonText: "Yes, Register Entry",
      cancelButtonText: "Cancel",
      background: "#18181b",
      color: "#ffffff",
      allowOutsideClick: true,
    });

    if (!confirm.isConfirmed) return;

    setActionId(eventId);
    try {
      const res = await api.post(`/events/${eventId}/register`);
      if (res.data.success) {
        toast.success(`Registered for ${eventName}!`);
        await fetchEventsData(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register.");
    } finally {
      setActionId(null);
    }
  };

  const handleCancel = async (eventId) => {
    const confirm = await Swal.fire({
      title: "Cancel Tournament Entry?",
      text: "Are you sure you want to withdraw from this tournament?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#27272a",
      confirmButtonText: "Yes, Cancel Entry",
      cancelButtonText: "Keep Entry",
      background: "#18181b",
      color: "#ffffff",
      allowOutsideClick: true,
    });

    if (!confirm.isConfirmed) return;

    setActionId(eventId);
    try {
      const res = await api.delete(`/events/${eventId}/register`);
      if (res.data.success) {
        toast.success("Event registration cancelled.");
        await fetchEventsData(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel registration.");
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="user">
        <PageLoader message="Loading club tournaments & events..." />
      </DashboardLayout>
    );
  }

  if (!isMemberActive) {
    return (
      <RestrictedFeature
        title="Tournaments & Leagues Restricted"
        featureName="Athletic competitions, tournament registrations, and championship roster access"
      />
    );
  }

  return (
    <DashboardLayout role="user">
      <div className="w-full">
        {/* HEADER WITH LIVE REFRESH INDICATOR */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-px w-5 bg-orange-500" />
              <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-orange-500">
                Championships
              </span>
            </div>
            <h1 className="mt-2 text-[22px] font-extrabold tracking-tight text-white md:text-[24px]">
              Sports Events & Tournaments
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Participate in club championships, swimming galas, and tennis leagues.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 text-[11px] text-zinc-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Auto-Sync (5s)</span>
          </div>
        </div>

        {/* EVENTS LIST */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((ev) => {
            const isRegistered = registeredEventIds.has(ev.EventID);
            const isFull = ev.MaximumParticipants && (ev.RegisteredCount >= ev.MaximumParticipants);

            return (
              <div
                key={ev.EventID}
                className="group flex flex-col justify-between overflow-hidden border border-zinc-800 bg-[#121215] transition duration-300 hover:border-orange-500/60"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-zinc-900">
                    <img
                      src={ev.EventImageURL || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"}
                      alt={ev.EventName}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 bg-orange-500 px-2 py-0.5 text-[9px] font-black uppercase text-black">
                      {ev.SportName || "Sports"}
                    </span>
                    {isRegistered && (
                      <span className="absolute top-3 right-3 bg-emerald-500 px-2 py-0.5 text-[9px] font-black uppercase text-black flex items-center gap-1">
                        <CheckCircle2 size={11} /> Registered
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                      📅 {new Date(ev.EventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>

                    <h3
                      onClick={() => setSelectedEventModal(ev)}
                      className="mt-2 text-base font-extrabold text-white group-hover:text-orange-400 transition cursor-pointer"
                    >
                      {ev.EventName}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-zinc-400 line-clamp-3">
                      {ev.Description}
                    </p>

                    <div className="mt-4 border-t border-zinc-800/80 pt-3 space-y-1.5 text-xs text-zinc-400">
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-orange-500 shrink-0" />
                        <span>{ev.Venue || "Main Complex"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={13} className="text-orange-500 shrink-0" />
                        <span>
                          {ev.RegisteredCount || 0} / {ev.MaximumParticipants || "Open Limit"} participants
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-2">
                  <button
                    onClick={() => setSelectedEventModal(ev)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-none border border-zinc-700 bg-zinc-900 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                  >
                    <Info size={14} />
                    View Details & Rules
                  </button>

                  {isRegistered ? (
                    <button
                      onClick={() => handleCancel(ev.EventID)}
                      disabled={actionId === ev.EventID}
                      className="flex w-full items-center justify-center gap-1.5 rounded-none border border-red-500/30 bg-red-500/10 py-2.5 text-xs font-bold text-red-400 transition hover:bg-red-500 hover:text-white"
                    >
                      <XCircle size={14} />
                      {actionId === ev.EventID ? "Processing..." : "Cancel Registration"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegister(ev.EventID, ev.EventName)}
                      disabled={actionId === ev.EventID || isFull}
                      className="flex w-full items-center justify-center gap-1.5 rounded-none bg-orange-500 py-2.5 text-xs font-extrabold uppercase tracking-wider text-black transition hover:bg-white disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} />
                      {isFull ? "Event Full" : actionId === ev.EventID ? "Registering..." : "Register Now"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* EVENT DETAILS MODAL */}
        {selectedEventModal && (
          <EventDetailsModal
            event={selectedEventModal}
            isOpen={!!selectedEventModal}
            onClose={() => setSelectedEventModal(null)}
            isRegistered={registeredEventIds.has(selectedEventModal.EventID)}
            onRegister={handleRegister}
            onCancel={handleCancel}
            actionLoading={actionId === selectedEventModal.EventID}
            isAuthenticated={true}
            isMemberActive={isMemberActive}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

export default EventsPage;
