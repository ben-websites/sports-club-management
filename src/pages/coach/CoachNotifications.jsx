import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import startPolling from "../../services/polling";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import { Bell, CheckCheck } from "lucide-react";

function CoachNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAll = async (initial = false) => {
    try {
      if (initial) setLoading(true);
      const res = await api.get("/notifications", { params: { limit: 40 } });
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnread(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (initial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(true);
    // Live auto-refresh (skipped while the tab is hidden)
    return startPolling(() => fetchAll(false), 15000);
  }, []);

  const openNotification = async (n) => {
    if (!n.IsRead) {
      try {
        await api.put(`/notifications/${n.NotificationID}/read`);
        setNotifications((prev) => prev.map((x) => (x.NotificationID === n.NotificationID ? { ...x, IsRead: true } : x)));
        setUnread((c) => Math.max(0, c - 1));
      } catch (err) {
        console.error(err);
      }
    }
    if (n.Link) navigate(n.Link);
  };

  const markAll = async () => {
    try {
      await api.put("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((x) => ({ ...x, IsRead: true })));
      setUnread(0);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="coach">
        <PageLoader message="Loading notifications..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="coach">
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-black text-white">
              <Bell size={20} className="text-orange-500" /> Notifications
            </h1>
            <p className="mt-1 text-xs text-zinc-400">{unread} unread alert(s)</p>
          </div>
          {unread > 0 && (
            <button
              onClick={markAll}
              className="flex items-center gap-2 border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-orange-400 transition hover:bg-orange-500 hover:text-black"
            >
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
        </div>

        <div className="border border-zinc-800 bg-[#121215]">
          {notifications.length === 0 ? (
            <div className="px-5 py-12 text-center text-xs text-zinc-500">No notifications yet.</div>
          ) : (
            <div className="divide-y divide-zinc-800/70">
              {notifications.map((n) => (
                <button
                  key={n.NotificationID}
                  onClick={() => openNotification(n)}
                  className={`flex w-full items-start gap-3 px-5 py-3.5 text-left transition hover:bg-zinc-800/30 ${
                    !n.IsRead ? "bg-orange-500/5" : ""
                  }`}
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-orange-500/30 bg-orange-500/10 text-orange-400">
                    <Bell size={13} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-bold text-white">{n.Title}</span>
                      <span className="shrink-0 text-[9.5px] text-zinc-500">
                        {new Date(n.CreatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-zinc-400">{n.Message}</div>
                  </div>
                  {!n.IsRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CoachNotifications;
