import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const origin = "https://sitronics-kt.ru/local/templates/sitronics/assets/images";
const assets = [
  ["public/images/hero-ecosystem.jpg", `${origin}/ecosystem/background.jpg`, "063dbb016a058affbb1b4f780b3576f17e1a232861d97cd855c21cc10951f96f"],
  ["public/images/products/ais-t104.jpg", `${origin}/onshore/block-4-1.jpg`, "a8a490e10d2ef09fa113989e2cfcbfa5e1bfe719bd84a25fee551949ba1a1da6"],
  ["public/images/products/ais-t300.jpg", `${origin}/onshore/block-4-2.jpg`, "dba945ae649bda9f56f5895bedd4619a277279854dac872e55648842be52a0f6"],
  ["public/images/products/ais-t600.jpg", `${origin}/onshore/block-4-3.jpg", "d6003ab576897b7d3df5e14a373c81955285dd7bad9a11fc6f7776201141c549"],
  ["public/images/products/civ-t500.jpg", `${origin}/onshore/block-4-4.jpg`, "87373b6e4ac7dac2f94ece53bf40b8b7744c50c94936c4fc7fe1933a60efdcb7"],
  ["public/images/products/control-station.jpg", `${origin}/onshore-equipment/block-3-1.jpg`, "4cfa037710d099a48dd53678fa473de510e3024babe5df5eafe9ef2dc4ddd19c"],
  ["public/images/products/crane-simulator.jpg", `${origin}/sim/block-3-1.jpg`, "4d6f466593ba237339594e36843e75cf68b22db3f46aa1b8e95a2de12a6e5492"],
  ["public/images/products/ksu-ts.jpg", `${origin}/onshore/block-5-1.jpg`, "8247d76e96080dac8f61d595b0f6ecdf5bb5035f132c1083481922f335c8f1df"],
  ["public/images/products/mostik-2000.jpg", `${origin}/sim/block-3-7.jpg`, "6207388cd27eb9a01f584cc7e738b23907d6a0e9844b50f42f4a36b88aebe104"],
];

const digest = (data) => createHash("sha256").update(data).digest("hex");

for (const [relativePath, url, expectedHash] of assets) {
  const destination = path.join(root, relativePath);
  try {
    if (digest(await readFile(destination)) === expectedHash) continue;
  } catch {}
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`Не удалось загрузить ${url}: HTTP ${response.status}`);
  const data = Buffer.from(await response.arrayBuffer());
  if (digest(data) !== expectedHash) throw new Error(`Контрольная сумма не совпала: ${url}`);
  await mkdir(path.dirname(destination), { recursive: true });
  const temporary = `${destination}.tmp`;
  await writeFile(temporary, data);
  await rename(temporary, destination);
  console.log(`Загружен фирменный ресурс: ${relativePath}`);
}
