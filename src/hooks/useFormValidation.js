import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";

export const useFormValidation = (soilAnalysisFields) => {
  const { t } = useTranslation("soil-input");
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [showSubmitButton, setShowSubmitButton] = useState(false);

  // Check if all required fields are filled
  const checkAllFieldsFilled = () => {
    const allFilled = soilAnalysisFields.every(field => {
      if (!field.required) return true;
      const value = formData[field.id];
      return value && value.toString().trim() !== '';
    });
    setShowSubmitButton(allFilled);
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

  // Handle input change
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

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate required fields
    soilAnalysisFields.forEach(field => {
      if (field.required && (!formData[field.id] || formData[field.id].toString().trim() === '')) {
        newErrors[field.id] = `${field.name} ${t('required')}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add useEffect to check fields on mount and when formData changes
  useEffect(() => {
    checkAllFieldsFilled();
  }, [formData]);

  return {
    formData,
    errors,
    showSubmitButton,
    isFieldFilled,
    hasFieldError,
    handleInputChange,
    validateForm
  };
}; 
