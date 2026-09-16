"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ClayCard } from "@/components/ui/clay-card";
import { ClayButton } from "@/components/ui/clay-button";
import { KeyProfile } from "@/types";
import { useProfileStore } from "@/stores/profile-store";
import { createEmptyProfile } from "@/lib/profile/normalize";
import { ArrowRight, Save } from "lucide-react";
import { useRouter } from "next/navigation";

import { useI18nStore } from "@/stores/i18n-store";

export default function MKSPage() {
  const [masterKey, setMasterKey] = useState("24642");
  const [macs, setMacs] = useState("7");
  const [step, setStep] = useState("2");
  
  const [results, setResults] = useState<number[][]>([]);
  const [generating, setGenerating] = useState(false);
  
  const { addProfile } = useProfileStore();
  const { t } = useI18nStore();
  const router = useRouter();

  const generateMKS = () => {
    setGenerating(true);
    
    // Slight delay to allow UI to show loading state
    setTimeout(() => {
      const masterArr = masterKey.split('').map(n => parseInt(n));
      const macsVal = parseInt(macs);
      const stepVal = parseInt(step);
      
      const positions = masterArr.length;
      let validKeys: number[][] = [];
      
      // Generate possible depths for each position based on progression step
      const possibleDepthsPerPosition: number[][] = [];
      for (let i = 0; i < positions; i++) {
        const mDepth = masterArr[i];
        const depths = [];
        for (let d = 0; d <= 9; d++) {
          if (Math.abs(d - mDepth) % stepVal === 0) {
            depths.push(d);
          }
        }
        possibleDepthsPerPosition.push(depths);
      }
      
      // Backtracking algorithm
      const backtrack = (currentKey: number[], posIndex: number) => {
        if (validKeys.length > 5000) return; // Hard limit for safety
        
        if (posIndex === positions) {
          // Check if it's identical to master key
          if (currentKey.join('') !== masterKey) {
            validKeys.push([...currentKey]);
          }
          return;
        }
        
        const possibleDepths = possibleDepthsPerPosition[posIndex];
        for (const depth of possibleDepths) {
          // Check MACS if not first position
          if (posIndex > 0) {
            if (Math.abs(currentKey[posIndex - 1] - depth) > macsVal) {
              continue; // Violates MACS
            }
          }
          currentKey.push(depth);
          backtrack(currentKey, posIndex + 1);
          currentKey.pop();
        }
      };
      
      backtrack([], 0);
      
      setResults(validKeys);
      setGenerating(false);
    }, 50);
  };

  const saveAsProfile = async (bittingArr: number[]) => {
    const profile = createEmptyProfile();
    profile.name = `Change Key (${bittingArr.join('')})`;
    profile.bitting = bittingArr.map(n => n.toString());
    profile.positions = bittingArr.length;
    profile.outline = `${bittingArr.length}-pin`;
    await addProfile(profile);
    router.push(`/profiles/${profile.id}`);
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-20">
        <header>
          <h1 className="text-2xl font-bold">{t.mks.title}</h1>
          <p className="text-muted-foreground">{t.mks.subtitle}</p>
        </header>

        <ClayCard className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">{t.mks.masterKey}</label>
              <input 
                type="text" 
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value.replace(/\D/g, ''))}
                className="clay-input p-3 font-mono text-xl tracking-widest text-center"
                placeholder="e.g. 24642"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">{t.mks.macs}</label>
              <input 
                type="number" 
                min="1" max="9"
                value={macs}
                onChange={(e) => setMacs(e.target.value)}
                className="clay-input p-3 text-center"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">{t.mks.step}</label>
              <select 
                value={step} 
                onChange={(e) => setStep(e.target.value)}
                className="clay-input p-3"
              >
                <option value="1">{t.mks.step1}</option>
                <option value="2">{t.mks.step2}</option>
              </select>
            </div>
          </div>
          
          <ClayButton variant="primary" onClick={generateMKS} className="mt-4" disabled={generating || masterKey.length < 2}>
            {generating ? t.mks.generating : t.mks.generate}
          </ClayButton>
        </ClayCard>

        {results.length > 0 && (
          <ClayCard className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">{t.mks.generatedCount}: {results.length}</h2>
              {results.length >= 5000 && <span className="text-orange-500 text-sm">{t.mks.limitReached}</span>}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[60vh] overflow-y-auto p-2">
              {results.map((bitting, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border shadow-sm group hover:border-primary/50 transition-colors">
                  <span className="font-mono font-bold tracking-widest">{bitting.join('')}</span>
                  <button 
                    onClick={() => saveAsProfile(bitting)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-primary hover:bg-primary/10 rounded transition-all"
                    title={t.mks.saveProfile}
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </ClayCard>
        )}
      </div>
    </AppShell>
  );
}
