export const DEFAULT_LANGUAGE_CODE = 'en-us';

type CodeToLanguage = {
  [code:string]:string
};

const CODE_TO_LANGUAGE:CodeToLanguage = {
  'ca': 'Català',
  'cn': '中文',
  'de': 'Deutsch',
  'en-us': 'English (US)',
  'en-in': 'English (India)',
  'es': 'Español',
  'fa': 'فارسی',
  'fr': 'Français',
  'it': 'Italiano',
  'pt': 'Português',
  'ru': 'Русский',
  'tr': 'Türkçe',
  'vn': 'Tiếng Việt'
};

export function codeToLanguage(code:string):string {
  return CODE_TO_LANGUAGE[code] ?? '';
}

export const LANGUAGE_CODES = Object.keys(CODE_TO_LANGUAGE);