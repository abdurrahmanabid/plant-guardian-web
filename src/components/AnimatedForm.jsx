import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSoilAnalysisFields } from "../hooks/useSoilAnalysisFields";
import { useFormValidation } from "../hooks/useFormValidation";
import FormSidebar from "./FormSidebar";
import FieldDetailsPanel from "./FieldDetailsPanel";
import api from "../hooks/api";
import LeafSpinner from "./LeafSpinner";

const AnimatedForm = () => {
  const { t } = useTranslation("soil-input");
  const navigate = useNavigate();
  const [selectedField, setSelectedField] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [diseaseOptions, setDiseaseOptions] = useState([]);

  const sidebarRef = useRef(null);
  const detailsPanelRef = useRef(null);
  const fieldItemsRef = useRef([]);
  const importanceRef = useRef(null);
  const prevCropRef = useRef(null);

  const soilAnalysisFields = useSoilAnalysisFields();
  const {
    formData,
    errors,
    showSubmitButton,
    isFieldFilled,
    hasFieldError,
    handleInputChange,
    validateForm,
  } = useFormValidation(soilAnalysisFields);

  // Update disease options when crop changes
  useEffect(() => {
    if (formData.crop) {
      const cropDiseases = t(`diseases.${formData.crop}`, {
        returnObjects: true,
      });

      if (
        cropDiseases &&
        typeof cropDiseases === "object" &&
        !Array.isArray(cropDiseases)
      ) {
        const options = Object.entries(cropDiseases).map(([value, label]) => ({
          value,
          label,
        }));
        setDiseaseOptions(options);

        // Clear disease selection only when crop actually changes
        if (prevCropRef.current !== formData.crop && formData.disease) {
          handleInputChange({
            target: {
              name: "disease",
              value: "",
            },
          });
        }
      } else {
        setDiseaseOptions([]);
      }
    } else {
      setDiseaseOptions([]);
    }

    // Update the ref with current crop
    prevCropRef.current = formData.crop;
  }, [formData.crop, formData.disease, t]); // Removed handleInputChange from dependencies

  useGSAP(() => {
    // Initial entrance animation
    gsap.set([sidebarRef.current, detailsPanelRef.current], {
      opacity: 0,
      x: -100,
    });

    gsap.set(detailsPanelRef.current, { x: 100 });

    // Staggered entrance
    const tl = gsap.timeline();
    tl.to(sidebarRef.current, {
      opacity: 1,
      x: 0,
      duration: 1,
      ease: "back.out(1.7)",
    }).to(
      detailsPanelRef.current,
      {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: "back.out(1.7)",
      },
      "-=0.6"
    );

    // Animate field items with stagger
    gsap.fromTo(
      fieldItemsRef.current,
      { opacity: 0, y: 30, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.7)",
        delay: 0.5,
      }
    );
  }, []);

  const handleFieldSelect = (field) => {
    if (isAnimating) return;
    setIsAnimating(true);

    setSelectedField(field);

    // Animate the selection
    const tl = gsap.timeline({
      onComplete: () => setIsAnimating(false),
    });

    // Slide out current content
    tl.to(detailsPanelRef.current, {
      x: 50,
      opacity: 0,
      duration: 0.3,
      ease: "power2.inOut",
    })
      // Slide in new content
      .to(detailsPanelRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.5,
        ease: "back.out(1.7)",
      });

    // Animate importance section
    gsap.fromTo(
      importanceRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "back.out(1.7)",
        delay: 0.3,
      }
    );
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      // Success animation
      gsap.to(detailsPanelRef.current, {
        scale: 1.05,
        duration: 0.2,
        ease: "back.out(1.7)",
        yoyo: true,
        repeat: 1,
        onComplete: async () => {
          setIsLoading(true);
          try {
            const response = await api.post(
              "/predict/predict-fertilizer-and-treatment",
              {
                Temperature: parseInt(formData?.temperature),
                pH: parseFloat(formData?.ph),
                Rainfall: parseInt(formData?.rainfall),
                Soil_color: formData?.soilColor,
                Nitrogen: parseInt(formData?.nitrogen),
                Potassium: parseInt(formData?.potassium),
                Phosphorus: parseInt(formData?.phosphorus),
                Crop: formData?.crop,
                Disease: formData?.disease,
              }
            );

            setIsLoading(false);

            if (response.data?.data) {
              const resultData = {
                formData: formData,
                result: response.data.data,
                predicted_fertilizer: response.data.data.predicted_fertilizer,
                treatment_suggestion: response.data.data.treatment_suggestion,
                fullResult:
                  response.data.data.predicted_fertilizer +
                  " and " +
                  response.data.data.treatment_suggestion,
              };

              // Redirect to results page with data
              navigate("/soil-analysis-result", { state: resultData });
            } else {
              // Handle error case
              navigate("/soil-analysis-result", {
                state: {
                  error: "Sorry, You might miss some fields",
                  formData: formData,
                },
              });
            }
          } catch (error) {
            setIsLoading(false);
            navigate("/soil-analysis-result", {
              state: {
                error: "Server error. Please try again.",
                formData: formData,
              },
            });
          }
        },
      });
    }
  };

  // Get crop options from translation
  const cropOptions = Object.entries(t("crops", { returnObjects: true })).map(
    ([value, label]) => ({
      value,
      label,
    })
  );

  return (
    <div className="h-screen text-white relative overflow-hidden mt-[10vh]">
      {isLoading && <LeafSpinner />}
      <div>
        <div className="max-w-7xl mx-auto h-[90vh] flex flex-col lg:flex-row gap-3 lg:gap-4 p-3 relative z-10">
          {/* Left Sidebar - Form Fields */}
          <FormSidebar
            soilAnalysisFields={soilAnalysisFields}
            selectedField={selectedField}
            isFieldFilled={isFieldFilled}
            hasFieldError={hasFieldError}
            onFieldSelect={handleFieldSelect}
            fieldItemsRef={fieldItemsRef}
            sidebarRef={sidebarRef}
          />

          {/* Right Panel - Field Details */}
          <FieldDetailsPanel
            selectedField={selectedField}
            formData={formData}
            errors={errors}
            handleInputChange={handleInputChange}
            showSubmitButton={showSubmitButton}
            onSubmit={handleSubmit}
            detailsPanelRef={detailsPanelRef}
            importanceRef={importanceRef}
            cropOptions={cropOptions}
            diseaseOptions={diseaseOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default AnimatedForm;
