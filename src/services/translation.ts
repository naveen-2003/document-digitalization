export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
];

export const translateText = async (
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'en'
): Promise<string> => {
  if (targetLanguage === sourceLanguage) {
    return text;
  }
  return text;
};

export const translateBatch = async (
  texts: string[],
  targetLanguage: string,
  sourceLanguage: string = 'en'
): Promise<string[]> => {
  if (targetLanguage === sourceLanguage) {
    return texts;
  }
  return texts;
};

export const getLanguageName = (code: string): string => {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
  return lang?.name || code;
};

export const getLanguageNativeName = (code: string): string => {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
  return lang?.nativeName || code;
};
