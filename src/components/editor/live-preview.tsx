"use client";

import { useEditorStore } from "@/stores/editor-store";
import { ClayCard } from "@/components/ui/clay-card";
import { KeyVisual } from "./key-visual";
import { useI18nStore } from "@/stores/i18n-store";

export function LivePreview() {
  const { currentProfile } = useEditorStore();
  const { t } = useI18nStore();

  if (!currentProfile) {
    return (
      <ClayCard className="flex flex-col items-center justify-center h-full min-h-[300px]">
        <p className="text-muted-foreground">Preview unavailable</p>
      </ClayCard>
    );
  }

  return (
    <ClayCard className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold mb-4">{t.editor.livePreview}</h3>
      
      <div className="flex-1 min-h-[200px] flex flex-col items-center justify-center bg-background border border-border shadow-inner rounded-xl p-4 overflow-hidden relative">
        <div className="w-full max-w-[280px]">
          <svg viewBox="0 0 500 150" className="w-full h-auto drop-shadow-xl" fillRule="evenodd">
            <KeyVisual profile={currentProfile} />
          </svg>
        </div>

        <div className="mt-4 font-mono text-xl tracking-widest text-primary font-bold">
          {currentProfile.bitting.join(" ")}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          {currentProfile.name} • {currentProfile.family}
        </div>
      </div>
    </ClayCard>
  );
}
