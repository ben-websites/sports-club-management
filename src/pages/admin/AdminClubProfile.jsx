import { useEffect, useRef, useState } from "react";
import {
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Save,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PageLoader from "../../components/dashboard/PageLoader";
import { useAuth } from "../../context/AuthContext";

const EMPTY = {
  clubName: "",
  legalName: "",
  tagline: "",
  description: "",
  logoUrl: "",
  coverImageUrl: "",
  contactEmail: "",
  contactPhone: "",
  addressLine: "",
  city: "",
  country: "",
  websiteUrl: "",
  foundedYear: "",
};

/**
 * The admin's window onto the club's public page.
 *
 * Whatever is saved here is exactly what a visitor sees on /clubs/:slug - the
 * facilities, plans, coaches and events themselves are managed on their own
 * screens and appear automatically. The name and logo also drive the workspace
 * sidebar, so the session is refreshed after every successful save.
 */
const AdminClubProfile = () => {
  const { refreshUser } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [meta, setMeta] = useState({ slug: "", status: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const { data } = await api.get("/club/profile");
        if (!alive || !data.success) return;

        const club = data.data || {};
        setMeta({ slug: club.Slug, status: club.Status });
        setForm({
          clubName: club.ClubName || "",
          legalName: club.LegalName || "",
          tagline: club.Tagline || "",
          description: club.Description || "",
          logoUrl: club.LogoURL || "",
          coverImageUrl: club.CoverImageURL || "",
          contactEmail: club.ContactEmail || "",
          contactPhone: club.ContactPhone || "",
          addressLine: club.AddressLine || "",
          city: club.City || "",
          country: club.Country || "",
          websiteUrl: club.WebsiteURL || "",
          foundedYear: club.FoundedYear || "",
        });
      } catch (error) {
        console.error("Could not load the club profile:", error.message);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  const change = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const imageKey = (kind) => (kind === "logo" ? "logoUrl" : "coverImageUrl");

  // The image is saved on its own the moment it is chosen, so the admin sees
  // the new logo in the sidebar without having to remember to press Save.
  const uploadImage = async (kind, file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file (PNG, JPG, WEBP or SVG).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Images must be 2 MB or smaller.");
      return;
    }

    const body = new FormData();
    body.append("image", file);
    setUploading(kind);

    try {
      const { data } = await api.post(`/club/profile/${kind}`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.success) {
        const key = imageKey(kind);
        setForm((current) => ({ ...current, [key]: data.data?.[key] || "" }));
        await refreshUser();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not upload that image.");
    } finally {
      setUploading(null);
    }
  };

  const removeImage = async (kind) => {
    const confirmed = window.confirm(
      `Remove the club ${kind === "logo" ? "logo" : "cover image"}? Your public page will fall back to the club initials.`
    );
    if (!confirmed) return;

    setUploading(kind);

    try {
      const { data } = await api.delete(`/club/profile/${kind}`);
      if (data.success) {
        setForm((current) => ({ ...current, [imageKey(kind)]: "" }));
        await refreshUser();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not remove that image.");
    } finally {
      setUploading(null);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const { data } = await api.put("/club/profile", {
        ...form,
        foundedYear: form.foundedYear ? Number(form.foundedYear) : null,
      });

      if (data.success) {
        toast.success(data.message || "Club profile updated.");
        await refreshUser();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save the club profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <PageLoader message="Loading club profile..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
            Club profile
          </div>
          <h1 className="mt-2 text-[22px] font-black tracking-tight text-white sm:text-[26px]">
            Company details &amp; branding
          </h1>
          <p className="mt-2 max-w-2xl text-[12px] leading-6 text-zinc-500">
            Change your club name, contact details and logo here. Everything on this page is what
            visitors see on your public page - and your workspace name and logo update with it.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {meta.status && (
            <span
              className={`border px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider ${
                meta.status === "Active"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-red-500/40 bg-red-500/10 text-red-300"
              }`}
            >
              {meta.status}
            </span>
          )}

          {meta.slug && (
            <a
              href={`/clubs/${meta.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-zinc-700 px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-wider text-zinc-300 transition hover:border-orange-500 hover:text-white"
            >
              <ExternalLink size={12} />
              View public page
            </a>
          )}
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="border border-zinc-800 bg-[#0e0e11]">
            <header className="border-b border-zinc-800 px-5 py-4">
              <h2 className="text-[13px] font-bold text-white">Identity</h2>
              <p className="mt-0.5 text-[11px] text-zinc-500">
                The name and story shown at the top of your page.
              </p>
            </header>

            <div className="space-y-4 p-5">
              <Field label="Club name" required>
                <input
                  value={form.clubName}
                  onChange={change("clubName")}
                  className={inputClass}
                  placeholder="Sports Hub"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Legal / registered name">
                  <input
                    value={form.legalName}
                    onChange={change("legalName")}
                    className={inputClass}
                    placeholder="Sports Hub (Pvt) Ltd"
                  />
                </Field>
                <Field label="Founded year">
                  <input
                    type="number"
                    value={form.foundedYear}
                    onChange={change("foundedYear")}
                    className={inputClass}
                    placeholder="2015"
                  />
                </Field>
              </div>

              <Field label="Tagline" hint="One line that sums the club up.">
                <input
                  value={form.tagline}
                  onChange={change("tagline")}
                  className={inputClass}
                  placeholder="Train with the best, on courts that never sleep."
                />
              </Field>

              <Field label="Description" hint="Facilities, history, what makes you different.">
                <textarea
                  rows={6}
                  value={form.description}
                  onChange={change("description")}
                  className={`${inputClass} leading-6`}
                  placeholder="We run six floodlit courts, a 25m pool and a full athletics track..."
                />
              </Field>
            </div>
          </section>

          <section className="border border-zinc-800 bg-[#0e0e11]">
            <header className="border-b border-zinc-800 px-5 py-4">
              <h2 className="text-[13px] font-bold text-white">Contact</h2>
              <p className="mt-0.5 text-[11px] text-zinc-500">
                Shown beside your facilities in the directory.
              </p>
            </header>

            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="Contact email" required>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={change("contactEmail")}
                  className={inputClass}
                  placeholder="hello@sportshub.pk"
                />
              </Field>
              <Field label="Contact phone">
                <input
                  value={form.contactPhone}
                  onChange={change("contactPhone")}
                  className={inputClass}
                  placeholder="+92 300 1234567"
                />
              </Field>
              <Field label="Address">
                <input
                  value={form.addressLine}
                  onChange={change("addressLine")}
                  className={inputClass}
                  placeholder="Plot 12, Main Boulevard"
                />
              </Field>
              <Field label="City">
                <input
                  value={form.city}
                  onChange={change("city")}
                  className={inputClass}
                  placeholder="Lahore"
                />
              </Field>
              <Field label="Country">
                <input
                  value={form.country}
                  onChange={change("country")}
                  className={inputClass}
                  placeholder="Pakistan"
                />
              </Field>
              <Field label="Website">
                <input
                  value={form.websiteUrl}
                  onChange={change("websiteUrl")}
                  className={inputClass}
                  placeholder="https://sportshub.pk"
                />
              </Field>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="border border-zinc-800 bg-[#0e0e11]">
            <header className="border-b border-zinc-800 px-5 py-4">
              <h2 className="text-[13px] font-bold text-white">Branding</h2>
              <p className="mt-0.5 text-[11px] text-zinc-500">
                Upload a logo - it appears here, in your sidebar and on your public page.
              </p>
            </header>

            <div className="space-y-6 p-5">
              <ImagePicker
                label="Club logo"
                hint="Square image works best. PNG, JPG, WEBP or SVG up to 2 MB."
                value={form.logoUrl}
                busy={uploading === "logo"}
                square
                onUpload={(file) => uploadImage("logo", file)}
                onRemove={() => removeImage("logo")}
              />

              <ImagePicker
                label="Cover image"
                hint="Wide banner shown at the top of your public page. Up to 2 MB."
                value={form.coverImageUrl}
                busy={uploading === "cover"}
                onUpload={(file) => uploadImage("cover", file)}
                onRemove={() => removeImage("cover")}
              />

              <details className="border-t border-zinc-800 pt-4">
                <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-wider text-zinc-500 transition hover:text-zinc-300">
                  Already hosting the images? Paste a link
                </summary>

                <div className="mt-3 space-y-3">
                  <Field label="Logo URL">
                    <input
                      value={form.logoUrl}
                      onChange={change("logoUrl")}
                      className={inputClass}
                      placeholder="https://.../logo.png"
                    />
                  </Field>

                  <Field label="Cover image URL">
                    <input
                      value={form.coverImageUrl}
                      onChange={change("coverImageUrl")}
                      className={inputClass}
                      placeholder="https://.../cover.jpg"
                    />
                  </Field>

                  <p className="text-[10.5px] text-zinc-600">
                    A pasted link is saved when you press Save profile.
                  </p>
                </div>
              </details>
            </div>
          </section>

          <section className="border border-zinc-800 bg-[#0e0e11] p-5">
            <div className="flex items-start gap-3">
              <MapPin size={15} className="mt-0.5 shrink-0 text-orange-500" />
              <p className="text-[11px] leading-6 text-zinc-500">
                Your address appears on the directory card so people can find you.
              </p>
            </div>
            <div className="mt-4 flex items-start gap-3">
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-orange-500" />
              <p className="text-[11px] leading-6 text-zinc-500">
                Membership plans, sports, services and events are managed on their own pages and
                show up on your public page automatically.
              </p>
            </div>
          </section>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 bg-orange-500 py-3.5 text-[11px] font-black uppercase tracking-wider text-black transition hover:bg-white disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save profile
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

const inputClass =
  "w-full border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none";

/**
 * Preview + upload + remove for one brand image.
 *
 * The file is stored as soon as it is picked (the parent saves it), so there is
 * no half-finished state where the preview and the database disagree.
 */
const ImagePicker = ({ label, hint, value, busy, square = false, onUpload, onRemove }) => {
  const inputRef = useRef(null);

  const pick = () => inputRef.current?.click();

  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
        {label}
      </label>

      <div className="mt-2 flex items-start gap-3">
        <div
          className={`flex shrink-0 items-center justify-center overflow-hidden border border-zinc-800 bg-zinc-900 ${
            square ? "h-20 w-20" : "h-20 w-32"
          }`}
        >
          {value ? (
            <img
              src={value}
              alt={`${label} preview`}
              className={`h-full w-full ${square ? "object-contain p-2" : "object-cover"}`}
            />
          ) : (
            <ImageIcon size={20} className="text-zinc-700" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={pick}
            disabled={busy}
            className="inline-flex items-center gap-2 border border-zinc-700 px-3 py-2 text-[10.5px] font-bold uppercase tracking-wider text-zinc-300 transition hover:border-orange-500 hover:text-white disabled:opacity-50"
          >
            {busy ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={12} />}
            {busy ? "Uploading..." : value ? "Replace" : "Upload"}
          </button>

          {value && (
            <button
              type="button"
              onClick={onRemove}
              disabled={busy}
              className="inline-flex items-center gap-2 border border-zinc-800 px-3 py-2 text-[10.5px] font-bold uppercase tracking-wider text-zinc-500 transition hover:border-red-500/60 hover:text-red-300 disabled:opacity-50"
            >
              <Trash2 size={12} />
              Remove
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          onUpload(file);
        }}
      />

      {hint && <p className="mt-2 text-[10.5px] text-zinc-600">{hint}</p>}
    </div>
  );
};

const Field = ({ label, hint, required, children }) => (
  <div>
    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
      {label}
      {required && <span className="ml-1 text-orange-500">*</span>}
    </label>
    <div className="mt-2">{children}</div>
    {hint && <p className="mt-1.5 text-[10.5px] text-zinc-600">{hint}</p>}
  </div>
);

export default AdminClubProfile;
