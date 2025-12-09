import i18n from './i18n/i18n';
import { sessionStorage } from "../utils/Storage";

const allowed = ['fi', 'en'];

export async function loadSavedLanguage() {
  const saved = await sessionStorage.getItem('lang');
  if (saved) await i18n.changeLanguage(saved);
}

export async function setLanguage(lang) {
  if (!allowed.includes(lang)) {
    console.warn('Unsupported language:', lang);
    return;
  }
  await i18n.changeLanguage(lang);
  await sessionStorage.setItem('lang', lang);
}
