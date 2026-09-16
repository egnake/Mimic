"use client";

import { useEffect, useState, use } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { BittingEditor } from "@/components/editor/bitting-editor";
import { LivePreview } from "@/components/editor/live-preview";
import { useEditorStore } from "@/stores/editor-store";
import { db } from "@/lib/db";
import { KeyProfile } from "@/types";
import { ClayCard } from "@/components/ui/clay-card";
import { ClayButton } from "@/components/ui/clay-button";
import { downloadStringAsFile, jsonExportAdapter, csvExportAdapter, plainExportAdapter } from "@/lib/export";
import { KeygenExportDialog } from "@/components/editor/keygen-export-dialog";
import { useProfileStore } from "@/stores/profile-store";
import { useI18nStore } from "@/stores/i18n-store";

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { currentProfile, setProfile } = useEditorStore();
  const { t } = useI18nStore();
  const [loading, setLoading] = useState(true);
  const [showKeygenDialog, setShowKeygenDialog] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (currentProfile?.id === id) {
        setLoading(false);
        return;
      }
      
      const profile = await db.profiles.get(id);
      if (profile) {
        setProfile(profile);
      }
      setLoading(false);
    };

    loadProfile();
  }, [id, currentProfile?.id, setProfile]);

  useEffect(() => {
    if (!currentProfile) return;
    const timeout = setTimeout(() => {
      db.profiles.put(currentProfile);
      useProfileStore.getState().updateProfile(currentProfile);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [currentProfile]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full">
          <p className="animate-pulse">{t.common.loading}</p>
        </div>
      </AppShell>
    );
  }

  if (!currentProfile) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-xl font-bold mb-4">Profile not found.</p>
          <ClayButton variant="primary" onClick={() => window.history.back()}>
            Go Back
          </ClayButton>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-20">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{currentProfile.name}</h1>
            <p className="text-muted-foreground">{currentProfile.family} • {currentProfile.positions} Positions</p>
          </div>
          <ClayButton variant="success">{t.common.save}</ClayButton>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-6">
            <BittingEditor />
            <ClayCard className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold mb-4">{t.editor.profileSettings}</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input 
                    type="text" 
                    className="clay-input w-full p-2" 
                    value={currentProfile.name}
                    onChange={(e) => useEditorStore.getState().updateProfileMeta({ name: e.target.value })}
                    placeholder="Profile Name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">TYPE</label>
                  <select 
                    className="clay-input w-full p-2"
                    value={currentProfile.type || "Schlage Classic"}
                    onChange={(e) => useEditorStore.getState().updateProfileMeta({ type: e.target.value })}
                  >
                    <option value="Schlage Classic">Schlage Classic</option>
                    <option value="Kwikset Classic">Kwikset Classic</option>
                    <option value="Medeco Biaxial">Medeco Biaxial</option>
                    <option value="Yale Standard">Yale Standard</option>
                    <option value="Sargent LA-LC">Sargent LA-LC</option>
                    <option value="Corbin Russwin">Corbin Russwin</option>
                    <option value="Kale Bilyali">Kale Bilyalı (Dimple)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">POSITIONS (Pin Count)</label>
                  <input 
                    type="number"
                    min="1"
                    max="12"
                    className="clay-input w-full p-2"
                    value={currentProfile.positions}
                    onChange={(e) => {
                      const positions = parseInt(e.target.value) || 5;
                      useEditorStore.getState().updateProfileMeta({ positions, outline: `${positions}-pin` });
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Number of cuts/pins on the main track.</p>
                </div>

                {currentProfile.templateId === "dimple-multi-track" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">SECONDARY PINS (Lower Track)</label>
                    <select 
                      className="clay-input w-full p-2"
                      value={currentProfile.secondaryPositions || 0}
                      onChange={(e) => {
                        const secondaryPositions = parseInt(e.target.value) || 0;
                        useEditorStore.getState().updateProfileMeta({ secondaryPositions });
                      }}
                    >
                      <option value="0">None</option>
                      <option value="4">4 Pins</option>
                      <option value="5">5 Pins</option>
                      <option value="6">6 Pins</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">WARDING</label>
                  <select 
                    className="clay-input w-full p-2"
                    value={currentProfile.warding || "C"}
                    onChange={(e) => useEditorStore.getState().updateProfileMeta({ warding: e.target.value })}
                  >
                    <option value="C">C</option>
                    <option value="CE">CE</option>
                    <option value="E">E</option>
                    <option value="EF">EF</option>
                    <option value="F">F</option>
                    <option value="FG">FG</option>
                    <option value="H">H</option>
                    <option value="J">J</option>
                    <option value="K">K</option>
                    <option value="L">L</option>
                  </select>
                </div>
              </div>
            </ClayCard>
          </div>
          <div className="flex flex-col gap-6 lg:sticky lg:top-4">
            <LivePreview />
            
            <ClayCard>
              <h3 className="text-lg font-semibold mb-4">Export</h3>
              <div className="flex flex-wrap gap-2">
                <ClayButton onClick={() => downloadStringAsFile(jsonExportAdapter.export(currentProfile), `${currentProfile.name}.json`, 'application/json')}>JSON</ClayButton>
                <ClayButton onClick={() => downloadStringAsFile(csvExportAdapter.export(currentProfile), `${currentProfile.name}.csv`, 'text/csv')}>CSV</ClayButton>
                <ClayButton onClick={() => downloadStringAsFile(plainExportAdapter.export(currentProfile), `${currentProfile.name}.txt`, 'text/plain')}>TXT</ClayButton>
                <ClayButton variant="primary" onClick={() => setShowKeygenDialog(true)}>3D STL (Keygen)</ClayButton>
              </div>
            </ClayCard>
          </div>
        </div>
      </div>
      
      {/* Mobile Sticky Action Bar */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <ClayCard className="p-2 flex justify-around items-center rounded-full bg-surface/90 backdrop-blur">
          <ClayButton variant="ghost" size="sm">{t.common.copy}</ClayButton>
          <ClayButton variant="primary" size="sm" className="rounded-full px-6">{t.common.save}</ClayButton>
          <ClayButton variant="ghost" size="sm" onClick={() => setShowKeygenDialog(true)}>3D Export</ClayButton>
        </ClayCard>
      </div>

      <KeygenExportDialog 
        profile={currentProfile} 
        isOpen={showKeygenDialog} 
        onClose={() => setShowKeygenDialog(false)} 
      />
    </AppShell>
  );
}
