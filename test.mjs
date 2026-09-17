import { render } from "openrscad-engine";
import fs from "fs";

async function run() {
  const scad = fs.readFileSync('test.scad', 'utf8');
  const r = await render(scad);
  if (!r.ok) {
    console.error(r.error);
    return;
  }
  const p = r.positions;
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  for (let i = 0; i < p.length; i += 3) {
    minX = Math.min(minX, p[i]); maxX = Math.max(maxX, p[i]);
    minY = Math.min(minY, p[i+1]); maxY = Math.max(maxY, p[i+1]);
    minZ = Math.min(minZ, p[i+2]); maxZ = Math.max(maxZ, p[i+2]);
  }
  console.log(`Bounds: X:[${minX.toFixed(2)}, ${maxX.toFixed(2)}] Y:[${minY.toFixed(2)}, ${maxY.toFixed(2)}] Z:[${minZ.toFixed(2)}, ${maxZ.toFixed(2)}]`);
}

run();
