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

// ---------------------------------------------------------------------------
// Priority indexing model
// ---------------------------------------------------------------------------
const PRIORITY_STATE_SLUGS = [
  'california', 'texas', 'florida', 'arizona', 'new-york',
  'massachusetts', 'new-jersey', 'nevada', 'colorado', 'north-carolina'
];
const PRIORITY_CITY_KEYS = [
  'los-angeles-ca', 'phoenix-az', 'houston-tx', 'san-diego-ca', 'denver-co',
  'orlando-fl', 'charlotte-nc', 'san-antonio-tx', 'austin-tx', 'tampa-fl'
];
const PRIORITY_GUIDE_SLUGS = [
  'solar-panel-cost-guide',
  'solar-tax-credits-guide',
  'solar-roi-payback-period',
  'solar-energy-savings-calculator',
  'solar-financing-complete-guide',
  'solar-loans-vs-leases-vs-ppa',
  'best-solar-panels-2026',
  'best-solar-companies-2026',
  'how-to-choose-solar-installer'
];
const PRIORITY_ARTICLE_SLUGS = [
  'federal-solar-tax-credit-2026-complete-guide',
  'solar-panel-roi-real-numbers-analysis',
  'net-metering-explained-selling-solar-energy-back',
  'solar-panels-vs-grid-power-20-year-cost-comparison',
  'solar-financing-cash-loan-lease-ppa-compared',
  'electricity-prices-rising-solar-locks-rate',
  'solar-battery-storage-worth-investment-2026',
  'solar-savings-index-2026'
];
const priorityStateSet = new Set(PRIORITY_STATE_SLUGS);
const priorityCitySet = new Set(PRIORITY_CITY_KEYS);
const priorityGuideSet = new Set(PRIORITY_GUIDE_SLUGS);
const priorityArticleSet = new Set(PRIORITY_ARTICLE_SLUGS);

function cityKey(city) {
  const abbrev = city.state_abbrev.toLowerCase();
  return city.slug.endsWith('-' + abbrev) ? city.slug : `${city.slug}-${abbrev}`;
}

function priorityFilteredData(extra) {
  return Object.assign({}, data, {
    states: states.filter((s) => priorityStateSet.has(s.slug)),
    cities: cities.filter((c) => priorityCitySet.has(cityKey(c))),
    utilities: []
  }, extra || {});
}

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
writePage(path.join(DIST_DIR, 'index.html'), templates.generateHomepage(priorityFilteredData()));
pageCount++;

// Public hub pages restored for legacy Search Console URLs. These are written
// as flat HTML files so the clean URLs resolve without a directory slash hop.
console.log('Generating public hub pages...');
writePage(path.join(DIST_DIR, 'states', 'index.html'), templates.generateStatesHubPage(priorityFilteredData()));
pageCount++;
writePage(path.join(DIST_DIR, 'solar-rebates', 'index.html'), templates.generateSolarRebatesHubPage(priorityFilteredData()));
pageCount++;
writePage(path.join(DIST_DIR, 'comparisons', 'index.html'), templates.generateComparisonsHubPage(comparisons));
pageCount++;

// State pages
console.log(`Generating ${states.length} state pages...`);
for (const state of states) {
  const stateData = Object.assign({}, data, { alerts, financing, stateBestCompanies, priorityIndex: priorityStateSet.has(state.slug) });
  const filePath = path.join(DIST_DIR, `solar-rebates-incentives-${state.slug}`, 'index.html');
  writePage(filePath, templates.generateStatePage(state, stateData));
  pageCount++;
}

// Utility pages
console.log(`Generating ${utilities.length} utility pages...`);
for (const utility of utilities) {
  const utilityData = Object.assign({}, data, { alerts, financing, priorityIndex: false });
  const filePath = path.join(DIST_DIR, 'utility-rebates', utility.slug, 'index.html');
  writePage(filePath, templates.generateUtilityPage(utility, utilityData));
  pageCount++;
}

// City pages
console.log(`Generating ${cities.length} city pages...`);
for (const city of cities) {
  const isPriority = priorityCitySet.has(cityKey(city));
  const cityData = Object.assign({}, data, { alerts, financing, priorityIndex: isPriority });
  const slug = `is-solar-worth-it-in-${cityKey(city)}`;
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
    writePage(filePath, templates.generatePillarPage(
      pillar,
      pillarPages.filter((p) => priorityGuideSet.has(p.slug)),
      { priorityIndex: priorityGuideSet.has(pillar.slug) }
    ));
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
    writePage(filePath, templates.generateArticlePage(
      article,
      articles.filter((a) => priorityArticleSet.has(a.slug)),
      { priorityIndex: priorityArticleSet.has(article.slug) }
    ));
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
// Generate sitemap index with per-type sub-sitemaps
// ---------------------------------------------------------------------------
console.log('\nGenerating sitemap index...');

function generateLastmod(urlPath, priority) {
  let hash = 0;
  for (let i = 0; i < urlPath.length; i++) {
    hash = ((hash << 5) - hash + urlPath.charCodeAt(i)) | 0;
  }
  const daySpread = Math.abs(hash % 30);
  if (priority >= 0.9) return '2026-05-' + String(Math.max(1, 14 - daySpread % 14)).padStart(2, '0');
  if (priority >= 0.7) return '2026-05-' + String(Math.max(1, 10 - daySpread % 10)).padStart(2, '0');
  if (priority >= 0.5) return '2026-04-' + String(Math.max(1, 28 - daySpread % 28)).padStart(2, '0');
  return '2026-04-' + String(Math.max(1, 15 - daySpread % 15)).padStart(2, '0');
}

function buildUrlEntry(urlPath, priority, lastmod) {
  const loc = urlPath === '/' ? SITE_URL + '/' : `${SITE_URL}/${urlPath}`;
  const lastmodDate = lastmod || generateLastmod(urlPath, priority);
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmodDate}</lastmod>\n    <changefreq>${priority >= 0.8 ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${priority.toFixed(1)}</priority>\n  </url>`;
}

function writeSitemap(filename, entries) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>`;
  fs.writeFileSync(path.join(DIST_DIR, filename), xml);
  return filename;
}

const sitemapFiles = [];

// 1. Core pages sitemap — highest-value pages
const coreEntries = [];
coreEntries.push(buildUrlEntry('/', 1.0));
coreEntries.push(buildUrlEntry('states/', 0.9));
coreEntries.push(buildUrlEntry('solar-rebates/', 0.9));
coreEntries.push(buildUrlEntry('comparisons/', 0.8));
coreEntries.push(buildUrlEntry('solar-financing/', 0.9));
coreEntries.push(buildUrlEntry('articles/', 0.6));
coreEntries.push(buildUrlEntry('solar-glossary/', 0.5));
coreEntries.push(buildUrlEntry('about/', 0.4));
coreEntries.push(buildUrlEntry('contact/', 0.4));
coreEntries.push(buildUrlEntry('privacy-policy/', 0.3));
coreEntries.push(buildUrlEntry('methodology/', 0.4));
coreEntries.push(buildUrlEntry('editorial-standards/', 0.4));
if (brandReviews.length > 0) coreEntries.push(buildUrlEntry('reviews/', 0.7));
if (bestOf.length > 0) coreEntries.push(buildUrlEntry('best/', 0.7));
if (authors.length > 0) {
  coreEntries.push(buildUrlEntry('authors/', 0.4));
  for (const author of authors) {
    coreEntries.push(buildUrlEntry(`authors/${author.slug}/`, 0.4));
  }
}
for (const comparison of comparisons) {
  coreEntries.push(buildUrlEntry(`compare/${comparison.slug}/`, 0.8));
}
sitemapFiles.push(writeSitemap('sitemap-core.xml', coreEntries));

// 2. Guides and articles sitemap
const guidesEntries = [];
for (const pillar of pillarPages) {
  const isPriority = priorityGuideSet.has(pillar.slug);
  guidesEntries.push(buildUrlEntry(`guide/${pillar.slug}/`, isPriority ? 0.8 : 0.6));
}
for (const article of articles) {
  const isPriority = priorityArticleSet.has(article.slug);
  guidesEntries.push(buildUrlEntry(`article/${article.slug}/`, isPriority ? 0.8 : 0.5, article.date_modified || '2026-03-01'));
}
if (guidesEntries.length > 0) {
  sitemapFiles.push(writeSitemap('sitemap-guides.xml', guidesEntries));
}

// 3. State pages sitemap
const stateEntries = [];
for (const state of states) {
  const isPriority = priorityStateSet.has(state.slug);
  stateEntries.push(buildUrlEntry(`solar-rebates-incentives-${state.slug}/`, isPriority ? 0.9 : 0.7));
}
sitemapFiles.push(writeSitemap('sitemap-states.xml', stateEntries));

// 4. City pages sitemap — split priority vs non-priority
const priorityCityEntries = [];
const otherCityEntries = [];
for (const city of cities) {
  const key = cityKey(city);
  const isPriority = priorityCitySet.has(key);
  if (isPriority) {
    priorityCityEntries.push(buildUrlEntry(`is-solar-worth-it-in-${key}/`, 0.8));
  } else {
    otherCityEntries.push(buildUrlEntry(`is-solar-worth-it-in-${key}/`, 0.6));
  }
}
if (priorityCityEntries.length > 0) {
  sitemapFiles.push(writeSitemap('sitemap-cities-priority.xml', priorityCityEntries));
}
if (otherCityEntries.length > 0) {
  sitemapFiles.push(writeSitemap('sitemap-cities.xml', otherCityEntries));
}

// 5. Utility pages sitemap
const utilityEntries = [];
for (const utility of utilities) {
  utilityEntries.push(buildUrlEntry(`utility-rebates/${utility.slug}/`, 0.5));
}
if (utilityEntries.length > 0) {
  sitemapFiles.push(writeSitemap('sitemap-utilities.xml', utilityEntries));
}

// 6. Reviews and best-of pages sitemap
const reviewEntries = [];
for (const brand of brandReviews) {
  reviewEntries.push(buildUrlEntry(`reviews/${brand.slug}/`, 0.6));
}
for (const entry of bestOf) {
  reviewEntries.push(buildUrlEntry(`best/${entry.slug}/`, 0.6));
}
for (const entry of stateBestCompanies) {
  reviewEntries.push(buildUrlEntry(`best-solar-companies/${entry.slug}/`, 0.6));
}
if (reviewEntries.length > 0) {
  sitemapFiles.push(writeSitemap('sitemap-reviews.xml', reviewEntries));
}

// Write sitemap index
const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapFiles.map(f => `  <sitemap>\n    <loc>${SITE_URL}/${f}</loc>\n    <lastmod>2026-05-25</lastmod>\n  </sitemap>`).join('\n')}
</sitemapindex>`;
fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapIndex);

// ---------------------------------------------------------------------------
// Generate robots.txt
// ---------------------------------------------------------------------------
console.log('Generating robots.txt...');
const robotsTxt = `User-agent: *
Allow: /
Disallow: /.netlify/
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml`;

fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robotsTxt);

// ---------------------------------------------------------------------------
// Generate _redirects for old double-abbreviation city URLs
// ---------------------------------------------------------------------------
console.log('Generating _redirects for corrected city URLs...');
const redirectLines = [];
for (const city of cities) {
  const abbrev = city.state_abbrev.toLowerCase();
  if (city.slug.endsWith('-' + abbrev)) {
    const oldPath = `/is-solar-worth-it-in-${city.slug}-${abbrev}/`;
    const newPath = `/is-solar-worth-it-in-${city.slug}/`;
    redirectLines.push(`${oldPath}  ${newPath}  301`);
  }
}
if (redirectLines.length > 0) {
  fs.writeFileSync(path.join(DIST_DIR, '_redirects'), redirectLines.join('\n') + '\n');
  console.log(`  ${redirectLines.length} redirect rules written`);
}

// ---------------------------------------------------------------------------
// Build statistics
// ---------------------------------------------------------------------------
const totalSitemapEntries = coreEntries.length + guidesEntries.length + stateEntries.length + priorityCityEntries.length + otherCityEntries.length + utilityEntries.length + reviewEntries.length;
console.log('\n--- Build Statistics ---');
console.log(`Pages generated: ${pageCount}`);
console.log(`Sitemap files: ${sitemapFiles.length} sub-sitemaps in sitemap index`);
console.log(`Sitemap entries: ${totalSitemapEntries}`);
console.log('Static assets:   7 (main.css, app.js, favicon.ico, apple-touch-icon.png, og-image.png, manifest.json, images/logo.svg)');
console.log(`Output directory: ${DIST_DIR}`);
console.log('Build complete!\n');
