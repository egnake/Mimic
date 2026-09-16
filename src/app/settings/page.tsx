"use client";

import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ClayCard } from "@/components/ui/clay-card";
import { ClayButton } from "@/components/ui/clay-button";
import { useI18nStore } from "@/stores/i18n-store";
import { Trash2 } from "lucide-react";
import { useProfileStore } from "@/stores/profile-store";
import { useEditorStore } from "@/stores/editor-store";

export default function SettingsPage() {
  const { t, lang, setLang } = useI18nStore();
  const { loadProfiles } = useProfileStore();
  const { setProfile } = useEditorStore();

  const handleClearData = async () => {
    if (confirm(t.settings.clearWarning)) {
      try {
        const req = indexedDB.deleteDatabase("mimic-db");
        req.onsuccess = () => {
          localStorage.clear();
          window.location.href = "/";
        };
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-20">
        <header>
          <h1 className="text-2xl font-bold">{t.settings.title}</h1>
          <p className="text-muted-foreground">{t.settings.subtitle}</p>
        </header>

        <ClayCard className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">{t.settings.language}</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="lang" 
                  value="tr" 
                  checked={lang === 'tr'} 
                  onChange={() => setLang('tr')} 
                  className="accent-primary w-4 h-4"
                />
                {t.settings.turkish}
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="lang" 
                  value="en" 
                  checked={lang === 'en'} 
                  onChange={() => setLang('en')} 
                  className="accent-primary w-4 h-4"
                />
                {t.settings.english}
              </label>
            </div>
          </div>
          
          <hr className="border-border" />
          
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-red-500 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              {t.settings.dangerZone}
            </h3>
            <p className="text-sm text-muted-foreground">{t.settings.clearWarning}</p>
            <ClayButton 
              variant="ghost" 
              onClick={handleClearData} 
              className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white w-fit"
            >
              {t.settings.clearData}
            </ClayButton>
          </div>
        </ClayCard>
      </div>
    </AppShell>
  );
}
