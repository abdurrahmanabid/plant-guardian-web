import { useTranslation } from "react-i18next";

export const useSoilAnalysisFields = () => {
  const { t } = useTranslation("soil-input");

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
      id: 'ph',
      name: t('ph'),
      icon: '📊',
      type: 'number',
      description: t('phDesc'),
      importance: 'pH levels affect nutrient availability to plants',
      placeholder: '3.5-9.0',
      required: true
    },
    {
      id: 'rainfall',
      name: t('rainfall'),
      icon: '🌧️',
      type: 'number',
      description: t('rainfallDesc'),
      importance: t('rainfallImportance'),
      placeholder: t('rainfallPlaceholder'),
      required: true
    },
    {
      id: 'soilColor',
      name: t('soilColor'),
      icon: '🎨',
      type: 'select',
      description: t('soilColorDesc'),
      importance: t('soilColorImportance'),
      placeholder: t('selectSoilColor'),
      options: Object.entries(t('soilColors', { returnObjects: true })).map(([value, label]) => ({
        value,
        label
      })),
      required: true
    },
    {
      id: 'nitrogen',
      name: t('nitrogen'),
      icon: '🧪',
      type: 'number',
      description: t('nitrogenDesc'),
      importance: t('nitrogenImportance'),
      placeholder: '0-140',
      required: true
    },
    {
      id: 'phosphorus',
      name: t('phosphorus'),
      icon: '💎',
      type: 'number',
      description: t('phosphorusDesc'),
      importance: t('phosphorusImportance'),
      placeholder: '0-145',
      required: true
    },
    {
      id: 'potassium',
      name: t('potassium'),
      icon: '⚡',
      type: 'number',
      description: t('potassiumDesc'),
      importance: t('potassiumImportance'),
      placeholder: '0-205',
      required: true
    },
    {
      id: 'crop',
      name: t('crop'),
      icon: '🌾',
      type: 'select',
      description: t('cropDesc'),
      importance: t('cropImportance'),
      placeholder: t('selectCrop'),
      options: Object.entries(t('crops', { returnObjects: true })).map(([value, label]) => ({
        value,
        label
      })),
      required: true
    }
  ];

  return soilAnalysisFields;
};
