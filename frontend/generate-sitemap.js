// generate-sitemap.js
import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

// ✅ All public routes
const links = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/login', changefreq: 'monthly', priority: 0.6 },
  { url: '/signup', changefreq: 'monthly', priority: 0.6 },
  { url: '/contact', changefreq: 'monthly', priority: 0.7 },
  { url: '/terms', changefreq: 'yearly', priority: 0.4 },
  { url: '/privacy', changefreq: 'yearly', priority: 0.4 },
  { url: '/compatibilityform', changefreq: 'monthly', priority: 0.8 },
  { url: '/profileform', changefreq: 'weekly', priority: 0.8 },
];

// ❌ Skipping dynamic/private pages: dashboard, chat, profile, view-profile

// ✅ Output path: public/ folder
const sitemapPath = resolve('./public/sitemap.xml');

// Ensure public folder exists
const publicDir = resolve('./public');
if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

// Create sitemap stream
const sitemap = new SitemapStream({ hostname: 'https://www.amoraonline.in' });

// Pipe to file
const writeStream = createWriteStream(sitemapPath);
sitemap.pipe(writeStream);

// Add links
links.forEach(link => sitemap.write(link));
sitemap.end();

// Wait until file is fully written
streamToPromise(sitemap)
  .then(() => console.log(`✅ Sitemap successfully created at ${sitemapPath}`))
  .catch(err => console.error('❌ Error creating sitemap:', err));
