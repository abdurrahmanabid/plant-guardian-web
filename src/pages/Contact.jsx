import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import leftLeaf from "../assets/img/hero-left-leaf.png";
import rightLeaf from "../assets/img/hero-right-leaf.png";
import Button from "../components/Button";

// Contact page for PlantGuardian
// - Tailwind for layout
// - i18n keys in the "contact" namespace (see JSON at bottom)
// - Safe submit: if VITE_CONTACT_ENDPOINT exists, POST there; otherwise mailto fallback
// - Route: <Route path="/contact" element={<Contact />} />

export default function Contact() {
  const { t } = useTranslation("contact");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
    hp: "",
  });
  const [status, setStatus] = useState({ state: "idle", error: null });

  useGSAP(() => {
    gsap.from("#contact-title", {
      y: 24,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out",
    });
    gsap.from(".contact-card", {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.06,
      delay: 0.1,
    });
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) return t("errors.name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return t("errors.email");
    if (form.message.trim().length < 10) return t("errors.message");
    if (form.hp) return t("errors.bot"); // honeypot
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setStatus({ state: "error", error: err });

    try {
      setStatus({ state: "submitting", error: null });
      const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT;

      if (endpoint) {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            subject: form.subject,
            message: form.message,
            source: "plantguardian-web",
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setStatus({ state: "success", error: null });
        setForm({
          name: "",
          email: "",
          subject: "general",
          message: "",
          hp: "",
        });
      } else {
        const mailto = `mailto:abdurrahmanabid33@gmail.com?subject=${encodeURIComponent(
          "[PlantGuardian] " + t(`subjects.${form.subject}`)
        )}&body=${encodeURIComponent(
          `${t("labels.name")}: ${form.name}\n${t("labels.email")}: ${
            form.email
          }\n\n${t("labels.message")}:\n${form.message}`
        )}`;
        window.location.href = mailto;
        setStatus({ state: "success", error: null });
      }
    } catch (e2) {
      setStatus({ state: "error", error: t("errors.server") });
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden">
      {/* Decorative leaves (scoped classes to avoid Hero collisions) */}
      <img
        src={leftLeaf}
        alt="left leaf"
        className="pointer-events-none select-none contact-leaf absolute -left-16 -top-10 w-40 md:w-72 opacity-70"
      />
      <img
        src={rightLeaf}
        alt="right leaf"
        className="pointer-events-none select-none contact-leaf absolute -right-10 top-40 w-32 md:w-64 opacity-70"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Title */}
        <h1
          id="contact-title"
          className="title text-gradient text-4xl md:text-6xl font-extrabold"
        >
          {t("title")}
        </h1>
        <p className="subtitle mt-4 md:mt-6 text-base md:text-lg max-w-3xl">
          {t("subtitle")}
        </p>

        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {/* Quick contact cards */}
          <div className="contact-card rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
            <h4 className="font-semibold mb-1">{t("cards.email.title")}</h4>
            <p className="text-sm opacity-80">{t("cards.email.body")}</p>
            <a
              href="mailto:abdurrahmanabid33@gmail.com"
              className="mt-3 inline-block underline"
            >
              abdurrahmanabid33@gmail.com
            </a>
          </div>
          <div className="contact-card rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
            <h4 className="font-semibold mb-1">{t("cards.location.title")}</h4>
            <p className="text-sm opacity-80">Chattogram, Bangladesh</p>
            <p className="text-xs opacity-60 mt-1">
              {t("cards.location.note")}
            </p>
          </div>
          <div className="contact-card rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
            <h4 className="font-semibold mb-1">{t("cards.links.title")}</h4>
            <div className="text-sm flex flex-col gap-1">
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

        {/* Form */}
        <form onSubmit={onSubmit} className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 md:col-span-1">
            <label className="block text-sm mb-2" htmlFor="name">
              {t("labels.name")}
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={onChange}
              autoComplete="name"
              className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder={t("placeholders.name")}
            />

            <label className="block text-sm mt-4 mb-2" htmlFor="email">
              {t("labels.email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              autoComplete="email"
              className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder={t("placeholders.email")}
            />

            <label className="block text-sm mt-4 mb-2" htmlFor="subject">
              {t("labels.subject")}
            </label>
            <select
              id="subject"
              name="subject"
              value={form.subject}
              onChange={onChange}
              className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="general">{t("subjects.general")}</option>
              <option value="bug">{t("subjects.bug")}</option>
              <option value="partnership">{t("subjects.partnership")}</option>
            </select>

            {/* honeypot */}
            <input
              type="text"
              name="hp"
              value={form.hp}
              onChange={onChange}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 md:col-span-1">
            <label className="block text-sm mb-2" htmlFor="message">
              {t("labels.message")}
            </label>
            <textarea
              id="message"
              name="message"
              rows={9}
              value={form.message}
              onChange={onChange}
              className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder={t("placeholders.message")}
            />

            <div className="mt-4 flex items-center justify-between">
              <Button
                speed="5s"
                thickness={3}
                type="submit"
                disabled={status.state === "submitting"}
              >
                {status.state === "submitting"
                  ? t("cta.sending")
                  : t("cta.send")}
              </Button>
              {status.state === "error" && (
                <span className="text-sm text-red-400">{status.error}</span>
              )}
              {status.state === "success" && (
                <span className="text-sm text-emerald-400">
                  {t("cta.sent")}
                </span>
              )}
            </div>
          </div>
        </form>

        {/* Back CTA */}
        <div className="mt-12 flex items-center gap-3">
          <button className="underline text-sm" onClick={() => navigate("/")}>
            {t("cta.backHome")}
          </button>
        </div>
      </div>
    </section>
  );
}
