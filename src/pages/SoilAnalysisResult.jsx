import React, { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/all";
import leftLeaf from "../assets/img/hero-left-leaf.png";
import rightLeaf from "../assets/img/hero-right-leaf.png";
import Button from "../components/Button";
import api from "../hooks/api";

// ---------- One-time GSAP plugin registration ----------
if (!gsap.core.globals()._soilResultPluginsRegistered) {
  gsap.registerPlugin(SplitText);
  gsap.core.globals({ _soilResultPluginsRegistered: true });
}

const SoilAnalysisResult = () => {
  const { t } = useTranslation("soil-result");
  const location = useLocation();
  const navigate = useNavigate();
  const {
    formData,
    result,
    error,
    predicted_fertilizer,
    treatment_suggestion,
  } = location.state || {};

  // State for GPT explanation
  const [gptExplanation, setGptExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [gptError, setGptError] = useState("");

  const titleRef = useRef(null);
  const resultRef = useRef(null);
  const formDataRef = useRef(null);
  const explanationRef = useRef(null);

  // Animation for GPT explanation when it appears
  useGSAP(() => {
    if (explanationRef.current && gptExplanation) {
      gsap.fromTo(
        explanationRef.current,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        }
      );
    }
  }, [gptExplanation]);

  // ---------- Other animations remain the same ----------
  useGSAP(() => {
    // Title animation
    if (titleRef.current) {
      const split = new SplitText(titleRef.current, { type: "chars, words" });
      split.chars.forEach((c) => c.classList.add("text-gradient"));
      gsap.from(split.chars, {
        yPercent: 100,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.04,
      });
    }

    // Result section animation
    if (resultRef.current) {
      gsap.fromTo(
        resultRef.current.children,
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
          delay: 0.5,
        }
      );
    }

    // Form data animation
    if (formDataRef.current) {
      gsap.fromTo(
        formDataRef.current.children,
        {
          opacity: 0,
          scale: 0.9,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.05,
          ease: "back.out(1.7)",
          delay: 0.8,
        }
      );
    }

    // Floating leaves animation
    gsap.to(".right-leaf", {
      y: 220,
      scrollTrigger: {
        trigger: "#soil-result-page",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.to(".left-leaf", {
      y: -220,
      scrollTrigger: {
        trigger: "#soil-result-page",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }, []);

  // Function to get translated field names
  const getTranslatedFieldName = (fieldKey) => {
    return t(`fields.${fieldKey}`, { defaultValue: fieldKey });
  };

  // Function to handle GPT explanation request
  const handleGptExplanation = async () => {
    setIsLoading(true);
    setGptError("");

    try {
      // Prepare the data to send to GPT
      const requestData = {
        content: `Analyze the soil test results.   
        Soil Info: 
        - N: ${formData.nitrogen || "N/A"}
        - P: ${formData.phosphorus || "N/A"}
        - K: ${formData.potassium || "N/A"}
        - Temp: ${formData.temperature || "N/A"}°C
        - Humidity: ${formData.humidity || "N/A"}%
        - pH: ${formData.ph || "N/A"}
        - Rainfall: ${formData.rainfall || "N/A"}mm
        - Disease With Crop: ${formData.disease || "N/A"}
        Fertilizer: ${predicted_fertilizer || "N/A"}
        Treatment: ${treatment_suggestion || "N/A"}
        Explain in short:
        1. Why this Treatment?
        2. Why this fertilizer?
        3. Benefits for the crop?
        4. Tips to improve soil health.`,

        systemMessage: `You’re an agriculture expert. Explain the soil results and suggestions simply for farmers. Avoid jargon and provide practical, actionable advice in a conversational tone.
        in json
        {whyFertilizer:Why this fertilizer?,
        benefit:Benefits for the crop?,
        tips: Tips to improve soil health.,
        whyTreatment: Why this Treatment?
        } provide in ${
          localStorage.getItem("lang") === "en" ? "english" : "bangla"
        }`,
      };

      const response = await api.post("gpt/gpt-explain", requestData);

      if (response.data && response.data.response) {
        // Parse the response string
        const parsedResponse = JSON.parse(response.data.response);

        const { whyFertilizer, benefit, tips, whyTreatment } = parsedResponse;

        setGptExplanation(
          `${t(
            "results.explainedFields.whyFertilizer"
          )}: \n${whyFertilizer}\n\n${t(
            "results.explainedFields.whyTreatment"
          )}: \n${whyTreatment}\n\n${t(
            "results.explainedFields.benefit"
          )}:\n${benefit}\n\n${t("results.explainedFields.tips")}:\n${tips}`
        );
      } else {
        setGptError(t("gptError.noExplanation"));
      }
    } catch (err) {
      console.error("Error getting GPT explanation:", err);
      setGptError(t("gptError.failed"));
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <section
        id="soil-result-page"
        className="relative overflow-hidden noisy min-h-screen mt-36"
      >
        {/* floating leaves */}
        <img
          src={leftLeaf}
          alt="left-leaf"
          className="left-leaf pointer-events-none select-none absolute -left-10 top-20 opacity-60"
        />
        <img
          src={rightLeaf}
          alt="right-leaf"
          className="right-leaf pointer-events-none select-none absolute right-0 -top-6 opacity-60 mt-64"
        />

        <div className="container mx-auto px-4 md:px-8 py-16 md:py-24">
          <h1
            ref={titleRef}
            className="title text-[40px] md:text-[72px] leading-[0.9]"
          >
            {t("title")}
          </h1>

          <div className="mt-10 grid lg:grid-cols-1 gap-8">
            <div className="rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/10 bg-white/5 dark:bg-black/20 backdrop-blur-sm">
              <div className="text-center py-8">
                <div className="h-16 w-16 rounded-2xl bg-red-500/20 border border-red-400/30 flex items-center justify-center text-2xl font-semibold mb-4 select-none mx-auto">
                  ⚠️
                </div>
                <h3 className="text-xl font-semibold text-red-300 mb-2">
                  {t("error.title")}
                </h3>
                <p className="text-lg mb-6 opacity-90">{error}</p>
                <Button
                  thickness={3}
                  speed="5s"
                  onClick={() => navigate("/soil-analysis")}
                  className="mx-auto"
                >
                  {t("error.tryAgain")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="soil-result-page"
      className="relative overflow-hidden noisy min-h-screen mt-36"
    >
      {/* floating leaves */}
      <img
        src={leftLeaf}
        alt="left-leaf"
        className="left-leaf pointer-events-none select-none absolute -left-10 top-20 opacity-60"
      />
      <img
        src={rightLeaf}
        alt="right-leaf"
        className="right-leaf pointer-events-none select-none absolute right-0 -top-6 opacity-60 mt-64"
      />

      <div className="container mx-auto px-4 md:px-8 py-16 md:py-24">
        <h1
          ref={titleRef}
          className="title text-[40px] md:text-[72px] leading-[0.9]"
        >
          {t("title")}
        </h1>
        <p className="mt-3 md:mt-4 text-lg opacity-90 max-w-3xl">
          {t("subtitle")}
        </p>

        <div className="mt-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
          {/* Results Section */}
          <div className="rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/10 bg-white/5 dark:bg-black/20 backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-6">{t("results.title")}</h3>

            <div ref={resultRef} className="space-y-6">
              <div className="p-6 bg-green-900/20 border border-green-400/20 rounded-xl">
                <p className="text-xs uppercase tracking-[0.2em] opacity-70 mb-2">
                  {t("results.fertilizerLabel")}
                </p>
                <p className="text-2xl font-semibold text-green-300">
                  {predicted_fertilizer || t("results.noRecommendation")}
                </p>
              </div>

              <div className="p-6 bg-blue-900/20 border border-blue-400/20 rounded-xl">
                <p className="text-xs uppercase tracking-[0.2em] opacity-70 mb-2">
                  {t("results.treatmentLabel")}
                </p>
                <p className="text-xl opacity-90">
                  {treatment_suggestion || t("results.noTreatment")}
                </p>
              </div>

              {/* GPT Explanation Section */}
              {gptExplanation && (
                <div
                  ref={explanationRef}
                  className="p-6 bg-purple-900/20 border border-purple-400/20 rounded-xl"
                >
                  <p className="text-xs uppercase tracking-[0.2em] opacity-70 mb-2">
                    {t("results.explanationLabel")}
                  </p>
                  <p className="text-lg opacity-90 whitespace-pre-wrap">
                    {gptExplanation}
                  </p>
                </div>
              )}

              {/* Error message for GPT */}
              {gptError && (
                <div className="p-4 bg-red-900/20 border border-red-400/20 rounded-xl">
                  <p className="text-red-300">{gptError}</p>
                </div>
              )}

              <div className="flex flex-col gap-3 mt-8 pt-6 border-t border-white/10">
                <Button
                  thickness={2}
                  speed="5s"
                  onClick={handleGptExplanation}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      {t("buttons.generating")}
                    </span>
                  ) : (
                    t("buttons.gptDetails")
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Form Data Summary */}
          <aside className="rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/10 bg-white/5 dark:bg-black/20">
            <h3 className="text-xl font-semibold mb-6">
              {t("inputData.title")}
            </h3>

            {formData ? (
              <div
                ref={formDataRef}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                {Object.entries(formData).map(
                  ([key, value]) =>
                    value && (
                      <div
                        key={key}
                        className="p-4 bg-black/20 border border-white/10 rounded-lg"
                      >
                        <p className="text-xs uppercase tracking-[0.2em] opacity-70 mb-1">
                          {getTranslatedFieldName(key)}
                        </p>
                        <p className="text-lg font-semibold">{value}</p>
                      </div>
                    )
                )}
              </div>
            ) : (
              <p className="opacity-70">{t("inputData.noData")}</p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-8 pt-6 border-t border-white/10">
              <Button
                thickness={2}
                speed="5s"
                onClick={() => navigate("/soil-analysis")}
                className="w-full"
              >
                {t("buttons.newAnalysis")}
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default SoilAnalysisResult;
