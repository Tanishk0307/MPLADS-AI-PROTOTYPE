import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, type Language, type Translations } from '@/lib/i18n';
import { Languages, Check, Globe } from 'lucide-react';

const LANGUAGE_STORAGE_KEY = 'mplads_portal_lang_pref';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isHindi: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'hi' || saved === 'en') return saved;
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: translations[language],
    isHindi: language === 'hi',
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

interface LanguageSwitcherProps {
  variant?: 'header' | 'login' | 'compact';
}

export function LanguageSwitcher({ variant = 'header' }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);

  if (variant === 'compact') {
    return (
      <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
        <button
          onClick={() => setLanguage('en')}
          className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
            language === 'en'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          English
        </button>
        <button
          onClick={() => setLanguage('hi')}
          className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
            language === 'hi'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          हिंदी
        </button>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
          variant === 'login'
            ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700 shadow-sm backdrop-blur-md'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-xs'
        }`}
        title={t.changeLanguage}
      >
        <Globe className={`h-4 w-4 ${variant === 'login' ? 'text-amber-400' : 'text-brand-600'}`} />
        <span>{language === 'en' ? 'English' : 'हिंदी'}</span>
        <span className="text-[10px] opacity-60">▼</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-fade-in-up">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center gap-1">
              <Languages className="h-3 w-3" /> {t.languageLabel}
            </div>
            
            <button
              type="button"
              onClick={() => {
                setLanguage('en');
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-left transition-colors ${
                language === 'en' ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>English</span>
              {language === 'en' && <Check className="h-3.5 w-3.5 text-brand-600" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setLanguage('hi');
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-left transition-colors ${
                language === 'hi' ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>हिंदी (Hindi)</span>
              {language === 'hi' && <Check className="h-3.5 w-3.5 text-brand-600" />}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
