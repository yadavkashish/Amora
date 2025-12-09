// scripts/inject-css.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dist = path.resolve(__dirname, "../dist");

// candidate manifest locations for Vite 7+ and other variants
const manifestCandidates = [
  path.join(dist, "manifest.json"),
  path.join(dist, ".vite", "manifest.json"),
  path.join(dist, ".vite", ".vite-manifest.json"),
];

let manifestPath = manifestCandidates.find((p) => fs.existsSync(p));
if (!manifestPath) {
  console.error(
    "manifest.json not found — make sure you ran `vite build` with `build.manifest: true`"
  );
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

// helper: normalize hrefs so they become '/assets/...' or '/...'
function normalizeHref(candidate) {
  if (!candidate) return null;
  if (candidate.startsWith("/")) return candidate;
  if (candidate.startsWith("assets/")) return "/" + candidate;
  return "/assets/" + candidate;
}

// 1) find a CSS file to preload (first referenced CSS in manifest)
let cssHref = null;
for (const [, entry] of Object.entries(manifest)) {
  if (entry.css && entry.css.length) {
    cssHref = normalizeHref(entry.css[0]);
    break;
  }
  if (entry.file && entry.file.endsWith(".css")) {
    cssHref = normalizeHref(entry.file);
    break;
  }
  if (entry.assets) {
    const cssAsset = entry.assets.find((a) => a.endsWith(".css"));
    if (cssAsset) {
      cssHref = normalizeHref(cssAsset);
      break;
    }
  }
}

// 2) gather modulepreload JS entries (entry chunks)
const modulePreloadHrefs = new Set();
for (const [, entry] of Object.entries(manifest)) {
  // many manifests include `isEntry` for real entry modules; fallback to files ending with .js
  if (entry.isEntry || (entry.file && entry.file.endsWith(".js"))) {
    const file = entry.file || null;
    if (file) modulePreloadHrefs.add(normalizeHref(file));
  }
}

// 3) optional preconnects (edit this list to match your critical origins; keep <=4)
const PRECONNECT_ORIGINS = [
  "https://images.unsplash.com",
  "https://res.cloudinary.com",
  "https://static.sketchfab.com",
  "https://amora-mx7x.onrender.com",
].filter(Boolean);

// Read and patch dist/index.html
const indexHtmlPath = path.join(dist, "index.html");
if (!fs.existsSync(indexHtmlPath)) {
  console.error("dist/index.html not found — run `vite build` first");
  process.exit(1);
}

let html = fs.readFileSync(indexHtmlPath, "utf8");

// Build snippet: preconnects -> modulepreloads -> css preload + noscript
let preconnectSnippet = "";
if (PRECONNECT_ORIGINS.length) {
  preconnectSnippet = PRECONNECT_ORIGINS.map(
    (origin) => `<link rel="preconnect" href="${origin}" crossorigin>`
  ).join("\n") + "\n";
}

// modulepreload snippet
let modulePreloadSnippet = Array.from(modulePreloadHrefs)
  .map((href) => `<link rel="modulepreload" href="${href}">`)
  .join("\n");
if (modulePreloadSnippet) modulePreloadSnippet += "\n";

// css preload + noscript
let cssSnippet = "";
if (cssHref) {
  cssSnippet =
    `<link rel="preload" href="${cssHref}" as="style" onload="this.rel='stylesheet'" onerror="this.rel='stylesheet'">\n` +
    `<noscript><link rel="stylesheet" href="${cssHref}"></noscript>\n`;
}

// Combine snippets (preconnects first, then modulepreload + css)
const fullSnippet = `${preconnectSnippet}${modulePreloadSnippet}${cssSnippet}`.trim();

// Insert into placeholder if present, otherwise before </head>
if (html.includes("<!-- CSS_PRELOAD_PLACEHOLDER -->")) {
  html = html.replace("<!-- CSS_PRELOAD_PLACEHOLDER -->", fullSnippet);
} else {
  html = html.replace("</head>", `${fullSnippet}\n</head>`);
}

fs.writeFileSync(indexHtmlPath, html, "utf8");
console.log("Injected preconnects/modulepreload/css:", {
  css: cssHref,
  modulepreloads: Array.from(modulePreloadHrefs),
  preconnects: PRECONNECT_ORIGINS,
});
