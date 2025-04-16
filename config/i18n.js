const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const LanguageDetector = require('i18next-browser-languagedetector');

i18next
  .use(Backend)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'en',
    debug: true,
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: './locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      order: ['querystring', 'cookie'],
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
    },
    interpolation: {
      escapeValue: false,
    },
  });

module.exports = i18next;
