"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ClayButton } from "@/components/ui/clay-button";

import { useI18nStore } from "@/stores/i18n-store";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export function MobileHeader() {
  const { lang, toggleLang } = useI18nStore();
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
        <a 
          href="https://github.com/egnake/Mimic" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors bg-surface px-1.5 py-1 rounded border border-border/50 hover:border-border"
          title="View on GitHub"
        >
          <GithubIcon className="w-3.5 h-3.5" />
          <span>{stars !== null ? stars : "..."}</span>
        </a>
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
