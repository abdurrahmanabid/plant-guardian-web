import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useTranslation } from "react-i18next";
import CommonFormField from "./CommonFormField";

const AnimatedForm = () => {
  const { t } = useTranslation("soil-input");
  const [selectedField, setSelectedField] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [showSubmitButton, setShowSubmitButton] = useState(false);

  const sidebarRef = useRef(null);
  const detailsPanelRef = useRef(null);
  const fieldItemsRef = useRef([]);
  const importanceRef = useRef(null);

  const soilAnalysisFields = [
    {
      id: 'temperature',
      name: t('temperature'),
      icon: '🌡️',
      type: 'number',
      description: t('temperatureDesc'),
      importance: t('temperatureImportance'),
      placeholder: t('temperaturePlaceholder'),
      required: true
    },
    {
      id: 'humidity',
      name: t('humidity'),
      icon: '💧',
      type: 'number',
      description: t('humidityDesc'),
      importance: t('humidityImportance'),
      placeholder: t('humidityPlaceholder'),
      required: true
    },
    {
      id: 'moisture',
      name: t('moisture'),
      icon: '🌱',
      type: 'number',
      description: t('moistureDesc'),
      importance: t('moistureImportance'),
      placeholder: t('moisturePlaceholder'),
      required: true
    },
    {
      id: 'soilType',
      name: t('soilType'),
      icon: '🏞️',
      type: 'select',
      description: t('soilTypeDesc'),
      importance: t('soilTypeImportance'),
      placeholder: t('selectSoilType'),
      options: [
        { value: 'Sandy', label: t('soilTypes.sandy') },
        { value: 'Loamy', label: t('soilTypes.loamy') },
        { value: 'Black', label: t('soilTypes.black') },
        { value: 'Red', label: t('soilTypes.red') },
        { value: 'Clayey', label: t('soilTypes.clayey') }
      ],
      required: true
    },
    {
      id: 'nitrogen',
      name: t('nitrogen'),
      icon: '🧪',
      type: 'number',
      description: t('nitrogenDesc'),
      importance: t('nitrogenImportance'),
      placeholder: t('nitrogenPlaceholder'),
      required: true
    },
    {
      id: 'potassium',
      name: t('potassium'),
      icon: '⚡',
      type: 'number',
      description: t('potassiumDesc'),
      importance: t('potassiumImportance'),
      placeholder: t('potassiumPlaceholder'),
      required: true
    },
    {
      id: 'phosphorous',
      name: t('phosphorous'),
      icon: '💎',
      type: 'number',
      description: t('phosphorousDesc'),
      importance: t('phosphorousImportance'),
      placeholder: t('phosphorousPlaceholder'),
      required: true
    },
    {
      id: 'fertilizerName',
      name: t('fertilizerName'),
      icon: '🌿',
      type: 'select',
      description: t('fertilizerNameDesc'),
      importance: t('fertilizerImportance'),
      placeholder: t('selectFertilizer'),
      options: [
        { value: 'Urea', label: t('fertilizers.urea') },
        { value: 'DAP', label: t('fertilizers.dap') },
        { value: '14-35-14', label: t('fertilizers.14-35-14') },
        { value: '28-28', label: t('fertilizers.28-28') },
        { value: '17-17-17', label: t('fertilizers.17-17-17') },
        { value: '20-20', label: t('fertilizers.20-20') },
        { value: '10-26-26', label: t('fertilizers.10-26-26') }
      ],
      required: true
    },
    {
      id: 'disease',
      name: t('disease'),
      icon: '🦠',
      type: 'select',
      description: t('diseaseDesc'),
      importance: t('diseaseImportance'),
      placeholder: t('selectDisease'),
      options: [
        { value: 'Tomato_Target_Spot', label: t('diseases.tomato_target_spot') },
        { value: 'Pepper__bell___healthy', label: t('diseases.pepper_bell_healthy') },
        { value: 'Tomato_Bacterial_spot', label: t('diseases.tomato_bacterial_spot') },
        { value: 'Pepper__bell___Bacterial_spot', label: t('diseases.pepper_bell_bacterial_spot') },
        { value: 'Tomato_Spider_mites_Two_spotted', label: t('diseases.tomato_spider_mites') },
        { value: 'Tomato_Early_blight', label: t('diseases.tomato_early_blight') },
        { value: 'Potato___Early_blight', label: t('diseases.potato_early_blight') },
        { value: 'Tomato_Leaf_Mold', label: t('diseases.tomato_leaf_mold') },
        { value: 'Potato___Late_blight', label: t('diseases.potato_late_blight') },
        { value: 'Tomato_Tomato_Yellow_Leaf_Curl_Virus', label: t('diseases.tomato_yellow_leaf_curl') },
        { value: 'Tomato_Septoria_leaf_spot', label: t('diseases.tomato_septoria') },
        { value: 'Tomato_healthy', label: t('diseases.tomato_healthy') },
        { value: 'Tomato_Tomato_mosaic_virus', label: t('diseases.tomato_mosaic') },
        { value: 'Tomato_Late_blight', label: t('diseases.tomato_late_blight') },
        { value: 'Potato___healthy', label: t('diseases.potato_healthy') }
      ],
      required: true
    }
  ];

  // Check if all required fields are filled
  const checkAllFieldsFilled = () => {
    const allFilled = soilAnalysisFields.every(field => {
      if (!field.required) return true;
      const value = formData[field.id];
      return value && value.toString().trim() !== '';
    });
    setShowSubmitButton(allFilled);
    console.log('All fields filled:', allFilled, 'Form data:', formData);
  };

  // Check if a specific field is filled
  const isFieldFilled = (fieldId) => {
    const value = formData[fieldId];
    return value && value.toString().trim() !== '';
  };

  // Check if a field has error
  const hasFieldError = (fieldId) => {
    return errors[fieldId] && !isFieldFilled(fieldId);
  };

  // Add useEffect to check fields on mount and when formData changes
  useEffect(() => {
    checkAllFieldsFilled();
  }, [formData]);

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

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: null
      }));
    }

    // Check if all fields are filled after a delay
    setTimeout(checkAllFieldsFilled, 100);
  };

  const handleSubmit = () => {
    const newErrors = {};
    
    // Validate required fields
    soilAnalysisFields.forEach(field => {
      if (field.required && (!formData[field.id] || formData[field.id].toString().trim() === '')) {
        newErrors[field.id] = `${field.name} ${t('required')}`;
      }
    });
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
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

  const getFieldPreview = (field) => {
    return (
      <CommonFormField
        field={field}
        value={formData[field.id] || ''}
        onChange={handleInputChange}
        error={errors[field.id]}
      />
    );
  };

  return (
    <div className="h-screen text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto h-[90vh] flex flex-col lg:flex-row gap-3 lg:gap-4 p-3 relative z-10">
        {/* Left Sidebar - Form Fields */}
        <div 
          ref={sidebarRef}
          className="w-full lg:w-72 xl:w-80 bg-black/40 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800 p-3 lg:p-4 overflow-y-auto"
        >
          <div className="sticky top-0 bg-black/40 backdrop-blur-sm pb-3 mb-3 border-b border-gray-800">
            <h2 className="text-lg lg:text-xl font-bold text-white mb-1 text-gradient">
              {t('title')}
            </h2>
            <p className="text-xs text-gray-400">
              {t('subtitle')}
            </p>
          </div>
          
          <div className="space-y-2">
            {soilAnalysisFields.map((field, index) => (
              <div
                key={field.id}
                ref={el => fieldItemsRef.current[index] = el}
                onClick={() => handleFieldSelect(field)}
                className={`p-2.5 lg:p-3 rounded-lg cursor-pointer transition-all duration-300 hover:scale-102 border ${
                  selectedField?.id === field.id
                    ? 'bg-green-900/30 border-green-500 shadow-lg'
                    : hasFieldError(field.id)
                    ? 'bg-red-900/20 border-red-500 shadow-lg'
                    : isFieldFilled(field.id)
                    ? 'bg-green-900/20 border-green-400'
                    : 'bg-gray-900/50 hover:bg-gray-800/50 border-transparent hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg lg:text-xl">{field.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm truncate">
                      {field.name}
                    </h3>
                    <p className="text-xs text-gray-400 truncate">
                      {field.description}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      {field.required && (
                        <span className="inline-block px-1.5 py-0.5 text-xs bg-red-900/50 text-red-300 rounded-full">
                          {t('required')}
                        </span>
                      )}
                      {isFieldFilled(field.id) && (
                        <span className="text-green-400 text-sm">✓</span>
                      )}
                      {hasFieldError(field.id) && (
                        <span className="text-red-400 text-sm">⚠️</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Field Details */}
        <div 
          ref={detailsPanelRef}
          className="flex-1 bg-black/40 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800 p-3 lg:p-4 overflow-y-auto"
        >
          {selectedField ? (
            <div className="h-full">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-2xl lg:text-3xl">{selectedField.icon}</span>
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-white text-gradient">
                    {selectedField.name}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {selectedField.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 lg:gap-4">
                {/* Field Preview */}
                <div className="bg-gray-900/50 rounded-lg p-3 lg:p-4">
                  <h3 className="text-base lg:text-lg font-semibold text-white mb-3">
                    {t('fieldPreview')}
                  </h3>
                  <div className="bg-black/20 rounded-lg p-3">
                    {getFieldPreview(selectedField)}
                  </div>
                </div>

                {/* Field Properties */}
                <div className="bg-gray-900/50 rounded-lg p-3 lg:p-4">
                  <h3 className="text-base lg:text-lg font-semibold text-white mb-3">
                    {t('fieldProperties')}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-black/20 rounded-lg">
                      <span className="text-gray-300 text-sm">{t('fieldType')}</span>
                      <span className="font-medium text-white text-sm">{selectedField.type}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-black/20 rounded-lg">
                      <span className="text-gray-300 text-sm">{t('required')}</span>
                      <span className={`font-medium text-sm ${selectedField.required ? 'text-red-400' : 'text-green-400'}`}>
                        {selectedField.required ? 'হ্যাঁ' : 'না'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-black/20 rounded-lg">
                      <span className="text-gray-300 text-sm">{t('placeholder')}</span>
                      <span className="font-medium text-white text-sm truncate">{selectedField.placeholder}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Importance Section */}
              <div 
                ref={importanceRef}
                className="mt-4 lg:mt-6 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg p-3 lg:p-4 border border-green-800/30"
              >
                <h3 className="text-base lg:text-lg font-semibold text-white mb-3 flex items-center">
                  <span className="text-lg lg:text-xl mr-2">💡</span>
                  {t('whyImportant')}
                </h3>
                <p className="text-gray-300 leading-relaxed text-sm">
                  {selectedField.importance}
                </p>
              </div>

              {/* Submit Button - Show when all required fields are filled */}
              {showSubmitButton && (
                <div className="mt-4">
                  <button
                    onClick={handleSubmit}
                    className="w-full py-2.5 lg:py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg text-sm"
                  >
                    {t('submitForm')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl lg:text-6xl mb-4">🌱</div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-400 mb-3">
                  {t('selectField')}
                </h3>
                <p className="text-gray-500 text-sm px-4">
                  {t('selectFieldDesc')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimatedForm;
