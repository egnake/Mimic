"use client";

import * as React from "react";
import { useEditorStore } from "@/stores/editor-store";
import { ClayCard } from "@/components/ui/clay-card";
import { ClayButton } from "@/components/ui/clay-button";
import { Undo, Redo, Copy, Maximize, Minimize, Download } from "lucide-react";

import { getTemplate, templates } from "@/lib/templates";
import { generateScad } from "@/lib/export/scad-generator";
import { generateGCode } from "@/lib/export/gcode-generator";
import { useI18nStore } from "@/stores/i18n-store";
import { KeyVisual } from "@/components/editor/key-visual";

export function BittingEditor() {
  const { currentProfile, updateBitting, updateTemplateId, undo, redo, historyIndex, history } = useEditorStore();
  const { t } = useI18nStore();
  const svgRef = React.useRef<SVGSVGElement>(null);
  
  // Physical Match State
  const [physicalMode, setPhysicalMode] = React.useState(false);
  const [scale, setScale] = React.useState(100);
  const [firstPinOffset, setFirstPinOffset] = React.useState(160);
  const [pinSpacing, setPinSpacing] = React.useState(67);
  
  // Optical Decoding State
  const [bgImage, setBgImage] = React.useState<string | null>(null);
  const [bgScale, setBgScale] = React.useState(100);
  const [bgPanX, setBgPanX] = React.useState(0);
  const [bgPanY, setBgPanY] = React.useState(0);
  const [bgRotate, setBgRotate] = React.useState(0);
  const [bgOpacity, setBgOpacity] = React.useState(60);

  // Logical Depth Scale Calibration
  const [depthSpan, setDepthSpan] = React.useState(35);
  const [xOffsets, setXOffsets] = React.useState<number[]>(Array(15).fill(0));

  if (!currentProfile) {
    return (
      <ClayCard className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-muted-foreground">{t.dashboard.noProfiles}</p>
      </ClayCard>
    );
  }

  const templateId = currentProfile.templateId || "kwikset-kw1";
  const template = getTemplate(templateId) || getTemplate("kwikset-kw1")!;
  const isDimple = template.cutStrategy === 'dimple';

  const handlePointerDown = (e: React.PointerEvent, posIndex: number) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    handlePointerMove(e, posIndex);
  };

  const handlePointerMove = (e: React.PointerEvent, posIndex: number) => {
    if (!svgRef.current) return;
    if (e.buttons !== 1) return; 

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // In physical mode, the SVG height is scaled by `scale/100`.
    // The native viewBox is 0 0 500 150.
    const svgY = (y / rect.height) * 150;
    
    // Y-axis (Depth) update
    const mappedValue = Math.round(((svgY - 50) / depthSpan) * 9);
    const validValue = Math.max(0, Math.min(9, mappedValue));
    
    const currentValStr = currentProfile.bitting[posIndex]?.toString() || "0";
    const angleStr = currentValStr.replace(/[^a-zA-Z]/g, '').toUpperCase();
    useEditorStore.getState().updateBitting(posIndex, `${validValue}${angleStr}`);

    // X-axis (Horizontal) update
    // Native SVG width is 500. We calculate the theoretical center and find the difference.
    const svgX = (x / rect.width) * 500;
    const theoreticalCx = 50 + firstPinOffset + (posIndex * pinSpacing);
    setXOffsets(prev => {
      const newOffsets = [...prev];
      newOffsets[posIndex] = svgX - theoreticalCx;
      return newOffsets;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBgImage(event.target?.result as string);
        setPhysicalMode(true); // Auto-enter physical mode
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = () => {
    const text = currentProfile.bitting.join("");
    navigator.clipboard.writeText(text);
  };

  const handleDownloadScad = () => {
    if (!currentProfile) return;
    const scad = generateScad(currentProfile);
    const blob = new Blob([scad], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mimic_${currentProfile.name || 'key'}.scad`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadGCode = () => {
    if (!currentProfile) return;
    const gcode = generateGCode(currentProfile);
    const blob = new Blob([gcode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mimic_${currentProfile.name || 'key'}.nc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const positions = currentProfile.positions;

  return (
    <ClayCard className="flex flex-col gap-6 overflow-hidden">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">{t.editor.bittingEditor}</h3>
          {!physicalMode && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t.editor.template}</span>
              <select 
                value={currentProfile.templateId || 'standard-edge'} 
                onChange={(e) => updateTemplateId(e.target.value)}
                className="bg-surface border border-border rounded-md text-sm px-2 py-1 outline-none focus:ring-1 focus:ring-primary"
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ClayButton size="icon" variant="ghost" onClick={undo} disabled={historyIndex <= 0}>
            <Undo className="w-4 h-4" />
          </ClayButton>
          <ClayButton size="icon" variant="ghost" onClick={redo} disabled={historyIndex >= history.length - 1}>
            <Redo className="w-4 h-4" />
          </ClayButton>
          <ClayButton size="sm" variant="default" onClick={copyToClipboard} className="ml-2">
            <Copy className="w-4 h-4 mr-2" /> {t.common.copy}
          </ClayButton>
          <ClayButton size="sm" variant="ghost" onClick={handleDownloadScad} className="text-emerald-600 border border-emerald-600/30 hover:bg-emerald-50 bg-background">
            <Download className="w-4 h-4 mr-2" /> .SCAD
          </ClayButton>
          <ClayButton size="sm" variant="ghost" onClick={handleDownloadGCode} className="text-orange-600 border border-orange-600/30 hover:bg-orange-50 bg-background">
            <Download className="w-4 h-4 mr-2" /> .NC
          </ClayButton>
        </div>
      </div>

      <div className="flex justify-between gap-2 overflow-x-auto pb-2">
        {currentProfile.bitting.map((val, idx) => {
          const valStr = val.toString();
          const depth = valStr.replace(/\D/g, '') || "0";
          const angle = valStr.replace(/[^a-zA-Z]/g, '').toUpperCase();
          const isMedeco = currentProfile.type === "Medeco Biaxial";

          return (
            <div key={idx} className="flex flex-col items-center gap-2 shrink-0">
              <label className="text-xs text-muted-foreground font-mono">{idx + 1}</label>
              <div className="flex flex-col gap-1 items-center">
                <input
                  type="text"
                  maxLength={isMedeco ? 2 : 1}
                  value={valStr}
                  onChange={(e) => updateBitting(idx, e.target.value.toUpperCase())}
                  className="clay-input w-12 h-12 text-center text-lg font-bold"
                />
                {isMedeco && (
                  <div className="flex gap-1">
                    <button 
                      onClick={() => updateBitting(idx, `${depth}L`)} 
                      className={`text-[10px] px-1 rounded ${angle === 'L' ? 'bg-primary text-white' : 'bg-surface border border-border'}`}
                    >L</button>
                    <button 
                      onClick={() => updateBitting(idx, `${depth}C`)} 
                      className={`text-[10px] px-1 rounded ${angle === 'C' ? 'bg-primary text-white' : 'bg-surface border border-border'}`}
                    >C</button>
                    <button 
                      onClick={() => updateBitting(idx, `${depth}R`)} 
                      className={`text-[10px] px-1 rounded ${angle === 'R' ? 'bg-primary text-white' : 'bg-surface border border-border'}`}
                    >R</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {currentProfile.secondaryPositions ? (
        <>
          <label className="text-xs text-muted-foreground font-semibold px-2">{t.editor.lowerTrack}</label>
          <div className="flex justify-between gap-2 overflow-x-auto pb-2">
            {(currentProfile.secondaryBitting || []).map((val, idx) => {
              const valStr = val.toString();
              return (
                <div key={`sec-${idx}`} className="flex flex-col items-center gap-2 shrink-0">
                  <label className="text-xs text-muted-foreground font-mono">{idx + 1}</label>
                  <div className="flex flex-col gap-1 items-center">
                    <input
                      type="text"
                      maxLength={1}
                      value={valStr}
                      onChange={(e) => useEditorStore.getState().updateSecondaryBitting(idx, e.target.value.toUpperCase())}
                      className="clay-input w-12 h-12 text-center text-lg font-bold"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : null}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold flex justify-between">
          <span>{t.editor.directInput}</span>
          <span className="text-xs text-muted-foreground font-normal">{t.editor.directInputHint} (e.g. 12345/123)</span>
        </label>
        <input 
          type="text" 
          placeholder="Enter cuts..."
          className="clay-input w-full p-3 font-mono text-center tracking-widest text-lg uppercase"
          onChange={(e) => {
            const text = e.target.value.toUpperCase();
            
            // Handle multi-track split
            const tracks = text.split('/');
            
            // Parse Track 1
            if (tracks[0]) {
              const newBitting = [...currentProfile.bitting];
              let changed = false;
              
              if (tracks[0].includes('=')) {
                // Lishi format
                const pairs = tracks[0].split(/[,;\s]+/);
                pairs.forEach(pair => {
                  const [posStr, depthStr] = pair.split('=');
                  const pos = parseInt(posStr) - 1;
                  if (!isNaN(pos) && pos >= 0 && pos < currentProfile.positions && depthStr) {
                    newBitting[pos] = depthStr;
                    changed = true;
                  }
                });
              } else {
                // Direct string format
                const matches = tracks[0].match(/(\d[a-zA-Z]*)/g);
                if (matches) {
                  matches.forEach((block, idx) => {
                    if (idx < currentProfile.positions) {
                      newBitting[idx] = block;
                      changed = true;
                    }
                  });
                }
              }
              
              if (changed) {
                newBitting.forEach((val, idx) => {
                  if (val !== currentProfile.bitting[idx]) {
                    useEditorStore.getState().updateBitting(idx, val);
                  }
                });
              }
            }

            // Parse Track 2
            if (tracks[1] && currentProfile.secondaryPositions) {
              const newSecBitting = [...(currentProfile.secondaryBitting || [])];
              let changedSec = false;
              
              const matches = tracks[1].match(/(\d[a-zA-Z]*)/g);
              if (matches) {
                matches.forEach((block, idx) => {
                  if (idx < currentProfile.secondaryPositions!) {
                    newSecBitting[idx] = block;
                    changedSec = true;
                  }
                });
              }
              
              if (changedSec) {
                newSecBitting.forEach((val, idx) => {
                  if (val !== (currentProfile.secondaryBitting || [])[idx]) {
                    useEditorStore.getState().updateSecondaryBitting(idx, val);
                  }
                });
              }
            }
          }}
        />
      </div>

      {/* Calibration & Optical Decoder Controls */}
      <div className="flex flex-col gap-4 bg-surface/50 p-4 rounded-xl border border-border">
        <div className="flex items-center gap-4">
          <ClayButton 
            variant={physicalMode ? "primary" : "default"} 
            onClick={() => setPhysicalMode(!physicalMode)}
            className="shrink-0 bg-red-500 hover:bg-red-600 text-white"
            style={physicalMode ? {} : { backgroundColor: 'var(--primary)', color: 'white' }}
          >
            {physicalMode ? <Minimize className="w-4 h-4 mr-2" /> : <Maximize className="w-4 h-4 mr-2" />}
            {physicalMode ? t.editor.exitDecoder : t.editor.enterDecoder}
          </ClayButton>
          <span className="text-sm text-muted-foreground flex-1">
            {physicalMode 
              ? t.editor.decoderHintSchematic 
              : t.editor.decoderHintReal}
          </span>
          <label className="clay-button bg-surface border border-border px-3 py-1.5 text-sm cursor-pointer hover:bg-background">
            {t.editor.uploadImage}
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>
        
        {physicalMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase text-muted-foreground">{t.editor.schematicCalibration}</h4>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold w-24">{t.editor.scale}</span>
                <input 
                  type="range" min="50" max="400" step="5"
                  value={scale} onChange={(e) => setScale(parseInt(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="text-xs font-mono w-10 text-right">{scale}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold w-20">{t.editor.firstPin}</span>
                <button onClick={() => setFirstPinOffset(Math.max(0, firstPinOffset - 0.5))} className="px-2 py-1 bg-surface border rounded">-</button>
                <input 
                  type="range" min="0" max="200" step="0.1"
                  value={firstPinOffset} onChange={(e) => setFirstPinOffset(parseFloat(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <button onClick={() => setFirstPinOffset(Math.min(200, firstPinOffset + 0.5))} className="px-2 py-1 bg-surface border rounded">+</button>
                <span className="text-xs font-mono w-8 text-right">{firstPinOffset.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold w-20">{t.editor.pinSpacing}</span>
                <button onClick={() => setPinSpacing(Math.max(10, pinSpacing - 0.5))} className="px-2 py-1 bg-surface border rounded">-</button>
                <input 
                  type="range" min="10" max="150" step="0.1"
                  value={pinSpacing} onChange={(e) => setPinSpacing(parseFloat(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <button onClick={() => setPinSpacing(Math.min(150, pinSpacing + 0.5))} className="px-2 py-1 bg-surface border rounded">+</button>
                <span className="text-xs font-mono w-8 text-right">{pinSpacing.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold w-20">Depth Span</span>
                <button onClick={() => setDepthSpan(Math.max(10, depthSpan - 1))} className="px-2 py-1 bg-surface border rounded">-</button>
                <input 
                  type="range" min="10" max="100" step="1"
                  value={depthSpan} onChange={(e) => setDepthSpan(parseInt(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <button onClick={() => setDepthSpan(Math.min(100, depthSpan + 1))} className="px-2 py-1 bg-surface border rounded">+</button>
                <span className="text-xs font-mono w-8 text-right">{depthSpan}</span>
              </div>
            </div>
            
            {bgImage && (
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold uppercase text-muted-foreground">{t.editor.imageAlignment}</h4>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold w-16">{t.editor.zoom}</span>
                  <input 
                    type="range" min="1" max="1000" step="1"
                    value={bgScale} onChange={(e) => setBgScale(parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-xs font-mono w-8 text-right">{bgScale}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold w-16">{t.editor.panX}</span>
                  <input 
                    type="range" min="-1500" max="1500" step="1"
                    value={bgPanX} onChange={(e) => setBgPanX(parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-xs font-mono w-8 text-right">{bgPanX}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold w-16">{t.editor.panY}</span>
                  <input 
                    type="range" min="-1500" max="1500" step="1"
                    value={bgPanY} onChange={(e) => setBgPanY(parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-xs font-mono w-8 text-right">{bgPanY}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold w-16">{t.editor.rotate}</span>
                  <input 
                    type="range" min="-180" max="180" step="1"
                    value={bgRotate} onChange={(e) => setBgRotate(parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-xs font-mono w-8 text-right">{bgRotate}°</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold w-16">{t.editor.opacity}</span>
                  <input 
                    type="range" min="0" max="100" step="1"
                    value={bgOpacity} onChange={(e) => setBgOpacity(parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-xs font-mono w-8 text-right">{bgOpacity}%</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Settings Bar */}
      {physicalMode && (
        <div className="flex items-center gap-4 mt-2 p-2 bg-surface/50 rounded-lg border border-border">
          <label className="text-xs font-bold uppercase whitespace-nowrap">PIN COUNT:</label>
          <div className="flex gap-2">
            {[4, 5, 6, 7].map(num => (
              <button 
                key={num}
                onClick={() => useEditorStore.getState().updateProfileMeta({ positions: num, outline: `${num}-pin` })}
                className={`w-8 h-8 rounded text-sm font-bold ${currentProfile.positions === num ? 'bg-primary text-white' : 'bg-background border'}`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SVG Container */}
      <div 
        className={`relative w-full rounded-xl border shadow-inner overflow-auto transition-colors ${physicalMode ? 'bg-[#e0f7fa] border-[#b2ebf2]' : 'bg-background/50 border-border'}`} 
        style={{ height: physicalMode ? '70vh' : '250px', touchAction: physicalMode ? 'pan-x pan-y' : 'none' }}
      >
        <div 
          className="flex items-center min-w-full min-h-full origin-top-left"
          style={{ 
            padding: physicalMode ? '100px 50px' : '20px',
            justifyContent: physicalMode ? 'flex-start' : 'center'
          }}
        >
          <svg 
            ref={svgRef} 
            viewBox="0 0 500 150" 
            preserveAspectRatio="xMidYMid meet"
            className="relative z-10" 
            style={{ 
              width: physicalMode ? `${500 * (scale / 100)}px` : '100%', 
              height: physicalMode ? `${150 * (scale / 100)}px` : 'auto',
              maxWidth: physicalMode ? 'none' : '280px',
              transition: 'width 0.2s, max-width 0.2s, height 0.2s',
              overflow: physicalMode ? 'visible' : 'hidden',
              filter: physicalMode ? 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))' : 'drop-shadow(0px 10px 15px rgba(0,0,0,0.3))'
            }}
            fillRule="evenodd"
          >
            {/* Background Image Layer */}
            {bgImage && physicalMode && (
              <g 
                style={{ 
                  transform: `translate(${bgPanX}px, ${bgPanY}px) scale(${bgScale/100}) rotate(${bgRotate}deg)`,
                  transformOrigin: '250px 75px',
                  opacity: bgOpacity / 100,
                  transition: 'transform 0.1s, opacity 0.1s'
                }}
              >
                <image 
                  href={bgImage} 
                  x="-500" y="-500" 
                  width="1500" height="1150" 
                  preserveAspectRatio="xMidYMid slice" 
                />
              </g>
            )}

            {/* RENDER THE KEY */}
            {physicalMode ? (
              // DECODER SCHEMATIC VIEW
              <g className="pointer-events-none">
                {/* White backdrop for backlight contrast - ONLY when not using a photo */}
                {!bgImage && <rect x="-500" y="-500" width="1500" height="1150" fill="white" className="opacity-100" />}
                
                {/* Simple Blade Rectangle - Transparent with dashed borders */}
                <path 
                  d="M 50,50 L 480,50 Q 490,60 490,75 Q 490,100 480,100 L 50,100 Z" 
                  className="fill-transparent stroke-black dark:stroke-black" 
                  strokeWidth="2" 
                  strokeDasharray="4 4"
                />
                
                {/* Shoulder Alignment Line - Extends globally */}
                <line x1="50" y1="-100" x2="50" y2="300" stroke="#ef4444" strokeWidth="3" className="drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                <text x="50" y="-20" fill="#ef4444" fontSize="16" fontWeight="bold" textAnchor="middle">SHOULDER</text>
              </g>
            ) : (
              <g className="pointer-events-none" style={{ filter: physicalMode ? 'drop-shadow(0 0 10px rgba(14,165,233,0.5))' : 'none' }}>
                <KeyVisual profile={currentProfile} />
              </g>
            )}

            {/* Interactive Columns & Points */}
            {currentProfile.bitting.map((val, idx) => {
              let cx = 0;
              if (physicalMode) {
                cx = 50 + firstPinOffset + (idx * pinSpacing) + (xOffsets[idx] || 0);
              } else {
                const startX = 160;
                const endX = 430;
                const standardSpacing = positions > 1 ? (endX - startX) / (positions - 1) : 0;
                cx = startX + idx * standardSpacing;
              }
              
              const valStr = val?.toString() || "0";
              const parsedVal = parseInt(valStr.replace(/\D/g, '')) || 0;
              const angleStr = valStr.replace(/[^a-zA-Z]/g, '').toUpperCase();
              
              const cy = 50 + (parsedVal / 9) * depthSpan;
              
              return (
                <g key={`pin-${idx}`}>
                  {/* Invisible Drag Column for flawless touch (no finger blocking) */}
                  <rect
                    x={cx - (physicalMode ? pinSpacing / 2 : 15)}
                    y={physicalMode ? -50 : 0}
                    width={physicalMode ? pinSpacing : 30}
                    height={physicalMode ? 250 : 150}
                    fill="transparent"
                    className="cursor-pointer touch-none pointer-events-auto"
                    onPointerDown={(e) => handlePointerDown(e, idx)}
                    onPointerMove={(e) => handlePointerMove(e, idx)}
                  />

                  {/* Vertical Guide Line */}
                  {physicalMode ? (
                    <line 
                      x1={cx} y1="0" x2={cx} y2="150"
                      stroke="#0ea5e9" strokeWidth="1"
                      className="opacity-40 pointer-events-none"
                      strokeDasharray="2 4"
                    />
                  ) : (
                    !isDimple && (
                      <line 
                        x1={cx} y1="30" x2={cx} y2="120"
                        stroke="var(--primary)" strokeWidth="1"
                        className="opacity-30 pointer-events-none"
                        strokeDasharray="2 4"
                      />
                    )
                  )}

                  {/* Tick marks for angled cuts */}
                  {angleStr === 'L' && (
                    <line x1={cx - 5} y1={cy + 5} x2={cx + 5} y2={cy - 5} stroke={physicalMode ? "black" : "currentColor"} strokeWidth="2" className="pointer-events-none" />
                  )}
                  {angleStr === 'R' && (
                    <line x1={cx - 5} y1={cy - 5} x2={cx + 5} y2={cy + 5} stroke={physicalMode ? "black" : "currentColor"} strokeWidth="2" className="pointer-events-none" />
                  )}
                  {(!angleStr || angleStr === 'C') && (
                    <line x1={cx - 5} y1={cy} x2={cx + 5} y2={cy} stroke={physicalMode ? "black" : "currentColor"} strokeWidth="2" className="pointer-events-none" />
                  )}
                  
                  {/* The Target Dot */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={physicalMode ? 6 : 8}
                    className={`pointer-events-none ${physicalMode ? 'fill-[#0ea5e9] stroke-white drop-shadow-[0_0_3px_rgba(0,0,0,0.8)]' : 'fill-background stroke-primary drop-shadow-[0_0_8px_rgba(14,165,233,0.8)]'}`}
                    strokeWidth={physicalMode ? "2" : "3"}
                  />
                  
                  {/* Up/Down Tap Buttons for Physical Mode */}
                  {physicalMode && (
                    <g className="cursor-pointer" onClick={(e) => {
                      e.stopPropagation();
                      const newVal = Math.max(0, parsedVal - 1);
                      useEditorStore.getState().updateBitting(idx, newVal.toString());
                    }}>
                      <rect x={cx - 15} y={-30} width={30} height={30} fill="transparent" />
                      <path d={`M ${cx - 8} ${-10} L ${cx} ${-18} L ${cx + 8} ${-10}`} fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  )}
                  {physicalMode && (
                    <g className="cursor-pointer" onClick={(e) => {
                      e.stopPropagation();
                      const newVal = Math.min(9, parsedVal + 1);
                      useEditorStore.getState().updateBitting(idx, newVal.toString());
                    }}>
                      <rect x={cx - 15} y={110} width={30} height={30} fill="transparent" />
                      <path d={`M ${cx - 8} ${120} L ${cx} ${128} L ${cx + 8} ${120}`} fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  )}
                </g>
              );
            })}

            {/* Secondary Interactive Points */}
            {(currentProfile.secondaryBitting || []).map((val, idx) => {
              let cx = 0;
              if (physicalMode) {
                cx = 50 + firstPinOffset + (idx * pinSpacing);
              } else {
                const startX = 160;
                const endX = 430;
                const standardSpacing = currentProfile.secondaryPositions && currentProfile.secondaryPositions > 1 
                  ? (endX - startX) / (currentProfile.secondaryPositions - 1) : 0;
                cx = startX + idx * standardSpacing;
              }
              
              const valStr = val?.toString() || "0";
              const parsedVal = parseInt(valStr.replace(/\D/g, '')) || 0;
              const cy = 80 + (parsedVal / 9) * 35;
              
              return (
                <g key={`sec-pt-${idx}`}>
                  {physicalMode ? (
                    <rect
                      x={cx - (pinSpacing / 2)}
                      y="100"
                      width={pinSpacing}
                      height="150"
                      fill="transparent"
                      className="cursor-pointer touch-none pointer-events-auto"
                      onPointerDown={(e) => {
                        (e.target as Element).setPointerCapture(e.pointerId);
                        const rect = svgRef.current?.getBoundingClientRect();
                        if(!rect) return;
                        const y = e.clientY - rect.top;
                        const svgY = (y / rect.height) * 150;
                        const mappedValue = Math.round(((svgY - 80) / 35) * 9);
                        const validValue = Math.max(0, Math.min(9, mappedValue));
                        useEditorStore.getState().updateSecondaryBitting(idx, validValue.toString());
                      }}
                      onPointerMove={(e) => {
                        if (e.buttons !== 1) return;
                        const rect = svgRef.current?.getBoundingClientRect();
                        if(!rect) return;
                        const y = e.clientY - rect.top;
                        const svgY = (y / rect.height) * 150;
                        const mappedValue = Math.round(((svgY - 80) / 35) * 9);
                        const validValue = Math.max(0, Math.min(9, mappedValue));
                        useEditorStore.getState().updateSecondaryBitting(idx, validValue.toString());
                      }}
                    />
                  ) : (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={20}
                      fill="transparent"
                      className="cursor-pointer touch-none pointer-events-auto"
                      onPointerDown={(e) => {
                        (e.target as Element).setPointerCapture(e.pointerId);
                        const rect = svgRef.current?.getBoundingClientRect();
                        if(!rect) return;
                        const y = e.clientY - rect.top;
                        const svgY = (y / rect.height) * 150;
                        const mappedValue = Math.round(((svgY - 80) / 35) * 9);
                        const validValue = Math.max(0, Math.min(9, mappedValue));
                        useEditorStore.getState().updateSecondaryBitting(idx, validValue.toString());
                      }}
                      onPointerMove={(e) => {
                        if (e.buttons !== 1) return;
                        const rect = svgRef.current?.getBoundingClientRect();
                        if(!rect) return;
                        const y = e.clientY - rect.top;
                        const svgY = (y / rect.height) * 150;
                        const mappedValue = Math.round(((svgY - 80) / 35) * 9);
                        const validValue = Math.max(0, Math.min(9, mappedValue));
                        useEditorStore.getState().updateSecondaryBitting(idx, validValue.toString());
                      }}
                    />
                  )}
                  
                  <circle
                    cx={cx}
                    cy={cy}
                    r={physicalMode ? 5 : 8}
                    className={`pointer-events-none ${physicalMode ? 'fill-[#f97316] stroke-white drop-shadow-[0_0_3px_rgba(0,0,0,0.8)]' : 'fill-background stroke-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]'}`}
                    strokeWidth={physicalMode ? "2" : "3"}
                  />
                </g>
              );
            })}
          </svg>

          {/* PiP Live Preview inside Bitting Editor for immediate feedback */}
          {physicalMode && (
            <div className="absolute bottom-4 right-4 w-[250px] bg-white border-2 border-black rounded shadow-2xl overflow-hidden pointer-events-none flex flex-col">
               <div className="bg-black text-white text-[10px] font-bold px-2 py-1 flex justify-between">
                 <span>PREVIEW</span>
                 <span className="text-blue-300">{currentProfile.type || 'Schlage Classic'}</span>
               </div>
               <div className="h-[75px] w-full flex items-center justify-center">
                 <svg viewBox="0 0 500 150" className="w-full h-full drop-shadow-md">
                    <KeyVisual profile={currentProfile} />
                 </svg>
               </div>
            </div>
          )}
        </div>
        
        {/* Direct Bitting Input */}
        <div className="flex items-center gap-4 mt-2 p-3 bg-background rounded-lg border border-border shadow-inner">
          <label className="text-sm font-bold whitespace-nowrap">{t.editor.directInput}:</label>
          <input
            type="text"
            className="flex-1 bg-surface border border-border rounded p-2 font-mono text-lg tracking-widest uppercase"
            placeholder="e.g. 52341"
            value={currentProfile.bitting.join('')}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              // Parse out numbers and optional L/R/C angle codes
              // A simple regex approach to split into valid pins
              // For a simple code like "52341", this will update the store directly.
              const parts = val.match(/\d[LRC]?/g) || val.split('');
              parts.forEach((p, i) => {
                if (i < (currentProfile.positions || 5)) {
                  useEditorStore.getState().updateBitting(i, p);
                }
              });
            }}
          />
          <span className="text-xs text-muted-foreground whitespace-nowrap">Auto-snaps dots!</span>
        </div>
      </div>
    </ClayCard>
  );
}
