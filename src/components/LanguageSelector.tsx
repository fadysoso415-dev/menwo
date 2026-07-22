import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Language } from '../context/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LANGUAGES: { code: Language; name: string; flag: string }[] = [
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export default function LanguageSelector() {
  const { language, setLanguage, dir } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all shadow-sm"
        id="language-selector-btn"
        title="تغيير اللغة / Change Language"
      >
        <Globe className="h-4 w-4 text-emerald-400" />
        <span className="text-sm">{currentLang.flag}</span>
        <span className="hidden sm:inline font-bold">{currentLang.name}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className={`absolute ${dir === 'rtl' ? 'left-0' : 'right-0'} mt-2 w-36 origin-top-right rounded-2xl border border-zinc-800 bg-zinc-950 p-1.5 shadow-2xl ring-1 ring-black/50 z-50 animate-in fade-in zoom-in-95 duration-100`}
        >
          <div className="text-[10px] font-bold text-zinc-500 px-2.5 py-1 uppercase tracking-wider">
            Select Language
          </div>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                language === lang.code
                  ? 'bg-emerald-500/10 text-emerald-400 font-extrabold'
                  : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </span>
              {language === lang.code && <Check className="h-3.5 w-3.5 text-emerald-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
