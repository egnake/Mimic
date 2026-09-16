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
      self.postMessage({ 
        id, 
        ok: true, 
        positions: posBuf, 
        normals: normBuf, 
        triangleCount: r.triangleCount 
      }, [posBuf, normBuf]);
    } else {
      self.postMessage({ id, ok: false, error: r.error || 'Failed to render', diagnostics: r.diagnostics });
    }
  } catch (err: unknown) {
    self.postMessage({ id, ok: false, error: err instanceof Error ? err.message : String(err) });
  }
};
