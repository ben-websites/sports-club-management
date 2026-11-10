import { useEffect, useState } from "react";

/**
 * Avatar with a graceful initials fallback.
 * Keeps the uploaded picture visible across refreshes and never renders
 * an empty box when the stored image URL cannot be loaded.
 */
function Avatar({ src, name, className, fallbackClassName, alt }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return <div className={fallbackClassName}>{name?.charAt(0)?.toUpperCase() || "U"}</div>;
  }

  return (
    <img
      src={src}
      alt={alt || name || "Profile picture"}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

export default Avatar;
