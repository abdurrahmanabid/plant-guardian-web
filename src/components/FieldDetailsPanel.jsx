import React from 'react';
import { useTranslation } from "react-i18next";
import CommonFormField from "./CommonFormField";

const FieldDetailsPanel = ({ 
  selectedField, 
  formData, 
  errors, 
  handleInputChange, 
  showSubmitButton, 
  onSubmit,
  detailsPanelRef,
  importanceRef 
}) => {
  const { t } = useTranslation("soil-input");

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
                onClick={onSubmit}
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
  );
};

export default FieldDetailsPanel; 