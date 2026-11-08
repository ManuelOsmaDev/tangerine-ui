// Construye la web de Tangerine UI en sitio/dist.
// Copia los componentes y el CSS del paquete para que la web use exactamente lo que se publica.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const sitio = path.join(raiz, "sitio");
fs.copyFileSync(path.join(raiz, "src", "index.tng"), path.join(sitio, "src", "ui.tng"));
fs.copyFileSync(path.join(raiz, "css", "tangerine-ui.css"), path.join(sitio, "ui.css"));

// El CLI de Tangerine: TANGERINE_LANG, el paquete instalado o la carpeta vecina.
function cli() {
  if (process.env.TANGERINE_LANG) return path.join(process.env.TANGERINE_LANG, "bin", "tangerine.js");
  try {
    const req = createRequire(import.meta.url);
    return path.join(path.dirname(req.resolve("tangerine-lang/package.json")), "bin", "tangerine.js");
  } catch {
    return path.join(raiz, "..", "tangerine-lang", "bin", "tangerine.js");
  }
}

const r = spawnSync(process.execPath, [cli(), "build"], { cwd: sitio, stdio: "inherit" });
if (r.status !== 0) process.exit(r.status ?? 1);
fs.copyFileSync(path.join(sitio, "logo.svg"), path.join(sitio, "dist", "logo.svg"));
fs.writeFileSync(path.join(sitio, "dist", ".nojekyll"), "");
console.log("Web lista en sitio/dist");
