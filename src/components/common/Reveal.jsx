import { useEffect, useRef, useState } from "react";

/**
 * Lightweight fade / slide / zoom reveal on scroll.
 *
 * variant: "up" (default) | "fade" | "left" | "right" | "zoom"
 * group:   when true the wrapper itself stays in place and its direct
 *          children fade in one after another (staggered).
 * delay:   extra delay in milliseconds for the wrapper.
 */
export default function Reveal({
  as: Tag = "div",
  variant = "up",
  group = false,
  delay = 0,
  className = "",
  style,
  children,
  ...rest
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    // Very old browsers: just show the content.
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -70px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const classes = [
    group ? "reveal-group" : `reveal reveal-${variant}`,
    isVisible ? "is-visible" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const mergedStyle = delay
    ? { "--reveal-delay": `${delay}ms`, ...style }
    : style;

  return (
    <Tag ref={ref} className={classes} style={mergedStyle} {...rest}>
      {children}
    </Tag>
  );
}
