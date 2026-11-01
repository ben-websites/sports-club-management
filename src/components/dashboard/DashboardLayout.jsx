import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import api from "../../services/api";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CreditCard,
  ReceiptText,
  FileText,
  Clock,
  UploadCloud,
  Zap,
  Bell,
  CalendarDays,
  User,
  Megaphone,
  Gem,
  AlertCircle,
  Dumbbell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Trophy,
  CheckCircle2,
  Lock,
} from "lucide-react";

function DashboardLayout({ children, role: requiredRole = "user" }) {
  const { user, role, logout, isMemberActive } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const prevDataRef = useRef({});

  const isAdmin = role === "admin";

  const [dbNotifications, setDbNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const userNavItems = [
    { name: "Overview", path: "/user/dashboard", icon: LayoutDashboard },
    { name: "Notifications", path: "/user/notifications", icon: Bell, isNotificationItem: true },
    { name: "My Membership", path: "/user/membership", icon: ShieldCheck },
    { name: "Monthly Fees", path: "/user/fees", icon: ReceiptText, requiresActive: true },
    { name: "Vouchers", path: "/user/vouchers", icon: FileText, requiresActive: true },
    { name: "Payments", path: "/user/payments", icon: Clock, requiresActive: true },
    { name: "Upload Receipt", path: "/user/upload-receipt", icon: UploadCloud, requiresActive: true },
    { name: "Advance Payment", path: "/user/advance-payment", icon: Zap, requiresActive: true },
    { name: "Announcements", path: "/user/announcements", icon: Megaphone },
    { name: "Events & Leagues", path: "/user/events", icon: CalendarDays, requiresActive: true },
    { name: "Profile", path: "/user/profile", icon: User },
  ];

  const adminNavItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Notifications", path: "/admin/notifications", icon: Bell, isNotificationItem: true },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Memberships", path: "/admin/memberships", icon: ShieldCheck },
    { name: "Membership Plans", path: "/admin/plans", icon: Gem },
    { name: "Monthly Fees", path: "/admin/vouchers", icon: ReceiptText },
    { name: "Payments & Receipts", path: "/admin/payments", icon: CheckCircle2 },
    { name: "Fines & Policies", path: "/admin/fines", icon: AlertCircle },
    { name: "Advance Payments", path: "/admin/advance-payments", icon: Zap },
    { name: "Announcements", path: "/admin/announcements", icon: Megaphone },
    { name: "Events & Tournaments", path: "/admin/events", icon: Trophy },
    { name: "Sports & Services", path: "/admin/sports-services", icon: Dumbbell },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;
  const homePath = isAdmin ? "/admin/dashboard" : "/user/dashboard";

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Sign Out?",
      text: "Are you sure you want to end your current session?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#27272a",
      confirmButtonText: "Yes, Sign Out",
      cancelButtonText: "Cancel",
      background: "#18181b",
      color: "#ffffff",
      allowOutsideClick: true,
    });

    if (result.isConfirmed) {
      logout();
      navigate("/login");
    }
  };

  // Close notifications popover on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isNotifOpen]);

  // Real-time live activity notification engine (5s poll)
  useEffect(() => {
    let isMounted = true;
    const checkLiveActivity = async () => {
      try {
        if (isAdmin) {
          const res = await api.get("/admin/dashboard");
          if (res.data?.success && isMounted) {
            const stats = res.data.stats || {};
            const prev = prevDataRef.current;

            if (prev.pendingPayments !== undefined && stats.PendingPayments > prev.pendingPayments) {
              const diff = stats.PendingPayments - prev.pendingPayments;
              const msg = `🔔 ${diff} new payment receipt(s) submitted for admin review!`;
              toast(msg, { id: "admin-pay-toast", duration: 5000 });
              setNotifications((prevList) => [
                {
                  id: "pay-" + Date.now(),
                  title: "New Payment Receipt",
                  message: msg,
                  time: "Just now",
                  icon: CreditCard,
                },
                ...prevList.slice(0, 9),
              ]);
            }

            if (prev.pendingMemberships !== undefined && stats.PendingApplications > prev.pendingMemberships) {
              const diff = stats.PendingApplications - prev.pendingMemberships;
              const msg = `🔔 ${diff} new member enrollment application(s) received!`;
              toast(msg, { id: "admin-mem-toast", duration: 5000 });
              setNotifications((prevList) => [
                {
                  id: "mem-" + Date.now(),
                  title: "New Member Application",
                  message: msg,
                  time: "Just now",
                  icon: ShieldCheck,
                },
                ...prevList.slice(0, 9),
              ]);
            }

            if (prev.totalUsers !== undefined && stats.TotalUsers > prev.totalUsers) {
              const diff = stats.TotalUsers - prev.totalUsers;
              const msg = `👤 ${diff} new user(s) registered on Z Sports!`;
              toast(msg, { id: "admin-user-toast", duration: 5000 });
              setNotifications((prevList) => [
                {
                  id: "user-" + Date.now(),
                  title: "New User Registered",
                  message: msg,
                  time: "Just now",
                  icon: Users,
                },
                ...prevList.slice(0, 9),
              ]);
            }

            prevDataRef.current = {
              pendingPayments: stats.PendingPayments,
              pendingMemberships: stats.PendingApplications,
              totalUsers: stats.TotalUsers,
            };
          }
        } else {
          // Member live notifications
          const [memberRes, summaryRes, notifRes] = await Promise.all([
            api.get("/membership/my-status").catch(() => null),
            api.get("/vouchers/my-summary").catch(() => null),
            api.get("/public/announcements").catch(() => null),
          ]);

          if (isMounted) {
            const memberData = memberRes?.data?.membership;
            const appData = memberRes?.data?.application;
            const summary = summaryRes?.data?.summary;
            const announcements = notifRes?.data?.data || [];
            const prev = prevDataRef.current;

            // 1. Membership status change (e.g. Approved or Active)
            const currentStatus = memberData?.MembershipStatus || appData?.ApplicationStatus;
            if (prev.memStatus && prev.memStatus !== "Active" && currentStatus === "Active") {
              const msg = "🎉 Congratulations! Your membership has been Approved! Your digital pass is active.";
              toast.success(msg, { id: "user-appr-toast", duration: 6000 });
              setNotifications((prevList) => [
                {
                  id: "appr-" + Date.now(),
                  title: "Membership Approved",
                  message: msg,
                  time: "Just now",
                  icon: CheckCircle2,
                },
                ...prevList.slice(0, 9),
              ]);
            }

            // 2. Receipt verified & marked paid (unpaid count decreases)
            if (prev.unpaidCount !== undefined && summary?.unpaidCount < prev.unpaidCount) {
              const msg = "✅ Your payment receipt has been verified and marked Paid!";
              toast.success(msg, { id: "user-pay-toast", duration: 5000 });
              setNotifications((prevList) => [
                {
                  id: "paid-" + Date.now(),
                  title: "Payment Approved",
                  message: msg,
                  time: "Just now",
                  icon: CheckCircle2,
                },
                ...prevList.slice(0, 9),
              ]);
            }

            // 3. New voucher issued (unpaid count increases)
            if (prev.unpaidCount !== undefined && summary?.unpaidCount > prev.unpaidCount) {
              const diff = summary.unpaidCount - prev.unpaidCount;
              const msg = `📄 ${diff} new monthly fee voucher has been issued for your account.`;
              toast(msg, { id: "user-vouch-toast", duration: 5000 });
              setNotifications((prevList) => [
                {
                  id: "vouch-" + Date.now(),
                  title: "New Voucher Issued",
                  message: msg,
                  time: "Just now",
                  icon: ReceiptText,
                },
                ...prevList.slice(0, 9),
              ]);
            }

            // 4. New club announcement posted
            if (prev.announcementCount !== undefined && announcements.length > prev.announcementCount) {
              const latest = announcements[0];
              const msg = `📢 New Club Notice: ${latest?.Title || "Administrative Announcement"}`;
              toast(msg, { id: "user-ann-toast", duration: 6000 });
              setNotifications((prevList) => [
                {
                  id: "ann-" + Date.now(),
                  title: "Club Notice",
                  message: msg,
                  time: "Just now",
                  icon: Megaphone,
                },
                ...prevList.slice(0, 9),
              ]);
            }

            prevDataRef.current = {
              memStatus: currentStatus,
              unpaidCount: summary?.unpaidCount,
              announcementCount: announcements.length,
            };
          }
        }
      } catch (err) {
        // Background polling fallback
      }
    };

    checkLiveActivity();
    const interval = setInterval(checkLiveActivity, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAdmin]);

  // Fetch real notifications from database
  const fetchDbNotifications = async () => {
    try {
      const res = await api.get("/notifications", { params: { limit: 8 } });
      if (res.data?.success) {
        setDbNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Background fallback
    }
  };

  useEffect(() => {
    fetchDbNotifications();

    const handleUpdate = () => fetchDbNotifications();
    window.addEventListener("scms-activity-event", handleUpdate);
    window.addEventListener("scms-notification-updated", handleUpdate);

    const intv = setInterval(fetchDbNotifications, 5000);
    return () => {
      window.removeEventListener("scms-activity-event", handleUpdate);
      window.removeEventListener("scms-notification-updated", handleUpdate);
      clearInterval(intv);
    };
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.IsRead) {
      try {
        await api.put(`/notifications/${notif.NotificationID}/read`);
        setDbNotifications((prev) =>
          prev.map((n) => (n.NotificationID === notif.NotificationID ? { ...n, IsRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (e) {
        // Silent
      }
    }
    setIsNotifOpen(false);
    if (notif.Link) {
      navigate(notif.Link);
    }
  };

  const handleMarkAllReadQuick = async () => {
    try {
      await api.put("/notifications/mark-all-read");
      setDbNotifications((prev) => prev.map((n) => ({ ...n, IsRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read!");
    } catch (e) {
      // Silent
    }
  };

  const formatNotifTime = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans flex flex-col md:flex-row">
      {/* =========================================================
          DESKTOP SIDEBAR
      ========================================================= */}
      <aside className="hidden md:flex w-64 flex-col border-r border-zinc-800 bg-[#0c0c0f] shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* LOGO (Links strictly to Portal Home, NEVER public website) */}
        <div className="flex h-20 items-center justify-between border-b border-zinc-800 px-6">
          <Link to={homePath} className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-orange-500/40 bg-zinc-900 p-1 transition duration-300 group-hover:border-orange-400">
              <img
                src="/z-sports-animated-logo.svg"
                alt="Z Sports Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-white leading-none">
                Z <span className="text-orange-500">SPORTS</span>
              </div>
              <div className="mt-1 text-[8.5px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                {isAdmin ? "Admin Portal" : "Member Portal"}
              </div>
            </div>
          </Link>
        </div>

        {/* USER PROFILE INFO CARD WITH AVATAR */}
        <div className="px-5 py-4 border-b border-zinc-800/60 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <Link to={isAdmin ? "/admin/dashboard" : "/user/profile"} className="relative shrink-0 group">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.fullName || "User Avatar"}
                  className="h-11 w-11 rounded-none object-cover border border-orange-500/60 transition group-hover:border-orange-400"
                />
              ) : (
                <div className="h-11 w-11 rounded-none bg-orange-500 font-black text-black text-base flex items-center justify-center transition group-hover:bg-white">
                  {user?.fullName?.charAt(0) || "U"}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-none bg-emerald-500 border border-black" />
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-none px-1.5 py-0.5 text-[8.5px] font-extrabold uppercase tracking-widest ${
                    isAdmin
                      ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                      : isMemberActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {isAdmin ? "Admin" : isMemberActive ? "Active Member" : "Pending Review"}
                </span>
              </div>
              <div className="mt-1 text-xs font-bold text-zinc-200 truncate" title={user?.fullName}>
                {user?.fullName || "User"}
              </div>
              <div className="text-[10.5px] font-medium text-zinc-400 truncate" title={user?.email}>
                {user?.email}
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 space-y-0.5 p-3">
          <div className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            {isAdmin ? "Club Management" : "Member Menu"}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isRestricted = !isAdmin && item.requiresActive && !isMemberActive;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`group flex items-center justify-between rounded-none px-3.5 py-2.5 text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-orange-500 text-black shadow-lg shadow-orange-500/10"
                    : "text-zinc-400 hover:bg-zinc-800/70 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    size={17}
                    className={`shrink-0 transition-colors ${
                      isActive ? "text-black" : "text-zinc-400 group-hover:text-orange-500"
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.isNotificationItem && unreadCount > 0 && (
                    <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-orange-500 text-[9px] font-black text-black animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                  {isRestricted && (
                    <span
                      title="Requires Active Approved Membership"
                      className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-400/90 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5"
                    >
                      <Lock size={10} />
                      Locked
                    </span>
                  )}
                  {isActive && <ChevronRight size={13} className="text-black" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* BOTTOM ACTIONS (No Website Link) */}
        <div className="border-t border-zinc-800 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-none border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-red-400 transition hover:bg-red-500 hover:text-white"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* =========================================================
          MOBILE TOPBAR
      ========================================================= */}
      <div className="md:hidden flex h-16 items-center justify-between border-b border-zinc-800 bg-[#0c0c0f] px-5 sticky top-0 z-40">
        <Link to={homePath} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-orange-500/40 bg-zinc-900 p-0.5">
            <img
              src="/z-sports-animated-logo.svg"
              alt="Z Sports Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white">
            Z <span className="text-orange-500">SPORTS</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* MOBILE NOTIFICATION BELL */}
          <Link
            to={isAdmin ? "/admin/notifications" : "/user/notifications"}
            className="relative rounded-none border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 hover:border-orange-500 hover:text-white"
            title="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-black text-black">
                {unreadCount}
              </span>
            )}
          </Link>

          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user?.fullName}
              className="h-8 w-8 rounded-none object-cover border border-orange-500/60"
            />
          ) : (
            <div className="h-8 w-8 rounded-none bg-orange-500 font-bold text-black flex items-center justify-center text-xs">
              {user?.fullName?.charAt(0) || "U"}
            </div>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-none border border-zinc-700 bg-zinc-800 p-2 text-zinc-200"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER (Closes when clicking anywhere on the screen) */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/85 backdrop-blur-sm animate-fadeIn transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="h-full w-4/5 max-w-xs bg-[#0c0c0f] p-5 border-r border-zinc-800 flex flex-col justify-between overflow-y-auto animate-slideInLeft transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user?.fullName}
                      className="h-9 w-9 rounded-none object-cover border border-orange-500/60"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-none bg-orange-500 font-bold text-black flex items-center justify-center text-xs">
                      {user?.fullName?.charAt(0) || "U"}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-white truncate max-w-[150px]">
                      {user?.fullName}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-orange-400">
                      {isAdmin ? "Admin" : isMemberActive ? "Active Member" : "Pending"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  const isRestricted = !isAdmin && item.requiresActive && !isMemberActive;

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between rounded-none px-3.5 py-3 text-xs font-bold ${
                        isActive
                          ? "bg-orange-500 text-black"
                          : "text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} />
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.isNotificationItem && unreadCount > 0 && (
                          <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-orange-500 text-[9px] font-black text-black">
                            {unreadCount}
                          </span>
                        )}
                        {isRestricted && (
                          <span className="flex items-center gap-1 text-[8.5px] uppercase font-bold text-amber-400">
                            <Lock size={10} /> Locked
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-none border border-red-500/20 bg-red-500/10 py-2.5 text-xs font-bold uppercase tracking-wider text-red-400 transition hover:bg-red-500 hover:text-white"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MAIN CONTENT AREA
      ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR (No Website Link) */}
        <header className="hidden md:flex h-16 items-center justify-between border-b border-zinc-800 bg-[#0f0f13] px-8">
          <div className="flex items-center gap-3 text-xs text-zinc-400 font-semibold">
            <span className="text-zinc-400 uppercase tracking-wider">
              {isAdmin ? "Administration" : "Member Workspace"}
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-orange-500 font-bold uppercase tracking-wider">
              {navItems.find((n) => n.path === location.pathname)?.name || "Dashboard"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-[11px] font-medium text-zinc-400 border border-zinc-800 bg-zinc-900/80 px-3 py-1.5">
              📅 {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </div>

            {/* LIVE ACTIVITY NOTIFICATIONS BELL WITH POPOVER */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative rounded-none border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-300 transition hover:border-orange-500 hover:text-white"
                title="Activity & Notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-orange-500 text-[9px] font-black text-black animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* NOTIFICATION POPOVER */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-none border border-zinc-800 bg-[#121215] shadow-2xl z-50 animate-slideDown overflow-hidden">
                  <div className="flex items-center justify-between border-b border-zinc-800 bg-[#16161b] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Bell size={14} className="text-orange-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        Notifications & Alerts
                      </span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/30 px-1.5 py-0.2 font-black">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllReadQuick}
                        className="text-[10px] text-zinc-400 hover:text-orange-400 font-bold uppercase tracking-wider transition"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/60">
                    {dbNotifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-zinc-500">
                        No notifications found.
                      </div>
                    ) : (
                      dbNotifications.map((n) => (
                        <div
                          key={n.NotificationID}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3.5 hover:bg-zinc-800/40 transition flex items-start gap-3 cursor-pointer ${
                            !n.IsRead ? "bg-orange-500/5" : ""
                          }`}
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-orange-500/10 border border-orange-500/30 text-orange-400">
                            {!n.IsRead ? (
                              <span className="h-2 w-2 rounded-full bg-orange-500" />
                            ) : (
                              <Zap size={13} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-white leading-tight flex items-center justify-between gap-2">
                              <span className="truncate">{n.Title}</span>
                              <span className="text-[9.5px] text-zinc-500 font-mono shrink-0">
                                {formatNotifTime(n.CreatedAt)}
                              </span>
                            </div>
                            <div className="mt-1 text-[11px] text-zinc-400 leading-snug line-clamp-2">
                              {n.Message}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t border-zinc-800 bg-[#0c0c0f] p-2.5">
                    <Link
                      to={isAdmin ? "/admin/notifications" : "/user/notifications"}
                      onClick={() => setIsNotifOpen(false)}
                      className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-bold uppercase tracking-wider text-orange-400 hover:text-white bg-orange-500/10 hover:bg-orange-500 hover:text-black border border-orange-500/20 transition"
                    >
                      <span>View All Notifications Page</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* USER PROFILE INFO IN TOPBAR WITH AVATAR */}
            <Link
              to={isAdmin ? "/admin/dashboard" : "/user/profile"}
              className="flex items-center gap-2.5 pl-3 border-l border-zinc-800 group"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.fullName || "User Avatar"}
                  className="h-8 w-8 rounded-none object-cover border border-orange-500/60 transition group-hover:border-orange-400"
                />
              ) : (
                <div className="h-8 w-8 rounded-none bg-orange-500 font-black text-black flex items-center justify-center text-xs transition group-hover:bg-white">
                  {user?.fullName?.charAt(0) || "U"}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-white leading-tight group-hover:text-orange-400 transition">
                  {user?.fullName}
                </div>
                <div className="text-[10px] text-zinc-400">
                  {isAdmin ? "System Admin" : isMemberActive ? "Active Member" : "Pending Review"}
                </div>
              </div>
            </Link>
          </div>
        </header>

        {/* PAGE BODY (SMOOTH TRANSITION ON PAGE CHANGES) */}
        <main
          key={location.pathname}
          className="flex-1 p-5 md:p-8 max-w-7xl w-full mx-auto animate-fadeIn transition-all duration-300"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
