import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Reveal from "../../components/common/Reveal";
import ThemeToggle from "../../components/common/ThemeToggle";
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
  Dumbbell,
  Sparkles,
  Calendar,
  Layers,
} from "lucide-react";

export default function ServicesPage() {
  const { user, isAuthenticated, role, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get("/public/services");
        const databaseServices =
          res.data?.success && Array.isArray(res.data.data)
            ? res.data.data
            : [];

        // Keep database records and append the new sports programs.
        // Avoid showing a duplicate if a program already exists in the database.
        const existingNames = new Set(
          databaseServices
            .map((service) => service.ServiceName?.trim().toLowerCase())
            .filter(Boolean)
        );

        const sportsNotInDatabase = additionalSportsServices.filter(
          (service) =>
            !existingNames.has(service.ServiceName.trim().toLowerCase())
        );

        if (databaseServices.length > 0) {
          setServices([...databaseServices, ...sportsNotInDatabase]);
        } else {
          setServices([...defaultServices, ...additionalSportsServices]);
        }
      } catch (err) {
        console.error("Error loading services:", err);
        setServices([...defaultServices, ...additionalSportsServices]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const defaultServices = [
    {
      ServiceID: 1,
      ServiceName: "Personal Fitness Coaching",
      Description:
        "Certified athletic trainers delivering personalized nutrition regimens, biometric tracking, and targeted muscle conditioning.",
      ImageURL: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
      category: "Coaching",
      hours: "06:00 AM - 10:00 PM Daily",
      trainer: "Coach Marcus Vance (CSCS)",
      features: [
        "InBody 770 Body Composition Analysis",
        "Individualized Microcycle Training Programs",
        "Targeted Athletic Conditioning & Speed Work",
        "Monthly Biometric Re-Evaluation",
      ],
      plansIncluded: ["Gold Tier", "Platinum Tier"],
    },
    {
      ServiceID: 2,
      ServiceName: "Junior & Adult Sports Academies",
      Description:
        "Professional coaching clinics in cricket, tennis, swimming, and badminton led by former national athletes.",
      ImageURL: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
      category: "Academy",
      hours: "04:00 PM - 08:30 PM (Mon - Sat)",
      trainer: "Tariq Mehmood & Elena Rostova",
      features: [
        "Age-Bracketed Training (Under 14, U-19, Adult)",
        "Automated Speed Gun Pitch Telemetry",
        "High-Speed Stroke Video Analysis",
        "Official Club Ranking Ladder Tournaments",
      ],
      plansIncluded: ["Silver Tier", "Gold Tier", "Platinum Tier"],
    },
    {
      ServiceID: 3,
      ServiceName: "Executive Steam, Sauna & Recovery",
      Description:
        "Therapeutic infrared saunas, eucalyptus steam baths, cold plunge recovery tubs, and sports massage therapy rooms.",
      ImageURL: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
      category: "Wellness",
      hours: "07:00 AM - 11:00 PM Daily",
      trainer: "Sports Physio & Spa Team",
      features: [
        "Contrast Hydrotherapy (Cold Plunge & Hot Spa)",
        "Finnish Dry Cedar Sauna & Eucalyptus Mist",
        "Percussive Massage & Cryo Recovery Booths",
        "Post-Workout Muscle Relaxation Protocol",
      ],
      plansIncluded: ["Gold Tier", "Platinum Tier"],
    },
    {
      ServiceID: 4,
      ServiceName: "High-Protein Member Cafeteria & Lounge",
      Description:
        "Chef-prepared nutrition bowls, organic fruit smoothies, whey protein shakes, and a comfortable member co-working lounge.",
      ImageURL: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1200&q=80",
      category: "Nutrition",
      hours: "06:30 AM - 11:30 PM Daily",
      trainer: "Executive Chef & Sports Nutritionist",
      features: [
        "Calorie & Macro Counted Gourmet Meals",
        "Cold-Pressed Raw Juices & Electrolyte Bar",
        "High-Speed Wi-Fi Workstations & Athletic Lounge",
        "Member Priority Seating & Pre-Order via Portal",
      ],
      plansIncluded: ["All Active Members"],
    },
  ];


  // Additional sports and skill-development programs.
  // These are merged with database services without replacing database records.
  const additionalSportsServices = [
    {
      ServiceID: 101,
      ServiceName: "Karate Training Academy",
      Description: "Learn traditional Karate through structured training in discipline, striking techniques, balance, self-control and practical self-defense.",
      ImageURL: "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1200&q=80",
      category: "Martial Arts",
      hours: "04:00 PM - 08:00 PM (Mon - Sat)",
      trainer: "Karate Instructor",
      features: ["Beginner to Advanced Training", "Kata and Kumite Practice", "Belt Grading Preparation", "Self-Defense Techniques"],
      plansIncluded: ["Silver Tier", "Gold Tier", "Platinum Tier"],
    },
    {
      ServiceID: 102,
      ServiceName: "Taekwondo Classes",
      Description: "Develop flexibility, speed, coordination and confidence through traditional Taekwondo training and controlled sparring.",
      ImageURL: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1200&q=80",
      category: "Martial Arts",
      hours: "04:00 PM - 08:00 PM (Mon - Sat)",
      trainer: "Taekwondo Instructor",
      features: ["Kicking Techniques", "Forms and Patterns", "Controlled Sparring", "Belt Advancement Training"],
      plansIncluded: ["Silver Tier", "Gold Tier"],
    },
    {
      ServiceID: 103,
      ServiceName: "Professional Boxing Training",
      Description: "Build punching technique, endurance, defensive movement and ring confidence with structured boxing sessions.",
      ImageURL: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=80",
      category: "Combat Sports",
      hours: "06:00 AM - 09:00 PM Daily",
      trainer: "Boxing Coach",
      features: ["Boxing Fundamentals", "Punching Bag Workouts", "Footwork and Defense", "Fitness and Conditioning"],
      plansIncluded: ["Silver Tier", "Gold Tier", "Platinum Tier"],
    },
    {
      ServiceID: 104,
      ServiceName: "Mixed Martial Arts (MMA)",
      Description: "Combine striking, grappling, wrestling and ground techniques in a progressive mixed martial arts training program.",
      ImageURL: "https://images.unsplash.com/photo-1517438322307-e67111335449?auto=format&fit=crop&w=1200&q=80",
      category: "Combat Sports",
      hours: "05:00 PM - 09:00 PM (Mon - Sat)",
      trainer: "MMA Coach",
      features: ["Striking Fundamentals", "Grappling Techniques", "Ground Defense", "Supervised Practice Sessions"],
      plansIncluded: ["Gold Tier", "Platinum Tier"],
    },
    {
      ServiceID: 105,
      ServiceName: "Judo Training Program",
      Description: "Master balance, throws, movement and grappling through traditional Judo instruction.",
      ImageURL: "https://images.unsplash.com/photo-1564415051543-cb73a7465d9b?auto=format&fit=crop&w=1200&q=80",
      category: "Martial Arts",
      hours: "04:00 PM - 08:00 PM (Mon - Fri)",
      trainer: "Judo Instructor",
      features: ["Throwing Techniques", "Balance and Movement", "Ground Grappling", "Competition Preparation"],
      plansIncluded: ["Silver Tier", "Gold Tier"],
    },
    {
      ServiceID: 106,
      ServiceName: "Wrestling Academy",
      Description: "Improve strength, agility and grappling ability through freestyle wrestling drills and supervised training.",
      ImageURL: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=1200&q=80",
      category: "Combat Sports",
      hours: "05:00 PM - 08:00 PM (Mon - Sat)",
      trainer: "Wrestling Coach",
      features: ["Freestyle Wrestling Basics", "Takedown Techniques", "Strength and Agility Drills", "Match Preparation"],
      plansIncluded: ["Silver Tier", "Gold Tier"],
    },
    {
      ServiceID: 107,
      ServiceName: "Kickboxing Classes",
      Description: "Combine boxing punches and martial arts kicks to improve cardiovascular fitness, coordination and combat skills.",
      ImageURL: "https://images.unsplash.com/photo-1599058918144-1ffabb6ab9a0?auto=format&fit=crop&w=1200&q=80",
      category: "Combat Sports",
      hours: "06:00 PM - 09:00 PM Daily",
      trainer: "Kickboxing Coach",
      features: ["Punch and Kick Combinations", "Pad Training", "Defensive Movement", "Endurance Conditioning"],
      plansIncluded: ["Silver Tier", "Gold Tier", "Platinum Tier"],
    },
    {
      ServiceID: 108,
      ServiceName: "Practical Self-Defense Classes",
      Description: "Practical self-defense classes focused on awareness, confidence, personal safety and basic defensive techniques.",
      ImageURL: "https://images.unsplash.com/photo-1591117207239-788bf8de6c3b?auto=format&fit=crop&w=1200&q=80",
      category: "Martial Arts",
      hours: "05:00 PM - 08:00 PM (Mon - Sat)",
      trainer: "Self-Defense Instructor",
      features: ["Situational Awareness", "Defensive Movement", "Escape Techniques", "Confidence Building"],
      plansIncluded: ["Silver Tier", "Gold Tier"],
    },
    {
      ServiceID: 109,
      ServiceName: "Basketball Coaching Academy",
      Description: "Develop basketball fundamentals through professional drills, team play, shooting practice and match preparation.",
      ImageURL: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
      category: "Team Sports",
      hours: "04:00 PM - 09:00 PM Daily",
      trainer: "Basketball Coach",
      features: ["Dribbling and Ball Control", "Shooting Techniques", "Defensive Strategies", "Team Match Practice"],
      plansIncluded: ["Silver Tier", "Gold Tier", "Platinum Tier"],
    },
    {
      ServiceID: 110,
      ServiceName: "Football Skills Academy",
      Description: "Improve football technique, passing, shooting, positioning and teamwork with structured field training.",
      ImageURL: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
      category: "Team Sports",
      hours: "04:00 PM - 08:00 PM (Mon - Sat)",
      trainer: "Football Coach",
      features: ["Ball Control and Dribbling", "Passing and Shooting", "Team Tactics", "Fitness and Match Practice"],
      plansIncluded: ["Silver Tier", "Gold Tier"],
    },
    {
      ServiceID: 111,
      ServiceName: "Volleyball Training Academy",
      Description: "Build teamwork, coordination and athletic ability through volleyball drills and competitive practice.",
      ImageURL: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80",
      category: "Team Sports",
      hours: "04:00 PM - 08:00 PM (Mon - Sat)",
      trainer: "Volleyball Coach",
      features: ["Serving and Receiving", "Setting and Spiking", "Blocking Techniques", "Team Match Practice"],
      plansIncluded: ["Silver Tier", "Gold Tier"],
    },
    {
      ServiceID: 112,
      ServiceName: "Advanced Badminton Coaching",
      Description: "Enhance racket control, court movement, footwork and competitive badminton performance.",
      ImageURL: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80",
      category: "Racket Sports",
      hours: "06:00 AM - 10:00 PM Daily",
      trainer: "Badminton Coach",
      features: ["Footwork and Agility", "Smash and Drop Shots", "Singles and Doubles Strategy", "Tournament Preparation"],
      plansIncluded: ["Silver Tier", "Gold Tier"],
    },
    {
      ServiceID: 113,
      ServiceName: "Professional Tennis Coaching",
      Description: "Learn tennis fundamentals and advanced match techniques with dedicated court coaching.",
      ImageURL: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80",
      category: "Racket Sports",
      hours: "06:00 AM - 09:00 PM Daily",
      trainer: "Tennis Coach",
      features: ["Forehand and Backhand", "Serving Practice", "Court Positioning", "Singles and Doubles Training"],
      plansIncluded: ["Gold Tier", "Platinum Tier"],
    },
    {
      ServiceID: 114,
      ServiceName: "Table Tennis Academy",
      Description: "Improve reflexes, hand-eye coordination, spin control and match strategy through table tennis coaching.",
      ImageURL: "https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=1200&q=80",
      category: "Racket Sports",
      hours: "03:00 PM - 10:00 PM Daily",
      trainer: "Table Tennis Coach",
      features: ["Serving and Spin Control", "Forehand and Backhand", "Fast Reaction Drills", "Competitive Match Practice"],
      plansIncluded: ["Silver Tier", "Gold Tier"],
    },
    {
      ServiceID: 115,
      ServiceName: "Swimming Skills Academy",
      Description: "Structured swimming instruction for beginners and advanced swimmers, focusing on water confidence and stroke development.",
      ImageURL: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80",
      category: "Aquatics",
      hours: "06:00 AM - 09:00 PM Daily",
      trainer: "Swimming Instructor",
      features: ["Beginner Swimming Lessons", "Freestyle and Backstroke", "Breathing Techniques", "Water Safety Skills"],
      plansIncluded: ["Silver Tier", "Gold Tier", "Platinum Tier"],
    },
    {
      ServiceID: 116,
      ServiceName: "Athletics and Track Training",
      Description: "Develop speed, stamina and athletic performance through running, sprinting and track conditioning programs.",
      ImageURL: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80",
      category: "Athletics",
      hours: "06:00 AM - 09:00 AM / 04:00 PM - 07:00 PM",
      trainer: "Athletics Coach",
      features: ["Sprint Training", "Distance Running", "Speed and Agility", "Performance Assessment"],
      plansIncluded: ["Silver Tier", "Gold Tier"],
    },
    {
      ServiceID: 117,
      ServiceName: "Yoga and Flexibility Classes",
      Description: "Improve mobility, posture, flexibility and mental focus through guided yoga sessions.",
      ImageURL: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
      category: "Mind & Body",
      hours: "06:00 AM - 09:00 AM / 05:00 PM - 08:00 PM",
      trainer: "Yoga Instructor",
      features: ["Guided Yoga Sessions", "Breathing Exercises", "Mobility and Stretching", "Balance and Posture"],
      plansIncluded: ["Silver Tier", "Gold Tier", "Platinum Tier"],
    },
    {
      ServiceID: 118,
      ServiceName: "Zumba Dance Fitness",
      Description: "Enjoy energetic group dance workouts designed to improve stamina, coordination and cardiovascular fitness.",
      ImageURL: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
      category: "Fitness",
      hours: "05:00 PM - 08:00 PM Daily",
      trainer: "Group Fitness Instructor",
      features: ["Dance-Based Workouts", "Group Fitness Sessions", "Cardio Conditioning", "All Fitness Levels"],
      plansIncluded: ["Silver Tier", "Gold Tier"],
    },
    {
      ServiceID: 119,
      ServiceName: "CrossFit and Functional Fitness",
      Description: "Build all-round athletic ability with functional movements, strength circuits and coached conditioning workouts.",
      ImageURL: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=1200&q=80",
      category: "Fitness",
      hours: "06:00 AM - 10:00 PM Daily",
      trainer: "Functional Fitness Coach",
      features: ["Functional Movement Training", "Strength Circuits", "Cardio Conditioning", "Scalable Workout Levels"],
      plansIncluded: ["Gold Tier", "Platinum Tier"],
    },
    {
      ServiceID: 120,
      ServiceName: "Pilates and Core Conditioning",
      Description: "Strengthen core muscles, improve posture and develop controlled movement through instructor-led Pilates sessions.",
      ImageURL: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
      category: "Mind & Body",
      hours: "07:00 AM - 09:00 AM / 05:00 PM - 08:00 PM",
      trainer: "Pilates Instructor",
      features: ["Core Strengthening", "Controlled Movement", "Posture Improvement", "Flexibility and Balance"],
      plansIncluded: ["Gold Tier", "Platinum Tier"],
    },
  ];

  // Additional Special Amenities
  const specializedAmenities = [
    {
      icon: Activity,
      title: "Sports Physiotherapy & Injury Clinic",
      desc: "Licensed physiotherapists offering rapid musculoskeletal rehabilitation, dry needling, kinematic gait analysis, and sports taping.",
    },
    {
      icon: Trophy,
      title: "Pitch & Court Arena Private Bookings",
      desc: "Reserve full cricket turf pavilions or synthetic tennis courts with competition lighting for corporate tournaments and private matches.",
    },
    {
      icon: Dumbbell,
      title: "Olympic Powerlifting & CrossFit Rig",
      desc: "Eleiko calibrated Olympic bumper plates, heavy-duty power racks, Texas power bars, and shock-absorbent drop platforms.",
    },
    {
      icon: Sparkles,
      title: "Pro Equipment Shop & Racket Restringing",
      desc: "Official club gear shop featuring Babolat and Wilson racket restringing, cricket bat knocking, and high-performance athletic apparel.",
    },
  ];

  const categories = [
    "All",
    ...new Set(
      services
        .map((service) => service.category || "Other")
        .filter(Boolean)
    ),
  ];

  const filteredServices =
    selectedCategory === "All"
      ? services
      : services.filter(
          (s) =>
            s.category?.toLowerCase() === selectedCategory.toLowerCase() ||
            s.ServiceName?.toLowerCase().includes(selectedCategory.toLowerCase())
        );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="page-enter min-h-screen overflow-x-clip bg-[#0c0c0e] font-sans text-zinc-100">
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
        <div
          className={`mx-auto flex h-[82px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8 ${
            isScrolled ? "" : "keep-dark"
          }`}
        >
          <Link to="/" className="group flex items-center gap-3">
            <div
              className={`flex h-12 w-[92px] items-center justify-center overflow-hidden rounded-lg border transition-all duration-300 ${
                isScrolled
                  ? "border-[#e4dce5] bg-[#0c0c0e] shadow-sm"
                  : "border-white/20 bg-black/40 backdrop-blur-md"
              }`}
            >
              <img
                src="/sports-hub-logo.svg"
                alt="Sports Hub Logo"
                className="h-8 w-auto object-contain"
              />
            </div>

            <div className="text-left">
              <div
                className={`text-lg font-extrabold leading-none tracking-tight transition-colors ${
                  isScrolled ? "text-[#18181b]" : "text-white"
                }`}
              >
                SPORTS
                <span
                  className={`font-light ml-1 ${
                    isScrolled ? "text-orange-500" : "text-orange-400"
                  }`}
                >
                  HUB
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
              className={`text-[13px] font-semibold transition-colors ${
                isScrolled ? "text-[#27272a] hover:text-orange-600" : "text-zinc-300 hover:text-orange-400"
              }`}
            >
              About Us
            </Link>
            <Link
              to="/services"
              className="text-[13px] font-bold text-orange-500 border-b-2 border-orange-500 pb-0.5"
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

            <ThemeToggle variant={isScrolled ? "surface" : "overlay"} />
          </div>

          <div className="flex items-center gap-1.5 lg:hidden">
            <ThemeToggle variant={isScrolled ? "surface" : "overlay"} />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`rounded-full p-2 transition ${
                isScrolled ? "text-[#18181b]" : "text-white"
              }`}
            >
              {isMobileMenuOpen ? <X size={25} /> : <Menu size={25} />}
            </button>
          </div>
        </div>

        {/* MOBILE AUTH BAR (always visible under the navbar) */}
        <div
          className={`flex items-center gap-2.5 border-t px-4 py-2.5 lg:hidden transition-colors duration-500 ${
            isScrolled
              ? "border-[#eee9ee] bg-white/95 backdrop-blur-xl"
              : "keep-dark border-zinc-800/80 bg-[#0c0c0e]/95 backdrop-blur-md"
          }`}
        >
          {isAuthenticated ? (
            <>
              <Link
                to={role === "admin" ? "/admin/dashboard" : "/user/dashboard"}
                className="flex flex-1 items-center justify-center gap-2 bg-orange-500 py-2.5 text-[12px] font-bold text-black transition hover:bg-black hover:text-white"
              >
                <Home size={14} />
                {role === "admin" ? "Admin Panel" : "Members Dashboard"}
              </Link>
              <button
                onClick={logout}
                className={`border px-4 py-2.5 text-[12px] font-semibold transition ${
                  isScrolled
                    ? "border-[#dcd2df] text-[#18181b] hover:bg-zinc-100"
                    : "border-white/30 text-white hover:bg-white/10"
                }`}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`flex-1 border py-2.5 text-center text-[12px] font-semibold transition ${
                  isScrolled
                    ? "border-[#dcd2df] text-[#18181b] hover:bg-zinc-100"
                    : "border-white/30 text-white hover:bg-white/10"
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="flex flex-1 items-center justify-center gap-1.5 bg-orange-500 py-2.5 text-[12px] font-bold text-black transition hover:bg-black hover:text-white"
              >
                Join Club
                <ArrowRight size={13} />
              </Link>
            </>
          )}
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-zinc-800 bg-[#121216] px-6 py-5 lg:hidden">
            <div className="space-y-3">
              <Link to="/" className="block py-2 text-sm font-semibold text-zinc-300">
                Home
              </Link>
              <Link to="/about" className="block py-2 text-sm font-semibold text-zinc-300">
                About Us
              </Link>
              <Link to="/services" className="block py-2 text-sm font-bold text-orange-500">
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
      <section className="keep-dark relative min-h-[520px] pt-44 pb-20 lg:pt-36 overflow-hidden bg-[#09090b] border-b border-zinc-800">
        {/* HERO BACKGROUND IMAGE */}
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2200&q=90"
          alt="Sports Hub Services & Performance"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />

        {/* OVERLAYS (Black & Orange transitions) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-black/20 to-black/60" />
        <div className="absolute top-1/4 right-10 h-96 w-96 rounded-full bg-orange-500/15 blur-[120px] pointer-events-none animate-heroGlow" />

        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal variant="left" className="flex flex-col items-start gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-orange-500 transition"
            >
              <ArrowLeft size={14} /> Back to Website
            </Link>

            <div className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              Specialized Club Services
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.08] max-w-4xl">
              Specialized Services.{" "}
              <span className="text-orange-500 font-normal">Beyond Traditional Gyms.</span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-zinc-300 leading-relaxed max-w-3xl">
              At Sports Hub, your membership unlocks institutional amenities engineered for athletic recovery, competitive technical coaching, and peak metabolic conditioning.
            </p>
          </Reveal>

          {/* CATEGORY FILTER TABS */}
          <Reveal group className="mt-12 flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider transition ${
                  selectedCategory === cat
                    ? "bg-orange-500 text-black shadow-lg"
                    : "border border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-orange-500 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </Reveal>
        </div>
      </section>

      {/* =========================================================
          DETAILED SERVICES SHOWCASE (USER REQUESTED FEATURE)
      ========================================================= */}
      <section className="py-24 bg-[#09090b]">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {filteredServices.map((svc) => (
              <Reveal
                key={svc.ServiceID || svc.ServiceName}
                variant="up"
                className="flex h-full flex-col border border-zinc-800 bg-[#121215] transition duration-300 hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-[0_20px_50px_-26px_rgba(249,115,22,0.55)]"
              >
                {/* IMAGE */}
                <div className="relative overflow-hidden border-b border-zinc-800">
                  <img
                    src={svc.ImageURL}
                    alt={svc.ServiceName}
                    className="h-52 w-full object-cover transition duration-700 hover:scale-105 sm:h-60"
                  />
                  <div className="absolute top-4 left-4 bg-orange-500 px-3 py-1 text-[10px] font-black uppercase text-black">
                    {svc.category || "Club Service"}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-orange-400">
                    <Clock size={13} className="text-orange-500 shrink-0" />
                    {svc.hours || "Full Club Operating Hours"}
                  </div>

                  <h2 className="mt-2 text-xl sm:text-2xl font-black text-white">
                    {svc.ServiceName}
                  </h2>

                  <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
                    {svc.Description}
                  </p>

                  {svc.trainer && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
                      <span className="font-bold text-white">Lead Instructor:</span>
                      <span className="text-orange-400 font-semibold">{svc.trainer}</span>
                    </div>
                  )}

                  {/* FEATURES CHECKLIST */}
                  {svc.features && svc.features.length > 0 && (
                    <div className="mt-5 space-y-2 border-t border-zinc-800 pt-4">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        Included Program Features
                      </div>
                      {svc.features.map((feat) => (
                        <div key={feat} className="flex items-start gap-2.5 text-xs text-zinc-300">
                          <Check size={14} className="text-orange-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TIER BADGES */}
                  {svc.plansIncluded && (
                    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-zinc-800/80 pt-4">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 mr-1">
                        Included In:
                      </span>
                      {svc.plansIncluded.map((plan) => (
                        <span
                          key={plan}
                          className="bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2.5 py-0.5 text-[10px] font-bold"
                        >
                          {plan}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* ACTIONS */}
                  <div className="mt-auto flex flex-wrap gap-3 pt-6">
                    <Link
                      to="/#plans"
                      className="inline-flex items-center gap-2 rounded-none bg-orange-500 px-5 py-2.5 text-[11px] font-black uppercase text-black hover:bg-white transition"
                    >
                      Enroll with Membership
                      <ArrowRight size={13} />
                    </Link>
                    <Link
                      to="/about"
                      className="inline-flex items-center gap-2 rounded-none border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-[11px] font-bold text-zinc-300 hover:text-white hover:border-zinc-500 transition"
                    >
                      Meet Coaches
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          SPECIALIZED AMENITIES GRID
      ========================================================= */}
      <section className="py-24 bg-[#121216] border-t border-zinc-800">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
              <span className="h-px w-8 bg-orange-500" />
              Specialist Infrastructure
            </div>

            <h2 className="mt-4 text-3xl sm:text-5xl font-black text-white leading-tight">
              Additional Elite Amenities
            </h2>

            <p className="mt-3 text-sm text-zinc-400">
              Every facility at Sports Hub is maintained to international athletic specifications.
            </p>
          </Reveal>

          <Reveal group className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {specializedAmenities.map((amenity) => {
              const Icon = amenity.icon;
              return (
                <div
                  key={amenity.title}
                  className="border border-zinc-800 bg-[#0c0c0e] p-7 transition hover:border-orange-500/60 hover:bg-zinc-900/40"
                >
                  <div className="flex h-11 w-11 items-center justify-center bg-orange-500/10 border border-orange-500/30 text-orange-500">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-5 text-base font-black text-white">{amenity.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-zinc-400">{amenity.desc}</p>
                </div>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* =========================================================
          CTA SECTION
      ========================================================= */}
      <section className="py-20 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-black">
        <Reveal variant="fade" className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-black/80">
              Full Member Privileges
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black leading-tight text-black">
              Access All Services Through Your Membership
            </h2>
            <p className="mt-2 text-sm text-black/80 max-w-xl">
              Choose your membership tier to activate full privileges, automated deposit vouchers, and tournament bookings today.
            </p>
          </div>

          <Link
            to="/#plans"
            className="keep-dark rounded-none bg-black px-8 py-4 text-xs font-black uppercase tracking-wider text-white transition hover:bg-white hover:text-black shadow-xl"
          >
            Buy Membership Tier
          </Link>
        </Reveal>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="bg-[#08080a] text-zinc-400 border-t border-zinc-800">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 border-b border-zinc-800 pb-14 md:grid-cols-12">
            <div className="md:col-span-5">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-12 w-[86px] items-center justify-center overflow-hidden rounded-lg border border-orange-500/40 bg-zinc-900 px-1.5">
                  <img
                    src="/sports-hub-logo.svg"
                    alt="Sports Hub Logo"
                    className="h-7 w-auto object-contain"
                  />
                </div>
                <div className="text-left">
                  <div className="text-xl font-black text-white">
                    SPORTS <span className="text-orange-500">HUB</span>
                  </div>
                  <div className="mt-0.5 text-[8.5px] uppercase tracking-[0.22em] text-zinc-400">
                    Club Management System
                  </div>
                </div>
              </Link>
              <p className="mt-5 max-w-md text-xs leading-6 text-zinc-400">
                Sports Hub is an elite athletic institution offering Olympic swimming, cricket arenas, synthetic tennis courts, coaching academies, and relational fee management.
              </p>
              <div className="mt-6 space-y-2 text-xs text-zinc-400">
                <div>📍 Main Club Boulevard, Sports Enclave</div>
                <div>📞 +92 300 1234567</div>
                <div>✉️ info@sportshub.com</div>
              </div>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
                Quick Navigation
              </h3>
              <div className="mt-5 space-y-2.5 text-xs">
                <Link to="/" className="block text-zinc-400 hover:text-white">Home</Link>
                <Link to="/about" className="block text-zinc-400 hover:text-white">About Us</Link>
                <Link to="/services" className="block text-orange-500 font-bold">Services</Link>
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
              © {new Date().getFullYear()} Sports Hub Management System. All rights reserved.
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
