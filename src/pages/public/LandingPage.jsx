import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import EnrollmentModal from "../../components/membership/EnrollmentModal";
import EventDetailsModal from "../../components/events/EventDetailsModal";

import {
  ArrowRight,
  ArrowUp,
  ShieldCheck,
  Users,
  Home,
  ReceiptText,
  CalendarDays,
  Bell,
  CheckCircle2,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Clock,
  Zap,
  Gem,
  Trophy,
  Dumbbell,
  Target,
  CreditCard,
  UserCheck,
  Compass,
  AlertCircle,
  Info,
} from "lucide-react";

function CountUp({ value, suffix = "", duration = 1800 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let animationFrame;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Smooth ease-out counting animation
      const easedProgress = 1 - Math.pow(1 - progress, 4);

      setCount(Math.floor(easedProgress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    setCount(0);
    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <>
      {count.toLocaleString()}
      {suffix}
    </>
  );
}

function LandingPage() {
  const { isAuthenticated, role, user, logout } = useAuth();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(0);

  // Database driven state
  const [plans, setPlans] = useState([]);
  const [sports, setSports] = useState([]);
  const [services, setServices] = useState([]);
  const [events, setEvents] = useState([]);
  const [clubStats, setClubStats] = useState(null);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedEventForDetails, setSelectedEventForDetails] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch real database content
  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const [plansRes, sportsRes, servicesRes, eventsRes, statsRes] = await Promise.all([
          api.get("/public/plans"),
          api.get("/public/sports"),
          api.get("/public/services"),
          api.get("/public/events"),
          api.get("/public/club-info"),
        ]);

        if (plansRes.data.success) setPlans(plansRes.data.data);
        if (sportsRes.data.success) setSports(sportsRes.data.data);
        if (servicesRes.data.success) setServices(servicesRes.data.data);
        if (eventsRes.data.success) setEvents(eventsRes.data.data);
        if (statsRes.data.success) setClubStats(statsRes.data);
      } catch (error) {
        console.error("Error loading public club data:", error);
      }
    };

    fetchClubData();

    // 5-second live auto-refresh for public content
    const interval = setInterval(() => {
      fetchClubData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About Us", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Sports Arenas", href: "#sports" },
    { name: "Membership Plans", href: "#plans" },
    { name: "Tournaments", href: "#events" },
    { name: "FAQ", href: "#faq" },
  ];

  const portals = [
    {
      icon: ShieldCheck,
      title: "Club Administration",
      subtitle: "Complete Management Control",
      description:
        "Manage member approvals, generate monthly vouchers, calculate late fine penalties, review payment receipts and oversee sports facilities.",
      features: [
        "Member enrollment approval & rejection",
        "Monthly fee voucher generation",
        "Payment receipt verification & Cloudinary proof",
        "Late fine & advance payment management",
      ],
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=2000&q=85",
    },
    {
      icon: Home,
      title: "Member Portal",
      subtitle: "Everything in One Place",
      description:
        "Members can manage their digital club card, view monthly fee vouchers, upload external payment receipts, track prepayments and join tournaments.",
      features: [
        "Digital membership card with ID",
        "Monthly & advance fee voucher tracking",
        "Receipt slip upload & approval status",
        "Tournament registrations & announcements",
      ],
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
    },
    {
      icon: Zap,
      title: "Advance Fee System",
      subtitle: "Hassle-Free Prepayments",
      description:
        "Choose to pay 1 to 12 months in advance. The system automatically calculates dues, creates advance vouchers, and skips future monthly billing.",
      features: [
        "Custom advance months selection",
        "Zero duplicate monthly vouchers generated",
        "Instant prepaid ledger update on approval",
        "Late penalty protection",
      ],
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    },
    {
      icon: Trophy,
      title: "Tournaments & Leagues",
      subtitle: "Competitive Sports Platform",
      description:
        "Track club tournaments, seasonal leagues, bracket schedules, and 1-click event registration for active club members.",
      features: [
        "Cricket leagues & Tennis opens",
        "Olympic swimming championships",
        "Real-time participant counts",
        "Medals & prize records",
      ],
      image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  const modules = [
    {
      icon: Users,
      title: "Member Accounts",
      description: "Role-based user management with distinct permissions for members and club administrators.",
    },
    {
      icon: Gem,
      title: "Tiered Packages",
      description: "Custom membership plans with duration, monthly fee schedules, and facility privileges.",
    },
    {
      icon: ReceiptText,
      title: "Monthly Vouchers",
      description: "Automated generation of fee vouchers with unique serial numbers, barcodes and deposit details.",
    },
    {
      icon: AlertCircle,
      title: "Dynamic Late Fines",
      description: "Configurable due dates and automated per-day overdue penalties applied to unpaid slips.",
    },
    {
      icon: CreditCard,
      title: "Receipt Verification",
      description: "Secure Cloudinary receipt image upload and admin verification workflow.",
    },
    {
      icon: Zap,
      title: "Prepayment Ledger",
      description: "Advance payment module preventing future monthly voucher generation for prepaid months.",
    },
    {
      icon: Bell,
      title: "Club Notices",
      description: "Broadcast urgent administrative notices and membership updates directly to member dashboards.",
    },
    {
      icon: Trophy,
      title: "Sports Competitions",
      description: "Create and organize athletic events with registration caps, dates, and venues.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create Account",
      description: "Sign up as a user and explore all sports arenas, fitness services, and club membership plans.",
    },
    {
      number: "02",
      title: "Select Membership",
      description: "Choose your preferred tier (Bronze, Silver, Gold, Platinum) and submit your enrollment details.",
    },
    {
      number: "03",
      title: "Pay & Upload Slip",
      description: "View generated fee voucher, pay via bank transfer/mobile cash, and upload your payment receipt.",
    },
    {
      number: "04",
      title: "Access All Facilities",
      description: "Upon admin approval, receive your digital membership card and enjoy full club privileges.",
    },
  ];

  const faqData = [
    {
      question: "How do I become an official member of Z Sports Club?",
      answer:
        "First, register a free account. Next, browse our Membership Plans section and click 'Buy Membership'. Fill out your address and emergency contact details. Once submitted, your personal Member Dashboard is immediately activated while administration reviews your application.",
    },
    {
      question: "How do monthly fee payments and receipt uploads work?",
      answer:
        "Administration generates monthly fee vouchers for each active member. You can view and download your voucher slip directly from your Member Dashboard. After paying via bank deposit, JazzCash, EasyPaisa or club cashier, simply upload a photo or screenshot of your receipt. Admin verifies the receipt to mark your voucher Paid.",
    },
    {
      question: "How does the late payment fine calculation work?",
      answer:
        "Monthly vouchers have a specified Due Date (e.g. 10th of every month). If payment is made after the due date, an automatic daily penalty (e.g. Rs. 100/day) is added to your voucher total. Administration can configure the due date and late fine rate in the system.",
    },
    {
      question: "Can I pay several months in advance?",
      answer:
        "Yes! Our Advance Payment system allows members to pay up to 12 months ahead. The system calculates the total fee, generates an Advance Voucher, and upon payment approval, records the prepaid months. Crucially, the system skips voucher generation for all advance-paid months so you are never double-billed.",
    },
    {
      question: "How can someone obtain Administrator privileges?",
      answer:
        "Admin access is strictly controlled. Create a standard account, and then a database administrator can securely update that user's role from 'user' to 'admin' in SQL Server. No public admin registration is exposed.",
    },
    {
      question: "Are sports facilities and tournaments included?",
      answer:
        "Yes, our club provides international grade arenas including cricket nets, Olympic swimming pools, synthetic tennis courts, indoor badminton, squash courts, and high-performance gyms. Members can also register for tournaments directly from their dashboard.",
    },
  ];

  const handleNavClick = (href) => {
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBuyPlan = (plan) => {
    setSelectedPlanForModal(plan);
    setIsEnrollModalOpen(true);
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-[#0c0c0e] font-sans text-zinc-100">
      <style>{`
        .sports-section-bg {
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-attachment: scroll;
        }
        .sports-bg-about { background-image: linear-gradient(rgba(12,12,14,.88), rgba(12,12,14,.94)), url("https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=2000&q=85"); }
        .sports-bg-portals { background-image: linear-gradient(rgba(9,9,11,.89), rgba(9,9,11,.94)), url("https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=2000&q=85"); }
        .sports-bg-plans { background-image: linear-gradient(rgba(18,18,22,.90), rgba(18,18,22,.95)), url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2000&q=85"); }
        .sports-bg-arenas { background-image: linear-gradient(rgba(9,9,11,.86), rgba(9,9,11,.93)), url("https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=2000&q=85"); }
        .sports-bg-modules { background-image: linear-gradient(rgba(18,18,22,.90), rgba(18,18,22,.95)), url("https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=2000&q=85"); }
        .sports-bg-services { background-image: linear-gradient(rgba(9,9,11,.88), rgba(9,9,11,.94)), url("https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=2000&q=85"); }
        .sports-bg-events { background-image: linear-gradient(rgba(18,18,22,.88), rgba(18,18,22,.94)), url("https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?auto=format&fit=crop&w=2000&q=85"); }
        .sports-bg-workflow { background-image: linear-gradient(rgba(9,9,11,.90), rgba(9,9,11,.95)), url("https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=2000&q=85"); }
        .sports-bg-faq { background-image: linear-gradient(rgba(0,0,0,.76), rgba(0,0,0,.90)), url("https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=2000&q=85"); }
         @media (prefers-reduced-motion: reduce) {
          .sports-section-bg { background-attachment: scroll; }
        }
      `}</style>
      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "border-b border-[#e8e1e8] bg-white/95 shadow-sm backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-[82px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          {/* LOGO */}
          <button
            onClick={scrollToTop}
            className="group flex items-center gap-3"
          >
            <div
              className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border transition-all duration-300 ${
                isScrolled
                  ? "border-[#e4dce5] bg-white shadow-sm"
                  : "border-white/30 bg-white/10 backdrop-blur-md"
              }`}
            >
              <img
                src="/z-sports-animated-logo.svg"
                alt="Z Sports Logo"
                className="h-full w-full object-cover p-1"
              />
            </div>

            <div className="text-left">
              <div
                className={`text-lg font-extrabold leading-none tracking-tight transition-colors ${
                  isScrolled ? "text-[#18181b]" : "text-white"
                }`}
              >
                Z
                <span
                  className={`font-light ml-1 ${
                    isScrolled ? "text-orange-500" : "text-orange-400"
                  }`}
                >
                  SPORTS
                </span>
              </div>

              <div
                className={`mt-1 text-[8px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                  isScrolled ? "text-[#71717a]" : "text-white/65"
                }`}
              >
                Sports Club Management
              </div>
            </div>
          </button>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className={`relative text-[13px] font-semibold transition-colors ${
                  isScrolled
                    ? "text-[#27272a] hover:text-orange-600"
                    : "text-white/90 hover:text-orange-400"
                }`}
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* DESKTOP CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={role === "admin" ? "/admin/dashboard" : "/user/dashboard"}
                  className="inline-flex items-center gap-2 bg-orange-500 px-6 py-3 text-[12px] font-bold text-black transition-all hover:bg-black hover:text-white hover:shadow-lg"
                >
                  <Home size={15} />
                  {role === "admin" ? "Admin Panel" : "Members Dashboard"}
                </Link>

                <button
                  onClick={logout}
                  className={`px-4 py-3 text-[12px] font-semibold transition ${
                    isScrolled
                      ? "border border-[#dcd2df] text-[#18181b] hover:bg-zinc-100"
                      : "border border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                  }`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className={`border px-5 py-3 text-[12px] font-semibold transition ${
                    isScrolled
                      ? "border-[#dcd2df] text-[#18181b] hover:bg-zinc-100"
                      : "border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                  }`}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-orange-500 px-6 py-3 text-[12px] font-bold text-black transition-all hover:bg-black hover:text-white hover:shadow-lg"
                >
                  Get Started
                  <ArrowRight size={15} />
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`rounded-full p-2 lg:hidden transition ${
              isScrolled ? "text-[#18181b]" : "text-white"
            }`}
          >
            {isMobileMenuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`border-t border-[#e8e1e8] bg-white transition-all duration-300 lg:hidden shadow-2xl ${
            isMobileMenuOpen
              ? "max-h-[600px] opacity-100"
              : "pointer-events-none max-h-0 overflow-hidden opacity-0"
          }`}
        >
          <div className="space-y-1 px-5 py-5">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className="block w-full border-b border-[#eee9ee] py-4 text-left text-sm font-semibold text-[#18181b] hover:text-orange-500 transition-colors"
              >
                {link.name}
              </button>
            ))}

            <div className="pt-4">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    to={role === "admin" ? "/admin/dashboard" : "/user/dashboard"}
                    className="block w-full bg-orange-500 py-3 text-center text-sm font-bold text-black hover:bg-black hover:text-white transition"
                  >
                    Go to {role === "admin" ? "Admin Panel" : "Members Dashboard"}
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full border border-[#dcd2df] py-3 text-center text-sm font-semibold text-[#18181b] hover:bg-zinc-100 transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    className="border border-[#dcd2df] py-3 text-center text-sm font-semibold text-[#18181b] hover:bg-zinc-50 transition"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="bg-[#18181b] py-3 text-center text-sm font-bold text-white hover:bg-orange-500 hover:text-black transition"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OUTSIDE CLICK BACKDROP */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* =========================================================
          HERO SECTION
      ========================================================= */}
      <section id="home" className="relative min-h-[780px] overflow-hidden bg-[#09090b]">
        {/* HERO BACKGROUND IMAGE */}
        <img
          src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=2200&q=90"
          alt="Z Sports Club"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />

        {/* OVERLAYS (Black & Orange transitions) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-black/60" />
        <div className="absolute top-1/4 right-10 h-96 w-96 rounded-full bg-orange-500/10 blur-[130px] pointer-events-none" />

        {/* HERO CONTENT: 2-COLUMN GRID (LOGO OPPOSITE TO WORDING) */}
        <div className="relative z-10 mx-auto grid min-h-[780px] max-w-7xl grid-cols-1 items-center gap-12 px-5 pt-28 pb-28 lg:grid-cols-12 sm:px-6 lg:px-8">
          {/* LEFT: WORDING */}
          <div className="lg:col-span-7">
            <div className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em] text-orange-500">
              <span className="h-px w-10 bg-orange-500" />
              Complete Sports Club Management Platform
            </div>

            <h1 className="text-[44px] font-black leading-[1.03] tracking-[-0.03em] text-white sm:text-[62px] lg:text-[74px]">
              Stronger Club.
              <br />
              <span className="font-normal text-orange-500">
                Peak Performance.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-8 text-zinc-300 sm:text-[16px]">
              Z Sports Club brings athletes, administrative oversight, membership subscription workflows, monthly fee vouchers, late fine automation, and tournament bookings together through one connected system.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <button
                onClick={() => handleNavClick("#plans")}
                className="inline-flex items-center gap-3 rounded-none bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-wider text-black transition-all hover:bg-white hover:shadow-2xl"
              >
                Buy Membership
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => handleNavClick("#sports")}
                className="inline-flex items-center gap-3 rounded-none border border-zinc-700 bg-zinc-900/90 px-7 py-4 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm transition hover:border-orange-500 hover:text-orange-400"
              >
                Explore Arenas
                <Compass size={16} />
              </button>

              <button
                onClick={() => handleNavClick("#about")}
                className="inline-flex items-center gap-3 rounded-none border border-white/20 bg-white/5 px-7 py-4 text-xs font-bold uppercase tracking-wider text-zinc-300 backdrop-blur-sm transition hover:bg-white hover:text-black"
              >
                Club Overview
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* RIGHT: ANIMATED Z SPORTS LOGO (OPPOSITE TO WORDING) */}
          <div className="flex items-center justify-center lg:col-span-5">
            <div className="relative flex items-center justify-center">
              {/* Pulsing Backglow Orb */}
              <div className="absolute h-80 w-80 rounded-full bg-orange-500/25 blur-[100px] pointer-events-none animate-pulse" />

              {/* Glass Display Card Pedestal */}
              <div className="relative flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl">
                {/* SVG Animated Logo */}
                <div className="relative h-64 w-64 sm:h-80 sm:w-80 transition duration-700 hover:scale-105">
                  <img
                    src="/z-sports-animated-logo.svg"
                    alt="Z Sports Animated Logo"
                    className="h-full w-full object-contain filter drop-shadow-[0_0_35px_rgba(249,115,22,0.4)]"
                  />
                </div>

                {/* Badge Below Logo */}
                <div className="mt-4 flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-400">
                    Official Z Sports Club Emblem
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HERO BOTTOM STATS RIBBON */}
<div className="absolute bottom-0 left-0 right-0 z-10 border-t border-zinc-800 bg-[#0c0c0f]/85 backdrop-blur-xl">
  <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-4 sm:grid-cols-4 sm:gap-0 sm:px-0 sm:py-0">
    {[
      {
        value: 35,
        suffix: "+",
        label: "Sports Arenas",
        icon: Dumbbell,
      },
      {
        value: 25,
        suffix: "+",
        label: "Elite Services",
        icon: Sparkles,
      },
      {
        value: 275,
        suffix: clubStats?.stats?.ActiveMembers ? "" : "+",
        label: "Active Members",
        icon: Users,
      },
      {
        value: "24/7",
        label: "Organized Club Access",
        icon: Clock,
        isStatic: true,
      },
    ].map((stat, index) => {
      const Icon = stat.icon;

      return (
        <div
          key={stat.label}
          className={`group relative overflow-hidden border border-zinc-800 bg-[#121215] px-5 py-5 transition-all duration-300
            hover:border-orange-500/70
            hover:bg-orange-500/5
            hover:shadow-lg
            hover:shadow-orange-500/10
            sm:border-y-0 sm:border-l-0 sm:border-r-0 sm:px-7 sm:py-6
            ${
              index !== 0
                ? "sm:border-l sm:border-zinc-800"
                : ""
            }`}
        >
          {/* Orange hover glow */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-500/0 blur-3xl transition-all duration-500 group-hover:bg-orange-500/20" />

          {/* Top orange accent */}
          <div className="absolute left-0 top-0 h-[2px] w-0 bg-orange-500 transition-all duration-500 group-hover:w-full" />

          <div className="relative flex items-center justify-between">
            <div>
              <div className="text-2xl font-black tracking-tight text-white transition-colors duration-300 group-hover:text-orange-400 sm:text-3xl">
                {stat.isStatic ? (
                  stat.value
                ) : (
                  <CountUp
                    value={Number(stat.value)}
                    suffix={stat.suffix}
                  />
                )}
              </div>

              <div className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500 transition-colors duration-300 group-hover:text-orange-400">
                {stat.label}
              </div>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-zinc-800 bg-zinc-900 text-zinc-500 transition-all duration-300 group-hover:border-orange-500/50 group-hover:bg-orange-500 group-hover:text-black group-hover:shadow-lg group-hover:shadow-orange-500/20">
              <Icon size={19} />
            </div>
          </div>

          {/* Bottom hover indicator */}
          <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-orange-500 transition-all duration-500 group-hover:w-full" />
        </div>
      );
    })}
  </div>
</div>
      </section>

      {/* =========================================================
          ABOUT SECTION
      ========================================================= */}
      <section id="about" className="sports-section-bg sports-bg-about scroll-mt-20 py-24 sm:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-6 lg:grid-cols-2 lg:px-8">
          {/* IMAGE */}
          <div className="relative">
            <div className="overflow-hidden border border-zinc-800">
              <img
                src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=2200&q=90"
                alt="Modern sports complex"
                className="h-[480px] w-full object-cover transition duration-700 hover:scale-105 sm:h-[540px]"
              />
            </div>

            <div className="absolute bottom-0 left-0 bg-black p-6 border-t-2 border-r border-orange-500 text-white sm:px-9">
              <div className="text-3xl font-black text-orange-500">1</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-zinc-400">
                Connected Club System
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              About Z Sports Club
            </div>

            <h2 className="mt-5 text-[38px] font-black leading-[1.08] tracking-tight text-white sm:text-[50px]">
              One platform for your
              <span className="block font-normal text-orange-500">
                entire athletic journey.
              </span>
            </h2>

            <p className="mt-6 text-[15px] leading-8 text-zinc-300">
              Z Sports Club combines world-class athletic facilities with modern digital membership and fee management. Instead of manual vouchers and untracked receipts, every application, payment, and voucher is stored with relational integrity in SQL Server.
            </p>

            <p className="mt-4 text-[15px] leading-8 text-zinc-400">
              Club members can monitor their digital cards, track upcoming fees, submit Cloudinary-backed payment proofs, request advance payments, and register for championships.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Role-Based Club Access",
                "Automated Fee Vouchers",
                "Late Payment Fines Logic",
                "Advance Prepayment System",
                "Digital Membership Cards",
                "Tournaments & Registration",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 border-b border-zinc-800 pb-3">
                  <CheckCircle2 size={16} className="text-orange-500 shrink-0" />
                  <span className="text-xs font-bold text-zinc-200">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-none bg-orange-500 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-black transition hover:bg-white hover:shadow-xl"
              >
                Learn More About Us & Team
                <ArrowRight size={15} />
              </Link>

              <button
                onClick={() => handleNavClick("#portals")}
                className="inline-flex items-center gap-3 border-b-2 border-orange-500 pb-2 text-xs font-extrabold uppercase tracking-wider text-white transition hover:text-orange-400"
              >
                Explore dedicated portals
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          PORTALS SECTION
      ========================================================= */}
      <section id="portals" className="sports-section-bg sports-bg-portals scroll-mt-20 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              Dedicated Workspaces
            </div>

            <h2 className="mt-5 text-[38px] font-black leading-tight text-white sm:text-[48px]">
              A portal designed for
              <span className="block font-normal text-orange-500">
                every club responsibility.
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-[14px] leading-7 text-zinc-400">
              Every user receives an intuitive workspace equipped with the exact tools and records needed for seamless athletic and administrative operations.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {portals.map((portal) => {
              const Icon = portal.icon;

              return (
                <div
                  key={portal.title}
                  className="group grid overflow-hidden border border-zinc-800 bg-[#121215] transition duration-300 hover:border-orange-500/60 md:grid-cols-2"
                >
                  {/* IMAGE */}
                  <div className="relative min-h-[300px] overflow-hidden">
                    <img
                      src={portal.image}
                      alt={portal.title}
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute bottom-6 left-6">
                      <Icon size={38} className="text-orange-500" />
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="flex flex-col justify-center p-6 sm:p-7">
                    <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-orange-500">
                      {portal.subtitle}
                    </div>

                    <h3 className="mt-2 text-[21px] font-black text-white">
                      {portal.title}
                    </h3>

                    <p className="mt-3 text-[12.5px] leading-6 text-zinc-400">
                      {portal.description}
                    </p>

                    <div className="mt-5 space-y-2">
                      {portal.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center gap-2 text-[11px] font-medium text-zinc-300"
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-none bg-orange-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          MEMBERSHIP PLANS (DATABASE DRIVEN)
      ========================================================= */}
      <section id="plans" className="sports-section-bg sports-bg-plans scroll-mt-20 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              Membership Plans
              <span className="h-px w-8 bg-orange-500" />
            </div>

            <h2 className="mt-5 text-[38px] font-black leading-tight text-white sm:text-[48px]">
              Choose your tier.
              <span className="block font-normal text-orange-500">
                Unlock peak performance.
              </span>
            </h2>

            <p className="mt-4 text-[14px] leading-7 text-zinc-400">
              Select an official membership package. Non-members can sign up and enroll in seconds.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.PlanID}
                className="group relative flex flex-col justify-between overflow-hidden border border-zinc-800 bg-[#0e0e11] p-6 transition-all duration-300 hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">
                      Tier {plan.PlanID}
                    </span>
                    <span className="rounded-none border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[9px] font-bold uppercase text-zinc-400">
                      {plan.DurationMonths} Months
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-black text-white group-hover:text-orange-400 transition">
                    {plan.PlanName}
                  </h3>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">
                      Rs. {Number(plan.MonthlyFee).toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">/ month</span>
                  </div>

                  <p className="mt-4 text-xs leading-6 text-zinc-400 min-h-[60px]">
                    {plan.Description}
                  </p>

                  <div className="mt-6 border-t border-zinc-800/80 pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-zinc-300">
                      <CheckCircle2 size={13} className="text-orange-500 shrink-0" />
                      Digital Membership Card
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-300">
                      <CheckCircle2 size={13} className="text-orange-500 shrink-0" />
                      Monthly Fee Voucher Access
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-300">
                      <CheckCircle2 size={13} className="text-orange-500 shrink-0" />
                      Tournament Eligibility
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleBuyPlan(plan)}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-none bg-zinc-800 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 group-hover:bg-orange-500 group-hover:text-black"
                >
                  Buy Membership
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          SPORTS ARENAS (DATABASE DRIVEN)
      ========================================================= */}
      <section id="sports" className="sports-section-bg sports-bg-arenas scroll-mt-20 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
                <span className="h-px w-8 bg-orange-500" />
                World-Class Infrastructure
              </div>

              <h2 className="mt-5 text-[38px] font-black leading-tight text-white sm:text-[48px]">
                Olympic standards.
                <span className="block font-normal text-orange-500">
                  Built for champion athletes.
                </span>
              </h2>
            </div>

            <p className="max-w-md text-[14px] leading-7 text-zinc-400">
              Z Sports Club houses multi-sport complexes with international specifications, tournament illumination, climate control, and digital scoring.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sports.map((sport, index) => (
              <div
                key={sport.SportID}
                className="group overflow-hidden border border-zinc-800 bg-[#121215] transition hover:border-orange-500/60"
              >
                <div className="relative flex h-56 items-center justify-center overflow-hidden bg-zinc-900">
                  <img
                    src={sport.ImageURL || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"}
                    alt={sport.SportName}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <span className="absolute right-4 top-4 rounded-none bg-black/60 px-2 py-0.5 text-[9px] font-bold text-orange-400 border border-zinc-700 backdrop-blur-md">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="text-base font-extrabold text-white group-hover:text-orange-400 transition">
                    {sport.SportName}
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-zinc-400">
                    {sport.Description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          CORE MODULES
      ========================================================= */}
      <section className="sports-section-bg sports-bg-modules py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
                <span className="h-px w-8 bg-orange-500" />
                System Modules
              </div>

              <h2 className="mt-5 text-[38px] font-black leading-tight text-white sm:text-[48px]">
                Everything your sports club
                <span className="block font-normal text-orange-500">
                  needs in one system.
                </span>
              </h2>
            </div>

            <p className="text-[14px] leading-7 text-zinc-400">
              Manage complete club operations through connected modules built around everyday sports, administrative, and financial workflows.
            </p>
          </div>

          <div className="mt-14 grid border-l border-t border-zinc-800 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.title}
                  className="group border-b border-r border-zinc-800 p-7 transition hover:bg-orange-500/5 hover:border-orange-500/40"
                >
                  <div className="flex h-11 w-11 items-center justify-center border border-zinc-700 bg-zinc-900 text-orange-500 transition group-hover:border-orange-500 group-hover:bg-orange-500 group-hover:text-black">
                    <Icon size={20} />
                  </div>

                  <h3 className="mt-6 text-[15px] font-bold text-white">
                    {module.title}
                  </h3>

                  <p className="mt-2 text-[11px] leading-6 text-zinc-400">
                    {module.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          CLUB SERVICES
      ========================================================= */}
      <section id="services" className="sports-section-bg sports-bg-services scroll-mt-20 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              Member Amenities
              <span className="h-px w-8 bg-orange-500" />
            </div>

            <h2 className="mt-5 text-[38px] font-black leading-tight text-white sm:text-[48px]">
              Specialized services.
              <span className="block font-normal text-orange-500">
                Beyond traditional gyms.
              </span>
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((svc) => (
              <div
                key={svc.ServiceID}
                className="overflow-hidden border border-zinc-800 bg-[#121215] transition hover:border-orange-500/50"
              >
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={svc.ImageURL || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"}
                    alt={svc.ServiceName}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>
                <div className="p-5">
                  <h4 className="text-sm font-black text-white">{svc.ServiceName}</h4>
                  <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                    {svc.Description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-3 rounded-none bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-wider text-black transition hover:bg-white hover:shadow-2xl"
            >
              Explore Full Detailed Services & Amenities
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          UPCOMING EVENTS & TOURNAMENTS
      ========================================================= */}
      <section id="events" className="sports-section-bg sports-bg-events scroll-mt-20 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
                <span className="h-px w-8 bg-orange-500" />
                Competitions & Championships
              </div>

              <h2 className="mt-5 text-[38px] font-black leading-tight text-white sm:text-[48px]">
                Upcoming Tournaments.
                <span className="block font-normal text-orange-500">
                  Register and compete.
                </span>
              </h2>
            </div>

            <Link
              to={isAuthenticated ? "/user/events" : "/login"}
              className="inline-flex items-center gap-2 rounded-none border border-zinc-700 bg-zinc-800 px-5 py-3 text-xs font-bold text-white transition hover:bg-orange-500 hover:text-black"
            >
              View Member Events Portal
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {events.map((ev) => (
              <div
                key={ev.EventID}
                className="group overflow-hidden border border-zinc-800 bg-[#0e0e11] transition duration-300 hover:border-orange-500"
              >
                <div className="relative h-48 overflow-hidden bg-zinc-900">
                  <img
                    src={ev.EventImageURL || "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=80"}
                    alt={ev.EventName}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                  <div className="absolute top-3 left-3 bg-orange-500 px-2 py-0.5 text-[9px] font-black text-black">
                    {ev.SportName || "Tournament"}
                  </div>
                </div>

                <div className="p-6">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                    📅 {new Date(ev.EventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>

                  <h3 className="mt-2 text-base font-extrabold text-white group-hover:text-orange-400 transition">
                    {ev.EventName}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-zinc-400">
                    {ev.Description}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3 text-[11px] text-zinc-400">
                    <span>📍 {ev.Venue || "Main Complex"}</span>
                    <span>👥 {ev.RegisteredCount || 0} / {ev.MaximumParticipants || "Open"}</span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => setSelectedEventForDetails(ev)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-none border border-zinc-700 bg-zinc-800/80 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
                    >
                      <Info size={13} />
                      View Details & Rules
                    </button>

                    <Link
                      to={isAuthenticated ? "/user/events" : "/login"}
                      className="block w-full text-center rounded-none bg-orange-500 py-2.5 text-xs font-extrabold uppercase text-black transition hover:bg-white"
                    >
                      {isAuthenticated ? "Join Tournament" : "Login to Register"}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}
      <section className="sports-section-bg sports-bg-workflow py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              Workflow
            </div>

            <h2 className="mt-5 text-[38px] font-black leading-tight text-white sm:text-[48px]">
              Simple steps.
              <span className="block font-normal text-orange-500">
                Complete transparency.
              </span>
            </h2>
          </div>

          <div className="mt-14 grid border-l border-t border-zinc-800 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="border-b border-r border-zinc-800 p-7 sm:p-8 hover:bg-zinc-900/40 transition"
              >
                <div className="text-5xl font-black text-orange-500/30">
                  {step.number}
                </div>

                <h3 className="mt-6 text-[16px] font-black text-white">
                  {step.title}
                </h3>

                <p className="mt-2 text-[12px] leading-6 text-zinc-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FAQ ACCORDION
      ========================================================= */}
      <section id="faq" className="sports-section-bg sports-bg-faq scroll-mt-20 py-24 sm:py-28">
        <div className="mx-auto max-w-4xl px-5 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              Frequently Asked Questions
              <span className="h-px w-8 bg-orange-500" />
            </div>

            <h2 className="mt-5 text-[38px] font-black leading-tight text-white sm:text-[48px]">
              Everything you need to
              <span className="block font-normal text-orange-500">
                know about Z Sports Club.
              </span>
            </h2>
          </div>

          <div className="mt-14 space-y-3">
            {faqData.map((item, index) => {
              const isOpen = openFAQ === index;

              return (
                <div
                  key={item.question}
                  className={`border bg-[#0e0e11] transition duration-200 ${
                    isOpen ? "border-orange-500" : "border-zinc-800"
                  }`}
                >
                  <button
                    onClick={() => setOpenFAQ(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-5 px-6 py-5 text-left"
                  >
                    <span className="text-[13.5px] font-bold text-white sm:text-[15px]">
                      {item.question}
                    </span>

                    {isOpen ? (
                      <ChevronUp size={19} className="shrink-0 text-orange-500" />
                    ) : (
                      <ChevronDown size={19} className="shrink-0 text-zinc-500" />
                    )}
                  </button>

                  <div
                    className={`grid transition-all duration-300 ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 text-[13px] leading-7 text-zinc-400">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          CTA BANNER
      ========================================================= */}
      <section className="sports-section-bg sports-bg-cta relative overflow-hidden py-24 border-t border-zinc-800">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[130px]" />

        <div className="relative mx-auto flex max-w-7xl flex-col justify-between gap-10 px-5 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              Elevate Your Fitness
            </div>

            <h2 className="mt-5 text-[38px] font-black leading-tight text-white sm:text-[50px]">
              Ready for premier
              <span className="block font-normal text-orange-500">
                sports club living?
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-[14px] leading-7 text-zinc-400">
              Register an account today, select your tailored membership tier, and access world-class sports facilities, digital fee management, and tournaments.
            </p>
          </div>

          <Link
            to="/register"
            className="inline-flex w-fit items-center gap-3 rounded-none bg-orange-500 px-8 py-4 text-xs font-black uppercase tracking-wider text-black transition-all hover:bg-white hover:shadow-2xl"
          >
            Register as a Member
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer id="contact" className="sports-section-bg sports-bg-footer text-zinc-400 border-t border-zinc-800">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 border-b border-zinc-800 pb-14 md:grid-cols-12">
            {/* BRAND */}
            <div className="md:col-span-5">
              <button onClick={scrollToTop} className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-orange-500/40 bg-zinc-900 p-1">
                  <img
                    src="/z-sports-animated-logo.svg"
                    alt="Z Sports Logo"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="text-left">
                  <div className="text-xl font-black text-white">
                    Z <span className="text-orange-500">SPORTS</span>
                  </div>
                  <div className="mt-0.5 text-[8.5px] uppercase tracking-[0.22em] text-zinc-400">
                    Club Management System
                  </div>
                </div>
              </button>

              <p className="mt-5 max-w-md text-xs leading-6 text-zinc-400">
                Z Sports Club is a premier sports and athletic institution providing Olympic swimming, cricket arenas, synthetic tennis courts, coaching academies, and relational fee management.
              </p>

              <div className="mt-6 space-y-2.5 text-xs text-zinc-400">
                <div className="flex items-center gap-2.5">
                  <span className="text-orange-500 font-bold">📍</span>
                  Gulberg Town, Karachi, Pakistan
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-orange-500 font-bold">📞</span>
                  +92 324 1234567
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-orange-500 font-bold">✉️</span>
                  info@zsportsclub.com
                </div>
              </div>
            </div>

            {/* QUICK LINKS */}
            <div className="md:col-span-2">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
                Explore
              </h3>

              <div className="mt-5 space-y-2.5 text-xs">
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => handleNavClick(link.href)}
                    className="block text-zinc-400 transition hover:text-white"
                  >
                    {link.name}
                  </button>
                ))}
              </div>
            </div>

            {/* PORTALS */}
            <div className="md:col-span-2">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
                Portals
              </h3>

              <div className="mt-5 space-y-2.5 text-xs text-zinc-400">
                <Link to="/user/dashboard" className="block hover:text-white">
                  Member Portal
                </Link>
                <Link to="/admin/dashboard" className="block hover:text-white">
                  Admin Portal
                </Link>
                <Link to="/user/vouchers" className="block hover:text-white">
                  Fee Vouchers
                </Link>
                <Link to="/user/events" className="block hover:text-white">
                  Tournaments
                </Link>
              </div>
            </div>

            {/* CTA */}
            <div className="md:col-span-3">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
                Member Access
              </h3>

              <p className="mt-4 text-xs leading-6 text-zinc-400">
                Experience full transparency with automated vouchers, receipts, and tournament registrations.
              </p>

              <Link
                to="/register"
                className="mt-5 inline-flex items-center gap-2 rounded-none bg-orange-500 px-5 py-3 text-xs font-black uppercase text-black transition hover:bg-white"
              >
                Sign Up Now
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* BOTTOM */}
          <div className="flex flex-col items-center justify-between gap-4 pt-7 text-[10px] sm:flex-row">
            <p className="text-zinc-500">
              © {new Date().getFullYear()} Z Sports Club Management System. All rights reserved.
            </p>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-zinc-400 transition hover:text-orange-500"
            >
              Back to top
              <ArrowUp size={13} />
            </button>
          </div>
        </div>
      </footer>

      {/* ENROLLMENT MODAL */}
      <EnrollmentModal
        plan={selectedPlanForModal}
        isOpen={isEnrollModalOpen}
        onClose={() => {
          setIsEnrollModalOpen(false);
          setSelectedPlanForModal(null);
        }}
      />

      {/* EVENT DETAILS MODAL */}
      {selectedEventForDetails && (
        <EventDetailsModal
          event={selectedEventForDetails}
          isOpen={!!selectedEventForDetails}
          onClose={() => setSelectedEventForDetails(null)}
          isAuthenticated={isAuthenticated}
          onRegister={() => {
            setSelectedEventForDetails(null);
            navigate(isAuthenticated ? "/user/events" : "/login");
          }}
        />
      )}
    </div>
  );
}

export default LandingPage;
