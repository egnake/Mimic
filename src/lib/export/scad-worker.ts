import { render } from "openrscad-engine";

self.onmessage = async (e: MessageEvent) => {
  const { id, scadString } = e.data;
  
  try {
    const r = await render(scadString);
    if (r.ok) {
      if (!r.positions || !r.normals) {
        self.postMessage({ id, ok: false, error: 'Engine returned ok but missing positions/normals (maybe 2D?)' });
        return;
      }
      const posBuf = r.positions.buffer;
      const normBuf = r.normals.buffer;
      // Cast to any to avoid TS treating 'self' as a Window object
      (self.postMessage as any)({ 
        id, 
        ok: true, 
        positions: posBuf, 
        normals: normBuf, 
        triangleCount: r.triangleCount 
      }, [posBuf, normBuf]);
    } else {
      console.error("SCAD Render Failed:", r.error);
      self.postMessage({ id, ok: false, error: r.error || 'Failed to render', diagnostics: r.diagnostics });
    }
  } catch (err: unknown) {
    console.error("Worker catch error:", err);
    self.postMessage({ 
      id, 
      ok: false, 
      error: err instanceof Error ? err.message : String(err)
    });
  }
};
