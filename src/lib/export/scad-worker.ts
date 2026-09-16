import { render } from "openrscad-engine";

self.onmessage = async (e: MessageEvent) => {
  const { id, scadString } = e.data;
  
  try {
    const r = await render(scadString);
    if (r.ok) {
      // Create copies of the buffers if transfer fails, but usually Next.js worker loader handles it.
      self.postMessage({ 
        id, 
        ok: true, 
        positions: r.positions, 
        normals: r.normals, 
        triangleCount: r.triangleCount 
      });
    } else {
      self.postMessage({ id, ok: false, error: r.error, diagnostics: r.diagnostics });
    }
  } catch (err: unknown) {
    self.postMessage({ id, ok: false, error: err instanceof Error ? err.message : String(err) });
  }
};
