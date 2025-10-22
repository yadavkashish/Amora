// generate-sitemap.js
import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import { resolve } from 'path';

const links = [
  // ✅ Public pages
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/login', changefreq: 'monthly', priority: 0.6 },
  { url: '/signup', changefreq: 'monthly', priority: 0.6 },
  { url: '/contact', changefreq: 'monthly', priority: 0.7 },
  { url: '/terms', changefreq: 'yearly', priority: 0.4 },
  { url: '/privacy', changefreq: 'yearly', priority: 0.4 },
  { url: '/compatibilityform', changefreq: 'monthly', priority: 0.8 },
  { url: '/profileform', changefreq: 'weekly', priority: 0.8 },

  // ⚠️ Optional: If you want these indexed
  // { url: '/view-profile/:userId', changefreq: 'weekly', priority: 0.7 }, // skip dynamic
  // { url: '/chat/:userId', changefreq: 'daily', priority: 0.7 }, // skip dynamic

  // ❌ Do NOT include: /dashboard, /chat, /view-profile, /profile
  // Those are user-specific or private pages, so better not to index
];

const sitemap = new SitemapStream({ hostname: 'https://www.amoraonline.in' });
const pathToSitemap = resolve('./dist/sitemap.xml'); // output in build folder

streamToPromise(sitemap)
  .then(() => console.log('✅ Sitemap created successfully!'))
  .catch((err) => console.error('❌ Error creating sitemap:', err));

sitemap.pipe(createWriteStream(pathToSitemap));
links.forEach(link => sitemap.write(link));
sitemap.end();
