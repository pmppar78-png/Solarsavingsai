'use strict';

const SITE = {
  name: 'SolarSavingsAI',
  title: 'AI Solar & Energy Rebate Finder',
  url: 'https://solarsavingsai.netlify.app',
  year: new Date().getFullYear()
};

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
  const opts = Object.assign({ breadcrumbs: null, schema: '', alertHtml: '' }, options || {});
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
<link rel="stylesheet" href="/css/main.css">
${schemaHtml}
</head>
<body>
<div class="site-wrapper">
${opts.alertHtml}
${headerComponent()}
${breadcrumbsHtml}
<main class="main-content">
${bodyContent}
</main>
${footerComponent([])}
${stickyCtaComponent()}
${exitIntentModal()}
</div>
<script src="/js/app.js" defer></script>
</body>
</html>`;
}

/* --------------------------------------------------------------------------
   2. headerComponent
   -------------------------------------------------------------------------- */
function headerComponent() {
  return `<header class="site-header">
<div class="container">
<a href="/" class="nav-link" style="font-weight:700;font-size:1.125rem;color:var(--color-primary);border-bottom:none;">${escapeHtml(SITE.name)}</a>
<nav class="site-nav">
<ul class="nav-links" id="nav-links">
<li><a href="/#state-map" class="nav-link">State Rebates</a></li>
<li><a href="/solar-financing/" class="nav-link">Financing</a></li>
<li><a href="/solar-glossary/" class="nav-link">Solar Glossary</a></li>
<li><a href="/methodology/" class="nav-link">Methodology</a></li>
</ul>
<button class="mobile-menu-toggle" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="nav-links">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
</button>
</nav>
</div>
</header>`;
}

/* --------------------------------------------------------------------------
   3. footerComponent
   -------------------------------------------------------------------------- */
function footerComponent(states) {
  const safeStates = Array.isArray(states) ? states : [];
  const topStates = safeStates.slice(0, 10);

  const stateLinks = topStates.map(function (s) {
    const slug = s.slug || s.name.toLowerCase().replace(/\s+/g, '-');
    return '<li><a href="/states/' + escapeHtml(slug) + '/">' + escapeHtml(s.name) + '</a></li>';
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
<li><a href="/methodology/">Methodology</a></li>
<li><a href="/editorial-standards/">Editorial Standards</a></li>
</ul>
</div>
<div class="footer-col">
<h4>Disclaimer</h4>
<p>${escapeHtml(SITE.name)} provides estimates based on publicly available data. Actual savings depend on your specific situation, local utility rates, system size, and installation costs. We are not a licensed financial advisor. Consult a qualified solar installer for a personalized quote.</p>
</div>
</div>
<p>&copy; ${SITE.year} ${escapeHtml(SITE.name)}. All rights reserved. This site is for informational purposes only. Rebate amounts and incentive details are subject to change without notice. Always verify current incentive availability with your state energy office or utility provider.</p>
</div>
</footer>`;
}

/* --------------------------------------------------------------------------
   4. eligibilityWidget
   -------------------------------------------------------------------------- */
function eligibilityWidget(placement) {
  const p = escapeHtml(placement || 'hero');
  const idPrefix = 'widget-' + p;

  return `<div class="eligibility-widget" id="${idPrefix}">
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
<button type="submit" class="widget-submit">See My Savings Estimate</button>
</form>
<div class="widget-trust">
<span class="trust-badge">&#128274; No personal data stored</span>
<span class="trust-badge">&#9889; Instant results</span>
<span class="trust-badge">&#9989; 100% free</span>
</div>
</div>`;
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
  return `<div class="sticky-cta">
<span class="sticky-cta-text">See your solar savings</span>
<a href="#widget-hero" class="sticky-cta-btn">Get Estimate</a>
</div>`;
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
  SITE
};
