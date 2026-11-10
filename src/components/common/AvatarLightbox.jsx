import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Camera,
  ExternalLink,
  Image as ImageIcon,
  UploadCloud,
  X,
} from "lucide-react";

/**
 * Full-screen preview for the profile picture with the change-photo controls
 * built into the same popup (works the same on desktop and mobile).
 */
function AvatarLightbox({
  open,
  onClose,
  src,
  name,
  subtitle,
  fallbackLetter = "U",
  busy = false,
  pendingName,
  onFileSelected,
  onUpload,
  onCancelPending,
  urlValue = "",
  onUrlChange,
  onApplyUrl,
  urlPlaceholder = "https://example.com/my-photo.jpg",
  title = "Profile Picture",
}) {
  const fileInputRef = useRef(null);

  // Escape to close + lock the page behind the popup.
  useEffect(() => {
    if (!open) return;

    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handlePick = (event) => {
    onFileSelected?.(event);
    // Allow picking the same file again after a discard.
    event.target.value = "";
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-full w-full max-w-lg flex-col overflow-hidden border border-zinc-800 bg-[#121215] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* HEADER */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-800 px-4 py-3">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">
              {title}
            </div>
            <div className="mt-1 truncate text-sm font-black text-white">
              {name || "Member"}
            </div>
            {subtitle && (
              <div className="truncate text-[10.5px] font-medium text-zinc-400">
                {subtitle}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close picture preview"
            className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center border border-zinc-800 bg-zinc-900/80 text-zinc-300 transition hover:border-orange-500 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* ENLARGED PICTURE */}
        <div className="keep-dark flex min-h-0 flex-1 items-center justify-center bg-[#08080a] p-3 sm:p-5">
          {src ? (
            <img
              src={src}
              alt={name || "Profile picture"}
              className="max-h-[46vh] w-auto max-w-full object-contain shadow-2xl"
            />
          ) : (
            <div className="flex h-40 w-40 items-center justify-center bg-orange-500 text-5xl font-black text-black">
              {(fallbackLetter || "U").toUpperCase()}
            </div>
          )}
        </div>

        {/* UPDATE CONTROLS */}
        <div className="shrink-0 space-y-3 overflow-y-auto border-t border-zinc-800 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 bg-orange-500 px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-wider text-black transition hover:bg-white"
            >
              <Camera size={13} />
              Choose New Photo
            </button>

            {src && (
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-wider text-zinc-200 transition hover:border-orange-500 hover:text-orange-400"
              >
                <ExternalLink size={13} />
                Open Original
              </a>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePick}
              className="hidden"
            />
          </div>

          {pendingName && (
            <div className="border border-orange-500/40 bg-orange-500/5 p-2.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-400">
                <ImageIcon size={12} />
                Ready to upload
              </div>
              <div className="mt-1 truncate text-[11px] font-semibold text-zinc-300">
                {pendingName}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onUpload}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 bg-orange-500 px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-wider text-black transition hover:bg-white disabled:opacity-50"
                >
                  <UploadCloud size={13} />
                  {busy ? "Uploading..." : "Save Picture"}
                </button>
                <button
                  type="button"
                  onClick={onCancelPending}
                  className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 transition hover:text-red-400"
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[9.5px] font-bold uppercase tracking-wider text-zinc-400">
              Or use an image web link
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                type="url"
                value={urlValue}
                onChange={(event) => onUrlChange?.(event.target.value)}
                placeholder={urlPlaceholder}
                className="min-w-0 flex-1 border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-[11px] text-white focus:border-orange-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={onApplyUrl}
                disabled={busy || !urlValue?.trim()}
                className="shrink-0 border border-zinc-700 bg-zinc-800 px-3 py-2 text-[10.5px] font-bold uppercase text-zinc-200 transition hover:bg-zinc-700 hover:text-white disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>

          <p className="text-[10px] leading-relaxed text-zinc-500">
            JPG, PNG or WEBP. The picture is used on your dashboard, vouchers and club pass.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default AvatarLightbox;
