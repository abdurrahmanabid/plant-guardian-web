import React, { useState, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useSoilAnalysisFields } from "../hooks/useSoilAnalysisFields";
import { useFormValidation } from "../hooks/useFormValidation";
import FormSidebar from "./FormSidebar";
import FieldDetailsPanel from "./FieldDetailsPanel";

const AnimatedForm = () => {
  const [selectedField, setSelectedField] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const sidebarRef = useRef(null);
  const detailsPanelRef = useRef(null);
  const fieldItemsRef = useRef([]);
  const importanceRef = useRef(null);

  const soilAnalysisFields = useSoilAnalysisFields();
  const {
    formData,
    errors,
    showSubmitButton,
    isFieldFilled,
    hasFieldError,
    handleInputChange,
    validateForm
  } = useFormValidation(soilAnalysisFields);

  useGSAP(() => {
    // Initial entrance animation
    gsap.set([sidebarRef.current, detailsPanelRef.current], {
      opacity: 0,
      x: -100
    });

    gsap.set(detailsPanelRef.current, { x: 100 });

    // Staggered entrance
    const tl = gsap.timeline();
    tl.to(sidebarRef.current, {
      opacity: 1,
      x: 0,
      duration: 1,
      ease: "back.out(1.7)"
    })
    .to(detailsPanelRef.current, {
      opacity: 1,
      x: 0,
      duration: 1,
      ease: "back.out(1.7)"
    }, "-=0.6");

    // Animate field items with stagger
    gsap.fromTo(fieldItemsRef.current,
      { opacity: 0, y: 30, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.7)",
        delay: 0.5
      }
    );
  }, []);

  const handleFieldSelect = (field) => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    setSelectedField(field);
    
    // Animate the selection
    const tl = gsap.timeline({
      onComplete: () => setIsAnimating(false)
    });

    // Slide out current content
    tl.to(detailsPanelRef.current, {
      x: 50,
      opacity: 0,
      duration: 0.3,
      ease: "power2.inOut"
    })
    // Slide in new content
    .to(detailsPanelRef.current, {
      x: 0,
      opacity: 1,
      duration: 0.5,
      ease: "back.out(1.7)"
    });

    // Animate importance section
    gsap.fromTo(importanceRef.current,
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6, 
        ease: "back.out(1.7)",
        delay: 0.3
      }
    );
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Success animation
      gsap.to(detailsPanelRef.current, {
        scale: 1.05,
        duration: 0.2,
        ease: "back.out(1.7)",
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          alert('মাটি বিশ্লেষণ সফলভাবে জমা হয়েছে!');
          console.log('Soil Analysis Data:', formData);
        }
      });
    }
  };

  return (
    <div className="h-screen text-white relative overflow-hidden mt-[10vh]">
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
          />
        </div>
      </div>
    </div>
  );
};

export default AnimatedForm;
