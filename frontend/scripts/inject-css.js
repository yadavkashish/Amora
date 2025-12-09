// scripts/inject-css.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dist = path.resolve(__dirname, "../dist");

// possible manifest locations (v7 may emit .vite/manifest.json)
const manifestCandidates = [
  path.join(dist, "manifest.json"),
  path.join(dist, ".vite", "manifest.json"),
  path.join(dist, ".vite", ".vite-manifest.json"),
];

let manifestPath = manifestCandidates.find((p) => fs.existsSync(p));
if (!manifestPath) {
  console.error(
    "manifest.json not found — make sure you ran vite build with `build.manifest: true`"
  );
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

// Helper to normalize the href so we don't end up with "/assets/assets/..."
function normalizeCssHref(candidate) {
  if (!candidate) return null;
  // if already absolute (/...), return as-is
  if (candidate.startsWith("/")) return candidate;
  // if candidate already starts with "assets/", prefix single leading slash
  if (candidate.startsWith("assets/")) return "/" + candidate;
  // otherwise assume it's a filename like "index-abc.css" -> put under /assets/
  return "/assets/" + candidate;
}

// Find first CSS asset referenced in the manifest values
let cssHref = null;
for (const [, entry] of Object.entries(manifest)) {
  if (entry.css && entry.css.length) {
    cssHref = normalizeCssHref(entry.css[0]);
    break;
  }
  if (entry.file && entry.file.endsWith(".css")) {
    cssHref = normalizeCssHref(entry.file);
    break;
  }
  if (entry.assets) {
    const cssAsset = entry.assets.find((a) => a.endsWith(".css"));
    if (cssAsset) {
      cssHref = normalizeCssHref(cssAsset);
      break;
    }
  }
}

if (!cssHref) {
  console.error("Could not find CSS in manifest.json");
  process.exit(1);
}

const indexHtmlPath = path.join(dist, "index.html");
if (!fs.existsSync(indexHtmlPath)) {
  console.error("dist/index.html not found — run vite build first");
  process.exit(1);
}

let html = fs.readFileSync(indexHtmlPath, "utf8");

// Build the preload snippet (with noscript fallback + onerror)
const snippet =
  `<link rel="preload" href="${cssHref}" as="style" onload="this.rel='stylesheet'" onerror="this.rel='stylesheet'">\n` +
  `<noscript><link rel="stylesheet" href="${cssHref}"></noscript>`;

// Replace placeholder (falls back to inserting snippet if placeholder missing)
if (html.includes("<!-- CSS_PRELOAD_PLACEHOLDER -->")) {
  html = html.replace("<!-- CSS_PRELOAD_PLACEHOLDER -->", snippet);
} else {
  // fallback: try to insert before closing </head>
  html = html.replace("</head>", `${snippet}\n</head>`);
}

fs.writeFileSync(indexHtmlPath, html, "utf8");
console.log("Injected CSS preload:", cssHref);
