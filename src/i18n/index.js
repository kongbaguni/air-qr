import Vue from 'vue'
import VueI18n from 'vue-i18n'
import ko from './locales/ko'
import en from './locales/en'
import zh from './locales/zh'

Vue.use(VueI18n)

var STORAGE_KEY = 'app_language'

function getStoredLanguage() {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'ko'
  } catch (e) {
    return 'ko'
  }
}

function setStoredLanguage(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch (e) {
    console.warn('Failed to save language preference')
  }
}

var i18n = new VueI18n({
  locale: getStoredLanguage(),
  fallbackLocale: 'ko',
  messages: {
    ko: ko,
    en: en,
    zh: zh
  }
})

export { setStoredLanguage, getStoredLanguage }
export default i18n
