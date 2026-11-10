import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatusBadge from "../../components/dashboard/StatusBadge";
import AvatarLightbox from "../../components/common/AvatarLightbox";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { User, Mail, Phone, ShieldCheck, CheckCircle2, Lock, Camera, UploadCloud, Image as ImageIcon, Maximize2 } from "lucide-react";

function ProfilePage() {
  const { user, updateUserProfile, refreshUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatarUrlInput, setAvatarUrlInput] = useState(user?.avatarUrl || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);

  const fileInputRef = useRef(null);

  // Keep the URL field in step with the picture actually stored on the account,
  // so saving details later can never submit a stale (blank) avatar value.
  useEffect(() => {
    if (user?.avatarUrl) setAvatarUrlInput(user.avatarUrl);
  }, [user?.avatarUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please choose a valid image file.");
        return;
      }
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleUploadAvatarFile = async () => {
    if (!selectedFile) return;

    const confirm = await Swal.fire({
      title: "Update Profile Picture?",
      text: "Upload selected image as your club membership avatar?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#27272a",
      confirmButtonText: "Yes, Upload",
      cancelButtonText: "Cancel",
      background: "#18181b",
      color: "#ffffff",
      allowOutsideClick: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      const res = await api.post("/auth/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        toast.success(res.data.message || "Profile picture updated!");
        setSelectedFile(null);
        setFilePreview(null);
        setIsPhotoOpen(false);
        await refreshUser();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveAvatarUrl = async () => {
    if (!avatarUrlInput.trim()) return;

    const confirm = await Swal.fire({
      title: "Save Profile Picture URL?",
      text: "Update your avatar picture with the provided web link?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#27272a",
      confirmButtonText: "Yes, Update",
      cancelButtonText: "Cancel",
      background: "#18181b",
      color: "#ffffff",
      allowOutsideClick: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      setUploadingAvatar(true);
      const res = await api.put("/auth/profile", {
        fullName: fullName || user?.fullName,
        phone: phone || user?.phone,
        avatarUrl: avatarUrlInput.trim(),
      });

      if (res.data.success) {
        toast.success("Profile picture link updated!");
        await refreshUser();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile picture URL.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirm = await Swal.fire({
      title: "Save Profile Changes?",
      text: "Are you sure you want to update your registered personal details?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#27272a",
      confirmButtonText: "Yes, Save Details",
      cancelButtonText: "Cancel",
      background: "#18181b",
      color: "#ffffff",
      allowOutsideClick: true,
    });

    if (!confirm.isConfirmed) return;

    setSaving(true);
    await updateUserProfile({ fullName, phone });
    setSaving(false);
  };

  const displayAvatar = filePreview || user?.avatarUrl;

  return (
    <DashboardLayout role="user">
      <div className="w-full max-w-3xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="h-px w-5 bg-orange-500" />
            <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-orange-500">
              Account
            </span>
          </div>
          <h1 className="mt-2 text-[22px] font-extrabold tracking-tight text-white md:text-[24px]">
            Personal Profile & Photo
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Manage your profile picture, contact credentials, and membership pass identity.
          </p>
        </div>

        <div className="border border-zinc-800 bg-[#121215] p-7 shadow-xl space-y-8">
          {/* USER CHIP WITH PROFILE PICTURE UPLOAD */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-zinc-800">
            <div className="relative group shrink-0">
              <button
                type="button"
                onClick={() => setIsPhotoOpen(true)}
                title="Click to view and update your photo"
                aria-label="Open profile picture"
                className="group/pic relative block h-20 w-20 overflow-hidden border-2 border-orange-500 shadow-lg"
              >
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={user?.fullName || "Profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-orange-500 text-3xl font-black text-black">
                    {user?.fullName?.charAt(0) || "U"}
                  </span>
                )}

                <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition group-hover/pic:opacity-100 group-focus-visible/pic:opacity-100">
                  <Maximize2 size={18} className="text-white" />
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
              <div className="text-lg font-black text-white truncate">{user?.fullName}</div>
              <div className="text-xs text-zinc-400 truncate">{user?.email}</div>
              <button
                type="button"
                onClick={() => setIsPhotoOpen(true)}
                className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-400 transition hover:text-orange-300"
              >
                <Maximize2 size={11} /> View / change photo
              </button>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="rounded-none bg-zinc-800 px-2 py-0.5 text-[9px] font-bold uppercase text-orange-400 border border-zinc-700">
                  Role: {user?.role}
                </span>
                {user?.membership && (
                  <StatusBadge status={user.membership.status} />
                )}
              </div>

              {selectedFile && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[11px] text-zinc-300 font-medium truncate max-w-xs">
                    {selectedFile.name}
                  </span>
                  <button
                    onClick={handleUploadAvatarFile}
                    disabled={uploadingAvatar}
                    className="inline-flex items-center gap-1.5 rounded-none bg-orange-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-black hover:bg-white transition"
                  >
                    <UploadCloud size={13} />
                    {uploadingAvatar ? "Uploading..." : "Save Picture"}
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

          {/* AVATAR WEB URL OPTION */}
          <div className="border border-zinc-800/80 bg-zinc-900/40 p-4">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
              Profile Photo Web Link (Image URL Option)
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/my-photo.jpg"
                value={avatarUrlInput}
                onChange={(e) => setAvatarUrlInput(e.target.value)}
                className="flex-1 rounded-none border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveAvatarUrl}
                disabled={uploadingAvatar}
                className="rounded-none border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-bold uppercase text-zinc-200 hover:bg-zinc-700 hover:text-white transition shrink-0"
              >
                Apply Link
              </button>
            </div>
            <p className="mt-1 text-[10px] text-zinc-500">
              You can upload an image file from your device above or paste any direct image link here.
            </p>
          </div>

          {/* EDIT DETAILS FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-zinc-800 pb-2">
              Account Information
            </h3>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                Full Name *
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
                <User size={15} className="absolute right-3.5 top-3 text-zinc-500" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Email Address (Permanent Account Identifier)
              </label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full rounded-none border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5 text-xs text-zinc-400 cursor-not-allowed"
                />
                <Mail size={15} className="absolute right-3.5 top-3 text-zinc-600" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                Phone Number
              </label>
              <div className="mt-1 relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full rounded-none border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
                <Phone size={15} className="absolute right-3.5 top-3 text-zinc-500" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-none bg-orange-500 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-white disabled:opacity-50"
              >
                {saving ? "Saving Changes..." : "Save Profile Details"}
              </button>
            </div>
          </form>

          {/* SECURITY NOTE */}
          <div className="border-t border-zinc-800 pt-5 text-xs text-zinc-400 space-y-1">
            <div className="flex items-center gap-2 text-zinc-300 font-bold text-xs">
              <Lock size={13} className="text-orange-500" />
              Account Security & Role Authority
            </div>
            <p>
              Your account password is encrypted using salted bcrypt hashing in Microsoft SQL Server. Role privilege upgrades to Administrator are managed via database administrator access.
            </p>
          </div>
        </div>
      </div>

      <AvatarLightbox
        open={isPhotoOpen}
        onClose={() => setIsPhotoOpen(false)}
        src={displayAvatar}
        name={user?.fullName}
        subtitle={user?.email}
        fallbackLetter={user?.fullName?.charAt(0) || "U"}
        busy={uploadingAvatar}
        pendingName={selectedFile?.name}
        onFileSelected={handleFileChange}
        onUpload={handleUploadAvatarFile}
        onCancelPending={() => {
          setSelectedFile(null);
          setFilePreview(null);
        }}
        urlValue={avatarUrlInput}
        onUrlChange={setAvatarUrlInput}
        onApplyUrl={handleSaveAvatarUrl}
        urlPlaceholder="https://example.com/my-photo.jpg"
      />
    </DashboardLayout>
  );
}

export default ProfilePage;
