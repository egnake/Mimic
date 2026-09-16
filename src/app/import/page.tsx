"use client";

import React, { useRef, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ClayCard } from "@/components/ui/clay-card";
import { ClayButton } from "@/components/ui/clay-button";
import { useI18nStore } from "@/stores/i18n-store";
import { useProfileStore } from "@/stores/profile-store";
import { Download, Upload } from "lucide-react";

export default function ImportPage() {
  const { t } = useI18nStore();
  const { profiles, addProfile } = useProfileStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(profiles, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mimic_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedData)) {
          // Simplistic import loop. In a real app we'd validate the schema deeply
          let importedCount = 0;
          for (const p of importedData) {
            if (p.id && p.name && Array.isArray(p.bitting)) {
              await addProfile(p);
              importedCount++;
            }
          }
          setStatus(`${t.import.success} (${importedCount} profiles)`);
        } else {
          setStatus(t.import.error);
        }
      } catch (err) {
        setStatus(t.import.error);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-20">
        <header>
          <h1 className="text-2xl font-bold">{t.import.title}</h1>
          <p className="text-muted-foreground">{t.import.subtitle}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ClayCard className="flex flex-col items-center justify-center gap-4 text-center p-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Download className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">{t.import.exportAll}</h3>
              <p className="text-sm text-muted-foreground">{t.import.exportDesc}</p>
            </div>
            <ClayButton variant="primary" onClick={handleExport} className="mt-4">
              {t.import.exportAll}
            </ClayButton>
          </ClayCard>

          <ClayCard className="flex flex-col items-center justify-center gap-4 text-center p-8">
            <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">{t.import.importFile}</h3>
              <p className="text-sm text-muted-foreground">{t.import.importDesc}</p>
            </div>
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImport}
            />
            <ClayButton 
              variant="default" 
              onClick={() => fileInputRef.current?.click()} 
              className="mt-4 bg-green-500 hover:bg-green-600 text-white"
            >
              {t.import.selectFile}
            </ClayButton>
            {status && (
              <p className={`text-sm mt-2 font-medium ${status.includes('error') || status.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
                {status}
              </p>
            )}
          </ClayCard>
        </div>
      </div>
    </AppShell>
  );
}
