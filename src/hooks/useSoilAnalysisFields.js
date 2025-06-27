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

  return soilAnalysisFields;
}; 