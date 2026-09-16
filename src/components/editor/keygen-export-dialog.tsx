"use client";

import React, { useState, useEffect } from "react";
import { ClayCard } from "@/components/ui/clay-card";
import { ClayButton } from "@/components/ui/clay-button";
import { KeyProfile } from "@/types";
import { X, ExternalLink, Loader2 } from "lucide-react";

interface KeygenType {
  name: string;
  filename: string;
  outlines: string[];
  wardings: string[];
  description: string;
}

interface KeygenExportDialogProps {
  profile: KeyProfile;
  isOpen: boolean;
  onClose: () => void;
}

export function KeygenExportDialog({ profile, isOpen, onClose }: KeygenExportDialogProps) {
  const [types, setTypes] = useState<KeygenType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedOutline, setSelectedOutline] = useState<string>("");
  const [selectedWarding, setSelectedWarding] = useState<string>("");
  
  const bittingString = profile.bitting.join("");

  useEffect(() => {
    if (!isOpen) return;

    const fetchTypes = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/keygen");
        if (!res.ok) throw new Error("Failed to fetch keygen data");
        const data = await res.json();
        setTypes(data);
        
        if (data.length > 0) {
          const first = data[0];
          setSelectedType(first.filename);
          setSelectedOutline(first.outlines[0] || "");
          setSelectedWarding(first.wardings[0] || "");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load keygen.co metadata");
      } finally {
        setLoading(false);
      }
    };

    if (types.length === 0) {
      fetchTypes();
    }
  }, [isOpen, types.length]);

  const activeTypeData = types.find(t => t.filename === selectedType);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const filename = e.target.value;
    setSelectedType(filename);
    const typeData = types.find(t => t.filename === filename);
    if (typeData) {
      setSelectedOutline(typeData.outlines[0] || "");
      setSelectedWarding(typeData.wardings[0] || "");
    }
  };

  const handleGenerate = () => {
    if (!selectedType || !selectedOutline || !selectedWarding) return;
    
    // Format: type|outline|warding|bitting
    const payload = `${selectedType}|${selectedOutline}|${selectedWarding}|${bittingString}`;
    const encoded = btoa(payload);
    
    // Open in new tab
    window.open(`https://keygen.co/#${encoded}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <ClayCard className="w-full max-w-md relative flex flex-col gap-6">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Export to Keygen.co
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generate a 3D-printable STL model of your key.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p>Loading keygen.co parameters...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 text-sm">
            {error}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">Key Type</label>
              <select 
                value={selectedType}
                onChange={handleTypeChange}
                className="clay-input p-2 rounded-lg bg-surface text-foreground"
              >
                {types.map(t => (
                  <option key={t.filename} value={t.filename}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold">Outline</label>
                <select 
                  value={selectedOutline}
                  onChange={(e) => setSelectedOutline(e.target.value)}
                  className="clay-input p-2 rounded-lg bg-surface text-foreground"
                >
                  {activeTypeData?.outlines.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold">Warding</label>
                <select 
                  value={selectedWarding}
                  onChange={(e) => setSelectedWarding(e.target.value)}
                  className="clay-input p-2 rounded-lg bg-surface text-foreground"
                >
                  {activeTypeData?.wardings.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">Bitting (Auto-filled)</label>
              <input 
                type="text" 
                value={bittingString}
                readOnly
                className="clay-input p-2 rounded-lg bg-background font-mono text-muted-foreground"
              />
            </div>

            {activeTypeData?.description && (
              <div className="p-3 bg-black/5 dark:bg-white/5 rounded-lg text-xs whitespace-pre-wrap">
                {activeTypeData.description}
              </div>
            )}
            
            <ClayButton 
              variant="primary" 
              className="w-full mt-2"
              onClick={handleGenerate}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Generate 3D Model on keygen.co
            </ClayButton>
          </div>
        )}
      </ClayCard>
    </div>
  );
}
