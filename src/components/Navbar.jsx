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
    <nav>
      <div>
        <a href="#home" className="flex items-center gap-2">
          <img src={logo} alt="logo" height={70} width={70} />
          <p>{t("common:siteName")}</p>
        </a>

        <ul>
          {links.map((link) => (
            <li key={link.key}>
              <a href={`#${link.key}`}>{link.label}</a>
            </li>
          ))}
          <div className="flex items-center">
            <Globe className="text-white w-5 h-5" />
            <select
              className="text-white bg-gray-800 p-2 rounded"
              value={selectedLang}
              onChange={handleLanguageChange}
            >
              {language.map((lang) => (
                <option key={lang.code} value={lang.code}>
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
