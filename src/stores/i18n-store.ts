import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { tr } from '@/lib/i18n/tr';
import { en } from '@/lib/i18n/en';

type Language = 'tr' | 'en';
type Translations = typeof tr;

interface I18nState {
  lang: Language;
  t: Translations;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      lang: 'tr',
      t: tr,
      setLang: (lang) => set({ lang, t: lang === 'tr' ? tr : en }),
      toggleLang: () => set((state) => {
        const newLang = state.lang === 'tr' ? 'en' : 'tr';
        return { lang: newLang, t: newLang === 'tr' ? tr : en };
      }),
    }),
    {
      name: 'mimic-i18n-storage',
    }
  )
);
