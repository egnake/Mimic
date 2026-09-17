"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, KeySquare, Settings, FileDown, Plus } from "lucide-react";
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
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-border">
          <img src="/logo.jpg" alt="Mimic Logo" className="w-full h-full object-cover" />
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
      
      <div className="mt-auto px-2 py-4 flex items-center justify-between">
        <div className="flex flex-col text-xs text-muted-foreground">
        </div>
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
