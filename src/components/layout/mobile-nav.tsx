"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, KeySquare, Settings, Plus } from "lucide-react";
import { useI18nStore } from "@/stores/i18n-store";

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useI18nStore();

  const navItems = [
    { name: t.sidebar.dashboard, href: "/", icon: Home },
    { name: t.sidebar.profiles, href: "/profiles", icon: KeySquare },
    { name: t.sidebar.mks, href: "/mks", icon: Plus },
    { name: t.sidebar.settings, href: "/settings", icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-lg border-t border-border pb-safe">
      <div className="flex items-center justify-around p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
          
          return (
            <Link key={item.name} href={item.href} className="flex-1 flex flex-col items-center justify-center p-2">
              <Icon 
                className={cn(
                  "w-6 h-6 mb-1 transition-colors", 
                  isActive ? "text-primary" : "text-muted-foreground"
                )} 
              />
              <span 
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
