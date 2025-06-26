import React from 'react';

const CommonFormField = ({ 
  field, 
  value, 
  onChange, 
  error, 
  className = "" 
}) => {
  const baseInputClasses = "w-full px-4 py-3 bg-black/20 border border-gray-600 rounded-lg focus:outline-none focus:border-green-300 transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm";
  const errorClasses = error ? "border-red-500 focus:border-red-500" : "";

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'tel':
      case 'email':
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`${baseInputClasses} ${errorClasses} ${className}`}
            required={field.required}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`${baseInputClasses} ${errorClasses} ${className}`}
            required={field.required}
            min="0"
            step="0.01"
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={`${baseInputClasses} ${errorClasses} ${className} resize-none`}
            required={field.required}
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(field.id, e.target.value)}
            className={`${baseInputClasses} ${errorClasses} ${className}`}
            required={field.required}
          />
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => onChange(field.id, e.target.value)}
            className={`${baseInputClasses} ${errorClasses} ${className}`}
            required={field.required}
          >
            <option value="">{field.placeholder}</option>
            {field.options?.map(option => {
              // Handle both string options and object options with value/label
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              
              return (
                <option key={optionValue} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })}
          </select>
        );
      
      case 'radio':
        return (
          <div className="space-y-3">
            {field.options?.map(option => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              
              return (
                <label key={optionValue} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={field.id}
                    value={optionValue}
                    checked={value === optionValue}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    className="w-4 h-4 text-green-300 bg-black/20 border-gray-600 focus:ring-green-300 focus:ring-2"
                    required={field.required}
                  />
                  <span className="text-white">{optionLabel}</span>
                </label>
              );
            })}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-3">
            {field.options?.map(option => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              
              return (
                <label key={optionValue} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    value={optionValue}
                    checked={Array.isArray(value) && value.includes(optionValue)}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      const newValues = e.target.checked
                        ? [...currentValues, optionValue]
                        : currentValues.filter(v => v !== optionValue);
                      onChange(field.id, newValues);
                    }}
                    className="w-4 h-4 text-green-300 bg-black/20 border-gray-600 focus:ring-green-300 focus:ring-2 rounded"
                  />
                  <span className="text-white">{optionLabel}</span>
                </label>
              );
            })}
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`${baseInputClasses} ${errorClasses} ${className}`}
            required={field.required}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        {field.name}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      {field.description && (
        <p className="text-gray-400 text-sm">{field.description}</p>
      )}
    </div>
  );
};

export default CommonFormField; 