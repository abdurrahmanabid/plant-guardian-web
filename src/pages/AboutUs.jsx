import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import leftLeaf from "../assets/img/hero-left-leaf.png";
import rightLeaf from "../assets/img/hero-right-leaf.png";
import Button from "../components/Button";

// About page for PlantGuardian
// - Tailwind for layout/typography
// - Reuses hero leaf assets for visual continuity
// - i18n keys live under the "about" namespace (see keys below)
// - Add a route: <Route path="/about" element={<AboutUs />} />

const Feature = ({ title, body }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 shadow-sm hover:shadow-md transition-shadow">
    <h4 className="text-lg font-semibold mb-2">{title}</h4>
    <p className="text-sm leading-relaxed opacity-90">{body}</p>
  </div>
);

const Stat = ({ value, label }) => (
  <div className="text-center p-4">
    <div className="text-4xl md:text-5xl font-bold tracking-tight">{value}</div>
    <div className="mt-1 text-sm opacity-80">{label}</div>
  </div>
);

export default function AboutUs() {
  const { t } = useTranslation("about");
  const navigate = useNavigate();

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from("#about-title", { y: 30, opacity: 0, duration: 0.6 })
      .from("#about-subtitle", { y: 20, opacity: 0, duration: 0.6 }, "-=0.3")
      .from(".about-leaf", { y: 10, opacity: 0, duration: 0.6 }, "-=0.3")
      .from(
        ".about-feature",
        { y: 20, opacity: 0, stagger: 0.08, duration: 0.5 },
        "-=0.2"
      );
  }, []);

  return (
    <section id="about" className=" overflow-hidden">
      {/* Decorative leaves */}
      <img
        src={leftLeaf}
        alt="left leaf"
        className="pointer-events-none select-none about-leaf about-left absolute top-32 left-0 md:-left-10 w-32 md:w-64 opacity-70"
      />
      <img
        src={rightLeaf}
        alt="right leaf"
        className="pointer-events-none select-none about-leaf about-right absolute top-92 right-0 md:-right-10 w-28 md:w-56 opacity-70"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Header */}
        <h1
          id="about-title"
          className="title text-gradient text-4xl md:text-6xl font-extrabold"
        >
          {t("title")}
        </h1>
        <p
          id="about-subtitle"
          className="subtitle mt-4 md:mt-6 text-base md:text-lg max-w-3xl"
        >
          {t("subtitle")}
        </p>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Stat
            value={t("stats.classes.value")}
            label={t("stats.classes.label")}
          />
          <Stat
            value={t("stats.languages.value")}
            label={t("stats.languages.label")}
          />
          <Stat
            value={t("stats.response.value")}
            label={t("stats.response.label")}
          />
          <Stat
            value={t("stats.accuracy.value")}
            label={t("stats.accuracy.label")}
          />
        </div>

        {/* Mission & How it works */}
        <div className="mt-16 grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          <div>
            <h3 className="text-2xl font-semibold mb-3">
              {t("mission.title")}
            </h3>
            <p className="opacity-90 leading-relaxed">{t("mission.body")}</p>
            <div className="mt-6">
              <Button
                speed="5s"
                thickness={3}
                onClick={() => navigate("/leaf-disease-predict/all")}
              >
                {t("cta.scanLeaf")}
              </Button>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-3">{t("how.title")}</h3>
            <ol className="space-y-3 list-decimal pl-5">
              <li className="about-feature">{t("how.steps.0")}</li>
              <li className="about-feature">{t("how.steps.1")}</li>
              <li className="about-feature">{t("how.steps.2")}</li>
              <li className="about-feature">{t("how.steps.3")}</li>
            </ol>
          </div>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <Feature
            title={t("features.fast.title")}
            body={t("features.fast.body")}
          />
          <Feature
            title={t("features.actionable.title")}
            body={t("features.actionable.body")}
          />
          <Feature
            title={t("features.local.title")}
            body={t("features.local.body")}
          />
          <Feature
            title={t("features.multilang.title")}
            body={t("features.multilang.body")}
          />
          <Feature
            title={t("features.privacy.title")}
            body={t("features.privacy.body")}
          />
          <Feature
            title={t("features.stack.title")}
            body={t("features.stack.body")}
          />
        </div>

        {/* Team */}
        <div className="mt-20">
          <h3 className="text-2xl font-semibold mb-6">{t("team.title")}</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 flex items-center gap-5">
              <div className="h-14 w-14 shrink-0 rounded-full bg-gradient-to-br from-green-300/80 to-emerald-500/70 flex items-center justify-center text-xl font-bold">
                AR
              </div>
              <div>
                <div className="text-lg font-semibold">Md. Abdur Rahman</div>
                <div className="text-sm opacity-80">
                  {t("team.roles.founder")}
                </div>
                <div className="mt-2 text-sm opacity-90">
                  {t("team.location")}: Chattogram, Bangladesh ·{" "}
                  {t("team.contact")}{" "}
                  <a
                    className="underline"
                    href="mailto:abdurrahmanabid33@gmail.com"
                  >
                    abdurrahmanabid33@gmail.com
                  </a>
                </div>
                <div className="mt-2 flex gap-4 text-sm">
                  <a
                    className="underline"
                    href="https://github.com/abdurrahmanabid"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub
                  </a>
                  <a
                    className="underline"
                    href="https://linkedin.com/in/ab-rahman33"
                    target="_blank"
                    rel="noreferrer"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
              <h4 className="font-semibold mb-2">{t("credits.title")}</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm opacity-90">
                <li>{t("credits.items.dataset")}</li>
                <li>{t("credits.items.icons")}</li>
                <li>{t("credits.items.libs")}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 md:mt-20 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="text-sm opacity-80">{t("footer.note")}</p>
          <Button
            speed="5s"
            thickness={3}
            onClick={() => navigate("/leaf-disease-predict/all")}
          >
            {t("cta.tryNow")}
          </Button>
        </div>
      </div>
    </section>
  );
}
