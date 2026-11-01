import { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import { Megaphone, Bell, Calendar } from "lucide-react";

function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get("/public/announcements");
      if (res.data.success) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="user">
        <PageLoader message="Loading announcements..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="user">
      <div className="w-full">
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="h-px w-5 bg-orange-500" />
            <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-orange-500">
              Notices & Broadcasts
            </span>
          </div>
          <h1 className="mt-2 text-[22px] font-extrabold tracking-tight text-white md:text-[24px]">
            Club Announcements
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Important notices, scheduled facility maintenance, and administrative updates.
          </p>
        </div>

        <div className="space-y-4">
          {announcements.length > 0 ? (
            announcements.map((a) => (
              <div
                key={a.AnnouncementID}
                className="border border-zinc-800 bg-[#121215] p-6 transition hover:border-orange-500/50"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-none bg-orange-500/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-orange-400 border border-orange-500/20">
                    <Megaphone size={12} />
                    {a.Audience} Broadcast
                  </span>

                  <span className="text-[11px] text-zinc-500">
                    {new Date(a.PublishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-extrabold text-white">
                  {a.Title}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-zinc-300">
                  {a.Message}
                </p>
              </div>
            ))
          ) : (
            <div className="border border-zinc-800 bg-[#121215] p-12 text-center text-xs text-zinc-500">
              No announcements published at this time.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AnnouncementsPage;
