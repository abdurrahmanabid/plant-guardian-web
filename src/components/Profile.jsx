import React, { useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText, ScrollTrigger } from "gsap/all";
import { useMediaQuery } from "react-responsive";
import leftLeaf from "../assets/img/hero-left-leaf.png";
import rightLeaf from "../assets/img/hero-right-leaf.png";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getUser } from "../utils/getUser";
import LeafSpinner from "./LeafSpinner";

// Register GSAP plugins once at module load
if (!gsap.core.globals()._profilePluginsRegistered) {
  gsap.registerPlugin(SplitText, ScrollTrigger);
  gsap.core.globals({ _profilePluginsRegistered: true });
}

const Field = ({ label, value, href }) => (
  <div className="space-y-1">
    <p className="text-xs uppercase tracking-[0.2em] opacity-70">{label}</p>
    {href ? (
      <a
        href={href}
        className="inline-block font-medium hover:opacity-90 transition-opacity break-all"
      >
        {value}
      </a>
    ) : (
      <p className="font-medium break-words">{value}</p>
    )}
  </div>
);

export default function Profile() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { t } = useTranslation("profile");

  const [user, setUser] = useState(null);

  // Fetch user safely (handles unmount)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getUser(); // getUser() returns a Promise
        if (alive) setUser(data);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // GSAP animations — run only when user-loaded & elements exist
  useGSAP(() => {
    if (!user) return;

    const titleEl = document.querySelector(".profile-title");
    const subEl = document.querySelector(".profile-subtitle");

    if (!titleEl || !subEl) return; // guard

    const nameSplit = new SplitText(titleEl, { type: "chars, words" });
    const subSplit = new SplitText(subEl, { type: "lines" });

    nameSplit.chars.forEach((c) => c.classList.add("text-gradient"));

    gsap.from(nameSplit.chars, {
      yPercent: 100,
      duration: 1.6,
      ease: "expo.out",
      stagger: 0.05,
    });

    gsap.from(subSplit.lines, {
      opacity: 0,
      yPercent: 80,
      duration: 1.2,
      ease: "expo.out",
      stagger: 0.06,
      delay: 0.4,
    });

    gsap
      .timeline({
        scrollTrigger: {
          trigger: "#profile",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      })
      .to(".right-leaf", { y: 220 }, 0)
      .to(".left-leaf", { y: -220 }, 0);

    const startValue = isMobile ? "top 80%" : "top 85%";
    gsap.from(".profile-card", {
      scrollTrigger: { trigger: ".profile-card", start: startValue },
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });
  }, [user, isMobile]);

  if (!user) return <LeafSpinner />;

  const { name, role, email, phone, address, id } = user;
  const prettyPhone = (p) => (p || "").replace(/\s+/g, "");

  return (
    <section id="profile" className="relative overflow-hidden noisy">
      {/* Floating theme leaves (reusing assets from Hero) */}
      <img
        src={leftLeaf}
        alt="left-leaf"
        className="left-leaf pointer-events-none select-none absolute -left-10 top-0 opacity-60"
      />
      <img
        src={rightLeaf}
        alt="right-leaf"
        className="right-leaf pointer-events-none select-none absolute -right-10 -top-6 opacity-60"
      />

      <div className="container mx-auto px-4 md:px-8 py-16 md:py-24">
        {/* Title */}
        <h1 className="profile-title title text-[42px] md:text-[96px] leading-[0.9]">
          {name}
        </h1>

        <div className="mt-4 md:mt-6 max-w-3xl">
          <p className="profile-subtitle text-lg md:text-2xl opacity-90">
            {role} • {address?.city || ""}, {address?.state || ""}
          </p>
        </div>

        {/* Card */}
        <div className="profile-card mt-10 md:mt-14 grid md:grid-cols-[1.2fr_1fr] gap-6 md:gap-10">
          <div className="rounded-2xl md:rounded-3xl p-6 md:p-8 backdrop-blur-sm bg-white/5 dark:bg-black/20 shadow-xl shadow-black/10 border border-white/10">
            <div className="flex items-center gap-4 md:gap-6">
              {/* Simple avatar badge with initials */}
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl md:text-3xl font-semibold">
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.25em] opacity-70">
                  {t("profileId")}
                </p>
                <p className="font-mono text-sm md:text-base break-all">{id}</p>
              </div>
            </div>

            <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field
                label={t("email")}
                value={email}
                href={`mailto:${email}`}
              />
              <Field
                label={t("phone")}
                value={phone}
                href={`tel:${prettyPhone(phone)}`}
              />
              <Field label={t("city")} value={address?.city || ""} />
              <Field label={t("street")} value={address?.street || ""} />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 md:gap-4">
              <Button
                thickness={3}
                speed="5s"
                onClick={() => navigate("/profile/edit")}
              >
                {t("updateBtn")}
              </Button>
            </div>
          </div>

          {/* Side panel */}
          <aside className="rounded-2xl md:rounded-3xl p-6 md:p-8 bg-white/5 dark:bg-black/20 border border-white/10">
            <h3 className="text-base md:text-lg font-semibold mb-4">
              {t("about")}
            </h3>
            <p className="opacity-80 leading-relaxed">
              {t("aboutText", {
                name,
                role: (role || "").toLowerCase(),
                city: address?.city || "",
                state: address?.state || "",
              })}
            </p>

            <div className="mt-6">
              <h4 className="text-sm uppercase tracking-[0.2em] opacity-70 mb-2">
                {t("location")}
              </h4>
              <p className="font-medium">{address?.street || ""}</p>
              <p className="opacity-80">
                {address?.city || ""}, {address?.state || ""}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
