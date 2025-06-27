import React from 'react';
import { useTranslation } from "react-i18next";

const FieldItem = ({ 
  field, 
  isSelected, 
  isFieldFilled, 
  hasFieldError, 
  onClick 
}) => {
  const { t } = useTranslation("soil-input");

  return (
    <div
      onClick={() => onClick(field)}
      className={`p-2.5 lg:p-3 rounded-lg cursor-pointer transition-all duration-300 hover:scale-102 border ${
        isSelected
          ? 'bg-green-900/30 border-green-500 shadow-lg'
          : hasFieldError
          ? 'bg-red-900/20 border-red-500 shadow-lg'
          : isFieldFilled
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
            {isFieldFilled && (
              <span className="text-green-400 text-sm">✓</span>
            )}
            {hasFieldError && (
              <span className="text-red-400 text-sm">⚠️</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldItem; 