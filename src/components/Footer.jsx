import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Github,
  Send,
  ArrowUpRight,
} from "lucide-react";
import logo from "../assets/img/logo-no-bg.png";

const Footer = () => {
  const { t } = useTranslation(["footer", "common"]);
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);
  const year = new Date().getFullYear();

  const groupsRaw = t("footer:links", { returnObjects: true });
  const groups = Array.isArray(groupsRaw) ? groupsRaw : [];

  const contact = t("footer:contact", { returnObjects: true }) || {};
  const socials = [
    { icon: Facebook, href: contact?.socials?.facebook || "#" },
    { icon: Twitter, href: contact?.socials?.twitter || "#" },
    { icon: Instagram, href: contact?.socials?.instagram || "#" },
    { icon: Github, href: contact?.socials?.github || "#" },
  ];

  const onSubmit = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return;
    // এখানে তোমার API হিট করো চাইলে
    setOk(true);
    setEmail("");
    setTimeout(() => setOk(false), 2500);
  };

  const inputCls =
    "w-full bg-white/10 text-white placeholder-white/60 border border-white/10 rounded-xl px-3 py-2 outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-white/30 transition";

  return (
    <footer className="relative mt-16 text-white">
      {/* subtle top gradient line */}
      <div className="pointer-events-none absolute -top-px left-0 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="bg-[#0b061f]/60 backdrop-blur-md border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            {/* Brand & tagline */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src={logo} alt="logo" width={32} height={32} />
                <span className="font-semibold text-lg">
                  {t("common:siteName")}
                </span>
              </div>
              <p className="text-white/70">{t("footer:tagline")}</p>

              <div className="flex items-center gap-3 pt-2">
                {socials.map(({ icon: Icon, href }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                    aria-label="social-link"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link groups */}
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-8">
              {groups.map((g, gi) => (
                <div key={gi}>
                  <h4 className="text-sm uppercase tracking-wider text-white/70 mb-3">
                    {g.title}
                  </h4>
                  <ul className="space-y-2">
                    {(g.items || []).map((it, ii) => (
                      <li key={ii}>
                        <a
                          href={it.to || "#"}
                          className="group inline-flex items-center gap-1 text-white/90 hover:text-accent transition"
                        >
                          <span>{it.label}</span>
                          <ArrowUpRight className="w-3 h-3 translate-x-0 group-hover:translate-x-0.5 transition" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Newsletter + Contact */}
            <div className="space-y-5">
              <h4 className="text-sm uppercase tracking-wider text-white/70">
                {t("footer:newsletter.title")}
              </h4>
              <p className="text-white/70">{t("footer:newsletter.subtitle")}</p>
              <form onSubmit={onSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("footer:newsletter.placeholder")}
                  className={`${inputCls}`}
                  aria-label="email"
                />
                <button
                  type="submit"
                  className="px-4 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 transition outline-none focus:outline-none focus:ring-0 focus:ring-offset-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              {ok && (
                <div className="text-xs text-green-300">
                  {t("footer:newsletter.success")}
                </div>
              )}

              <div className="pt-4 space-y-2 text-white/80">
                {contact?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <a
                      href={`mailto:${contact.email}`}
                      className="hover:text-accent transition"
                    >
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <a
                      href={`tel:${contact.phone}`}
                      className="hover:text-accent transition"
                    >
                      {contact.phone}
                    </a>
                  </div>
                )}
                {contact?.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-1" />
                    <span>{contact.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* bottom bar */}
          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/70">
            <div>
              © {year} {t("common:siteName")}. {t("footer:allRights")}
            </div>
            <div className="flex items-center gap-4">
              <a href="/privacy" className="hover:text-accent transition">
                {t("footer:privacy")}
              </a>
              <a href="/terms" className="hover:text-accent transition">
                {t("footer:terms")}
              </a>
              <a href="/status" className="hover:text-accent transition">
                {t("footer:status")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
