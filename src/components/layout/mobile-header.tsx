"use client";

import Link from "next/link";
import { Search, Menu, KeySquare } from "lucide-react";
import { ClayButton } from "@/components/ui/clay-button";

import { useI18nStore } from "@/stores/i18n-store";

export function MobileHeader() {
  const { lang, toggleLang } = useI18nStore();
  return (
    <header className="flex items-center justify-between p-4 bg-surface/80 backdrop-blur-md border-b border-border z-10 sticky top-0">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded overflow-hidden shadow border border-border flex items-center justify-center">
            <img src="/logo.jpg" alt="Mimic Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-lg">Mimic</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={toggleLang}
          className="text-xs font-bold bg-surface border border-border rounded px-2 py-1 mr-2 hover:bg-border transition-colors"
        >
          {lang.toUpperCase()}
        </button>
      </div>
    </header>
  );
}
