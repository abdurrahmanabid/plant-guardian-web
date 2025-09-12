import React, { useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";

/**
 * FloatingAvatar (Avatar + Tooltip)
 * ---------------------------------
 * - Shows only circular avatar by default.
 * - On hover: a tooltip-style label appears next to the avatar.
 */
export default function FloatingAvatar({
  src,
  alt = "profile",
  size = 68,
  position = "bottom-right",
  label = "Profile",
  onClick,
}) {
  const wrapRef = useRef(null);
  const mainRef = useRef(null);
  const imgRef = useRef(null);
  const rippleRef = useRef(null);

  const posClasses = useMemo(() => {
    switch (position) {
      case "bottom-left":
        return "fixed bottom-6 left-6";
      case "top-right":
        return "fixed top-6 right-6";
      case "top-left":
        return "fixed top-6 left-6";
      default:
        return "fixed bottom-6 right-6";
    }
  }, [position]);

  useEffect(() => {
    if (!wrapRef.current || !mainRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        mainRef.current,
        { autoAlpha: 0, y: 16, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: "power3.out" }
      );
      if (imgRef.current) {
        gsap.to(imgRef.current, {
          y: -5,
          duration: 2.4,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      }
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  const handleClick = () => {
    if (rippleRef.current) {
      gsap.fromTo(
        rippleRef.current,
        { scale: 0.7, autoAlpha: 0.25 },
        { scale: 1.5, autoAlpha: 0, duration: 0.45, ease: "power2.out" }
      );
    }
    if (onClick) onClick();
  };

  return (
    <div ref={wrapRef} className={`${posClasses} z-[60]`}>
      <button
        type="button"
        onClick={handleClick}
        ref={mainRef}
        aria-label={alt}
        className="group relative outline-none select-none"
        style={{ width: size, height: size }}
      >
        {/* avatar always visible */}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          style={{ width: size, height: size }}
          className="relative rounded-full ring-1 ring-white/60 shadow-md bg-white object-cover z-10"
        />

        {/* tooltip on hover */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg bg-white/90 text-gray-800 text-sm font-medium shadow-lg opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 origin-right">
          {label}
        </div>

        <div
          ref={rippleRef}
          className="pointer-events-none absolute inset-0 rounded-full border border-white/30"
        />
      </button>
    </div>
  );
}

// Usage:
// <FloatingAvatar src={avatarFarmar} label="Chat with us" position="bottom-right" />
