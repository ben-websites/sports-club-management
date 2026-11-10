import { useState, useEffect } from "react";
import api from "../../services/api";
import startPolling from "../../services/polling";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { Trophy, Plus, Users, Trash2, Calendar, MapPin, X, Eye } from "lucide-react";

function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [participantsModalEvent, setParticipantsModalEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    sportId: "",
    eventImageURL: "",
    eventDate: "",
    registrationDeadline: "",
    venue: "",
    maximumParticipants: 32,
  });

  useEffect(() => {
    fetchEvents(true);

    // Live auto-refresh (skipped while the tab is hidden)
    return startPolling(() => fetchEvents(false));
  }, []);

  const fetchEvents = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const [evRes, spRes] = await Promise.all([
        api.get("/admin/events"),
        api.get("/admin/sports"),
      ]);

      if (evRes.data.success) setEvents(evRes.data.events);
      if (spRes.data.success) setSports(spRes.data.sports);
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/admin/events", formData);
      if (res.data.success) {
        toast.success("Tournament created successfully!");
        setIsModalOpen(false);
        setFormData({
          eventName: "",
          description: "",
          sportId: "",
          eventImageURL: "",
          eventDate: "",
          registrationDeadline: "",
          venue: "",
          maximumParticipants: 32,
        });
        fetchEvents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create event.");
    }
  };

  const handleViewParticipants = async (event) => {
    setParticipantsModalEvent(event);
    setLoadingParticipants(true);
    try {
      const res = await api.get(`/admin/events/${event.EventID}/participants`);
      if (res.data.success) {
        setParticipants(res.data.participants);
      }
    } catch (err) {
      toast.error("Failed to load participants.");
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleDelete = async (id, name) => {
    const confirm = await Swal.fire({
      title: `Delete "${name}"?`,
      text: "This will remove the event and all participant registrations permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, Delete",
      background: "#18181b",
      color: "#ffffff",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await api.delete(`/admin/events/${id}`);
        if (res.data.success) {
          toast.success("Event deleted.");
          fetchEvents();
        }
      } catch (err) {
        toast.error("Failed to delete event.");
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <PageLoader message="Loading tournaments & events..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="w-full">
        {/* HEADER */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-px w-5 bg-orange-500" />
              <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-orange-500">
                Tournaments & Leagues
              </span>
            </div>
            <h1 className="mt-2 text-[22px] font-extrabold tracking-tight text-white md:text-[24px]">
              Events & Competitions
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Schedule tournaments, manage athletic arenas, and track registered member rosters.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-none bg-orange-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-orange-500/10 transition hover:bg-white"
          >
            <Plus size={15} />
            Create Event
          </button>
        </div>

        {/* EVENTS GRID */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((ev) => (
            <div
              key={ev.EventID}
              className="flex flex-col justify-between border border-zinc-800 bg-[#121215] overflow-hidden transition hover:border-orange-500/50"
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-zinc-900">
                  <img
                    src={ev.EventImageURL || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"}
                    alt={ev.EventName}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 bg-orange-500 px-2 py-0.5 text-[9px] font-black uppercase text-black">
                    {ev.SportName || "Sports Event"}
                  </span>
                </div>

                <div className="p-5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                    📅 {new Date(ev.EventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>

                  <h3 className="mt-2 text-base font-extrabold text-white">
                    {ev.EventName}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-zinc-400 line-clamp-2">
                    {ev.Description}
                  </p>

                  <div className="mt-4 border-t border-zinc-800 pt-3 space-y-1 text-xs text-zinc-400">
                    <div>📍 Venue: <span className="text-zinc-200 font-semibold">{ev.Venue || "Main Complex"}</span></div>
                    <div>👥 Registered: <span className="text-orange-400 font-bold">{ev.RegisteredCount || 0}</span> / {ev.MaximumParticipants || "Open Limit"}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-zinc-800 p-4">
                <button
                  onClick={() => handleViewParticipants(ev)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-none border border-zinc-700 bg-zinc-800 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-700 hover:text-white"
                >
                  <Users size={13} className="text-orange-500" />
                  Roster ({ev.RegisteredCount || 0})
                </button>
                <button
                  onClick={() => handleDelete(ev.EventID, ev.EventName)}
                  className="rounded-none border border-red-500/30 bg-red-500/10 p-2 text-red-400 hover:bg-red-500 hover:text-white"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CREATE EVENT MODAL */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto cursor-pointer animate-fadeIn transition-opacity duration-300"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="w-full max-w-lg border border-zinc-700 bg-[#121215] p-6 shadow-2xl my-8 cursor-default animate-modalPop transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Schedule New Sports Tournament
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.eventName}
                    onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                    placeholder="e.g. Annual Squash Championship"
                    className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                      Sport Discipline
                    </label>
                    <select
                      value={formData.sportId}
                      onChange={(e) => setFormData({ ...formData, sportId: e.target.value })}
                      className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                    >
                      <option value="">Select Sport (Optional)</option>
                      {sports.map((s) => (
                        <option key={s.SportID} value={s.SportID}>
                          {s.SportName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                      Participant Cap
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maximumParticipants}
                      onChange={(e) => setFormData({ ...formData, maximumParticipants: e.target.value })}
                      className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                      Event Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                      Registration Deadline
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.registrationDeadline}
                      onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                      className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                    Venue / Court *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. Center Tennis Court 1 or Olympic Pool"
                    className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.eventImageURL}
                    onChange={(e) => setFormData({ ...formData, eventImageURL: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                    Description & Rules
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tournament rules, age categories, prizes..."
                    className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-none border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-none bg-orange-500 px-6 py-2 text-xs font-bold uppercase text-black hover:bg-white"
                  >
                    Schedule Tournament
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PARTICIPANTS ROSTER MODAL */}
        {participantsModalEvent && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md cursor-pointer animate-fadeIn transition-opacity duration-300"
            onClick={() => setParticipantsModalEvent(null)}
          >
            <div
              className="w-full max-w-xl border border-zinc-700 bg-[#121215] p-6 shadow-2xl cursor-default animate-modalPop transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Participant Roster
                  </h3>
                  <p className="text-xs text-orange-400 font-bold mt-0.5">
                    {participantsModalEvent.EventName}
                  </p>
                </div>
                <button
                  onClick={() => setParticipantsModalEvent(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {loadingParticipants ? (
                <PageLoader message="Loading roster..." />
              ) : participants.length > 0 ? (
                <div className="max-h-[350px] overflow-y-auto space-y-2">
                  {participants.map((pt, idx) => (
                    <div
                      key={pt.RegistrationID}
                      className="flex items-center justify-between border border-zinc-800 bg-zinc-900/60 p-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-zinc-500">{idx + 1}.</span>
                        <div>
                          <div className="font-bold text-white">{pt.FullName}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            {pt.MembershipNumber || "Guest"} · {pt.Phone || pt.Email}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="rounded-none bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-400 border border-emerald-500/20">
                          {pt.RegistrationStatus}
                        </span>
                        <div className="text-[9px] text-zinc-500 mt-0.5">
                          {new Date(pt.RegisteredAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-zinc-500">
                  No members have registered for this tournament yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AdminEvents;
