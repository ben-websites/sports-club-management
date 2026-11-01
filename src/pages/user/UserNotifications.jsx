import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import api from "../../services/api";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  Bell,
  CheckCircle2,
  Trash2,
  Clock,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  ReceiptText,
  CalendarDays,
  Megaphone,
  Zap,
  Filter,
  Search,
  Check,
  RefreshCw,
  Info,
} from "lucide-react";

const TYPE_CONFIG = {
  membership: {
    icon: ShieldCheck,
    label: "Membership",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  payment: {
    icon: CreditCard,
    label: "Payment",
    color: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  },
  voucher: {
    icon: ReceiptText,
    label: "Fee Voucher",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  },
  event: {
    icon: CalendarDays,
    label: "Event & League",
    color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  },
  announcement: {
    icon: Megaphone,
    label: "Notice",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  sports: {
    icon: Zap,
    label: "Facility",
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  },
  system: {
    icon: Info,
    label: "System",
    color: "text-zinc-400 bg-zinc-800 border-zinc-700",
  },
};

function formatTimestamp(dateString) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 172800) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function UserNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'unread' | 'read'
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get("/notifications", {
        params: {
          status: statusFilter,
          type: filterType,
          limit: 100,
        },
      });

      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [filterType, statusFilter]);

  useEffect(() => {
    fetchNotifications();

    const handleActivity = () => fetchNotifications();
    window.addEventListener("scms-activity-event", handleActivity);
    return () => window.removeEventListener("scms-activity-event", handleActivity);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.NotificationID === id ? { ...n, IsRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      window.dispatchEvent(new CustomEvent("scms-notification-updated"));
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, IsRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read!");
      window.dispatchEvent(new CustomEvent("scms-notification-updated"));
    } catch (err) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.NotificationID !== id));
      toast.success("Notification removed");
      window.dispatchEvent(new CustomEvent("scms-notification-updated"));
    } catch (err) {
      toast.error("Failed to delete notification");
    }
  };

  const handleClearRead = async () => {
    const result = await Swal.fire({
      title: "Clear Read Notifications?",
      text: "This will remove all notifications that you have already opened.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#27272a",
      confirmButtonText: "Yes, Clear",
      background: "#18181b",
      color: "#ffffff",
    });

    if (result.isConfirmed) {
      try {
        await api.delete("/notifications/clear-read");
        setNotifications((prev) => prev.filter((n) => !n.IsRead));
        toast.success("Cleared read notifications.");
        window.dispatchEvent(new CustomEvent("scms-notification-updated"));
      } catch (err) {
        toast.error("Failed to clear notifications");
      }
    }
  };

  const filteredList = notifications.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.Title?.toLowerCase().includes(query) ||
      item.Message?.toLowerCase().includes(query) ||
      item.Type?.toLowerCase().includes(query)
    );
  });

  return (
    <DashboardLayout role="user">
      <div className="space-y-6 page-transition">
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center border border-orange-500/40 bg-orange-500/10 text-orange-500">
                <Bell size={18} />
              </div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                Member Notifications & Alerts
              </h1>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Live updates on membership approvals, monthly vouchers, payment verifications, and sports leagues.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchNotifications}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 border border-zinc-800 bg-zinc-900 hover:border-orange-500 hover:text-white transition"
              title="Refresh notifications"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Sync</span>
            </button>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-orange-400 border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500 hover:text-black transition"
              >
                <CheckCircle2 size={14} />
                <span>Mark All Read ({unreadCount})</span>
              </button>
            )}

            <button
              onClick={handleClearRead}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-400 border border-zinc-800 hover:border-red-500/40 hover:text-red-400 transition"
            >
              <Trash2 size={13} />
              <span>Clear Read</span>
            </button>
          </div>
        </div>

        {/* CONTROLS: SEARCH & CATEGORY FILTERS */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-zinc-900/60 p-3 border border-zinc-800/80">
          {/* SEARCH BAR */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications by keyword..."
              className="w-full bg-zinc-950 border border-zinc-800 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-orange-500 transition"
            />
          </div>

          {/* STATUS TOGGLE */}
          <div className="flex items-center gap-1 border border-zinc-800 p-1 bg-zinc-950">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition ${
                statusFilter === "all"
                  ? "bg-orange-500 text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setStatusFilter("unread")}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition ${
                statusFilter === "unread"
                  ? "bg-orange-500 text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setStatusFilter("read")}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition ${
                statusFilter === "read"
                  ? "bg-orange-500 text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Read
            </button>
          </div>
        </div>

        {/* TYPE FILTER PILLS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mr-1 flex items-center gap-1">
            <Filter size={11} /> Filter:
          </span>
          {[
            { id: "all", label: "All Types" },
            { id: "membership", label: "Membership" },
            { id: "payment", label: "Payments" },
            { id: "voucher", label: "Fee Vouchers" },
            { id: "event", label: "Events" },
            { id: "announcement", label: "Notices" },
            { id: "system", label: "System" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap border transition ${
                filterType === tab.id
                  ? "border-orange-500 bg-orange-500/10 text-orange-400 font-bold"
                  : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* NOTIFICATIONS LIST */}
        {loading ? (
          <div className="p-12 text-center text-zinc-500 text-xs font-semibold">
            <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-orange-500" />
            Synchronizing member alerts...
          </div>
        ) : filteredList.length === 0 ? (
          <div className="border border-zinc-800/80 bg-zinc-900/30 p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-600 mb-3">
              <Bell size={24} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
              No Notifications Found
            </h3>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
              {searchQuery
                ? `No notifications matched "${searchQuery}".`
                : "You're all caught up! New fee vouchers, payment receipts, and event notices will appear here automatically."}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredList.map((notif, index) => {
              const typeMeta = TYPE_CONFIG[notif.Type] || TYPE_CONFIG.system;
              const Icon = typeMeta.icon;
              const isUnread = !notif.IsRead;

              return (
                <div
                  key={notif.NotificationID || index}
                  className={`group relative p-4 sm:p-5 border transition-all duration-300 flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                    isUnread
                      ? "bg-[#141418] border-orange-500/40 shadow-lg shadow-orange-500/5 hover:border-orange-500"
                      : "bg-[#0f0f12] border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40"
                  }`}
                >
                  {/* UNREAD INDICATOR BAR */}
                  {isUnread && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />
                  )}

                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* TYPE ICON */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center border ${typeMeta.color}`}
                    >
                      <Icon size={18} />
                    </div>

                    {/* CONTENT */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 border ${typeMeta.color}`}
                        >
                          {typeMeta.label}
                        </span>

                        {isUnread && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/10 px-1.5 py-0.5 border border-orange-500/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                            New
                          </span>
                        )}

                        <span className="text-[11px] text-zinc-500 flex items-center gap-1 ml-auto font-mono">
                          <Clock size={11} />
                          {formatTimestamp(notif.CreatedAt)}
                        </span>
                      </div>

                      <h4 className="mt-1.5 text-sm font-bold text-white tracking-tight">
                        {notif.Title}
                      </h4>

                      <p className="mt-1 text-xs text-zinc-300 leading-relaxed break-words">
                        {notif.Message}
                      </p>

                      {/* QUICK ACTION BUTTON */}
                      {notif.Link && (
                        <div className="mt-3">
                          <Link
                            to={notif.Link}
                            onClick={() => !notif.IsRead && handleMarkAsRead(notif.NotificationID)}
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-400 hover:text-white bg-orange-500/10 hover:bg-orange-500 border border-orange-500/30 hover:border-orange-500 px-3 py-1.5 transition duration-200"
                          >
                            <span>Open Details</span>
                            <ExternalLink size={12} />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60 w-full sm:w-auto justify-end">
                    {isUnread && (
                      <button
                        onClick={(e) => handleMarkAsRead(notif.NotificationID, e)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition"
                        title="Mark as read"
                      >
                        <Check size={12} className="text-emerald-400" />
                        <span>Read</span>
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDelete(notif.NotificationID, e)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition border border-transparent hover:border-red-500/30"
                      title="Delete notification"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default UserNotifications;

