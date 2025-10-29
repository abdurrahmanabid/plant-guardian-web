import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import I18NextHttpBackend from "i18next-http-backend";

i18n
  .use(I18NextHttpBackend) // Only needed for async loading from /public
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    ns: ['navbar', 'common', 'home', 'howTo', 'soil-input', 'loading', 'authentication', 'registration', 'login', 'leafPredict', 'soil-result', 'saved', 'search', 'profile', 'auth'],
    defaultNS: 'common',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    }
  });


export default i18n;
