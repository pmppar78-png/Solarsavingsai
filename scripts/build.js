const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const DIST_DIR = path.join(ROOT, 'dist');
const SITE_URL = 'https://solarsavingsai.com';
const BUILD_ID = process.env.BUILD_ID || String(Date.now());
process.env.BUILD_ID = BUILD_ID;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writePage(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}

function loadJSON(filename) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, filename), 'utf-8'));
}

function loadJSONSafe(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return [];
}

// ---------------------------------------------------------------------------
// Load data
// ---------------------------------------------------------------------------
console.log('Loading data...');
const states = loadJSON('states.json');
const utilities = loadJSON('utilities.json');
const cities = loadJSON('cities.json');
const financing = loadJSON('financing.json');
const glossary = loadJSON('glossary.json');
const alerts = loadJSON('alerts.json');
const comparisons = loadJSONSafe('comparisons.json');
const rawPillarPages = loadJSONSafe('pillar-pages.json');
const pillarPages = rawPillarPages.map((pillar) => ({
  ...pillar,
  description: pillar.description || pillar.meta_description || pillar.intro || '',
  category: pillar.category || pillar.hub || 'Solar Guide'
}));
const rawBrandReviews = loadJSONSafe('brand-reviews.json');
const brandReviews = rawBrandReviews.map((review) => ({
  ...review,
  brand: review.brand || review.brand_name || review.name || '',
  rating: review.rating != null ? review.rating : review.overall_rating,
  slug: review.slug,
  name: review.name || review.brand_name || review.brand || '',
  overall_rating: review.overall_rating != null ? review.overall_rating : review.rating,
  type: review.type || review.brand_type || 'solar'
}));
const bestOf = loadJSONSafe('best-of.json');
const authors = loadJSONSafe('authors.json');
const stateBestCompanies = loadJSONSafe('state-best-companies.json');

const data = { states, utilities, cities, financing, glossary, alerts };

console.log(`  ${states.length} states`);
console.log(`  ${utilities.length} utilities`);
console.log(`  ${cities.length} cities`);
console.log(`  ${financing.providers ? financing.providers.length : 0} financing providers`);
console.log(`  ${glossary.length} glossary terms`);
console.log(`  ${comparisons.length} comparisons`);
console.log(`  ${pillarPages.length} pillar pages`);
console.log(`  ${brandReviews.length} brand reviews`);
console.log(`  ${bestOf.length} best-of pages`);
console.log(`  ${authors.length} authors`);
console.log(`  ${stateBestCompanies.length} state/city best companies`);

// ---------------------------------------------------------------------------
// Load templates
// ---------------------------------------------------------------------------
const templates = require('./templates');

// ---------------------------------------------------------------------------
// Clean and prepare dist directory
// ---------------------------------------------------------------------------
console.log('\nCleaning dist directory...');
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
ensureDir(DIST_DIR);

// ---------------------------------------------------------------------------
// Copy static assets
// ---------------------------------------------------------------------------
console.log('Copying static assets...');
ensureDir(path.join(DIST_DIR, 'css'));
ensureDir(path.join(DIST_DIR, 'js'));
ensureDir(path.join(DIST_DIR, 'images'));
fs.copyFileSync(path.join(ROOT, 'src', 'css', 'main.css'), path.join(DIST_DIR, 'css', 'main.css'));
fs.copyFileSync(path.join(ROOT, 'src', 'js', 'app.js'), path.join(DIST_DIR, 'js', 'app.js'));
fs.copyFileSync(path.join(ROOT, 'chat.html'), path.join(DIST_DIR, 'chat.html'));
fs.copyFileSync(path.join(ROOT, 'js', 'chat.js'), path.join(DIST_DIR, 'js', 'chat.js'));
fs.copyFileSync(path.join(ROOT, 'src', 'assets', 'favicon.ico'), path.join(DIST_DIR, 'favicon.ico'));
fs.copyFileSync(path.join(ROOT, 'src', 'assets', 'apple-touch-icon.png'), path.join(DIST_DIR, 'apple-touch-icon.png'));
fs.copyFileSync(path.join(ROOT, 'src', 'assets', 'og-image.png'), path.join(DIST_DIR, 'og-image.png'));
fs.copyFileSync(path.join(ROOT, 'src', 'assets', 'manifest.json'), path.join(DIST_DIR, 'manifest.json'));
fs.copyFileSync(path.join(ROOT, 'src', 'assets', 'images', 'logo.svg'), path.join(DIST_DIR, 'images', 'logo.svg'));

// ---------------------------------------------------------------------------
// Generate pages
// ---------------------------------------------------------------------------
let pageCount = 0;

// Homepage
console.log('\nGenerating homepage...');
writePage(path.join(DIST_DIR, 'index.html'), templates.generateHomepage(data));
pageCount++;

// State pages
console.log(`Generating ${states.length} state pages...`);
for (const state of states) {
  const stateData = { states, utilities, cities, alerts };
  const filePath = path.join(DIST_DIR, `solar-rebates-incentives-${state.slug}`, 'index.html');
  writePage(filePath, templates.generateStatePage(state, stateData));
  pageCount++;
}

// Utility pages
console.log(`Generating ${utilities.length} utility pages...`);
for (const utility of utilities) {
  const utilityData = { states, utilities, cities, alerts };
  const filePath = path.join(DIST_DIR, 'utility-rebates', utility.slug, 'index.html');
  writePage(filePath, templates.generateUtilityPage(utility, utilityData));
  pageCount++;
}

// City pages
console.log(`Generating ${cities.length} city pages...`);
for (const city of cities) {
  const cityData = { states, utilities, cities, alerts, financing };
  const slug = `is-solar-worth-it-in-${city.slug}-${city.state_abbrev.toLowerCase()}`;
  const filePath = path.join(DIST_DIR, slug, 'index.html');
  writePage(filePath, templates.generateCityPage(city, cityData));
  pageCount++;
}

// Financing page
console.log('Generating financing page...');
writePage(
  path.join(DIST_DIR, 'solar-financing', 'index.html'),
  templates.generateFinancingPage({ states, financing, alerts })
);
pageCount++;

// Glossary page
console.log('Generating glossary page...');
writePage(
  path.join(DIST_DIR, 'solar-glossary', 'index.html'),
  templates.generateGlossaryPage(glossary)
);
pageCount++;

// Methodology page
console.log('Generating methodology page...');
writePage(
  path.join(DIST_DIR, 'methodology', 'index.html'),
  templates.generateMethodologyPage()
);
pageCount++;

// Editorial standards page
console.log('Generating editorial standards page...');
writePage(
  path.join(DIST_DIR, 'editorial-standards', 'index.html'),
  templates.generateEditorialPage()
);
pageCount++;

// Comparison pages
if (comparisons.length > 0) {
  console.log(`Generating ${comparisons.length} comparison pages...`);
  for (const comparison of comparisons) {
    const filePath = path.join(DIST_DIR, 'compare', comparison.slug, 'index.html');
    writePage(filePath, templates.generateComparisonPage(comparison, comparisons));
    pageCount++;
  }
}

// Pillar / Authority pages
if (pillarPages.length > 0) {
  console.log(`Generating ${pillarPages.length} pillar pages...`);
  for (const pillar of pillarPages) {
    const filePath = path.join(DIST_DIR, 'guide', pillar.slug, 'index.html');
    writePage(filePath, templates.generatePillarPage(pillar, pillarPages));
    pageCount++;
  }
}

// ---------------------------------------------------------------------------
// NEW: About page
// ---------------------------------------------------------------------------
console.log('Generating about page...');
writePage(
  path.join(DIST_DIR, 'about', 'index.html'),
  templates.generateAboutPage(authors)
);
pageCount++;

// ---------------------------------------------------------------------------
// NEW: Contact page
// ---------------------------------------------------------------------------
console.log('Generating contact page...');
writePage(
  path.join(DIST_DIR, 'contact', 'index.html'),
  templates.generateContactPage()
);
pageCount++;

// ---------------------------------------------------------------------------
// NEW: Privacy Policy page
// ---------------------------------------------------------------------------
console.log('Generating privacy policy page...');
writePage(
  path.join(DIST_DIR, 'privacy-policy', 'index.html'),
  templates.generatePrivacyPolicyPage()
);
pageCount++;

// ---------------------------------------------------------------------------
// NEW: Authors pages
// ---------------------------------------------------------------------------
if (authors.length > 0) {
  console.log(`Generating authors index + ${authors.length} author pages...`);
  writePage(
    path.join(DIST_DIR, 'authors', 'index.html'),
    templates.generateAuthorsIndexPage(authors)
  );
  pageCount++;

  for (const author of authors) {
    const filePath = path.join(DIST_DIR, 'authors', author.slug, 'index.html');
    writePage(filePath, templates.generateAuthorPage(author, authors));
    pageCount++;
  }
}

// ---------------------------------------------------------------------------
// NEW: Brand Review pages
// ---------------------------------------------------------------------------
if (brandReviews.length > 0) {
  console.log(`Generating brand reviews index + ${brandReviews.length} review pages...`);
  writePage(
    path.join(DIST_DIR, 'reviews', 'index.html'),
    templates.generateBrandReviewsIndexPage(brandReviews)
  );
  pageCount++;

  for (const brand of brandReviews) {
    const filePath = path.join(DIST_DIR, 'reviews', brand.slug, 'index.html');
    writePage(filePath, templates.generateBrandReviewPage(brand, brandReviews));
    pageCount++;
  }
}

// ---------------------------------------------------------------------------
// NEW: Best-Of Roundup pages
// ---------------------------------------------------------------------------
if (bestOf.length > 0) {
  console.log('Generating best hub page...');
  writePage(
    path.join(DIST_DIR, 'best', 'index.html'),
    templates.generateBestHubPage()
  );
  pageCount++;

  console.log(`Generating ${bestOf.length} best-of roundup pages...`);
  for (const entry of bestOf) {
    const filePath = path.join(DIST_DIR, 'best', entry.slug, 'index.html');
    writePage(filePath, templates.generateBestOfPage(entry, bestOf));
    pageCount++;
  }
}

// ---------------------------------------------------------------------------
// NEW: State/City Best Companies pages
// ---------------------------------------------------------------------------
if (stateBestCompanies.length > 0) {
  console.log(`Generating ${stateBestCompanies.length} best-companies pages...`);
  for (const entry of stateBestCompanies) {
    const filePath = path.join(DIST_DIR, 'best-solar-companies', entry.slug, 'index.html');
    writePage(filePath, templates.generateStateBestCompaniesPage(entry, stateBestCompanies));
    pageCount++;
  }
}

// ---------------------------------------------------------------------------
// NEW: Editorial Articles
// ---------------------------------------------------------------------------
const articles = loadJSONSafe('articles.json');
if (articles.length > 0) {
  console.log(`Generating ${articles.length} editorial articles...`);
  for (const article of articles) {
    const filePath = path.join(DIST_DIR, 'article', article.slug, 'index.html');
    writePage(filePath, templates.generateArticlePage(article, articles));
    pageCount++;
  }

  // Articles index
  console.log('Generating articles index page...');
  writePage(
    path.join(DIST_DIR, 'articles', 'index.html'),
    templates.generateArticlesIndexPage(articles)
  );
  pageCount++;
}

// ---------------------------------------------------------------------------
// Custom 404 page
// ---------------------------------------------------------------------------
console.log('Generating custom 404 page...');
writePage(
  path.join(DIST_DIR, '404.html'),
  templates.generateNotFoundPage()
);
pageCount++;

// ---------------------------------------------------------------------------
// Generate sitemap.xml
// ---------------------------------------------------------------------------
console.log('\nGenerating sitemap.xml...');
const sitemapEntries = [];

function addEntry(urlPath, priority, lastmod) {
  const loc = urlPath === '/' ? SITE_URL + '/' : `${SITE_URL}/${urlPath}`;
  const lastmodDate = lastmod || '2026-03-12';
  sitemapEntries.push(`  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmodDate}</lastmod>\n    <changefreq>${priority >= 0.8 ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${priority.toFixed(1)}</priority>\n  </url>`);
}

addEntry('/', 1.0);

for (const state of states) {
  addEntry(`solar-rebates-incentives-${state.slug}/`, 0.9);
}

addEntry('solar-financing/', 0.8);

// Pillar pages (high authority)
for (const pillar of pillarPages) {
  addEntry(`guide/${pillar.slug}/`, 0.8);
}

// Comparison pages (commercial intent)
for (const comparison of comparisons) {
  addEntry(`compare/${comparison.slug}/`, 0.8);
}

// Best-of pages (commercial intent)
addEntry('best/', 0.7);
for (const entry of bestOf) {
  addEntry(`best/${entry.slug}/`, 0.8);
}

// State/City best companies (commercial intent)
for (const entry of stateBestCompanies) {
  addEntry(`best-solar-companies/${entry.slug}/`, 0.8);
}

// Brand review pages
for (const brand of brandReviews) {
  addEntry(`reviews/${brand.slug}/`, 0.7);
}

for (const utility of utilities) {
  addEntry(`utility-rebates/${utility.slug}/`, 0.7);
}

for (const city of cities) {
  addEntry(`is-solar-worth-it-in-${city.slug}-${city.state_abbrev.toLowerCase()}/`, 0.7);
}

addEntry('solar-glossary/', 0.7);

// Trust & authority pages
addEntry('about/', 0.6);
addEntry('authors/', 0.6);
addEntry('reviews/', 0.6);
addEntry('contact/', 0.5);
addEntry('methodology/', 0.5);
addEntry('editorial-standards/', 0.5);
addEntry('privacy-policy/', 0.4);

// Individual author pages
for (const author of authors) {
  addEntry(`authors/${author.slug}/`, 0.5);
}

// Editorial articles
for (const article of articles) {
  addEntry(`article/${article.slug}/`, 0.8, article.date_modified || '2026-03-01');
}

// Articles index page
addEntry('articles/', 0.7);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join('\n')}
</urlset>`;

fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap);

// ---------------------------------------------------------------------------
// Generate robots.txt
// ---------------------------------------------------------------------------
console.log('Generating robots.txt...');
const robotsTxt = `User-agent: *
Allow: /
Disallow: /.netlify/
Disallow: /chat.html

User-agent: Googlebot
Allow: /
Disallow: /.netlify/
Disallow: /chat.html

Sitemap: ${SITE_URL}/sitemap.xml`;

fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robotsTxt);

// ---------------------------------------------------------------------------
// Build statistics
// ---------------------------------------------------------------------------
const sitemapCount = sitemapEntries.length;
console.log('\n--- Build Statistics ---');
console.log(`Pages generated: ${pageCount}`);
console.log(`Sitemap entries: ${sitemapCount}`);
console.log('Static assets:   7 (main.css, app.js, favicon.ico, apple-touch-icon.png, og-image.png, manifest.json, images/logo.svg)');
console.log(`Output directory: ${DIST_DIR}`);
console.log('Build complete!\n');
