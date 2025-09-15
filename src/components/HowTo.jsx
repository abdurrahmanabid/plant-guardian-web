import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import Sector from "./Sector";
import { useNavigate } from "react-router-dom";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const HowTo = () => {
  const { t } = useTranslation("howTo");
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const modesRef = useRef([]);
  const footerRef = useRef(null);

  useGSAP(() => {
    // Initial entrance animation
    gsap.set(
      [
        titleRef.current,
        descRef.current,
        ...modesRef.current,
        footerRef.current,
      ],
      {
        opacity: 0,
        y: 50,
      }
    );

    // Staggered entrance animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
      },
    });

    tl.to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "back.out(1.7)",
    })
      .to(
        descRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "back.out(1.7)",
        },
        "-=0.6"
      )
      .to(
        modesRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "back.out(1.7)",
        },
        "-=0.4"
      )
      .to(
        footerRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "back.out(1.7)",
        },
        "-=0.6"
      );

    // Hover animations for mode cards
    modesRef.current.forEach((mode, index) => {
      mode.addEventListener("mouseenter", () => {
        gsap.to(mode, {
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out",
        });
      });

      mode.addEventListener("mouseleave", () => {
        gsap.to(mode, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      });
    });

    // Parallax effect for background elements
    gsap.to(".how-to-bg", {
      yPercent: -20,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }, []);

  const modes = [
    {
      title: t("mode_1_title"),
      subtitle: t("mode_1_subtitle"),
      steps: t("mode_1_steps", { returnObjects: true }),
      footer: t("mode_1_footer"),
      button: t("mode_1_button"),
      icon: "🔍",
      clickEvent: () => {
        navigate("/soil-analysis");
      },
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: t("mode_2_title"),
      subtitle: t("mode_2_subtitle"),
      steps: t("mode_2_steps", { returnObjects: true }),
      footer: t("mode_2_footer"),
      button: t("mode_2_button"),
      icon: "🌱",
      clickEvent: () => {
        navigate("/leaf-disease-predict/all");
      },
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: t("mode_3_title"),
      subtitle: t("mode_3_subtitle"),
      steps: t("mode_3_steps", { returnObjects: true }),
      footer: t("mode_3_footer"),
      button: t("mode_3_button"),
      icon: "🚀",
      clickEvent: () => {
        navigate("/leaf-disease-predict/all");
      },
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="how-to-bg absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-green-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 lg:py-24">
        {/* Header Section */}
        <div className="text-center mb-16 lg:mb-20">
          <h1
            ref={titleRef}
            className="text-4xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 text-gradient"
          >
            {t("how_to_use")}
          </h1>
          <p
            ref={descRef}
            className="text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            {t("how_to_use_desc")}
          </p>
        </div>

        {/* Modes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {modes.map((mode, index) => (
            <div
              key={index}
              ref={(el) => (modesRef.current[index] = el)}
              className="group bg-black/40 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-gray-800 hover:border-gray-600 transition-all duration-500 cursor-pointer"
            >
              {/* Icon */}
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${mode.gradient} flex items-center justify-center mb-6 text-2xl lg:text-3xl shadow-lg`}
              >
                {mode.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 leading-tight">
                {mode.title}
              </h3>

              {/* Subtitle */}
              <p className="text-gray-400 mb-6 text-sm lg:text-base">
                {mode.subtitle}
              </p>

              {/* Steps */}
              <div className="space-y-3 mb-6">
                {mode.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="flex items-start space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full bg-gradient-to-r ${mode.gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5`}
                    >
                      {stepIndex + 1}
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <p className="text-gray-500 text-sm mb-6 italic">{mode.footer}</p>

              {/* Button */}
              <button
                onClick={mode.clickEvent}
                className={`w-full py-3 px-6 bg-gradient-to-r ${mode.gradient} text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-sm lg:text-base`}
              >
                {mode.button}
              </button>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div ref={footerRef} className="text-center">
          <p className="text-gray-400 text-sm lg:text-base italic">
            {t("footer_note")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowTo;
