"use client";

import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ClayCard } from "@/components/ui/clay-card";
import { ClayButton } from "@/components/ui/clay-button";
import { useProfileStore } from "@/stores/profile-store";
import { useEditorStore } from "@/stores/editor-store";
import { useI18nStore } from "@/stores/i18n-store";
import { Plus, KeySquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createEmptyProfile } from "@/lib/profile/normalize";

export default function ProfilesPage() {
  const { profiles, addProfile } = useProfileStore();
  const { setProfile } = useEditorStore();
  const { t } = useI18nStore();
  const router = useRouter();

  const handleNewProfile = async () => {
    const newProfile = createEmptyProfile();
    await addProfile(newProfile);
    setProfile(newProfile);
    router.push(`/profiles/${newProfile.id}`);
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-20">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t.sidebar.profiles}</h1>
            <p className="text-muted-foreground">{t.dashboard.totalProfiles}: {profiles.length}</p>
          </div>
          <ClayButton variant="primary" onClick={handleNewProfile}>
            <Plus className="w-5 h-5 mr-2" /> {t.common.newProfile}
          </ClayButton>
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
            {profiles.map(profile => (
              <Link key={profile.id} href={`/profiles/${profile.id}`}>
                <ClayCard className="flex flex-col gap-4 hover:border-primary/50 transition-colors cursor-pointer h-full group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">{profile.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{profile.family}</p>
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
                  
                  <div className="mt-auto pt-2 border-t border-border/50 flex justify-end">
                    <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Open Editor →
                    </span>
                  </div>
                </ClayCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
