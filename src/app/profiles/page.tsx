"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ClayCard } from "@/components/ui/clay-card";
import { ClayButton } from "@/components/ui/clay-button";
import { useProfileStore } from "@/stores/profile-store";
import { useEditorStore } from "@/stores/editor-store";
import { useI18nStore } from "@/stores/i18n-store";
import { Plus, KeySquare, Trash2, CheckSquare, Square } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createEmptyProfile } from "@/lib/profile/normalize";

export default function ProfilesPage() {
  const { profiles, addProfile, deleteProfile } = useProfileStore();
  const { setProfile } = useEditorStore();
  const { t } = useI18nStore();
  const router = useRouter();

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleNewProfile = async () => {
    const newProfile = createEmptyProfile();
    await addProfile(newProfile);
    setProfile(newProfile);
    router.push(`/profiles/${newProfile.id}`);
  };

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.size} profile(s)?`)) {
      for (const id of Array.from(selectedIds)) {
        await deleteProfile(id);
      }
      setSelectedIds(new Set());
      setIsSelectionMode(false);
    }
  };

  const handleDeleteSingle = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm("Are you sure you want to delete this profile?")) {
      await deleteProfile(id);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-20">
        <header className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t.sidebar.profiles}</h1>
            <p className="text-muted-foreground">{t.dashboard.totalProfiles}: {profiles.length}</p>
          </div>
          <div className="flex items-center gap-3">
            {profiles.length > 0 && (
              <>
                {isSelectionMode ? (
                  <>
                    <ClayButton variant="danger" onClick={handleDeleteSelected} disabled={selectedIds.size === 0}>
                      <Trash2 className="w-5 h-5 mr-2" /> Delete Selected ({selectedIds.size})
                    </ClayButton>
                    <ClayButton variant="default" onClick={() => { setIsSelectionMode(false); setSelectedIds(new Set()); }}>
                      Cancel
                    </ClayButton>
                  </>
                ) : (
                  <ClayButton variant="default" onClick={() => setIsSelectionMode(true)}>
                    <CheckSquare className="w-5 h-5 mr-2" /> Select
                  </ClayButton>
                )}
              </>
            )}
            <ClayButton variant="primary" onClick={handleNewProfile}>
              <Plus className="w-5 h-5 mr-2" /> {t.common.newProfile}
            </ClayButton>
          </div>
        </header>

        {profiles.length === 0 ? (
          <ClayCard className="py-16 text-center flex flex-col items-center justify-center border-dashed border-2 bg-transparent">
            <KeySquare className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-6">{t.dashboard.noProfiles}</p>
            <ClayButton variant="primary" onClick={handleNewProfile} size="lg">
              <Plus className="w-5 h-5 mr-2" /> {t.dashboard.createFirst}
            </ClayButton>
          </ClayCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map(profile => {
              const isSelected = selectedIds.has(profile.id);
              
              const CardContent = (
                <ClayCard 
                  className={`flex flex-col gap-4 transition-all cursor-pointer h-full group relative ${
                    isSelected ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      {isSelectionMode && (
                        <div className="mt-1">
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-primary" />
                          ) : (
                            <Square className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">{profile.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{profile.family}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono bg-surface px-2 py-1 rounded text-muted-foreground whitespace-nowrap">
                      {profile.templateId}
                    </span>
                  </div>
                  
                  <div className="bg-surface/50 p-3 rounded-lg border border-border/50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-muted-foreground">{t.editor.bittingEditor}</span>
                      <span className="text-xs font-mono text-muted-foreground">{profile.positions} pos</span>
                    </div>
                    <div className="font-mono text-lg tracking-widest font-bold">
                      {profile.bitting.join(" ")}
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-2 border-t border-border/50 flex justify-between items-center">
                    {!isSelectionMode && (
                      <button 
                        onClick={(e) => handleDeleteSingle(profile.id, e)}
                        className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                      {isSelectionMode ? (isSelected ? 'Deselect' : 'Select') : 'Open Editor →'}
                    </span>
                  </div>
                </ClayCard>
              );

              return isSelectionMode ? (
                <div key={profile.id} onClick={(e) => toggleSelection(profile.id, e)}>
                  {CardContent}
                </div>
              ) : (
                <Link key={profile.id} href={`/profiles/${profile.id}`}>
                  {CardContent}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
