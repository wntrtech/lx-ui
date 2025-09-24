import countries from 'i18n-iso-countries';

import lv from 'i18n-iso-countries/langs/lv.json';
import en from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(lv);
countries.registerLocale(en);

export function countryCodeToName(countryCode, lang = 'lv') {
  const SUPPORTED_LANGUAGES = ['lv', 'en'];

  // check if lang is in format xx-XX
  let language = lang;
  if (language && language.length > 2 && language.includes('-')) {
    [language] = language.split('-');
  }

  // check if lang is supported
  language = SUPPORTED_LANGUAGES.includes(language) ? language : 'lv';
  return countries.isValid(countryCode) ? countries.getName(countryCode, language) : null;
}
