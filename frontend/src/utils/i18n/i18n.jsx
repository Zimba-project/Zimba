import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import fi_common from './Translations/fi/common.json';
import en_common from './Translations/en/common.json';

const LANGUAGE_KEY = 'user-language';

const resources = {
  fi: { common: fi_common },
  en: { common: en_common },
};

export const initI18n = async () => {
  const storedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
  const deviceLocale = Localization.getLocales()[0];
  const deviceLang = deviceLocale?.languageCode ?? 'en';
  const supportedLangs = Object.keys(resources);

  const initialLang = storedLang ?? (supportedLangs.includes(deviceLang) ? deviceLang : 'en');

  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      resources,
      lng: initialLang,
      fallbackLng: 'en',
      defaultNS: 'common',
      interpolation: { escapeValue: false },
    });
  }
};

export const changeLanguage = async (lang) => {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  await i18n.changeLanguage(lang);
};

export default i18n;
