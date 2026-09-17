"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, KeySquare, Settings, FileDown, Plus, Github } from "lucide-react";
import { ClayButton } from "@/components/ui/clay-button";
import { createEmptyProfile } from "@/lib/profile/normalize";
import { useProfileStore } from "@/stores/profile-store";
import { useEditorStore } from "@/stores/editor-store";
import { useRouter } from "next/navigation";

import { useI18nStore } from "@/stores/i18n-store";
import Image from "next/image";

export function Sidebar() {
  const pathname = usePathname();
  const { addProfile } = useProfileStore();
  const { setProfile } = useEditorStore();
  const { t, lang, toggleLang } = useI18nStore();
  const router = useRouter();

  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/egnake/Mimic")
      .then(res => res.json())
      .then(data => {
        if (typeof data.stargazers_count === "number") {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {});
  }, []);

  const handleNewProfile = async () => {
    const newProfile = createEmptyProfile();
    await addProfile(newProfile);
    setProfile(newProfile);
    router.push(`/profiles/${newProfile.id}`);
  };

  const navItems = [
    { name: t.sidebar.dashboard, href: "/", icon: Home },
    { name: t.sidebar.profiles, href: "/profiles", icon: KeySquare },
    { name: t.sidebar.mks, href: "/mks", icon: Plus },
    { name: t.sidebar.import, href: "/import", icon: FileDown },
    { name: t.sidebar.settings, href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center gap-3 px-2 py-4 mb-6">
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-border flex items-center justify-center bg-primary/10 text-primary">
          <KeySquare className="w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight">Mimic</span>
      </div>

      <ClayButton variant="primary" className="w-full justify-start mb-8" onClick={handleNewProfile}>
        <Plus className="w-5 h-5 mr-2" />
        {t.common.newProfile}
      </ClayButton>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
          
          return (
            <Link key={item.name} href={item.href}>
              <span
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-md transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "hover:bg-surface text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto px-2 py-4 flex items-center justify-between border-t border-border/50">
        <a 
          href="https://github.com/egnake/Mimic" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors bg-surface px-2 py-1 rounded border border-border/50 hover:border-border"
          title="View on GitHub"
        >
          <Github className="w-4 h-4" />
          <span>{stars !== null ? stars : "..."}</span>
        </a>
        <button 
          onClick={toggleLang}
          className="text-xs font-bold bg-surface border border-border rounded px-2 py-1 hover:bg-border transition-colors"
        >
          {lang.toUpperCase()}
        </button>
      </div>
    </div>
  );
}
