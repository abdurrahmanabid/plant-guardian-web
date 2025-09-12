import React from 'react';
import { useTranslation } from "react-i18next";
import FieldItem from './FieldItem';

const FormSidebar = ({ 
  soilAnalysisFields, 
  selectedField, 
  isFieldFilled, 
  hasFieldError, 
  onFieldSelect,
  fieldItemsRef,
  sidebarRef 
}) => {
  const { t } = useTranslation("soil-input");

  return (
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
          >
            <FieldItem
              field={field}
              isSelected={selectedField?.id === field.id}
              isFieldFilled={isFieldFilled(field.id)}
              hasFieldError={hasFieldError(field.id)}
              onClick={onFieldSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormSidebar;