
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import fi_common from './Translations/fi/common.json';
import en_common from './Translations/en/common.json';

const resources = {
  fi: { common: fi_common },
  en: { common: en_common }
};


const deviceLang = Localization.getLocales()[0].languageCode;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: resources[deviceLang] ? deviceLang : 'en',
    fallbackLng: 'en',
    ns: ['common', 'home'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    // react: { useSuspense: false }, // enable if you use Suspense
  });

export default i18n;
