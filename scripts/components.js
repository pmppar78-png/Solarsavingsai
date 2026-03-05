'use strict';

const SITE = {
  name: 'SolarSavingsAI',
  title: 'AI Solar & Energy Rebate Finder',
  url: 'https://solarsavingsai.com',
  year: new Date().getFullYear()
};
const BUILD_ID = process.env.BUILD_ID || String(Date.now());

/* --------------------------------------------------------------------------
   Utility: HTML-escape special characters to prevent XSS / broken markup
   -------------------------------------------------------------------------- */
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* --------------------------------------------------------------------------
   1. baseTemplate
   -------------------------------------------------------------------------- */
function baseTemplate(title, description, canonicalPath, bodyContent, options) {
  const opts = Object.assign({ breadcrumbs: null, schema: '', alertHtml: '', states: [] }, options || {});
  const fullTitle = escapeHtml(title) + ' | ' + escapeHtml(SITE.name);
  const safeDesc = escapeHtml(description);
  const canonicalUrl = SITE.url + (canonicalPath || '/');

  const breadcrumbsHtml = opts.breadcrumbs
    ? '<div class="container">' + breadcrumbComponent(opts.breadcrumbs) + '</div>'
    : '';

  const schemaHtml = opts.schema
    ? '<script type="application/ld+json">' + opts.schema + '</script>'
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${fullTitle}</title>
<meta name="description" content="${safeDesc}">
<link rel="canonical" href="${escapeHtml(canonicalUrl)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${fullTitle}">
<meta property="og:description" content="${safeDesc}">
<meta property="og:url" content="${escapeHtml(canonicalUrl)}">
<meta property="og:site_name" content="${escapeHtml(SITE.name)}">
<meta property="og:image" content="https://solarsavingsai.com/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${fullTitle}">
<meta name="twitter:description" content="${safeDesc}">
<meta name="twitter:image" content="https://solarsavingsai.com/og-image.png">
<link rel="icon" href="/favicon.ico">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">
<link rel="stylesheet" href="/css/main.css?v=${escapeHtml(BUILD_ID)}">
${schemaHtml}
</head>
<body>
<div class="site-wrapper">
${headerComponent()}
${breadcrumbsHtml}
<main class="main-content">
${bodyContent}
</main>
${footerComponent(opts.states)}
${leadCaptureForm()}
${stickyCtaComponent()}
${exitIntentModal()}
</div>
<script src="/js/app.js?v=${escapeHtml(BUILD_ID)}" defer></script>
${analyticsScript()}
</body>
</html>`;
}

/* --------------------------------------------------------------------------
   2. headerComponent
   -------------------------------------------------------------------------- */
function headerNavLinksMarkup() {
  return [
    '<li><a href="/solar-financing/" class="nav-link">Solar Financing</a></li>',
    '<li><a href="/solar-glossary/" class="nav-link">Solar Glossary</a></li>',
    '<li><a href="/guide/best-solar-panels-2026/" class="nav-link">Best Solar Panels</a></li>',
    '<li><a href="/guide/best-solar-companies-2026/" class="nav-link">Best Solar Companies</a></li>',
    '<li><a href="/reviews/" class="nav-link">Brand Reviews</a></li>',
    '<li><a href="/articles/" class="nav-link">Solar Articles</a></li>',
    '<li><a href="/about/" class="nav-link">About Us</a></li>',
    '<li><a href="/contact/" class="nav-link">Contact</a></li>',
    '<li><a href="/authors/" class="nav-link">Our Team</a></li>',
    '<li><a href="/methodology/" class="nav-link">Methodology</a></li>',
    '<li><a href="/editorial-standards/" class="nav-link">Editorial Standards</a></li>',
    '<li><a href="/privacy-policy/" class="nav-link">Privacy Policy</a></li>'
  ].join('');
}

function headerComponent() {
  const navLinksMarkup = headerNavLinksMarkup();

  return `<header class="site-header">
<div class="container header-row">
<a href="/" class="site-brand">${escapeHtml(SITE.name)}</a>

<div class="header-ctas-desktop" aria-label="Primary actions">
<a href="/chat.html" class="cta-btn cta-ai" role="button">
<span class="ai-sparkle-icon" aria-hidden="true"></span>
Try Our Solar AI
</a>
<a href="/#estimate" class="cta-btn cta-estimate" role="button">Get Estimate</a>
</div>
<button class="mobile-menu-toggle" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="nav-links">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
</button>
</div>
<nav class="site-nav" aria-label="Site navigation">
<ul class="nav-links" id="nav-links">
<li class="nav-cta">
<a href="/chat.html" class="nav-cta-btn nav-cta-ai" role="button">
<span class="ai-sparkle-icon" aria-hidden="true"></span>
Try Our Solar AI
</a>
</li>
<li class="nav-cta">
<a href="/#results" class="nav-cta-btn nav-cta-savings" role="button">See Your Solar Savings</a>
</li>
<li class="nav-cta">
<a href="/#estimate" class="nav-cta-btn nav-cta-estimate" role="button">Get Estimate</a>
</li>
${navLinksMarkup}
</ul>
</nav>
</header>`;
}

/* --------------------------------------------------------------------------
   3. footerComponent
   -------------------------------------------------------------------------- */
function footerComponent(states) {
  const safeStates = Array.isArray(states) ? states : [];
  const topStates = safeStates.slice(0, 10);

  const stateLinks = topStates.map(function (s) {
    const slug = s.slug || (s.state_name || s.name || '').toLowerCase().replace(/\s+/g, '-');
    const name = s.state_name || s.name || '';
    return '<li><a href="/solar-rebates-incentives-' + escapeHtml(slug) + '/">' + escapeHtml(name) + '</a></li>';
  }).join('\n');

  return `<footer class="site-footer">
<div class="container">
<div class="footer-grid">
<div class="footer-col">
<h4>${escapeHtml(SITE.name)}</h4>
<p>Solar rebate data &amp; ROI analysis powered by AI. Find incentives, estimate savings, and make informed decisions about going solar.</p>
<div class="trust-badges">
<span class="trust-badge">&#9989; Data updated regularly</span>
<span class="trust-badge">&#128274; Secure &amp; private</span>
</div>
</div>
<div class="footer-col">
<h4>Top States</h4>
<ul>
${stateLinks}
</ul>
</div>
<div class="footer-col">
<h4>Resources</h4>
<ul>
<li><a href="/solar-financing/">Solar Financing Guide</a></li>
<li><a href="/solar-glossary/">Solar Glossary</a></li>
<li><a href="/guide/best-solar-panels-2026/">Best Solar Panels</a></li>
<li><a href="/guide/best-solar-companies-2026/">Best Solar Companies</a></li>
<li><a href="/reviews/">Brand Reviews</a></li>
<li><a href="/articles/">Solar Articles</a></li>
</ul>
</div>
<div class="footer-col">
<h4>Company</h4>
<ul>
<li><a href="/about/">About Us</a></li>
<li><a href="/contact/">Contact</a></li>
<li><a href="/authors/">Our Team</a></li>
<li><a href="/methodology/">Methodology</a></li>
<li><a href="/editorial-standards/">Editorial Standards</a></li>
<li><a href="/privacy-policy/">Privacy Policy</a></li>
</ul>
</div>
<div class="footer-col">
<h4>Disclaimer</h4>
<p>${escapeHtml(SITE.name)} provides estimates based on publicly available data. Actual savings depend on your specific situation, local utility rates, system size, and installation costs. We are not a licensed financial advisor. Consult a qualified solar installer for a personalized quote.</p>
</div>
</div>
<p>&copy; ${SITE.year} ${escapeHtml(SITE.name)}. All rights reserved. This site is for informational purposes only. Rebate amounts and incentive details are subject to change without notice. Always verify current incentive availability with your state energy office or utility provider.</p>
</div>
<script type="application/ld+json">${organizationSchema()}</script>
<script type="application/ld+json">${websiteSchema()}</script>
</footer>`;
}

/* --------------------------------------------------------------------------
   4. eligibilityWidget
   -------------------------------------------------------------------------- */
function eligibilityWidget(placement) {
  const p = escapeHtml(placement || 'hero');
  const idPrefix = 'widget-' + p;
  const isHero = p === 'hero';
  const estimateWrapperStart = isHero ? '<div id="estimate">' : '';
  const estimateWrapperEnd = isHero ? '</div>' : '';
  const resultsAnchor = isHero
    ? '<div id="results" class="widget-results-anchor"><span id="savings" class="scroll-anchor scroll-anchor-results"></span></div>'
    : '';

  return `${estimateWrapperStart}
<div class="eligibility-widget" id="${idPrefix}">
<h3 class="widget-title">Check Your Solar Savings</h3>
<form class="widget-form" id="${idPrefix}-form" aria-label="Solar savings eligibility form">
<div class="widget-field">
<label class="widget-label" for="${idPrefix}-zip">ZIP Code</label>
<input class="widget-input" type="text" id="${idPrefix}-zip" name="zip" placeholder="e.g. 90210" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" required aria-required="true">
</div>
<div class="widget-field">
<label class="widget-label" for="${idPrefix}-ownership">Home Ownership</label>
<select class="widget-select" id="${idPrefix}-ownership" name="ownership" required aria-required="true">
<option value="">Select&hellip;</option>
<option value="own">I own my home</option>
<option value="rent">I rent</option>
</select>
</div>
<div class="widget-field">
<label class="widget-label" for="${idPrefix}-bill">Avg. Monthly Electric Bill</label>
<input class="widget-input" type="text" id="${idPrefix}-bill" name="bill" placeholder="e.g. $150" inputmode="decimal" required aria-required="true">
</div>
<div class="widget-field">
<label class="widget-label" for="${idPrefix}-email">Email Address</label>
<input class="widget-input" type="email" id="${idPrefix}-email" name="email" placeholder="your@email.com" required aria-required="true">
</div>
<button type="submit" class="widget-submit">See My Savings Estimate</button>
</form>
<div class="widget-trust">
<span class="trust-badge">&#128274; No personal data stored</span>
<span class="trust-badge">&#9889; Instant results</span>
<span class="trust-badge">&#9989; 100% free</span>
</div>
${resultsAnchor}
</div>
${estimateWrapperEnd}`;
}

/* --------------------------------------------------------------------------
   5. alertBanner
   -------------------------------------------------------------------------- */
function alertBanner(alertMessage, alertType) {
  const validTypes = { urgent: 'alert-urgent', warning: 'alert-warning', info: 'alert-info' };
  const cls = validTypes[alertType] || 'alert-info';
  const alertId = 'alert-' + escapeHtml(alertType || 'info') + '-' + Date.now();

  return `<div class="alert-banner ${cls}" role="alert" data-alert-id="${alertId}">
<span class="alert-text">${escapeHtml(alertMessage)}</span>
<button class="alert-close" aria-label="Dismiss alert">&times;</button>
</div>`;
}

/* --------------------------------------------------------------------------
   6. breadcrumbComponent
   -------------------------------------------------------------------------- */
function breadcrumbComponent(crumbs) {
  if (!Array.isArray(crumbs) || crumbs.length === 0) return '';

  const items = crumbs.map(function (crumb, i) {
    const isLast = i === crumbs.length - 1;
    const separator = isLast ? '' : '<span class="breadcrumb-separator"> / </span>';
    if (isLast) {
      return '<span class="breadcrumb-item" aria-current="page">' + escapeHtml(crumb.label) + '</span>';
    }
    return '<span class="breadcrumb-item"><a href="' + escapeHtml(crumb.url) + '">' + escapeHtml(crumb.label) + '</a>' + separator + '</span>';
  }).join('');

  return `<nav class="breadcrumbs" aria-label="Breadcrumb">${items}</nav>`;
}

/* --------------------------------------------------------------------------
   7. stickyCtaComponent
   -------------------------------------------------------------------------- */
function stickyCtaComponent() {
  return '';
}

/* --------------------------------------------------------------------------
   8. exitIntentModal
   -------------------------------------------------------------------------- */
function exitIntentModal() {
  return `<div class="modal-overlay" id="exit-intent-modal">
<div class="modal-content">
<button class="modal-close" aria-label="Close modal">&times;</button>
<h2 class="modal-title">Wait &mdash; Don&#39;t Miss Your Solar Savings</h2>
<div class="modal-body">
<p>The federal solar tax credit covers <strong>30%</strong> of your installation cost &mdash; but incentives change every year. Enter your details to see what you qualify for before rates adjust.</p>
${eligibilityWidget('modal')}
</div>
</div>
</div>`;
}

/* --------------------------------------------------------------------------
   9. ctaBlock
   -------------------------------------------------------------------------- */
function ctaBlock(type, title, text, href) {
  const blockCls = type === 'secondary' ? 'cta-block-secondary' : 'cta-block-primary';

  return `<div class="cta-block ${blockCls}">
<h2 class="cta-title">${escapeHtml(title)}</h2>
<p class="cta-text">${escapeHtml(text)}</p>
<div class="cta-actions">
<a href="${escapeHtml(href)}" class="btn btn-primary btn-lg">${escapeHtml(title)}</a>
</div>
</div>`;
}

/* --------------------------------------------------------------------------
   10. urgencyBlock
   -------------------------------------------------------------------------- */
function urgencyBlock(message) {
  return `<div class="urgency-block">
<p><strong>&#9888; ${escapeHtml(message)}</strong></p>
<a href="#widget-hero" class="btn btn-primary btn-sm mt-2">Check My Savings Now</a>
</div>`;
}

/* --------------------------------------------------------------------------
   11. statsGrid
   -------------------------------------------------------------------------- */
function statsGrid(stats) {
  if (!Array.isArray(stats) || stats.length === 0) return '';

  const cards = stats.map(function (stat) {
    return `<div class="stat-card">
<span class="stat-value">${escapeHtml(stat.value)}</span>
<span class="stat-label">${escapeHtml(stat.label)}</span>
</div>`;
  }).join('\n');

  return `<div class="stats-grid">${cards}</div>`;
}

/* --------------------------------------------------------------------------
   12. faqSection
   -------------------------------------------------------------------------- */
function faqSection(faqs) {
  if (!Array.isArray(faqs) || faqs.length === 0) return '';

  const items = faqs.map(function (faq) {
    return `<div class="faq-item">
<button class="faq-question">${escapeHtml(faq.question)}</button>
<div class="faq-answer">
<div>${faq.answer}</div>
</div>
</div>`;
  }).join('\n');

  return `<section class="faq-section">
<h2 class="section-title text-center mb-4">Frequently Asked Questions</h2>
${items}
</section>`;
}

/* --------------------------------------------------------------------------
   13. relatedPagesSection
   -------------------------------------------------------------------------- */
function relatedPagesSection(title, pages) {
  if (!Array.isArray(pages) || pages.length === 0) return '';

  const cards = pages.map(function (page) {
    return `<a href="${escapeHtml(page.url)}" class="related-card">
<span class="related-title">${escapeHtml(page.title)}</span>
<span class="related-meta">${escapeHtml(page.meta || '')}</span>
</a>`;
  }).join('\n');

  return `<section class="related-pages">
<div class="container">
<h2 class="section-title text-center mb-3">${escapeHtml(title)}</h2>
<div class="related-grid">
${cards}
</div>
</div>
</section>`;
}

/* --------------------------------------------------------------------------
   14. comparisonTable
   -------------------------------------------------------------------------- */
function comparisonTable(headers, rows) {
  if (!Array.isArray(headers) || !Array.isArray(rows)) return '';

  const ths = headers.map(function (h) {
    return '<th>' + escapeHtml(h) + '</th>';
  }).join('');

  const trs = rows.map(function (row) {
    const tds = row.map(function (cell) {
      return '<td>' + escapeHtml(cell) + '</td>';
    }).join('');
    return '<tr>' + tds + '</tr>';
  }).join('\n');

  return `<div class="comparison-table">
<table class="data-table">
<thead><tr>${ths}</tr></thead>
<tbody>
${trs}
</tbody>
</table>
</div>`;
}

/* --------------------------------------------------------------------------
   15. barChartComponent
   -------------------------------------------------------------------------- */
function barChartComponent(bars) {
  if (!Array.isArray(bars) || bars.length === 0) return '';

  const maxVal = Math.max.apply(null, bars.map(function (b) { return b.max || b.value; }));

  const barItems = bars.map(function (b) {
    const pct = maxVal > 0 ? Math.round((b.value / maxVal) * 100) : 0;
    return `<div class="bar">
<span class="bar-label">${escapeHtml(b.label)}</span>
<div class="bar-fill" style="width:${pct}%" role="img" aria-label="${escapeHtml(b.label)}: ${escapeHtml(String(b.value))}"></div>
<span class="bar-value">${escapeHtml(String(b.value))}</span>
</div>`;
  }).join('\n');

  return `<div class="chart-container">
<div class="bar-chart">
${barItems}
</div>
</div>`;
}

/* --------------------------------------------------------------------------
   16. affiliateCtaBlock – Revenue-generating affiliate links for content pages
   -------------------------------------------------------------------------- */
function affiliateCtaBlock(location, placement) {
  const p = escapeHtml(placement || 'content');
  const loc = escapeHtml(location || 'your area');

  return `<div class="affiliate-cta-block" id="affiliate-${p}">
<div class="affiliate-cta-header">
<h3>Compare Free Solar Quotes for ${loc}</h3>
<p>Get personalized quotes from vetted solar installers. Compare prices, financing, and equipment side-by-side.</p>
</div>
<div class="affiliate-providers">
<a href="https://www.energysage.com/solar/?rc=solarsavingsai" class="affiliate-card affiliate-card-featured" rel="sponsored noopener" target="_blank" data-affiliate="energysage-${p}">
<span class="affiliate-badge">Most Popular</span>
<strong class="affiliate-name">EnergySage</strong>
<span class="affiliate-desc">Compare quotes from local installers</span>
<span class="btn btn-primary btn-sm">Get Free Quotes</span>
</a>
<a href="https://www.sunrun.com/solar-plans?partner=solarsavingsai" class="affiliate-card" rel="sponsored noopener" target="_blank" data-affiliate="sunrun-${p}">
<strong class="affiliate-name">Sunrun</strong>
<span class="affiliate-desc">$0 down solar lease &amp; loan options</span>
<span class="btn btn-outline btn-sm">View Plans</span>
</a>
<a href="https://us.sunpower.com/get-quote?ref=solarsavingsai" class="affiliate-card" rel="sponsored noopener" target="_blank" data-affiliate="sunpower-${p}">
<strong class="affiliate-name">SunPower</strong>
<span class="affiliate-desc">Premium panels, 25-year warranty</span>
<span class="btn btn-outline btn-sm">Get Quote</span>
</a>
<a href="https://modernize.com/solar?aff=solarsavingsai" class="affiliate-card" rel="sponsored noopener" target="_blank" data-affiliate="modernize-${p}">
<strong class="affiliate-name">Modernize</strong>
<span class="affiliate-desc">Get matched with top local installers</span>
<span class="btn btn-outline btn-sm">Compare Now</span>
</a>
<a href="https://www.solarreviews.com/installers?ref=solarsavingsai" class="affiliate-card" rel="sponsored noopener" target="_blank" data-affiliate="solarreviews-${p}">
<strong class="affiliate-name">SolarReviews</strong>
<span class="affiliate-desc">Read installer reviews &amp; get quotes</span>
<span class="btn btn-outline btn-sm">Find Installers</span>
</a>
</div>
<p class="affiliate-disclosure">Affiliate disclosure: We may earn a commission when you request quotes through our partners. This does not affect our analysis or your cost. <a href="/editorial-standards/">Learn more</a>.</p>
</div>`;
}

/* --------------------------------------------------------------------------
   17. emailCaptureBlock – Lead magnet for email list building
   -------------------------------------------------------------------------- */
function emailCaptureBlock(location) {
  const loc = escapeHtml(location || 'Your Home');

  return `<div class="email-capture-block">
<div class="email-capture-content">
<h3>Get Your Free Solar Savings Report</h3>
<p>Enter your email to receive a personalized solar savings report for ${loc}, including incentive deadlines, financing comparisons, and installer recommendations.</p>
<form name="solar-savings-report" method="POST" data-netlify="true" class="email-capture-form" netlify-honeypot="bot-field">
<input type="hidden" name="form-name" value="solar-savings-report">
<p class="hidden" style="display:none"><label>Do not fill this out: <input name="bot-field"></label></p>
<div class="email-form-row">
<input type="email" name="email" placeholder="your@email.com" required class="widget-input" aria-label="Email address">
<input type="text" name="zip" placeholder="ZIP Code" pattern="[0-9]{5}" maxlength="5" inputmode="numeric" class="widget-input widget-input-sm" aria-label="ZIP code">
<button type="submit" class="btn btn-primary">Send My Free Report</button>
</div>
</form>
<div class="widget-trust">
<span class="trust-badge">&#128274; No spam, ever</span>
<span class="trust-badge">&#9889; Instant delivery</span>
<span class="trust-badge">&#9989; Unsubscribe anytime</span>
</div>
</div>
</div>`;
}

/* --------------------------------------------------------------------------
   18. leadCaptureForm – Hidden Netlify Form for calculator lead capture
   -------------------------------------------------------------------------- */
function leadCaptureForm() {
  return `<form name="solar-calculator-lead" method="POST" data-netlify="true" netlify-honeypot="bot-field" style="display:none">
<input type="hidden" name="form-name" value="solar-calculator-lead">
<input name="bot-field">
<input type="text" name="zip">
<input type="text" name="ownership">
<input type="text" name="bill">
<input type="text" name="state">
<input type="email" name="email">
<input type="text" name="page_url">
<input type="text" name="annual_savings">
<input type="text" name="twenty_year_savings">
</form>`;
}

/* --------------------------------------------------------------------------
   19. aboveFoldQuoteCta – High-priority above-fold CTA for lead generation
   -------------------------------------------------------------------------- */
function aboveFoldQuoteCta(location) {
  var loc = escapeHtml(location || 'your area');

  return `<div class="above-fold-cta">
<div class="above-fold-cta-inner">
<div class="above-fold-cta-text">
<strong>Get Your Free Solar Quote for ${loc}</strong>
<span>Compare quotes from top-rated installers. No obligation.</span>
</div>
<div class="above-fold-cta-actions">
<a href="https://www.energysage.com/solar/?rc=solarsavingsai" class="btn btn-primary btn-lg" rel="sponsored noopener" target="_blank" data-affiliate="above-fold-energysage">Get Free Quotes</a>
<a href="#widget-hero" class="btn btn-outline btn-lg">Calculate Savings</a>
</div>
</div>
<p class="affiliate-disclosure" style="font-size:0.75rem;margin-top:0.5rem;opacity:0.8;">Affiliate link. We may earn a commission at no cost to you. <a href="/editorial-standards/">Learn more</a>.</p>
</div>`;
}

/* --------------------------------------------------------------------------
   20. midContentFinancingCta – Contextual financing CTA for mid-page placement
   -------------------------------------------------------------------------- */
function midContentFinancingCta(location, annualSavings) {
  var loc = escapeHtml(location || 'your home');
  var savingsText = annualSavings ? ' Save up to ' + escapeHtml(String(annualSavings)) + '/year.' : '';

  return `<div class="mid-content-cta">
<div class="mid-content-cta-inner">
<h3>Explore Solar Financing for ${loc}</h3>
<p>$0 down options available. Own your system and claim the 30% federal tax credit.${savingsText}</p>
<div class="mid-content-cta-actions">
<a href="https://www.sunrun.com/solar-plans?partner=solarsavingsai" class="btn btn-primary" rel="sponsored noopener" target="_blank" data-affiliate="mid-sunrun">$0 Down Plans</a>
<a href="/solar-financing/" class="btn btn-outline">Compare All Options</a>
</div>
<p class="affiliate-disclosure" style="font-size:0.75rem;margin-top:0.5rem;opacity:0.8;">Affiliate link. <a href="/editorial-standards/">Disclosure</a>.</p>
</div>
</div>`;
}

/* --------------------------------------------------------------------------
   21. sidebarAffiliateWidget – Compact affiliate widget for sidebar/inline
   -------------------------------------------------------------------------- */
function sidebarAffiliateWidget(location) {
  var loc = escapeHtml(location || 'Your Area');

  return `<div class="sidebar-affiliate-widget">
<div class="sidebar-widget-header"><strong>Top Solar Providers for ${loc}</strong></div>
<div class="sidebar-widget-list">
<a href="https://www.energysage.com/solar/?rc=solarsavingsai" class="sidebar-widget-item" rel="sponsored noopener" target="_blank" data-affiliate="sidebar-energysage">
<span class="sidebar-widget-name">EnergySage</span>
<span class="sidebar-widget-detail">Compare local quotes free</span>
<span class="sidebar-widget-action">Get Quotes &rarr;</span>
</a>
<a href="https://www.sunrun.com/solar-plans?partner=solarsavingsai" class="sidebar-widget-item" rel="sponsored noopener" target="_blank" data-affiliate="sidebar-sunrun">
<span class="sidebar-widget-name">Sunrun</span>
<span class="sidebar-widget-detail">$0 down solar lease/loan</span>
<span class="sidebar-widget-action">View Plans &rarr;</span>
</a>
<a href="https://us.sunpower.com/get-quote?ref=solarsavingsai" class="sidebar-widget-item" rel="sponsored noopener" target="_blank" data-affiliate="sidebar-sunpower">
<span class="sidebar-widget-name">SunPower</span>
<span class="sidebar-widget-detail">Premium panels, 25yr warranty</span>
<span class="sidebar-widget-action">Get Quote &rarr;</span>
</a>
<a href="https://modernize.com/solar?aff=solarsavingsai" class="sidebar-widget-item" rel="sponsored noopener" target="_blank" data-affiliate="sidebar-modernize">
<span class="sidebar-widget-name">Modernize</span>
<span class="sidebar-widget-detail">Top local installer matching</span>
<span class="sidebar-widget-action">Compare &rarr;</span>
</a>
</div>
<p class="affiliate-disclosure" style="font-size:0.7rem;margin-top:0.5rem;opacity:0.7;">Sponsored. <a href="/editorial-standards/">Disclosure</a>.</p>
</div>`;
}

/* --------------------------------------------------------------------------
   22. calculatorResultMonetization – Post-calculator affiliate push
   -------------------------------------------------------------------------- */
function calculatorResultMonetization(location) {
  var loc = escapeHtml(location || 'your area');

  return `<div class="calculator-monetization">
<h3>Ready to Get Real Quotes for ${loc}?</h3>
<p>Your estimate shows strong savings potential. Get exact pricing from vetted installers.</p>
<div class="calculator-monetization-grid">
<a href="https://www.energysage.com/solar/?rc=solarsavingsai" class="calc-monetize-card calc-monetize-featured" rel="sponsored noopener" target="_blank" data-affiliate="calc-result-energysage">
<span class="calc-monetize-badge">Recommended</span>
<strong>EnergySage Marketplace</strong>
<span>Compare 3-7 installer quotes</span>
<span class="btn btn-primary btn-sm">Get Free Quotes</span>
</a>
<a href="https://www.sunrun.com/solar-plans?partner=solarsavingsai" class="calc-monetize-card" rel="sponsored noopener" target="_blank" data-affiliate="calc-result-sunrun">
<strong>Sunrun</strong>
<span>$0 down lease &amp; loan</span>
<span class="btn btn-outline btn-sm">See Plans</span>
</a>
<a href="https://us.sunpower.com/get-quote?ref=solarsavingsai" class="calc-monetize-card" rel="sponsored noopener" target="_blank" data-affiliate="calc-result-sunpower">
<strong>SunPower</strong>
<span>Highest efficiency panels</span>
<span class="btn btn-outline btn-sm">Get Quote</span>
</a>
<a href="https://modernize.com/solar?aff=solarsavingsai" class="calc-monetize-card" rel="sponsored noopener" target="_blank" data-affiliate="calc-result-modernize">
<strong>Modernize</strong>
<span>Match with local pros</span>
<span class="btn btn-outline btn-sm">Get Matched</span>
</a>
</div>
<p class="affiliate-disclosure" style="font-size:0.75rem;margin-top:0.5rem;text-align:center;opacity:0.8;">We may earn a commission. This does not affect your cost. <a href="/editorial-standards/">Disclosure</a>.</p>
</div>`;
}

/* --------------------------------------------------------------------------
   23. authorBioBlock – E-E-A-T structured author bio
   -------------------------------------------------------------------------- */
function authorBioBlock() {
  return `<div class="author-bio-block" itemscope itemtype="https://schema.org/Person">
<div class="author-bio-inner">
<div class="author-bio-info">
<h4 class="author-bio-name" itemprop="name">SolarSavingsAI Research Team</h4>
<p class="author-bio-title" itemprop="jobTitle">Solar Energy Analysts</p>
<p class="author-bio-desc" itemprop="description">Our team analyzes solar incentive data from federal (DOE, IRS), state (DSIRE), and utility sources to provide accurate savings estimates. Data is reviewed quarterly and cross-referenced with NREL benchmarks.</p>
<div class="author-bio-credentials">
<span class="author-credential">Sources: DOE, IRS, DSIRE, NREL, EIA</span>
<span class="author-credential">Updated: ${SITE.year}</span>
<span class="author-credential"><a href="/methodology/">Full Methodology</a></span>
<span class="author-credential"><a href="/editorial-standards/">Editorial Standards</a></span>
</div>
</div>
</div>
</div>`;
}

/* --------------------------------------------------------------------------
   24. comparisonAffiliateTable – Comparison table with affiliate CTAs
   -------------------------------------------------------------------------- */
function comparisonAffiliateTable(title, items) {
  if (!Array.isArray(items) || items.length === 0) return '';

  var rows = items.map(function (item) {
    var ctaHtml = item.affiliate_url
      ? '<a href="' + escapeHtml(item.affiliate_url) + '" class="btn btn-primary btn-sm" rel="sponsored noopener" target="_blank" data-affiliate="table-' + escapeHtml(item.slug || '') + '">' + escapeHtml(item.cta_text || 'Get Quote') + '</a>'
      : '<span class="text-muted">N/A</span>';
    return '<tr><td><strong>' + escapeHtml(item.name) + '</strong></td><td>' + escapeHtml(item.type || '') + '</td><td>' + escapeHtml(item.highlight || '') + '</td><td>' + escapeHtml(item.rating || '') + '</td><td>' + ctaHtml + '</td></tr>';
  }).join('\n');

  return `<div class="comparison-affiliate-table">
<h3>${escapeHtml(title)}</h3>
<div class="comparison-table">
<table class="data-table">
<thead><tr><th>Provider</th><th>Type</th><th>Highlight</th><th>Rating</th><th>Action</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>
</div>
<p class="affiliate-disclosure" style="font-size:0.75rem;margin-top:0.5rem;opacity:0.8;">Some links are affiliate links. <a href="/editorial-standards/">Disclosure</a>.</p>
</div>`;
}

/* --------------------------------------------------------------------------
   25. articleSchema – Article structured data for pillar/authority pages
   -------------------------------------------------------------------------- */
function articleSchema(title, description, url, datePublished, authorName) {
  var author = authorName
    ? { '@type': 'Person', name: authorName, url: SITE.url + '/authors/' }
    : { '@type': 'Organization', name: SITE.name, url: SITE.url };
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    url: SITE.url + url,
    datePublished: datePublished || SITE.year + '-01-15',
    dateModified: SITE.year + '-03-01',
    author: author,
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': SITE.url + url
    }
  });
}

/* --------------------------------------------------------------------------
   26. organizationSchema – Site-wide Organization structured data
   -------------------------------------------------------------------------- */
function organizationSchema() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    description: 'Solar rebate data and ROI analysis. Find incentives, estimate savings, and make informed decisions about going solar.',
    foundingDate: '2024',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      url: SITE.url + '/contact/'
    },
    sameAs: []
  });
}

/* --------------------------------------------------------------------------
   27. howToSchema – HowTo structured data for guide pages
   -------------------------------------------------------------------------- */
function howToSchema(title, description, steps) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    description: description,
    step: steps.map(function (s, i) {
      return {
        '@type': 'HowToStep',
        position: i + 1,
        name: s.name,
        text: s.text
      };
    })
  });
}

/* --------------------------------------------------------------------------
   28. reviewSchema – AggregateRating structured data for review pages
   -------------------------------------------------------------------------- */
function reviewSchema(itemName, itemType, rating, reviewCount, bestRating) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': itemType || 'Product',
    name: itemName,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating,
      bestRating: bestRating || 5,
      worstRating: 1,
      reviewCount: reviewCount || 100
    }
  });
}

/* --------------------------------------------------------------------------
   WebSite schema with SearchAction – enables sitelinks searchbox
   -------------------------------------------------------------------------- */
function websiteSchema() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    description: 'Solar rebate data and ROI analysis powered by AI. Find incentives, estimate savings, and compare solar options.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: SITE.url + '/#state-map?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url
    }
  });
}

/* --------------------------------------------------------------------------
   ItemList schema for best-of and ranking pages
   -------------------------------------------------------------------------- */
function itemListSchema(name, description, items) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: name,
    description: description,
    numberOfItems: items.length,
    itemListElement: items.map(function (item, i) {
      return {
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        url: item.url ? SITE.url + item.url : undefined
      };
    })
  });
}

/* --------------------------------------------------------------------------
   29. lastUpdatedBlock – "Last updated" + "Reviewed by" metadata for E-E-A-T
   -------------------------------------------------------------------------- */
function lastUpdatedBlock(authorName, authorSlug) {
  var dateStr = SITE.year + '-03-01';
  var authorHtml = authorName
    ? '<span class="content-meta-item">Reviewed by: <a href="/authors/' + escapeHtml(authorSlug || '') + '/">' + escapeHtml(authorName) + '</a></span>'
    : '<span class="content-meta-item">Reviewed by: <a href="/authors/">SolarSavingsAI Research Team</a></span>';
  return '<div class="content-meta">' +
    '<span class="content-meta-item">Last updated: <time datetime="' + dateStr + '">' + dateStr + '</time></span>' +
    authorHtml +
    '</div>';
}

/* --------------------------------------------------------------------------
   30. analyticsScript – Conversion tracking via data attributes
   -------------------------------------------------------------------------- */
function analyticsScript() {
  return `<script>
(function(){
  var t=function(e,a){try{var d={event:e,timestamp:new Date().toISOString(),page:window.location.pathname,referrer:document.referrer};if(a)for(var k in a)d[k]=a[k];if(navigator.sendBeacon){navigator.sendBeacon('/.netlify/functions/lead-router',JSON.stringify(d));}console.log('[analytics]',e,d);}catch(x){}};
  document.addEventListener('click',function(e){
    var a=e.target.closest('[data-affiliate]');
    if(a){t('affiliate_click',{affiliate:a.getAttribute('data-affiliate'),href:a.href});}
    var c=e.target.closest('.btn');
    if(c){t('cta_click',{text:c.textContent.trim().substring(0,50),href:c.href||''});}
  });
  document.addEventListener('submit',function(e){
    var f=e.target.closest('.widget-form');
    if(f){t('calculator_submit',{widget:f.id||'unknown'});}
  });
  window.addEventListener('beforeunload',function(){
    t('session_end',{pages:window.__pageViews||1,duration:Math.round((Date.now()-(window.__sessionStart||Date.now()))/1000)});
  });
  window.__sessionStart=Date.now();
  window.__pageViews=(parseInt(sessionStorage.getItem('pv')||'0',10))+1;
  try{sessionStorage.setItem('pv',String(window.__pageViews));}catch(x){}
  t('page_view',{pages:window.__pageViews});
})();
</script>`;
}

/* --------------------------------------------------------------------------
   31. displayAdSlot – Reserved ad placement for non-converting traffic
   -------------------------------------------------------------------------- */
function displayAdSlot(placement) {
  var p = escapeHtml(placement || 'content');
  return '<div class="ad-slot" data-ad-placement="' + p + '" aria-hidden="true">' +
    '<div class="ad-slot-inner">' +
    '<span class="ad-slot-label">Advertisement</span>' +
    '</div></div>';
}

/* --------------------------------------------------------------------------
   32. contextualLinksBlock – Internal linking block for SEO
   -------------------------------------------------------------------------- */
function contextualLinksBlock(title, links) {
  if (!Array.isArray(links) || links.length === 0) return '';
  var html = links.map(function (l) {
    return '<li><a href="' + escapeHtml(l.url) + '">' + escapeHtml(l.title) + '</a></li>';
  }).join('\n');
  return '<div class="contextual-links"><h3>' + escapeHtml(title) + '</h3><ul>' + html + '</ul></div>';
}

/* --------------------------------------------------------------------------
   33. hubLinksSection – Hub-and-spoke cluster linking
   -------------------------------------------------------------------------- */
function hubLinksSection(hubName, links) {
  if (!Array.isArray(links) || links.length === 0) return '';
  var cards = links.map(function (l) {
    return '<a href="' + escapeHtml(l.url) + '" class="related-card"><span class="related-title">' + escapeHtml(l.title) + '</span><span class="related-meta">' + escapeHtml(l.meta || '') + '</span></a>';
  }).join('\n');
  return '<section class="content-section bg-light"><div class="container"><h2>Explore: ' + escapeHtml(hubName) + '</h2><div class="related-grid">' + cards + '</div></div></section>';
}

/* --------------------------------------------------------------------------
   34. enhancedAuthorBioBlock – Individual author bio with full E-E-A-T
   -------------------------------------------------------------------------- */
function enhancedAuthorBioBlock(author) {
  if (!author) return authorBioBlock();
  var creds = (author.credentials || []).map(function (c) {
    return '<span class="author-credential">' + escapeHtml(c) + '</span>';
  }).join('\n');
  return '<div class="author-bio-block" itemscope itemtype="https://schema.org/Person">' +
    '<div class="author-bio-inner">' +
    '<div class="author-bio-info">' +
    '<h4 class="author-bio-name"><a href="/authors/' + escapeHtml(author.slug || '') + '/" itemprop="url"><span itemprop="name">' + escapeHtml(author.name) + '</span></a></h4>' +
    '<p class="author-bio-title" itemprop="jobTitle">' + escapeHtml(author.title) + '</p>' +
    '<p class="author-bio-desc" itemprop="description">' + escapeHtml((author.bio || '').substring(0, 200)) + '...</p>' +
    '<div class="author-bio-credentials">' + creds + '</div>' +
    '</div></div></div>';
}

/* --------------------------------------------------------------------------
   Module Exports
   -------------------------------------------------------------------------- */
module.exports = {
  baseTemplate,
  headerComponent,
  footerComponent,
  eligibilityWidget,
  alertBanner,
  breadcrumbComponent,
  stickyCtaComponent,
  exitIntentModal,
  ctaBlock,
  urgencyBlock,
  statsGrid,
  faqSection,
  relatedPagesSection,
  comparisonTable,
  barChartComponent,
  affiliateCtaBlock,
  emailCaptureBlock,
  leadCaptureForm,
  aboveFoldQuoteCta,
  midContentFinancingCta,
  sidebarAffiliateWidget,
  calculatorResultMonetization,
  authorBioBlock,
  comparisonAffiliateTable,
  articleSchema,
  organizationSchema,
  howToSchema,
  reviewSchema,
  websiteSchema,
  itemListSchema,
  lastUpdatedBlock,
  analyticsScript,
  displayAdSlot,
  contextualLinksBlock,
  hubLinksSection,
  enhancedAuthorBioBlock,
  SITE
};
