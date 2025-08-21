// src/components/Navbar.jsx
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import logo from "../assets/img/logo-no-bg.png";
import { Globe } from "lucide-react";
import { language } from "../constants/language.js";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../utils/getUser.js";
import { isLoggedIn as loggedIn } from "../utils/isLoggedIn.js";
import api from "../hooks/api.js";

gsap.registerPlugin(ScrollTrigger);

const Navbar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(["navbar", "common", "authentication"]);

  // Robust reads from i18n (guards against non-array values)
  const linksRaw = t("navbar:links", { returnObjects: true });
  const links = Array.isArray(linksRaw) ? linksRaw : [];

  const authRaw = t("authentication:option", { returnObjects: true });
  const authOption = Array.isArray(authRaw)
    ? authRaw
    : authRaw && typeof authRaw === "object"
    ? Object.values(authRaw)
    : [];

  useGSAP(() => {
    const navTween = gsap.timeline({
      scrollTrigger: {
        trigger: "nav",
        start: "bottom top",
      },
    });

    navTween.fromTo(
      "nav",
      { backgroundColor: "transparent", backdropFilter: "blur(0px)" },
      {
        backgroundColor: "#00000050",
        backdropFilter: "blur(10px)",
        duration: 1,
        ease: "power1.inOut",
      }
    );
  }, []);

  const [selectedLang, setSelectedLang] = useState("en");
  const [isLoggedIn, setIsLoggedIn] = useState(loggedIn);
  const submitLogOut = async () => {
    const res = await api.get("/user/signout");
    if (res.status === 200) {
      localStorage.removeItem("Login");
      setIsLoggedIn(false);
    }
  };
  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    const langToSet = savedLang || "en";
    i18next.changeLanguage(langToSet);
    setSelectedLang(langToSet);
    if (!savedLang) localStorage.setItem("lang", "en");
  }, []);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    i18next.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
    setSelectedLang(newLang);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0b061f]/40 backdrop-blur-md shadow-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
        <a href="#home" className="flex items-center gap-2">
          <img src={logo} alt="logo" height={32} width={32} />
          <p className="text-white font-semibold text-base">
            {t("common:siteName")}
          </p>
        </a>

        <ul className="flex items-center gap-4 text-white font-medium text-sm">
          {links.map((link) => (
            <li key={link.key}>
              <a href={`${link.url}`} className="hover:text-accent transition">
                {link.label}
              </a>
            </li>
          ))}

          <div className="flex items-center gap-2">
            {/* Auth select (navigate on change) */}
            {!isLoggedIn ? (
              <select
                aria-label={t("authentication:subject")}
                defaultValue=""
                className="bg-transparent text-white p-1 rounded outline-none focus:outline-none focus:ring-0 focus:ring-offset-0"
                onChange={(e) => {
                  if (e.target.value) navigate(e.target.value);
                }}
              >
                <option value="" disabled className="text-black">
                  {t("authentication:subject")}
                </option>
                {(authOption || []).map((op) => (
                  <option key={op.id} value={op.link} className="text-black">
                    {op.label}
                  </option>
                ))}
              </select>
            ) : (
              <button onClick={submitLogOut}>
                {t("authentication:logout")}
              </button>
            )}

            {/* Language switcher */}
            <Globe className="text-white w-4 h-4" />
            <select
              aria-label="Language"
              className="text-white bg-transparent p-1 rounded outline-none focus:outline-none focus:ring-0 focus:ring-offset-0"
              value={selectedLang}
              onChange={handleLanguageChange}
            >
              {language.map((lang) => (
                <option
                  key={lang.code}
                  value={lang.code}
                  className="text-black"
                >
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
