import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import AvatarLightbox from "../../components/common/AvatarLightbox";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import {
  BadgeCheck,
  Camera,
  ClipboardCheck,
  Dumbbell,
  Info,
  Lock,
  Mail,
  Maximize2,
  Phone,
  ShieldCheck,
  Star,
  Trophy,
  UploadCloud,
  User,
  Users,
  Wallet,
} from "lucide-react";

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const confirmDialog = (title, text, confirmButtonText) =>
  Swal.fire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#f97316",
    cancelButtonColor: "#27272a",
    confirmButtonText,
    cancelButtonText: "Cancel",
    background: "#18181b",
    color: "#ffffff",
    allowOutsideClick: true,
  });

function CoachProfile() {
  const { user, refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState(null);

  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);

  const fileInputRef = useRef(null);

  const load = async () => {
    try {
      const res = await api.get("/coach/profile");
      if (res.data.success) {
        setProfile(res.data);
        setPhone(res.data.coach?.Phone || "");
        setBio(res.data.coach?.Bio || "");
        setImageUrlInput(res.data.coach?.ImageURL || "");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load your profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a valid image file.");
      return;
    }
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) return;

    const confirm = await confirmDialog(
      "Update Profile Photo?",
      "Upload the selected image as your coaching staff photo?",
      "Yes, Upload"
    );
    if (!confirm.isConfirmed) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      const res = await api.post("/coach/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        toast.success(res.data.message || "Profile photo updated!");
        setSelectedFile(null);
        setFilePreview(null);
        setIsPhotoOpen(false);
        await refreshUser();
        await load();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload photo.");
    } finally {
      setUploading(false);
    }
  };

  const handleApplyLink = async () => {
    if (!imageUrlInput.trim()) return;

    const confirm = await confirmDialog(
      "Save Photo Link?",
      "Use the provided web link as your coaching profile photo?",
      "Yes, Update"
    );
    if (!confirm.isConfirmed) return;

    try {
      setUploading(true);
      const res = await api.put("/coach/profile", {
        phone,
        bio,
        imageUrl: imageUrlInput.trim(),
      });
      if (res.data.success) {
        toast.success("Profile photo link updated!");
        await refreshUser();
        await load();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update photo link.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirm = await confirmDialog(
      "Save Profile Changes?",
      "Update your coaching contact number and bio?",
      "Yes, Save"
    );
    if (!confirm.isConfirmed) return;

    try {
      setSaving(true);
      const res = await api.put("/coach/profile", { phone, bio });
      if (res.data.success) {
        toast.success(res.data.message || "Coach profile updated!");
        await refreshUser();
        await load();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="coach">
        <PageLoader message="Loading coach profile..." />
      </DashboardLayout>
    );
  }

  const coach = profile?.coach || {};
  const account = profile?.account || {};
  const stats = profile?.stats || {};
  const trainers = profile?.trainers || [];
  const tournaments = profile?.tournaments || [];
  const salary = profile?.salary || [];

  const displayPhoto = filePreview || coach.ImageURL || account.AvatarURL;

  const statCards = [
    { label: "Students", value: stats.Students ?? 0, icon: Users, tone: "text-orange-400" },
    { label: "Trainers", value: stats.Trainers ?? 0, icon: User, tone: "text-sky-400" },
    { label: "Schedules", value: stats.Schedules ?? 0, icon: ClipboardCheck, tone: "text-emerald-400" },
    { label: "Tournaments", value: stats.Tournaments ?? 0, icon: Trophy, tone: "text-amber-400" },
    { label: "Equipment", value: stats.Equipment ?? 0, icon: Dumbbell, tone: "text-violet-400" },
    { label: "Evaluations", value: stats.Evaluations ?? 0, icon: BadgeCheck, tone: "text-rose-400" },
  ];

  return (
    <DashboardLayout role="coach">
      <div className="w-full max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="h-px w-5 bg-orange-500" />
            <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-orange-500">
              Coaching Staff
            </span>
          </div>
          <h1 className="mt-2 text-[22px] font-extrabold tracking-tight text-white md:text-[24px]">
            My Coach Profile
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Your staff identity, sport assignment, contact details and squad summary in one place.
          </p>
        </div>

        <div className="space-y-6">
          {/* IDENTITY CARD */}
          <div className="border border-zinc-800 bg-[#121215] p-6 shadow-xl">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative group shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPhotoOpen(true)}
                  title="Click to view and update your photo"
                  aria-label="Open profile picture"
                  className="group/pic relative block h-24 w-24 overflow-hidden border-2 border-orange-500 shadow-lg"
                >
                  {displayPhoto ? (
                    <img
                      src={displayPhoto}
                      alt={coach.FullName || "Coach"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-orange-500 text-3xl font-black text-black">
                      {coach.FullName?.charAt(0) || "C"}
                    </span>
                  )}

                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition group-hover/pic:opacity-100 group-focus-visible/pic:opacity-100">
                    <Maximize2 size={19} className="text-white" />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 bg-zinc-900 border border-orange-500/60 p-1.5 text-orange-400 hover:text-white hover:bg-orange-500 transition shadow"
                  title="Change Photo"
                >
                  <Camera size={14} />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-lg font-black text-white truncate">{coach.FullName}</div>
                  <span
                    className={`border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                      coach.IsActive
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : "border-zinc-700 bg-zinc-900 text-zinc-500"
                    }`}
                  >
                    {coach.IsActive ? "Active Duty" : "Inactive"}
                  </span>
                </div>

                <div className="mt-1 text-xs text-zinc-400">
                  {coach.Specialization || "Head Coach"} · {coach.SportName || "Unassigned sport"}
                </div>

                <button
                  type="button"
                  onClick={() => setIsPhotoOpen(true)}
                  className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-400 transition hover:text-orange-300"
                >
                  <Maximize2 size={11} /> View / change photo
                </button>

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className="rounded-none bg-zinc-800 px-2 py-0.5 text-[9px] font-bold uppercase text-orange-400 border border-zinc-700">
                    {coach.EmployeeCode || "COACH"}
                  </span>
                  <span className="flex items-center gap-1 rounded-none bg-zinc-800 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-400 border border-zinc-700">
                    <Star size={9} /> {Number(coach.Rating || 0).toFixed(1)}
                  </span>
                  <span className="rounded-none bg-zinc-800 px-2 py-0.5 text-[9px] font-bold uppercase text-zinc-300 border border-zinc-700">
                    {coach.ExperienceYears || 0} yrs experience
                  </span>
                </div>

                {selectedFile && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[11px] text-zinc-300 font-medium truncate max-w-xs">
                      {selectedFile.name}
                    </span>
                    <button
                      onClick={handleUploadPhoto}
                      disabled={uploading}
                      className="inline-flex items-center gap-1.5 rounded-none bg-orange-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-black hover:bg-white transition disabled:opacity-50"
                    >
                      <UploadCloud size={13} />
                      {uploading ? "Uploading..." : "Save Picture"}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreview(null);
                      }}
                      className="text-[10px] text-zinc-400 hover:text-red-400"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SEASON SNAPSHOT */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="border border-zinc-800 bg-[#121215] p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                      {card.label}
                    </span>
                    <Icon size={14} className={card.tone} />
                  </div>
                  <div className="mt-1.5 text-lg font-black text-white">{card.value}</div>
                </div>
              );
            })}
          </div>

          {/* STAFF RECORD + EDIT FORM */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="border border-zinc-800 bg-[#121215] p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-zinc-800 pb-2">
                Staff Record
              </h3>

              <div className="mt-4 space-y-3 text-[11.5px]">
                {[
                  ["Employee Code", coach.EmployeeCode || "—"],
                  ["Sport Facility", coach.SportName || "—"],
                  ["Specialization", coach.Specialization || "—"],
                  ["Experience", `${coach.ExperienceYears || 0} years`],
                  ["Monthly Salary", coach.MonthlySalary ? `Rs ${Number(coach.MonthlySalary).toLocaleString()}` : "—"],
                  ["Date of Joining", formatDate(coach.JoinedAt)],
                  ["Login Email", account.Email || user?.email || "—"],
                  ["Attendance This Month", `${stats.PresentDays ?? 0} present / ${stats.AbsentDays ?? 0} absent`],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-3 border-b border-zinc-800/60 pb-2 last:border-0">
                    <span className="text-[9.5px] uppercase tracking-wider text-zinc-500">{label}</span>
                    <span className="text-right font-bold text-zinc-200">{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-start gap-2 border border-zinc-800/80 bg-zinc-900/40 p-3 text-[10.5px] text-zinc-400">
                <Lock size={12} className="mt-0.5 shrink-0 text-orange-500" />
                <p>
                  Name, sport assignment, specialization and salary are maintained by the administrator. Contact the
                  front desk for changes to those records.
                </p>
              </div>
            </div>

            <div className="border border-zinc-800 bg-[#121215] p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-zinc-800 pb-2">
                Editable Details
              </h3>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                    Staff Contact Number
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="tel"
                      value={phone}
                      maxLength={50}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+92 321 1234567"
                      className="w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                    />
                    <Phone size={15} className="absolute right-3.5 top-3 text-zinc-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Login Email (read only)
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="email"
                      disabled
                      value={account.Email || user?.email || ""}
                      className="w-full rounded-none border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5 text-xs text-zinc-400 cursor-not-allowed"
                    />
                    <Mail size={15} className="absolute right-3.5 top-3 text-zinc-600" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                      Coaching Bio
                    </label>
                    <span className="text-[9px] text-zinc-500">{bio.length}/1000</span>
                  </div>
                  <textarea
                    rows={5}
                    value={bio}
                    maxLength={1000}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Certifications, playing career, coaching philosophy, achievements..."
                    className="mt-1 w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white leading-relaxed focus:border-orange-500 focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-none bg-orange-500 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-white disabled:opacity-50"
                >
                  {saving ? "Saving Changes..." : "Save Profile Details"}
                </button>
              </form>

              <div className="mt-5 border border-zinc-800/80 bg-zinc-900/40 p-4">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                  Profile Photo Web Link
                </label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/coach-photo.jpg"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-1 rounded-none border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyLink}
                    disabled={uploading}
                    className="rounded-none border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-bold uppercase text-zinc-200 hover:bg-zinc-700 hover:text-white transition shrink-0 disabled:opacity-50"
                  >
                    Apply Link
                  </button>
                </div>
                <p className="mt-1 text-[10px] text-zinc-500">
                  Upload a file from your device with the camera button above, or paste a direct image link here.
                </p>
              </div>
            </div>
          </div>

          {/* SQUAD + RECENT ACTIVITY */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="border border-zinc-800 bg-[#121215] p-5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Trainer Squad</h3>
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                  {trainers.length} linked
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {trainers.map((t) => (
                  <div
                    key={t.TrainerID}
                    className="flex items-center justify-between border border-zinc-800/70 bg-zinc-900/40 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[11.5px] font-bold text-zinc-200">{t.FullName}</div>
                      <div className="truncate text-[10px] text-zinc-500">
                        {t.Specialization || "Assistant Trainer"} · {t.Shift || "Morning"} shift
                      </div>
                    </div>
                    <span
                      className={`shrink-0 border px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider ${
                        t.IsActive
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                          : "border-zinc-700 bg-zinc-900 text-zinc-500"
                      }`}
                    >
                      {t.IsActive ? "Active" : "Off"}
                    </span>
                  </div>
                ))}
                {trainers.length === 0 && (
                  <div className="py-6 text-center text-[11px] text-zinc-500">
                    No trainers have been assigned to your squad yet.
                  </div>
                )}
              </div>
            </div>

            <div className="border border-zinc-800 bg-[#121215] p-5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Recent Submissions</h3>
                <Wallet size={13} className="text-orange-500" />
              </div>

              <div className="mt-3 space-y-2">
                {tournaments.map((t) => (
                  <div
                    key={t.TournamentID}
                    className="flex items-center justify-between gap-2 border border-zinc-800/70 bg-zinc-900/40 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[11.5px] font-bold text-zinc-200">{t.TournamentName}</div>
                      <div className="text-[10px] text-zinc-500">
                        {formatDate(t.StartDate)} · {t.Venue || "Venue TBD"}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 border px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider ${
                        t.ApprovalStatus === "Approved"
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                          : t.ApprovalStatus === "Rejected"
                          ? "border-red-500/40 bg-red-500/10 text-red-400"
                          : "border-amber-500/40 bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {t.ApprovalStatus || "Pending"}
                    </span>
                  </div>
                ))}

                {salary.slice(0, 2).map((s) => (
                  <div
                    key={s.SalaryPaymentID}
                    className="flex items-center justify-between border border-zinc-800/70 bg-zinc-900/40 px-3 py-2"
                  >
                    <div>
                      <div className="text-[11.5px] font-bold text-zinc-200">
                        Salary {String(s.SalaryMonth).padStart(2, "0")}/{s.SalaryYear}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {s.Status} · {s.PaidOn ? formatDate(s.PaidOn) : "not disbursed"}
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-emerald-400">
                      Rs {Number(s.NetSalary || 0).toLocaleString()}
                    </span>
                  </div>
                ))}

                {tournaments.length === 0 && salary.length === 0 && (
                  <div className="py-6 text-center text-[11px] text-zinc-500">
                    No tournament submissions or salary entries yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECURITY NOTE */}
          <div className="border border-zinc-800 bg-[#121215] p-5 text-xs text-zinc-400 space-y-1">
            <div className="flex items-center gap-2 text-zinc-300 font-bold text-xs">
              <ShieldCheck size={13} className="text-orange-500" />
              Staff Account Security
            </div>
            <p>
              Your coaching account is issued by the administration with a salted bcrypt password hash. Role upgrades,
              sport re-assignment and deactivation are performed only by club administrators.
            </p>
          </div>

          <div className="flex items-start gap-2 border border-sky-500/20 bg-sky-500/5 p-4 text-[11px] text-sky-300">
            <Info size={15} className="mt-0.5 shrink-0" />
            <p>
              This profile is visible to the administration only. Members see your name, sport and rating on their
              enrolment cards.
            </p>
          </div>
        </div>
      </div>

      <AvatarLightbox
        open={isPhotoOpen}
        onClose={() => setIsPhotoOpen(false)}
        src={displayPhoto}
        name={coach.FullName}
        subtitle={coach.Specialization || coach.SportName || "Coaching Staff"}
        fallbackLetter={coach.FullName?.charAt(0) || "C"}
        title="Coach Profile Photo"
        busy={uploading}
        pendingName={selectedFile?.name}
        onFileSelected={handleFileChange}
        onUpload={handleUploadPhoto}
        onCancelPending={() => {
          setSelectedFile(null);
          setFilePreview(null);
        }}
        urlValue={imageUrlInput}
        onUrlChange={setImageUrlInput}
        onApplyUrl={handleApplyLink}
        urlPlaceholder="https://example.com/coach-photo.jpg"
      />
    </DashboardLayout>
  );
}

export default CoachProfile;
