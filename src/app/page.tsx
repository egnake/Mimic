"use client";

import { AppShell } from "@/components/layout/app-shell";
import { ClayCard } from "@/components/ui/clay-card";
import { ClayButton } from "@/components/ui/clay-button";
import { Plus, ArrowRight, KeySquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/stores/profile-store";
import { useEditorStore } from "@/stores/editor-store";
import { useI18nStore } from "@/stores/i18n-store";
import { createEmptyProfile } from "@/lib/profile/normalize";

export default function Home() {
  const { profiles } = useProfileStore();
  const { setProfile } = useEditorStore();
  const { addProfile } = useProfileStore();
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
      <div className="flex flex-col gap-8 pb-20">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t.dashboard.welcome}</h1>
          <p className="text-muted-foreground">{t.dashboard.subtitle}</p>
        </header>

        <section>
          <h2 className="text-lg font-semibold mb-4 text-foreground/80">{t.dashboard.quickStats}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ClayCard className="flex flex-col items-center justify-center p-6 text-center">
              <span className="text-4xl font-bold text-primary mb-2">{profiles.length}</span>
              <span className="text-sm font-medium text-muted-foreground">{t.dashboard.totalProfiles}</span>
            </ClayCard>
            
            <ClayCard className="flex flex-col items-center justify-center p-6 text-center bg-primary/5 border-primary/10 cursor-pointer hover:bg-primary/10 transition-colors" onClick={handleNewProfile}>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3 text-primary">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-foreground">{t.common.newProfile}</span>
            </ClayCard>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground/80">{t.dashboard.recentActivity}</h2>
            <Link href="/profiles" className="text-sm text-primary font-medium hover:underline flex items-center">
              {t.dashboard.jumpBack} <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profiles.length === 0 ? (
              <ClayCard className="col-span-full py-12 text-center flex flex-col items-center justify-center border-dashed border-2 bg-transparent">
                <KeySquare className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground mb-4">{t.dashboard.noProfiles}</p>
                <ClayButton variant="primary" onClick={handleNewProfile}>
                  <Plus className="w-5 h-5 mr-2" /> {t.dashboard.createFirst}
                </ClayButton>
              </ClayCard>
            ) : (
              profiles.slice(0, 4).map(profile => (
                <Link key={profile.id} href={`/profiles/${profile.id}`}>
                  <ClayCard className="flex flex-col gap-2 hover:border-primary/50 transition-colors cursor-pointer h-full group">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{profile.name}</h3>
                      <span className="text-xs font-mono bg-surface px-2 py-1 rounded text-muted-foreground">
                        {profile.templateId}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground font-mono mt-auto pt-2 border-t border-border/50">
                      {t.common.cuts}: {profile.bitting.join(" ")}
                    </div>
                  </ClayCard>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
