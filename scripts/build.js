const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const DIST_DIR = path.join(ROOT, 'dist');
const SITE_URL = 'https://solarsavingsai.netlify.app';

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

const data = { states, utilities, cities, financing, glossary, alerts };

console.log(`  ${states.length} states`);
console.log(`  ${utilities.length} utilities`);
console.log(`  ${cities.length} cities`);
console.log(`  ${financing.providers.length} financing providers`);
console.log(`  ${glossary.length} glossary terms`);

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
fs.copyFileSync(path.join(ROOT, 'src', 'css', 'main.css'), path.join(DIST_DIR, 'css', 'main.css'));
fs.copyFileSync(path.join(ROOT, 'src', 'js', 'app.js'), path.join(DIST_DIR, 'js', 'app.js'));

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

// ---------------------------------------------------------------------------
// Generate sitemap.xml
// ---------------------------------------------------------------------------
console.log('\nGenerating sitemap.xml...');
const sitemapEntries = [];

function addEntry(urlPath, priority) {
  const loc = urlPath === '/' ? SITE_URL + '/' : `${SITE_URL}/${urlPath}`;
  sitemapEntries.push(`  <url>\n    <loc>${loc}</loc>\n    <priority>${priority.toFixed(1)}</priority>\n  </url>`);
}

addEntry('/', 1.0);

for (const state of states) {
  addEntry(`solar-rebates-incentives-${state.slug}/`, 0.9);
}

addEntry('solar-financing/', 0.8);

for (const utility of utilities) {
  addEntry(`utility-rebates/${utility.slug}/`, 0.7);
}

for (const city of cities) {
  addEntry(`is-solar-worth-it-in-${city.slug}-${city.state_abbrev.toLowerCase()}/`, 0.7);
}

addEntry('solar-glossary/', 0.6);
addEntry('methodology/', 0.5);
addEntry('editorial-standards/', 0.5);

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

Sitemap: ${SITE_URL}/sitemap.xml`;

fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robotsTxt);

// ---------------------------------------------------------------------------
// Build statistics
// ---------------------------------------------------------------------------
const sitemapCount = sitemapEntries.length;
console.log('\n--- Build Statistics ---');
console.log(`Pages generated: ${pageCount}`);
console.log(`Sitemap entries: ${sitemapCount}`);
console.log(`Static assets:   2 (main.css, app.js)`);
console.log(`Output directory: ${DIST_DIR}`);
console.log('Build complete!\n');
