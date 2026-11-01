import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  ShieldCheck,
  Trophy,
  Users,
  Award,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Star,
  Activity,
  HeartPulse,
  Flame,
  Zap,
  Clock,
  MapPin,
  Phone,
  Mail,
  Menu,
  X,
  Home,
  ArrowUp,
  Compass,
  Check,
  ReceiptText,
} from "lucide-react";

export default function AboutPage() {
  const { user, isAuthenticated, role, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [clubStats, setClubStats] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/public/club-info");
        if (res.data.success) {
          setClubStats(res.data);
        }
      } catch (err) {
        console.error("Error loading club stats:", err);
      }
    };
    fetchStats();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 4 Core Team Members
  const teamMembers = [
    {
      name: "Zaid Al-Mansoor",
      role: "Founder & Managing Director",
      experience: "15+ Years Athletic Governance",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
      bio: "Former national decathlete and sports infrastructure architect. Zaid founded Z Sports Club to combine Olympic-tier training standards with automated, transparent club management.",
      specialty: "Sports Facility Architecture & Governance",
      badges: ["National Champion 2012", "M.Sc Sports Science", "World Athletics Member"],
    },
    {
      name: "Coach Marcus Vance",
      role: "Head of Athletic Performance",
      experience: "12+ Years High-Performance Coaching",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
      bio: "CSCS-certified strength & conditioning specialist. Marcus has trained international track athletes, premier cricketers, and competitive tennis players with data-driven biometric regimens.",
      specialty: "Biomechanics, Speed & Power Conditioning",
      badges: ["CSCS Certified", "USA Weightlifting L2", "Olympic Conditioning Specialist"],
    },
    {
      name: "Elena Rostova",
      role: "Chief Aquatics Director",
      experience: "10+ Years FINA Master Coach",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
      bio: "Former international swimming medalist and FINA master coach. Elena oversees our 50-meter Olympic pool operations, stroke telemetry clinics, and competitive junior swim squads.",
      specialty: "Stroke Refinement & Endurance Physiology",
      badges: ["FINA Master Coach", "Olympic Trials Finalist", "Lifeguard Instructor"],
    },
    {
      name: "Tariq Mehmood",
      role: "Director of Sports Operations & Tournaments",
      experience: "14+ Years League & Arena Management",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80",
      bio: "Senior tournament organizer and ECB certified coach. Tariq coordinates club championships, radar speed net telemetry, court allocations, and competitive athletic brackets.",
      specialty: "Championship Logistics & Player Development",
      badges: ["ECB Level 3 Coach", "PCB Tournament Director", "Match Referee Certified"],
    },
  ];

  // Why Choose Us Pillars
  const whyChooseUs = [
    {
      icon: Trophy,
      title: "Olympic Standard Arenas",
      subtitle: "Certified Professional Facilities",
      description:
        "International grade cricket turf pitches with automated bowling machines, a 50m temperature-controlled Olympic swimming pool, 4 BWF badminton courts, and illuminated synthetic tennis courts.",
      stat: "6+ Arenas",
    },
    {
      icon: ReceiptText,
      title: "Automated Monthly Vouchers",
      subtitle: "100% Financial Transparency",
      description:
        "Transparent fee management with unique deposit slips, barcode tracking, and automated late fine logic. Zero surprise charges or missing payment records.",
      stat: "Zero Paperwork",
    },
    {
      icon: Zap,
      title: "Advance Fee Prepayments",
      subtitle: "Hassle-Free Advance Coverage",
      description:
        "Members can pay 1 to 12 months ahead. The system automatically records prepaid months and skips future monthly voucher generation so you are never double-billed.",
      stat: "Up to 12 Mos",
    },
    {
      icon: ShieldCheck,
      title: "Digital Membership Pass",
      subtitle: "Instant Verification & Security",
      description:
        "Every approved member receives a digital club pass with personal ID and QR verification for frictionless arena access and tournament check-in.",
      stat: "Instant ID Pass",
    },
    {
      icon: Users,
      title: "World-Class Coaching Team",
      subtitle: "Former National & Olympic Trainers",
      description:
        "Learn from accredited master trainers and certified athletic performance specialists with individualized performance analytics and biometric tracking.",
      stat: "Top Coaches",
    },
    {
      icon: Award,
      title: "Competitive Championship Leagues",
      subtitle: "Ranked Tournaments & Medals",
      description:
        "Participate in seasonal club leagues, cricket opens, swimming galas, and tennis trophies with live participant tracking, medals, and official club rankings.",
      stat: "Seasonal Cups",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-clip bg-[#0c0c0e] font-sans text-zinc-100">
      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "border-b border-[#e8e1e8] bg-white/95 shadow-sm backdrop-blur-xl"
            : "border-b border-zinc-800/80 bg-[#0c0c0e]/90 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-[82px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          {/* BRAND LOGO */}
          <Link to="/" className="group flex items-center gap-3">
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
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden items-center gap-7 lg:flex">
            <Link
              to="/"
              className={`text-[13px] font-semibold transition-colors ${
                isScrolled ? "text-[#27272a] hover:text-orange-600" : "text-zinc-300 hover:text-orange-400"
              }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-[13px] font-bold text-orange-500 border-b-2 border-orange-500 pb-0.5"
            >
              About Us
            </Link>
            <Link
              to="/services"
              className={`text-[13px] font-semibold transition-colors ${
                isScrolled ? "text-[#27272a] hover:text-orange-600" : "text-zinc-300 hover:text-orange-400"
              }`}
            >
              Services
            </Link>
            <Link
              to="/#sports"
              className={`text-[13px] font-semibold transition-colors ${
                isScrolled ? "text-[#27272a] hover:text-orange-600" : "text-zinc-300 hover:text-orange-400"
              }`}
            >
              Sports Arenas
            </Link>
            <Link
              to="/#plans"
              className={`text-[13px] font-semibold transition-colors ${
                isScrolled ? "text-[#27272a] hover:text-orange-600" : "text-zinc-300 hover:text-orange-400"
              }`}
            >
              Membership Plans
            </Link>
            <Link
              to="/#events"
              className={`text-[13px] font-semibold transition-colors ${
                isScrolled ? "text-[#27272a] hover:text-orange-600" : "text-zinc-300 hover:text-orange-400"
              }`}
            >
              Tournaments
            </Link>
            <Link
              to="/#faq"
              className={`text-[13px] font-semibold transition-colors ${
                isScrolled ? "text-[#27272a] hover:text-orange-600" : "text-zinc-300 hover:text-orange-400"
              }`}
            >
              FAQ
            </Link>
          </nav>

          {/* DESKTOP CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={role === "admin" ? "/admin/dashboard" : "/user/dashboard"}
                  className="inline-flex items-center gap-2 bg-orange-500 px-6 py-3 text-[12px] font-bold text-black transition-all hover:bg-black hover:text-white"
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
                      : "border border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-orange-500 px-6 py-3 text-[12px] font-bold text-black transition-all hover:bg-black hover:text-white"
                >
                  Join Club
                  <ArrowRight size={15} />
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE TOGGLE */}
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
        {isMobileMenuOpen && (
          <div className="border-t border-zinc-800 bg-[#121216] px-6 py-5 lg:hidden">
            <div className="space-y-3">
              <Link to="/" className="block py-2 text-sm font-semibold text-zinc-300">
                Home
              </Link>
              <Link to="/about" className="block py-2 text-sm font-bold text-orange-500">
                About Us
              </Link>
              <Link to="/services" className="block py-2 text-sm font-semibold text-zinc-300">
                Services
              </Link>
              <Link to="/#sports" className="block py-2 text-sm font-semibold text-zinc-300">
                Sports Arenas
              </Link>
              <Link to="/#plans" className="block py-2 text-sm font-semibold text-zinc-300">
                Membership Plans
              </Link>
              <Link to="/#events" className="block py-2 text-sm font-semibold text-zinc-300">
                Tournaments
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================
          HERO BANNER
      ========================================================= */}
      <section className="relative min-h-[520px] pt-36 pb-20 overflow-hidden bg-[#09090b] border-b border-zinc-800">
        {/* HERO BACKGROUND IMAGE */}
        <img
          src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=2200&q=90"
          alt="Z Sports Club Heritage"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />

        {/* OVERLAYS (Black & Orange transitions) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-black/20 to-black/60" />
        <div className="absolute top-1/4 right-10 h-96 w-96 rounded-full bg-orange-500/15 blur-[120px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-orange-500 transition"
            >
              <ArrowLeft size={14} /> Back to Website
            </Link>

            <div className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              About Z Sports Club
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.08] max-w-4xl">
              One Connected Institution for Your{" "}
              <span className="text-orange-500 font-normal">Entire Athletic Journey.</span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-zinc-300 leading-relaxed max-w-3xl">
              Z Sports Club unites world-class Olympic athletic facilities with transparent digital membership workflows, automated fee deposit vouchers, late penalty automation, and tournament bookings together through one connected system.
            </p>
          </div>

          {/* STATS STRIP */}
          <div className="mt-14 grid grid-cols-2 gap-4 border border-zinc-800 bg-[#121215] p-6 sm:grid-cols-4">
            <div>
              <div className="text-3xl font-black text-orange-500">
                35
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">
                Olympic Arenas
              </div>
            </div>
            <div className="border-l border-zinc-800 pl-6">
              <div className="text-3xl font-black text-white">
                25+
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">
                Specialized Services
              </div>
            </div>
            <div className="border-l border-zinc-800 pl-6">
              <div className="text-3xl font-black text-orange-500">
                275
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">
                Active Athletes
              </div>
            </div>
            <div className="border-l border-zinc-800 pl-6">
              <div className="text-3xl font-black text-white">24/7</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">
                Digital Pass Access
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          OUR MISSION & STORY
      ========================================================= */}
      <section className="py-24 bg-[#09090b]">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 grid gap-14 lg:grid-cols-2 items-center">
          {/* IMAGE WITH LOGO ACCENT */}
          <div className="relative">
            <div className="overflow-hidden border border-zinc-800 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=2000&q=85"
                alt="Z Sports Club Athletes"
                className="h-[480px] w-full object-cover transition duration-700 hover:scale-105"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden sm:flex items-center gap-3 border border-orange-500/50 bg-[#121215] p-5 shadow-2xl">
              <div className="h-12 w-12 overflow-hidden rounded-full border border-orange-500/40 bg-zinc-900 p-1">
                <img src="/z-sports-animated-logo.svg" alt="Z Sports" className="h-full w-full object-contain" />
              </div>
              <div>
                <div className="text-sm font-black text-white">Z SPORTS CLUB</div>
                <div className="text-[9px] uppercase tracking-widest text-orange-400 font-bold">
                  Official Athletic Heritage
                </div>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              Our Core Heritage
            </div>

            <h2 className="mt-4 text-3xl sm:text-5xl font-black text-white leading-tight">
              A Modern Sports Club Engineered for{" "}
              <span className="text-orange-500 font-normal">Integrity & Performance.</span>
            </h2>

            <p className="mt-6 text-sm sm:text-base text-zinc-300 leading-relaxed">
              Founded on the belief that championship athletes need both pristine sports complexes and transparent operational management, Z Sports Club eliminates traditional friction points. Instead of lost paper slips, manual check-ins, and untracked fee ledgers, every process is unified.
            </p>

            <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed">
              From our ICC-grade cricket pavilion and FINA Olympic swimming pool to automated monthly fee vouchers, Cloudinary-verified receipts, and smart advance payment tracking, members experience an institutional standard of excellence every time they step through our doors.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "Strict relational integrity ensuring zero duplicate vouchers",
                "Advanced prepayment engine skipping future monthly generation",
                "Verified digital cards with dynamic activation and role boundaries",
                "Year-round championship leagues and open tournaments",
              ].map((point) => (
                <div key={point} className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-orange-500 shrink-0" />
                  <span className="text-xs font-semibold text-zinc-200">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          WHY CHOOSE US (USER REQUESTED FEATURE)
      ========================================================= */}
      <section className="py-24 bg-[#121216] border-y border-zinc-800">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              The Z Sports Advantage
              <span className="h-px w-8 bg-orange-500" />
            </div>

            <h2 className="mt-4 text-3xl sm:text-5xl font-black text-white leading-tight">
              Why Choose Z Sports Club?
            </h2>

            <p className="mt-4 text-sm text-zinc-400 leading-relaxed">
              Discover the six fundamental standards that separate Z Sports Club from conventional athletic facilities and gyms.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyChooseUs.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group relative overflow-hidden border border-zinc-800 bg-[#0e0e11] p-8 transition duration-300 hover:border-orange-500/60 hover:bg-[#15151a]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center bg-zinc-900 border border-zinc-700 text-orange-500 transition group-hover:bg-orange-500 group-hover:text-black">
                      <Icon size={24} />
                    </div>
                    <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 border border-orange-500/20">
                      {item.stat}
                    </span>
                  </div>

                  <div className="mt-6">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-orange-500">
                      {item.subtitle}
                    </div>
                    <h3 className="mt-1 text-lg font-black text-white">{item.title}</h3>
                    <p className="mt-3 text-xs leading-6 text-zinc-400">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          FOUR (4) CORE TEAM MEMBERS (USER REQUESTED FEATURE)
      ========================================================= */}
      <section className="py-24 bg-[#09090b]">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
                <span className="h-px w-8 bg-orange-500" />
                Club Leadership & Athletic Direction
              </div>

              <h2 className="mt-4 text-3xl sm:text-5xl font-black text-white leading-tight">
                Meet Our Core Team
              </h2>

              <p className="mt-3 text-sm text-zinc-400 max-w-xl">
                Led by Olympians, certified strength coaches, and sports administrators committed to your athletic peak.
              </p>
            </div>

            <Link
              to="/#plans"
              className="inline-flex items-center gap-2 rounded-none bg-orange-500 px-6 py-3.5 text-xs font-black uppercase text-black hover:bg-white transition"
            >
              Train With Our Team
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="group overflow-hidden border border-zinc-800 bg-[#121215] transition duration-300 hover:border-orange-500/60"
              >
                {/* PHOTO */}
                <div className="relative h-72 overflow-hidden bg-zinc-900">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="bg-orange-500 px-2 py-0.5 text-[9px] font-black uppercase text-black">
                      {member.experience}
                    </span>
                  </div>
                </div>

                {/* DETAILS */}
                <div className="p-6">
                  <h3 className="text-lg font-black text-white group-hover:text-orange-400 transition">
                    {member.name}
                  </h3>
                  <div className="text-[11px] font-bold text-orange-500 mt-0.5 uppercase tracking-wide">
                    {member.role}
                  </div>

                  <p className="mt-3 text-xs leading-5 text-zinc-400">{member.bio}</p>

                  <div className="mt-4 border-t border-zinc-800/80 pt-3">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                      Specialization
                    </div>
                    <div className="text-xs font-semibold text-zinc-300 mt-0.5">
                      {member.specialty}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {member.badges.map((b) => (
                      <span
                        key={b}
                        className="rounded-none bg-zinc-800/80 px-2 py-0.5 text-[9px] font-medium text-zinc-300 border border-zinc-700"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          CALL TO ACTION
      ========================================================= */}
      <section className="py-20 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-black">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-black/80">
              Join the Z Sports Community Today
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black leading-tight text-black">
              Ready to elevate your athletic training?
            </h2>
            <p className="mt-2 text-sm text-black/80 max-w-xl">
              Subscribe to a membership tier, access world-class sports arenas, and enjoy automated voucher billing and tournament access.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/#plans"
              className="rounded-none bg-black px-7 py-4 text-xs font-black uppercase tracking-wider text-white transition hover:bg-white hover:text-black shadow-xl"
            >
              View Membership Plans
            </Link>
            <Link
              to="/services"
              className="rounded-none border-2 border-black bg-transparent px-7 py-4 text-xs font-black uppercase tracking-wider text-black transition hover:bg-black hover:text-white"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="bg-[#08080a] text-zinc-400 border-t border-zinc-800">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 border-b border-zinc-800 pb-14 md:grid-cols-12">
            <div className="md:col-span-5">
              <Link to="/" className="flex items-center gap-3">
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
              </Link>
              <p className="mt-5 max-w-md text-xs leading-6 text-zinc-400">
                Z Sports Club is an elite athletic institution offering Olympic swimming, cricket arenas, synthetic tennis courts, coaching academies, and relational fee management.
              </p>
              <div className="mt-6 space-y-2 text-xs text-zinc-400">
                <div>📍 Main Club Boulevard, Sports Enclave</div>
                <div>📞 +92 300 1234567</div>
                <div>✉️ info@zsportsclub.com</div>
              </div>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
                Quick Navigation
              </h3>
              <div className="mt-5 space-y-2.5 text-xs">
                <Link to="/" className="block text-zinc-400 hover:text-white">Home</Link>
                <Link to="/about" className="block text-orange-500 font-bold">About Us</Link>
                <Link to="/services" className="block text-zinc-400 hover:text-white">Services</Link>
                <Link to="/#sports" className="block text-zinc-400 hover:text-white">Sports Arenas</Link>
                <Link to="/#plans" className="block text-zinc-400 hover:text-white">Memberships</Link>
              </div>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
                Portals
              </h3>
              <div className="mt-5 space-y-2.5 text-xs">
                <Link to="/user/dashboard" className="block text-zinc-400 hover:text-white">Member Portal</Link>
                <Link to="/admin/dashboard" className="block text-zinc-400 hover:text-white">Admin Portal</Link>
                <Link to="/user/vouchers" className="block text-zinc-400 hover:text-white">Fee Vouchers</Link>
                <Link to="/user/events" className="block text-zinc-400 hover:text-white">Tournaments</Link>
              </div>
            </div>

            <div className="md:col-span-3">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
                Member Access
              </h3>
              <p className="mt-4 text-xs leading-6 text-zinc-400">
                Experience full transparency with automated vouchers, receipts, and tournament registrations.
              </p>
              <Link
                to="/register"
                className="mt-5 inline-flex items-center gap-2 bg-orange-500 px-5 py-3 text-xs font-black uppercase text-black hover:bg-white transition"
              >
                Sign Up Now
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 pt-7 text-[10px] sm:flex-row">
            <p className="text-zinc-500">
              © {new Date().getFullYear()} Z Sports Club Management System. All rights reserved.
            </p>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-orange-500 transition"
            >
              Back to top
              <ArrowUp size={13} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
