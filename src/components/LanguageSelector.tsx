import { Languages } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../services/translation';

interface LanguageSelectorProps {
  currentLanguage: string;
  onChange: (language: string) => void;
}

export const LanguageSelector = ({ currentLanguage, onChange }: LanguageSelectorProps) => {
  return (
    <div className="relative">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
        <Languages className="w-4 h-4" />
        Language
      </label>
      <select
        value={currentLanguage}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
};
