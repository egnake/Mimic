import { KeyProfile } from "@/types";

export interface ExportAdapter {
  id: string;
  name: string;
  export: (profile: KeyProfile) => string;
}

export const jsonExportAdapter: ExportAdapter = {
  id: "json",
  name: "JSON",
  export: (profile) => {
    return JSON.stringify({
      version: 1,
      name: profile.name,
      family: profile.family,
      type: profile.type,
      positions: profile.positions,
      bitting: profile.bitting,
      metadata: profile.metadata,
      notes: profile.notes,
      tags: profile.tags
    }, null, 2);
  }
};

export const csvExportAdapter: ExportAdapter = {
  id: "csv",
  name: "CSV",
  export: (profile) => {
    return profile.bitting.join(",");
  }
};

export const spaceExportAdapter: ExportAdapter = {
  id: "space",
  name: "Space Separated",
  export: (profile) => {
    return profile.bitting.join(" ");
  }
};

export const plainExportAdapter: ExportAdapter = {
  id: "plain",
  name: "Plain Text",
  export: (profile) => {
    return profile.bitting.join("");
  }
};

export const exportAdapters = [
  jsonExportAdapter,
  csvExportAdapter,
  spaceExportAdapter,
  plainExportAdapter
];

export function downloadStringAsFile(data: string, filename: string, mimeType: string) {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
