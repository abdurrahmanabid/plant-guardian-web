import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import logo from "../assets/img/logo-no-bg.png";
import { Globe } from "lucide-react";
import { language } from "../../constant/language.js";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

const Navbar = () => {
  const { t } = useTranslation(["navbar", "common"]);
  const links = t("navbar:links", { returnObjects: true });
  useGSAP(() => {
    const navTween = gsap.timeline({
      scrollTrigger: {
        trigger: "nav",
        start: "bottom top",
      },
    });

    navTween.fromTo(
      "nav",
      { backgroundColor: "transparent" },
      {
        backgroundColor: "#00000050",
        backgroundFilter: "blur(100px)",
        duration: 1,
        ease: "power1.inOut",
      }
    );
  });
  const [selectedLang, setSelectedLang] = useState("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    const langToSet = savedLang || "en";

    i18next.changeLanguage(langToSet);
    setSelectedLang(langToSet);

    if (!savedLang) {
      localStorage.setItem("lang", "en");
    }
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
              <a href={`#${link.key}`} className="hover:text-accent transition">
                {link.label}
              </a>
            </li>
          ))}

          <div className="flex items-center gap-1">
            <Globe className="text-white w-4 h-4" />
            <select
              className="text-white bg-transparent p-1 rounded outline-none"
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
