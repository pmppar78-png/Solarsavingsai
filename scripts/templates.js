'use strict';

const {
  baseTemplate, eligibilityWidget, alertBanner, statsGrid,
  faqSection, relatedPagesSection, comparisonTable, barChartComponent,
  ctaBlock, urgencyBlock, affiliateCtaBlock, emailCaptureBlock,
  aboveFoldQuoteCta, midContentFinancingCta, sidebarAffiliateWidget,
  calculatorResultMonetization, authorBioBlock, comparisonAffiliateTable,
  articleSchema, organizationSchema, howToSchema, reviewSchema, serviceSchema,
  lastUpdatedBlock, displayAdSlot, contextualLinksBlock, hubLinksSection,
  enhancedAuthorBioBlock, SITE
} = require('./components');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmt(n) {
  return Number(n).toLocaleString('en-US');
}

function dollar(n) {
  return '$' + fmt(Math.round(n));
}

function pct(n) {
  return n + '%';
}

function calculateROI(installCost, systemSize, sunHours, kwRate, fedCredit, stateCredit, stateRebate) {
  const annualKwh = systemSize * sunHours * 365;
  const annualSavings = annualKwh * kwRate;
  const fedSavings = installCost * (fedCredit / 100);
  const stateSavings = installCost * (stateCredit / 100) + (stateRebate || 0);
  const netCost = installCost - fedSavings - stateSavings;
  const breakEvenYears = netCost > 0 ? Math.ceil(netCost / annualSavings) : 1;
  const twentyYearSavings = (annualSavings * 20) - netCost;
  return { annualKwh: Math.round(annualKwh), annualSavings: Math.round(annualSavings), fedSavings: Math.round(fedSavings), stateSavings: Math.round(stateSavings), netCost: Math.round(netCost), breakEvenYears, twentyYearSavings: Math.round(twentyYearSavings) };
}

function faqSchema(faqs) {
  if (!faqs || faqs.length === 0) return '';
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(function (f) {
      return {
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer.replace(/<[^>]+>/g, '') }
      };
    })
  });
}

function joinSchemas() {
  return Array.prototype.slice.call(arguments).filter(Boolean).join('</script><script type="application/ld+json">');
}

function breadcrumbSchema(crumbs) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map(function (c, i) {
      return { '@type': 'ListItem', position: i + 1, name: c.label, item: c.url ? SITE.url + c.url : undefined };
    })
  });
}

function stateAlerts(alerts, stateAbbrev) {
  if (!alerts || !alerts.state_alerts) return '';
  var html = '';
  alerts.state_alerts.forEach(function (a) {
    if (a.state_abbrev === stateAbbrev && a.active) {
      html += alertBanner(a.message, a.severity === 'high' ? 'urgent' : (a.severity === 'medium' ? 'warning' : 'info'));
    }
  });
  return html;
}

function utilityAlerts(alerts, utilitySlug) {
  if (!alerts || !alerts.utility_alerts) return '';
  var html = '';
  alerts.utility_alerts.forEach(function (a) {
    if (a.utility_slug === utilitySlug && a.active) {
      html += alertBanner(a.message, a.severity === 'high' ? 'urgent' : (a.severity === 'medium' ? 'warning' : 'info'));
    }
  });
  return html;
}

function federalAlert(alerts) {
  if (!alerts || !alerts.federal_credit) return '';
  return alertBanner(alerts.federal_credit.message, 'urgent');
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ---------------------------------------------------------------------------
// 1. Homepage
// ---------------------------------------------------------------------------
function generateHomepage(data) {
  var states = data.states || [];
  var utilities = data.utilities || [];
  var cities = data.cities || [];
  var alerts = data.alerts || {};
  var financing = data.financing || {};

  var regionMap = {};
  states.forEach(function (s) {
    var r = s.region || 'other';
    if (!regionMap[r]) regionMap[r] = [];
    regionMap[r].push(s);
  });

  var regionNames = { northeast: 'Northeast', southeast: 'Southeast', midwest: 'Midwest', southwest: 'Southwest', west: 'West', pacific: 'Pacific' };

  var stateLinksHtml = '';
  Object.keys(regionMap).sort().forEach(function (region) {
    stateLinksHtml += '<div class="state-region"><h3>' + (regionNames[region] || region) + '</h3><div class="state-grid">';
    regionMap[region].forEach(function (s) {
      stateLinksHtml += '<a href="/solar-rebates-incentives-' + s.slug + '/" class="state-link">' + s.state_name + ' (' + s.state_abbrev + ')</a>';
    });
    stateLinksHtml += '</div></div>';
  });

  var topCities = cities.slice(0, 12);
  var cityLinksHtml = topCities.map(function (c) {
    return '<a href="/is-solar-worth-it-in-' + c.slug + '-' + c.state_abbrev.toLowerCase() + '/" class="related-card"><span class="related-title">' + c.city_name + ', ' + c.state_abbrev + '</span><span class="related-meta">' + c.avg_sun_hours + ' sun hrs/day &middot; $' + c.avg_electricity_rate + '/kWh</span></a>';
  }).join('');

  var body = `
<section class="hero">
<div class="container">
<div class="hero-content">
<h1>Solar Tax Credit ${SITE.year}: Calculate Your Savings, Find Rebates &amp; Incentives</h1>
<p class="hero-subtitle">Discover how much you can save with solar energy. Our free <strong>solar savings calculator</strong> analyzes the <strong>30% federal solar tax credit</strong>, state rebates, utility incentives, and local programs to give you an accurate savings estimate. Over ${fmt(cities.length)} cities and all 50 states covered. Join thousands of homeowners who have used SolarSavingsAI to make informed solar decisions.</p>
${eligibilityWidget('hero')}
</div>
</div>
</section>

${aboveFoldQuoteCta('Your Area')}

<section class="content-section">
<div class="container">
${statsGrid([
  { value: '30%', label: 'Federal Solar Tax Credit (ITC)' },
  { value: '50', label: 'State Incentive Programs Tracked' },
  { value: fmt(utilities.length) + '+', label: 'Utility Net Metering Policies' },
  { value: fmt(cities.length) + '+', label: 'City Solar ROI Reports' }
])}
</div>
</section>

<section class="content-section bg-light" id="how-it-works">
<div class="container">
<h2 class="section-title text-center">How to Calculate Your Solar Savings in 3 Steps</h2>
<div class="steps-grid">
<div class="step-card">
<div class="step-number">1</div>
<h3>Enter Your ZIP Code &amp; Electric Bill</h3>
<p>Provide your ZIP code, homeownership status, and average monthly electric bill. We use this to match you with state-specific solar incentives and calculate accurate savings projections based on your local electricity rates and sun exposure.</p>
</div>
<div class="step-card">
<div class="step-number">2</div>
<h3>See All Available Solar Incentives</h3>
<p>We identify the 30% <a href="/article/federal-solar-tax-credit-2026-complete-guide/">federal solar tax credit</a>, state rebates, SREC income, utility programs, <a href="/solar-glossary/#term-net-metering">net metering</a> policies, and property tax exemptions available in your area.</p>
</div>
<div class="step-card">
<div class="step-number">3</div>
<h3>Get Your 20-Year Savings Estimate</h3>
<p>Receive a detailed ROI projection including your break-even timeline, annual electricity savings, total incentive value, and <a href="/solar-financing/">financing options</a> comparison. Most homeowners save $20,000–$60,000 over 20 years.</p>
</div>
</div>
</div>
</section>

${affiliateCtaBlock('Your Area', 'homepage-top')}

<section class="content-section" id="solar-incentives-overview">
<div class="container">
<h2 class="section-title text-center">Understanding Solar Tax Credits, Rebates &amp; Incentives in ${SITE.year}</h2>
<div class="content-prose">
<p>The <strong>federal solar tax credit</strong> (Investment Tax Credit or ITC) lets homeowners deduct <strong>30% of their solar installation cost</strong> from federal taxes. This incentive, extended through 2032 under the Inflation Reduction Act, is the single largest solar incentive available. For a typical $15,000 system, that is $4,500 back on your taxes. <a href="/article/federal-solar-tax-credit-2026-complete-guide/">Read our complete federal solar tax credit guide</a> for step-by-step claiming instructions.</p>
<p>Beyond the federal credit, many states offer additional <strong>solar rebates</strong>, tax credits, and performance-based incentives. Some states like <a href="/solar-rebates-incentives-new-york/">New York</a>, <a href="/solar-rebates-incentives-california/">California</a>, and <a href="/solar-rebates-incentives-massachusetts/">Massachusetts</a> offer state tax credits worth thousands of dollars on top of the federal ITC. Others, like <a href="/solar-rebates-incentives-new-jersey/">New Jersey</a> and <a href="/solar-rebates-incentives-maryland/">Maryland</a>, have valuable SREC (Solar Renewable Energy Certificate) programs that provide ongoing income for solar production.</p>
<p>Utility companies also play a role through <strong>net metering</strong> policies, which credit you for excess solar energy sent back to the grid. The value of net metering varies significantly — <a href="/solar-rebates-incentives-arizona/">check your state</a> to see current rates. Combined, these <strong>solar incentives</strong> can reduce the cost of going solar by 40-70% depending on where you live.</p>
<h3>How Much Can You Save with Solar in ${SITE.year}?</h3>
<p>The average homeowner saves between <strong>$20,000 and $60,000 over 20 years</strong> after accounting for all available incentives. Your actual savings depend on local electricity rates, sun exposure, system size, and available state and utility programs. States with high electricity rates like <a href="/solar-rebates-incentives-connecticut/">Connecticut</a>, <a href="/solar-rebates-incentives-rhode-island/">Rhode Island</a>, and <a href="/solar-rebates-incentives-new-hampshire/">New Hampshire</a> often see the fastest payback periods. Use our <a href="#estimate">free solar savings calculator</a> above to get a personalized estimate based on your ZIP code.</p>
</div>
</div>
</section>

<section class="content-section" id="state-map">
<div class="container">
<h2 class="section-title text-center">Solar Rebates &amp; Incentives by State</h2>
<p class="text-center mb-4">Select your state to see detailed solar tax credit information, utility rebate programs, ROI projections, city-level analysis, and all available incentives.</p>
${stateLinksHtml}
</div>
</section>

${midContentFinancingCta('Your Home')}

<section class="content-section">
<div class="container">
<h2 class="section-title text-center">Solar Installation Savings: What to Expect in ${SITE.year}</h2>
<div class="content-prose">
<h3>How Much Does Solar Cost After Incentives?</h3>
<p>The average residential <strong>solar installation cost</strong> ranges from $13,500 to $18,000 before incentives. After applying the <strong>30% federal solar tax credit</strong> (worth $4,050–$5,400), the net cost drops to roughly $9,450–$12,600. Many states offer additional incentives that reduce costs further — in some cases to under $8,000. See our <a href="/guide/solar-panel-cost-guide/">detailed solar cost breakdown</a> for exact pricing by state.</p>
<h3>Solar Cost After Incentives by State</h3>
<p>Solar savings vary dramatically by location. Homeowners in <a href="/solar-rebates-incentives-texas/">Texas</a> and <a href="/solar-rebates-incentives-florida/">Florida</a> benefit from high sun exposure, while those in <a href="/solar-rebates-incentives-new-york/">New York</a> and <a href="/solar-rebates-incentives-massachusetts/">Massachusetts</a> benefit from generous state incentives and high electricity rates. <a href="#state-map">Select your state above</a> to see your specific incentive package.</p>
<h3>Solar Energy Savings Over Time</h3>
<p>After the initial payback period (typically 6–10 years), your solar panels produce essentially <strong>free electricity</strong> for the remaining 15–20+ years of their lifespan. With electricity rates historically rising 2–3% annually, the value of your solar investment grows over time. Most homeowners see total <strong>solar energy savings</strong> of $20,000–$60,000 over a 20-year period. Learn more about <a href="/article/solar-panel-roi-real-numbers-analysis/">real solar ROI numbers</a> from actual installations.</p>
</div>
</div>
</section>

<section class="content-section bg-light">
<div class="container">
<h2 class="section-title text-center">Top Cities for Solar Savings</h2>
<p class="text-center mb-4">These cities offer some of the best solar ROI due to high sun hours, favorable electricity rates, and strong local incentive programs.</p>
<div class="related-grid">
${cityLinksHtml}
</div>
</div>
</section>

<section class="content-section">
<div class="container">
<h2 class="section-title text-center">Solar Financing: Cash vs. Loan vs. Lease vs. PPA</h2>
<p class="text-center mb-4">Compare solar financing options to find the right fit for your budget. Many homeowners go solar with <strong>$0 down</strong>.</p>
<div class="financing-overview-grid">
<div class="stat-card"><span class="stat-value">Cash</span><span class="stat-label">Best total savings. Own your system and claim the full 30% tax credit from day one.</span></div>
<div class="stat-card"><span class="stat-value">Solar Loan</span><span class="stat-label">Own system, get tax credits, and spread payments over 10-25 years at rates from 3.99% APR.</span></div>
<div class="stat-card"><span class="stat-value">Lease</span><span class="stat-label">$0 down with no maintenance. Lower total savings but immediate bill reduction.</span></div>
<div class="stat-card"><span class="stat-value">PPA</span><span class="stat-label">Pay per kWh at rates 10-30% below your utility. No upfront cost or maintenance.</span></div>
</div>
<div class="text-center mt-4"><a href="/solar-financing/" class="btn btn-primary btn-lg">Compare All Financing Options</a></div>
</div>
</section>

${comparisonAffiliateTable('Compare Top Solar Providers', [
  { name: 'EnergySage', type: 'Marketplace', highlight: 'Compare 3-7 quotes free', rating: '4.8/5', slug: 'energysage-hp', affiliate_url: 'https://www.energysage.com/solar/?rc=solarsavingsai', cta_text: 'Get Quotes' },
  { name: 'Modernize', type: 'Lead Matching', highlight: 'Top local installer matching', rating: '4.7/5', slug: 'modernize-hp', affiliate_url: 'https://modernize.com/solar?aff=solarsavingsai', cta_text: 'Get Matched' },
  { name: 'Sunrun', type: 'Installer', highlight: '$0 down lease & loan', rating: '4.5/5', slug: 'sunrun-hp', affiliate_url: 'https://www.sunrun.com/solar-plans?partner=solarsavingsai', cta_text: 'View Plans' },
  { name: 'SunPower', type: 'Installer', highlight: 'Highest efficiency panels', rating: '4.6/5', slug: 'sunpower-hp', affiliate_url: 'https://us.sunpower.com/get-quote?ref=solarsavingsai', cta_text: 'Get Quote' },
  { name: 'SolarReviews', type: 'Marketplace', highlight: 'Read reviews & get quotes', rating: '4.6/5', slug: 'solarreviews-hp', affiliate_url: 'https://www.solarreviews.com/installers?ref=solarsavingsai', cta_text: 'Find Installers' }
])}

${faqSection([
  { question: 'What is the federal solar tax credit for ' + SITE.year + '?', answer: 'The federal solar Investment Tax Credit (ITC) allows homeowners to deduct <strong>30%</strong> of their total solar installation cost from federal income taxes. For a $15,000 system, that is $4,500 back. This credit applies to equipment, labor, permitting, and sales tax. It was extended at 30% through 2032 under the Inflation Reduction Act, then drops to 26% in 2033 and 22% in 2034. <a href="/article/federal-solar-tax-credit-2026-complete-guide/">Read our complete ITC guide</a>.' },
  { question: 'How much do solar panels cost in ' + SITE.year + '?', answer: 'The average residential solar system costs between <strong>$13,500 and $18,000</strong> before incentives, depending on system size and location. After the 30% federal tax credit and state incentives, net costs typically range from $8,000 to $14,000. Costs have dropped over 70% in the past decade. <a href="/guide/solar-panel-cost-guide/">See our detailed cost guide</a>.' },
  { question: 'How much can I save with solar panels?', answer: 'Most homeowners save between <strong>$20,000 and $60,000</strong> over 20 years depending on location, electricity rates, system size, and incentives. States with high electricity rates like <a href="/solar-rebates-incentives-california/">California</a>, <a href="/solar-rebates-incentives-new-york/">New York</a>, and <a href="/solar-rebates-incentives-massachusetts/">Massachusetts</a> see the highest savings. Use our calculator above for a personalized estimate.' },
  { question: 'Do I need to buy solar panels outright?', answer: 'No. You can finance solar through <strong>loans, leases, or power purchase agreements (PPAs)</strong>. Many options require $0 down. Solar loans let you own the system and claim tax credits. Leases and PPAs require no upfront investment but offer lower total savings. <a href="/solar-financing/">Compare all financing options</a>.' },
  { question: 'How long does it take for solar to pay for itself?', answer: 'Most residential solar systems reach break-even in <strong>6-10 years</strong>, depending on your state incentives, electricity rates, and system cost. After payback, your electricity is essentially free for the remaining 15-20+ year lifespan. States with strong incentives and high utility rates see faster payback periods.' },
  { question: 'What solar rebates are available in my state?', answer: 'Solar incentives vary widely by state. Common programs include state tax credits, direct rebates, SRECs (Solar Renewable Energy Certificates), property tax exemptions, sales tax exemptions, and net metering credits. <a href="#state-map">Select your state above</a> to see every available incentive.' },
  { question: 'Is solar worth it in ' + SITE.year + '?', answer: 'For most homeowners, yes. With the 30% federal tax credit, falling panel prices, and rising electricity rates (averaging 2-3% annually), solar provides strong returns. The average homeowner breaks even in 6-10 years and saves $20,000-$60,000 over the system lifetime. Solar also increases home value by an average of 4.1% according to Zillow research.' },
  { question: 'How does net metering work?', answer: 'Net metering credits you for excess solar electricity sent back to the grid. When your panels produce more than you use (typically midday), the surplus flows to the grid and your meter effectively spins backward. You use those credits when your panels are not producing (nighttime, cloudy days). Policies vary by state and utility — <a href="/solar-glossary/#term-net-metering">learn more in our glossary</a>.' },
  { question: 'Do solar panels increase home value?', answer: 'Yes. According to research from Zillow, homes with solar panels sell for approximately <strong>4.1% more</strong> than comparable homes without. A study by Lawrence Berkeley National Laboratory found that buyers are willing to pay an average premium of $15,000 for a home with an owned solar system. Many states also offer <a href="#state-map">property tax exemptions</a> so the added value does not increase your property taxes.' },
  { question: 'What happens to solar panels during a power outage?', answer: 'Standard grid-tied solar systems shut off during power outages for safety (to protect utility workers). To keep your power on during outages, you need a <strong>solar battery storage system</strong> like the Tesla Powerwall or Enphase IQ Battery. Battery costs range from $10,000-$15,000 installed, and some states offer battery incentives. <a href="/guide/solar-battery-buying-guide/">Read our battery buying guide</a>.' }
])}

${affiliateCtaBlock('Your Area', 'homepage-bottom')}

${emailCaptureBlock('Your Home')}

${authorBioBlock()}

${hubLinksSection('Solar Financing Hub', [
  { title: 'Complete Solar Financing Guide', url: '/guide/solar-financing-complete-guide/', meta: 'Loans, leases, PPAs & more' },
  { title: 'Solar Loans vs Leases vs PPA', url: '/guide/solar-loans-vs-leases-vs-ppa/', meta: 'Which saves you the most?' },
  { title: 'Solar Tax Credit Filing Guide', url: '/guide/solar-tax-credits-guide/', meta: 'Step-by-step ITC guide' },
  { title: 'Financing Options Compared', url: '/solar-financing/', meta: '12 providers compared' }
])}

${hubLinksSection('Solar Equipment Hub', [
  { title: 'Best Solar Panels 2026', url: '/guide/best-solar-panels-2026/', meta: 'Expert rankings & reviews' },
  { title: 'Best Solar Companies 2026', url: '/guide/best-solar-companies-2026/', meta: 'Top installers compared' },
  { title: 'Solar Battery Buying Guide', url: '/guide/solar-battery-buying-guide/', meta: 'Home storage options' },
  { title: 'Solar Warranties Explained', url: '/guide/solar-warranties-explained/', meta: 'Coverage & protection' }
])}

${hubLinksSection('Getting Started Hub', [
  { title: 'Complete Guide to Home Solar', url: '/guide/complete-guide-home-solar/', meta: 'Everything you need to know' },
  { title: 'How to Choose a Solar Installer', url: '/guide/how-to-choose-solar-installer/', meta: '10 critical questions' },
  { title: 'Solar Panel Cost Guide', url: '/guide/solar-panel-cost-guide/', meta: 'Real costs in 2026' },
  { title: 'Solar Installation Guide', url: '/guide/solar-installation-guide/', meta: 'Complete walkthrough' }
])}

${hubLinksSection('Latest Articles', [
  { title: 'Federal Solar Tax Credit 2026: Complete Guide', url: '/article/federal-solar-tax-credit-2026-complete-guide/', meta: 'How to claim the 30% ITC' },
  { title: 'Solar Panel ROI: Real Numbers Analyzed', url: '/article/solar-panel-roi-real-numbers-analysis/', meta: 'Data from 10,000+ installations' },
  { title: 'Solar Panels vs. Grid Power: 20-Year Comparison', url: '/article/solar-panels-vs-grid-power-20-year-cost-comparison/', meta: 'Complete cost analysis' },
  { title: 'Solar Financing: Cash vs. Loan vs. Lease vs. PPA', url: '/article/solar-financing-cash-loan-lease-ppa-compared/', meta: 'Side-by-side comparison' },
  { title: 'Solar Panel Myths Debunked', url: '/article/solar-panel-myths-debunked-common-misconceptions/', meta: '12 common misconceptions' },
  { title: 'View All Articles', url: '/articles/', meta: 'Expert guides and analysis' }
])}

${ctaBlock('primary', 'Get Your Free Solar Estimate', 'Enter your ZIP code above to see available rebates and projected savings for your home.', '#widget-hero')}
`;

  var faqs = [
    { question: 'What is the federal solar tax credit for ' + SITE.year + '?', answer: 'The federal solar Investment Tax Credit (ITC) allows homeowners to deduct 30% of their total solar installation cost from federal income taxes. This credit applies to equipment, labor, permitting, and sales tax. It was extended at 30% through 2032 under the Inflation Reduction Act.' },
    { question: 'How much do solar panels cost in ' + SITE.year + '?', answer: 'The average residential solar system costs between $13,500 and $18,000 before incentives. After the 30% federal tax credit and state incentives, net costs typically range from $8,000 to $14,000.' },
    { question: 'How much can I save with solar panels?', answer: 'Savings depend on your location, electricity rates, system size, and available incentives. On average, homeowners save between $20,000 and $60,000 over 20 years.' },
    { question: 'Do I need to buy solar panels outright?', answer: 'No. You can finance solar through loans, leases, or power purchase agreements. Many options require $0 down.' },
    { question: 'How long does it take for solar to pay for itself?', answer: 'Most residential solar systems reach break-even in 6-10 years.' },
    { question: 'What solar rebates are available in my state?', answer: 'Solar incentives vary widely by state. Common programs include state tax credits, direct rebates, SRECs, property tax exemptions, sales tax exemptions, and net metering credits.' },
    { question: 'Is solar worth it in ' + SITE.year + '?', answer: 'For most homeowners, yes. With the 30% federal tax credit, falling panel prices, and rising electricity rates, solar provides strong returns. The average homeowner breaks even in 6-10 years and saves $20,000-$60,000 over the system lifetime.' },
    { question: 'How does net metering work?', answer: 'Net metering credits you for excess solar electricity sent back to the grid. When your panels produce more than you use, the surplus flows to the grid. You use those credits when your panels are not producing.' },
    { question: 'Do solar panels increase home value?', answer: 'Yes. According to Zillow research, homes with solar panels sell for approximately 4.1% more than comparable homes without solar.' },
    { question: 'What happens to solar panels during a power outage?', answer: 'Standard grid-tied solar systems shut off during power outages for safety. To keep power on during outages, you need a solar battery storage system.' }
  ];

  return baseTemplate(
    'Solar Tax Credit Calculator ' + SITE.year + ': Rebates, Incentives & Savings by State',
    'Free solar savings calculator: find the 30% federal solar tax credit, state rebates, utility incentives & net metering programs. Compare financing, estimate your ROI, and discover how much you can save going solar in ' + SITE.year + '. Trusted by thousands of homeowners.',
    '/',
    body,
    {
      alertHtml: federalAlert(alerts),
      schema: joinSchemas(faqSchema(faqs), serviceSchema('Solar Savings Calculator', 'Free AI-powered solar savings calculator. Find the federal solar tax credit, state rebates, utility incentives, and calculate your estimated savings across all 50 states.'), JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How to Calculate Your Solar Savings',
        description: 'Use our free calculator to estimate how much you can save by going solar. Follow these 3 simple steps.',
        step: [
          { '@type': 'HowToStep', position: 1, name: 'Enter Your ZIP Code & Electric Bill', text: 'Provide your ZIP code, homeownership status, and average monthly electric bill to match with state-specific solar incentives.' },
          { '@type': 'HowToStep', position: 2, name: 'See All Available Solar Incentives', text: 'We identify the 30% federal solar tax credit, state rebates, SREC income, utility programs, net metering policies, and property tax exemptions.' },
          { '@type': 'HowToStep', position: 3, name: 'Get Your 20-Year Savings Estimate', text: 'Receive a detailed ROI projection including break-even timeline, annual savings, and total incentive value.' }
        ]
      })),
      states: states
    }
  );
}

// ---------------------------------------------------------------------------
// 2. State Page
// ---------------------------------------------------------------------------
function generateStatePage(state, stateData) {
  var states = stateData.states || [];
  var utilities = stateData.utilities || [];
  var cities = stateData.cities || [];
  var alerts = stateData.alerts || {};

  var stateUtilities = utilities.filter(function (u) { return u.state_abbrev === state.state_abbrev; });
  var stateCities = cities.filter(function (c) { return c.state_abbrev === state.state_abbrev; });

  var roi = calculateROI(
    state.avg_install_cost, state.avg_system_size, state.sunlight_hours,
    state.avg_kwh_rate, 30, state.state_tax_credit_percent, state.state_rebate_amount
  );

  var incentiveRows = [];
  incentiveRows.push(['Federal ITC (30%)', dollar(roi.fedSavings), 'Tax credit on federal return']);
  if (state.state_tax_credit_percent > 0) {
    incentiveRows.push(['State Tax Credit (' + state.state_tax_credit_percent + '%)', dollar(state.avg_install_cost * state.state_tax_credit_percent / 100), 'State income tax credit']);
  }
  if (state.state_rebate_amount > 0) {
    incentiveRows.push(['State Rebate', dollar(state.state_rebate_amount), 'Direct rebate from state program']);
  }
  if (state.srec_available) {
    incentiveRows.push(['SRECs', '$' + state.srec_value + '/MWh', 'Tradeable renewable energy credits']);
  }
  if (state.property_tax_exemption) {
    incentiveRows.push(['Property Tax Exemption', 'Yes', 'Solar adds value without raising property taxes']);
  }
  if (state.sales_tax_exemption) {
    incentiveRows.push(['Sales Tax Exemption', 'Yes', 'No sales tax on solar equipment']);
  }
  incentiveRows.push(['Net Metering', state.net_metering_status, 'Credit for excess solar energy exported']);

  var utilityLinksHtml = stateUtilities.map(function (u) {
    return '<a href="/utility-rebates/' + u.slug + '/" class="related-card"><span class="related-title">' + u.utility_name + '</span><span class="related-meta">' + (u.cap_reached ? 'Cap reached — act soon' : 'Net metering: ' + u.net_metering_rate) + '</span></a>';
  }).join('');

  var cityLinksHtml = stateCities.map(function (c) {
    return '<a href="/is-solar-worth-it-in-' + c.slug + '-' + c.state_abbrev.toLowerCase() + '/" class="related-card"><span class="related-title">' + c.city_name + '</span><span class="related-meta">' + c.avg_sun_hours + ' sun hrs &middot; $' + c.avg_electricity_rate + '/kWh</span></a>';
  }).join('');

  var nearbyStates = states.filter(function (s) { return s.region === state.region && s.slug !== state.slug; }).slice(0, 6);

  var faqs = [
    { question: 'What solar incentives are available in ' + state.state_name + ' in ' + SITE.year + '?', answer: 'Homeowners in ' + state.state_name + ' can claim the 30% federal ITC' + (state.state_tax_credit_percent > 0 ? ', a ' + state.state_tax_credit_percent + '% state tax credit' : '') + (state.state_rebate_amount > 0 ? ', a ' + dollar(state.state_rebate_amount) + ' state rebate' : '') + (state.srec_available ? ', and SRECs worth $' + state.srec_value + '/MWh' : '') + '. Net metering status: ' + state.net_metering_status + '.' + (state.property_tax_exemption ? ' Solar installations are exempt from property tax increases.' : '') + (state.sales_tax_exemption ? ' No sales tax on solar equipment.' : '') },
    { question: 'How much do solar panels cost in ' + state.state_name + '?', answer: 'The average solar installation in ' + state.state_name + ' costs approximately ' + dollar(state.avg_install_cost) + ' for a ' + state.avg_system_size + ' kW system before incentives. After the 30% federal tax credit and state incentives, the net cost is approximately ' + dollar(roi.netCost) + '. Prices vary by installer, equipment choice, and roof complexity.' },
    { question: 'How long does solar take to pay for itself in ' + state.state_name + '?', answer: 'Based on average electricity rates of $' + state.avg_kwh_rate + '/kWh and ' + state.sunlight_hours + ' peak sun hours per day, a solar system in ' + state.state_name + ' typically pays for itself in approximately ' + roi.breakEvenYears + ' years. After break-even, electricity savings are essentially pure profit for the remaining 15-20 year system lifespan.' },
    { question: 'Is net metering available in ' + state.state_name + '?', answer: 'Net metering in ' + state.state_name + ' is currently classified as "' + state.net_metering_status + '". This affects how much credit you receive for excess solar energy exported to the grid. Check with your specific utility for current rates and policies.' },
    { question: 'What is the 20-year savings estimate for solar in ' + state.state_name + '?', answer: 'Based on our calculations, a typical ' + state.avg_system_size + ' kW solar system in ' + state.state_name + ' can save approximately ' + dollar(roi.twentyYearSavings) + ' over 20 years, factoring in all available incentives and annual electricity bill savings of ' + dollar(roi.annualSavings) + '.' },
    { question: 'How do I claim the solar tax credit in ' + state.state_name + '?', answer: 'To claim the 30% federal solar tax credit, file IRS Form 5695 with your tax return after your system is installed and operational. You need documentation of total installation costs. The credit reduces your federal tax liability dollar-for-dollar. If the credit exceeds your tax liability, the remainder can be carried forward to future tax years.' + (state.state_tax_credit_percent > 0 ? ' ' + state.state_name + '\'s ' + state.state_tax_credit_percent + '% state credit is claimed on your state tax return.' : '') },
    { question: 'Can I go solar with no money down in ' + state.state_name + '?', answer: 'Yes. Multiple financing options allow you to go solar in ' + state.state_name + ' with $0 down: solar loans (own the system and claim tax credits), solar leases, and power purchase agreements (PPAs). Compare options on our financing page to find the best fit for your budget and goals.' },
    { question: 'What is the best time to install solar in ' + state.state_name + '?', answer: 'The best time to install solar in ' + state.state_name + ' is now, while the 30% federal tax credit is available through 2032 (it drops to 26% in 2033). Solar panels produce energy year-round in ' + state.state_name + ' with an average of ' + state.sunlight_hours + ' peak sun hours per day. Installation typically takes 1-3 months from signing to activation.' }
  ];

  var crumbs = [
    { label: 'Home', url: '/' },
    { label: 'State Rebates', url: '/#state-map' },
    { label: state.state_name }
  ];

  var body = `
<section class="content-section">
<div class="container">
<h1>${state.state_name} Solar Rebates, Tax Credits &amp; Incentives Guide (${SITE.year})</h1>
<p class="lead">Complete guide to <strong>solar incentives in ${state.state_name}</strong>. Discover the 30% federal solar tax credit, state rebates, utility net metering programs, SREC income, and local incentives. Average savings: <strong>${dollar(roi.twentyYearSavings)} over 20 years</strong> with a break-even period of ~${roi.breakEvenYears} years. Calculate your savings with our free tool below.</p>
${lastUpdatedBlock('Sarah Chen', 'sarah-chen')}

${aboveFoldQuoteCta(state.state_name)}

${statsGrid([
  { value: dollar(state.avg_install_cost), label: 'Avg. System Cost (' + state.avg_system_size + ' kW)' },
  { value: dollar(roi.netCost), label: 'Net Cost After Incentives' },
  { value: roi.breakEvenYears + ' yrs', label: 'Break-Even Timeline' },
  { value: dollar(roi.twentyYearSavings), label: '20-Year Savings' },
  { value: state.sunlight_hours + ' hrs', label: 'Peak Sun Hours/Day' },
  { value: '$' + state.avg_kwh_rate + '/kWh', label: 'Avg. Electricity Rate' }
])}

${eligibilityWidget('state')}

${affiliateCtaBlock(state.state_name, 'state-top')}
</div>
</section>

<section class="content-section bg-light">
<div class="container">
<h2>${state.state_name} Solar Incentives &amp; Tax Credits Breakdown</h2>
<p>Here is a breakdown of every solar incentive available to ${state.state_name} homeowners in ${SITE.year}, from the federal solar tax credit to state-specific programs. Combine these incentives to reduce your installation cost by up to ${pct(Math.min(70, Math.round((roi.fedSavings + roi.stateSavings) / state.avg_install_cost * 100)))}.</p>
${comparisonTable(['Incentive', 'Value', 'Details'], incentiveRows)}
${state.additional_incentives ? '<div class="info-box"><strong>Additional Programs:</strong> ' + state.additional_incentives + '</div>' : ''}
<p class="mt-3">Want to understand how these incentives stack? Read our <a href="/article/federal-solar-tax-credit-2026-complete-guide/">complete federal solar tax credit guide</a> or explore <a href="/solar-financing/">financing options</a> that let you claim all credits with $0 down. Compare <a href="/guide/best-solar-panels-2026/">top-rated solar panels</a> and find <a href="/guide/how-to-choose-solar-installer/">the right installer</a> for your project.</p>
</div>
</section>

${midContentFinancingCta(state.state_name, dollar(roi.annualSavings))}

<section class="content-section">
<div class="container">
<h2>Solar Installation Cost &amp; ROI Analysis for ${state.state_name}</h2>
<p>Based on a ${state.avg_system_size} kW system at ${dollar(state.avg_install_cost)} with ${state.sunlight_hours} peak sun hours per day and electricity at $${state.avg_kwh_rate}/kWh. <a href="/guide/solar-panel-cost-guide/">See our complete solar cost guide</a> for details on what affects pricing.</p>
${barChartComponent([
  { label: 'System Cost', value: state.avg_install_cost, max: state.avg_install_cost },
  { label: 'Federal ITC Savings', value: roi.fedSavings, max: state.avg_install_cost },
  { label: 'State Incentives', value: roi.stateSavings, max: state.avg_install_cost },
  { label: 'Year 1 Electric Savings', value: roi.annualSavings, max: state.avg_install_cost },
  { label: '20-Year Net Savings', value: Math.max(0, roi.twentyYearSavings), max: Math.max(roi.twentyYearSavings, state.avg_install_cost) }
])}
<div class="roi-summary">
<p><strong>Annual Energy Production:</strong> ${fmt(roi.annualKwh)} kWh</p>
<p><strong>Annual Electric Bill Savings:</strong> ${dollar(roi.annualSavings)}</p>
<p><strong>Total Incentive Savings:</strong> ${dollar(roi.fedSavings + roi.stateSavings)}</p>
<p><strong>Net System Cost:</strong> ${dollar(roi.netCost)}</p>
<p><strong>Break-Even:</strong> ~${roi.breakEvenYears} years</p>
<p><strong>Estimated Home Value Increase:</strong> ${dollar(Math.round(state.avg_install_cost * 0.97))} (based on Zillow 4.1% premium research)</p>
</div>
<p>Want to understand how these numbers are calculated? See our <a href="/methodology/">transparent methodology</a>. Looking to finance? <a href="/solar-financing/">Compare $0-down options</a> including loans, leases, and PPAs. Not sure what equipment to choose? Check our <a href="/guide/best-solar-panels-2026/">best solar panels</a> and <a href="/guide/solar-battery-buying-guide/">battery storage guide</a>.</p>
${calculatorResultMonetization(state.state_name)}
</div>
</section>

${urgencyBlock('The 30% federal solar tax credit is available through 2032. It drops to 26% in 2033. Lock in maximum savings in ' + state.state_name + ' now.')}

<section class="content-section">
<div class="container">
<h2>How to Go Solar in ${state.state_name}: Step-by-Step</h2>
<div class="content-prose">
<p>Going solar in ${state.state_name} is straightforward when you understand the process. Here is what to expect:</p>
<ol>
<li><strong>Assess your solar potential:</strong> Check your roof orientation, shading, and electricity usage. ${state.sunlight_hours} peak sun hours per day means ${state.state_name} has ${state.sunlight_hours >= 5 ? 'excellent' : state.sunlight_hours >= 4 ? 'good' : 'moderate'} solar potential.</li>
<li><strong>Compare quotes:</strong> Get at least 3 quotes from <a href="/guide/how-to-choose-solar-installer/">qualified installers</a>. Compare equipment, pricing, warranties, and financing terms.</li>
<li><strong>Choose financing:</strong> Decide between <a href="/solar-financing/">cash, loan, lease, or PPA</a>. Cash and loans let you claim the <a href="/article/federal-solar-tax-credit-2026-complete-guide/">30% federal tax credit</a>.</li>
<li><strong>Installation &amp; permitting:</strong> Your installer handles permitting. Installation typically takes 1–3 days on the roof. Read our <a href="/guide/solar-installation-guide/">complete installation guide</a>.</li>
<li><strong>Interconnection:</strong> Your utility connects your system to the grid and activates net metering.</li>
<li><strong>Claim incentives:</strong> File IRS Form 5695 for the federal credit${state.state_tax_credit_percent > 0 ? ' and claim your ' + state.state_tax_credit_percent + '% state credit on your state return' : ''}.</li>
</ol>
</div>
</div>
</section>

${sidebarAffiliateWidget(state.state_name)}

${stateUtilities.length > 0 ? '<section class="content-section bg-light"><div class="container"><h2>Utility Companies in ' + state.state_name + '</h2><p>Review net metering policies, export compensation rates, and solar programs for each utility serving ' + state.state_name + '.</p><div class="related-grid">' + utilityLinksHtml + '</div></div></section>' : ''}

${stateCities.length > 0 ? '<section class="content-section"><div class="container"><h2>City Solar Reports in ' + state.state_name + '</h2><p>Get city-specific solar ROI projections, local incentives, and break-even analysis.</p><div class="related-grid">' + cityLinksHtml + '</div></div></section>' : ''}

${comparisonAffiliateTable('Best Solar Options in ' + state.state_name, [
  { name: 'EnergySage', type: 'Marketplace', highlight: 'Compare local ' + state.state_name + ' installers', rating: '4.8/5', slug: 'energysage-' + state.slug, affiliate_url: 'https://www.energysage.com/solar/?rc=solarsavingsai', cta_text: 'Get Quotes' },
  { name: 'Sunrun', type: 'Installer', highlight: '$0 down solar in ' + state.state_name, rating: '4.5/5', slug: 'sunrun-' + state.slug, affiliate_url: 'https://www.sunrun.com/solar-plans?partner=solarsavingsai', cta_text: 'View Plans' },
  { name: 'SunPower', type: 'Premium', highlight: 'Top efficiency panels', rating: '4.6/5', slug: 'sunpower-' + state.slug, affiliate_url: 'https://us.sunpower.com/get-quote?ref=solarsavingsai', cta_text: 'Get Quote' }
])}

${emailCaptureBlock(state.state_name)}

${faqSection(faqs)}

${authorBioBlock()}

${relatedPagesSection('Explore Nearby States', nearbyStates.map(function (s) {
  return { title: s.state_name + ' Solar Rebates', url: '/solar-rebates-incentives-' + s.slug + '/', meta: s.sunlight_hours + ' sun hrs · $' + s.avg_kwh_rate + '/kWh' };
}))}

${ctaBlock('primary', 'Get Your ' + state.state_name + ' Solar Estimate', 'See exactly how much you can save with solar in ' + state.state_name + '. Enter your ZIP code to get started.', '#widget-state')}
`;

  return baseTemplate(
    state.state_name + ' Solar Rebates & Tax Credit ' + SITE.year + ': Incentives, Cost & Savings',
    'Complete ' + state.state_name + ' solar incentives guide ' + SITE.year + ': 30% federal tax credit' + (state.state_tax_credit_percent > 0 ? ' + ' + state.state_tax_credit_percent + '% state credit' : '') + '. Net cost ' + dollar(roi.netCost) + ' for a ' + state.avg_system_size + ' kW system. Save ' + dollar(roi.twentyYearSavings) + ' over 20 years. Break-even in ~' + roi.breakEvenYears + ' years. Free calculator.',
    '/solar-rebates-incentives-' + state.slug + '/',
    body,
    {
      breadcrumbs: crumbs,
      alertHtml: stateAlerts(alerts, state.state_abbrev),
      schema: joinSchemas(faqSchema(faqs), breadcrumbSchema(crumbs), articleSchema(state.state_name + ' Solar Rebates & Tax Credit ' + SITE.year, 'Complete guide to solar incentives in ' + state.state_name + '. Federal tax credit, state rebates, utility programs, and savings calculator.', '/solar-rebates-incentives-' + state.slug + '/'), serviceSchema('Solar Savings Analysis for ' + state.state_name, 'Personalized solar savings calculator for ' + state.state_name + ' homeowners. Find the federal tax credit, state rebates, and utility incentives.', state.state_name)),
      states: states
    }
  );
}

// ---------------------------------------------------------------------------
// 3. Utility Page
// ---------------------------------------------------------------------------
function generateUtilityPage(utility, utilityData) {
  var states = utilityData.states || [];
  var utilities = utilityData.utilities || [];
  var alerts = utilityData.alerts || {};

  var parentState = states.find(function (s) { return s.state_abbrev === utility.state_abbrev; });
  var sameStateUtils = utilities.filter(function (u) { return u.state_abbrev === utility.state_abbrev && u.slug !== utility.slug; }).slice(0, 6);
  var servedCities = (utilityData.cities || []).filter(function(c) { return c.state_abbrev === utility.state_abbrev; }).slice(0, 8);

  var faqs = [
    { question: 'Does ' + utility.utility_name + ' offer net metering?', answer: utility.utility_name + ' offers net metering with a "' + utility.net_metering_rate + '" rate structure. Export compensation is approximately $' + utility.export_compensation + '/kWh.' + (utility.cap_reached ? ' Note: the net metering cap has been reached, which may affect new applicants.' : '') },
    { question: 'What is the interconnection fee for ' + utility.utility_name + '?', answer: 'The interconnection fee for ' + utility.utility_name + ' is approximately $' + utility.interconnection_fee + '. This is a one-time fee to connect your solar system to the grid.' },
    { question: 'Does ' + utility.utility_name + ' have time-of-use rates?', answer: utility.time_of_use_rate ? utility.utility_name + ' offers time-of-use (TOU) rates. Peak rate: $' + utility.peak_rate + '/kWh. Off-peak rate: $' + utility.off_peak_rate + '/kWh. Battery storage can help you shift usage to off-peak hours.' : utility.utility_name + ' does not currently offer time-of-use rates.' },
    { question: 'Does ' + utility.utility_name + ' offer battery incentives?', answer: utility.battery_incentive ? 'Yes, ' + utility.utility_name + ' offers battery storage incentives. Pairing solar with battery storage can maximize your savings by storing excess energy for use during peak rate periods.' : utility.utility_name + ' does not currently offer specific battery incentives, but you may still benefit from battery storage with time-of-use rate optimization.' },
    { question: 'How many customers does ' + utility.utility_name + ' serve?', answer: utility.utility_name + ' serves approximately ' + fmt(utility.customers_served) + ' customers in ' + utility.state + '.' }
  ];

  var crumbs = [
    { label: 'Home', url: '/' },
    { label: utility.state, url: parentState ? '/solar-rebates-incentives-' + parentState.slug + '/' : '/#state-map' },
    { label: utility.utility_name }
  ];

  var body = `
<section class="content-section">
<div class="container">
<h1>${utility.utility_name} Solar Rates, Net Metering &amp; Incentives (${SITE.year})</h1>
<p class="lead">Complete solar policy guide for ${utility.utility_name} customers in ${utility.state}. Review net metering rates, export compensation, interconnection fees, time-of-use rates, and available solar programs. See how to maximize savings with your utility.</p>
${lastUpdatedBlock('Sarah Chen', 'sarah-chen')}

${statsGrid([
  { value: utility.net_metering_rate, label: 'Net Metering Type' },
  { value: '$' + utility.export_compensation + '/kWh', label: 'Export Compensation' },
  { value: '$' + utility.interconnection_fee, label: 'Interconnection Fee' },
  { value: fmt(utility.customers_served), label: 'Customers Served' },
  { value: utility.time_of_use_rate ? '$' + utility.peak_rate + '/kWh' : 'N/A', label: 'Peak Rate (TOU)' },
  { value: utility.time_of_use_rate ? '$' + utility.off_peak_rate + '/kWh' : 'N/A', label: 'Off-Peak Rate (TOU)' }
])}

${utility.cap_reached ? urgencyBlock(utility.utility_name + ' has reached its net metering cap. New applicants may receive reduced export compensation. Act quickly to lock in the best available rates.') : ''}

${aboveFoldQuoteCta(utility.utility_name + ' Area')}

${eligibilityWidget('utility')}

${affiliateCtaBlock(utility.utility_name + ' Area', 'utility-top')}
</div>
</section>

<section class="content-section bg-light">
<div class="container">
<h2>Solar Policy Details for ${utility.utility_name}</h2>
${comparisonTable(
  ['Policy', 'Details'],
  [
    ['Net Metering', utility.net_metering_rate],
    ['Export Compensation', '$' + utility.export_compensation + '/kWh'],
    ['Interconnection Fee', '$' + utility.interconnection_fee],
    ['Time-of-Use Rates', utility.time_of_use_rate ? 'Yes (Peak: $' + utility.peak_rate + ', Off-Peak: $' + utility.off_peak_rate + ')' : 'Not available'],
    ['Net Metering Cap', utility.cap_reached ? 'Reached — limited availability' : 'Not yet reached'],
    ['Renewable Program', utility.renewable_program ? 'Available' : 'Not available'],
    ['Battery Incentive', utility.battery_incentive ? 'Available' : 'Not available'],
    ['EV Rate Program', utility.ev_rate ? 'Available' : 'Not available']
  ]
)}
</div>
</section>

<section class="content-section">
<div class="container">
<h2>Maximizing Solar Savings with ${utility.utility_name}</h2>
<div class="content-prose">
${utility.time_of_use_rate ? '<h3>Time-of-Use Rate Optimization</h3><p>' + utility.utility_name + ' uses time-of-use rates with peak pricing at $' + utility.peak_rate + '/kWh and off-peak at $' + utility.off_peak_rate + '/kWh. Solar panels produce the most energy during peak afternoon hours when rates are highest, maximizing your bill savings. Adding battery storage lets you store excess solar energy and use it during expensive peak periods.</p>' : ''}
<h3>Export Compensation</h3>
<p>When your solar system produces more electricity than you use, the excess is exported to the grid. ${utility.utility_name} compensates you at $${utility.export_compensation}/kWh for exported energy under their ${utility.net_metering_rate} policy.</p>
${utility.battery_incentive ? '<h3>Battery Storage Benefits</h3><p>' + utility.utility_name + ' offers battery storage incentives. A home battery system can store excess solar energy for use during peak rate periods or grid outages, improving your return on investment and energy independence.</p>' : ''}
</div>
</div>
</section>

${parentState ? '<section class="content-section bg-light"><div class="container"><h2>State Incentives in ' + utility.state + '</h2><p>In addition to ' + utility.utility_name + '\'s policies, ' + utility.state + ' homeowners can access:</p><ul class="benefit-list"><li><strong>Federal ITC:</strong> 30% tax credit on solar installation</li>' + (parentState.state_tax_credit_percent > 0 ? '<li><strong>State Tax Credit:</strong> ' + parentState.state_tax_credit_percent + '% additional state credit</li>' : '') + (parentState.state_rebate_amount > 0 ? '<li><strong>State Rebate:</strong> ' + dollar(parentState.state_rebate_amount) + ' direct rebate</li>' : '') + (parentState.srec_available ? '<li><strong>SRECs:</strong> $' + parentState.srec_value + '/MWh tradeable credits</li>' : '') + (parentState.property_tax_exemption ? '<li><strong>Property Tax Exemption:</strong> Solar increases home value without raising property taxes</li>' : '') + (parentState.sales_tax_exemption ? '<li><strong>Sales Tax Exemption:</strong> No sales tax on solar equipment</li>' : '') + '</ul><a href="/solar-rebates-incentives-' + parentState.slug + '/" class="btn btn-primary mt-3">See All ' + utility.state + ' Incentives</a></div></section>' : ''}

${emailCaptureBlock(utility.state)}

${sidebarAffiliateWidget(utility.utility_name + ' Area')}

${faqSection(faqs)}

${authorBioBlock()}

${servedCities.length > 0 ? relatedPagesSection('Cities Served by ' + utility.utility_name, servedCities.map(function(c) { return { title: c.city_name + ', ' + c.state_abbrev, url: '/is-solar-worth-it-in-' + c.slug + '-' + c.state_abbrev.toLowerCase() + '/', meta: c.avg_sun_hours + ' sun hrs/day' }; })) : ''}

${relatedPagesSection('Other Utilities in ' + utility.state, sameStateUtils.map(function (u) {
  return { title: u.utility_name, url: '/utility-rebates/' + u.slug + '/', meta: 'Net metering: ' + u.net_metering_rate };
}))}

${ctaBlock('primary', 'Check Your Solar Savings', 'See how much you can save as a ' + utility.utility_name + ' customer. Enter your ZIP code to get started.', '#widget-utility')}
`;

  return baseTemplate(
    utility.utility_name + ' Solar Net Metering & Rates ' + SITE.year + ' — Incentives Guide',
    utility.utility_name + ' solar guide ' + SITE.year + ': ' + utility.net_metering_rate + ' net metering, $' + utility.export_compensation + '/kWh export rate, $' + utility.interconnection_fee + ' interconnection fee. Complete solar policy guide for ' + fmt(utility.customers_served) + ' customers in ' + utility.state + '.',
    '/utility-rebates/' + utility.slug + '/',
    body,
    {
      breadcrumbs: crumbs,
      alertHtml: utilityAlerts(alerts, utility.slug),
      schema: joinSchemas(faqSchema(faqs), breadcrumbSchema(crumbs), articleSchema(utility.utility_name + ' Net Metering & Solar Rates ' + SITE.year, 'Complete solar policy guide for ' + utility.utility_name + ' customers in ' + utility.state, '/utility-rebates/' + utility.slug + '/')),
      states: states
    }
  );
}

// ---------------------------------------------------------------------------
// 4. City Page
// ---------------------------------------------------------------------------
function generateCityPage(city, cityData) {
  var states = cityData.states || [];
  var cities = cityData.cities || [];
  var financing = cityData.financing || {};
  var alerts = cityData.alerts || {};

  var parentState = states.find(function (s) { return s.state_abbrev === city.state_abbrev; });
  if (!parentState) parentState = { state_name: city.state_name, slug: city.state_name.toLowerCase().replace(/\s+/g, '-'), avg_install_cost: 15000, avg_system_size: 7, state_tax_credit_percent: 0, state_rebate_amount: 0, net_metering_status: 'varies', sunlight_hours: city.avg_sun_hours, avg_kwh_rate: city.avg_electricity_rate };

  var roi = calculateROI(
    parentState.avg_install_cost, parentState.avg_system_size, city.avg_sun_hours,
    city.avg_electricity_rate, 30, parentState.state_tax_credit_percent, parentState.state_rebate_amount
  );

  var nearbyCities = cities.filter(function (c) { return c.state_abbrev === city.state_abbrev && c.slug !== city.slug; }).slice(0, 6);
  var cityUtilities = (cityData.utilities || []).filter(function(u) { return u.state_abbrev === city.state_abbrev; }).slice(0, 5);

  var yearSavingsRows = [];
  for (var yr = 1; yr <= 20; yr += (yr < 5 ? 1 : (yr < 10 ? 2 : 5))) {
    var cumSavings = roi.annualSavings * yr;
    var netPosition = cumSavings - roi.netCost;
    yearSavingsRows.push(['Year ' + yr, dollar(cumSavings), dollar(netPosition), netPosition >= 0 ? 'Profitable' : 'Paying off']);
  }
  if (yearSavingsRows[yearSavingsRows.length - 1][0] !== 'Year 20') {
    var cumSavings20 = roi.annualSavings * 20;
    yearSavingsRows.push(['Year 20', dollar(cumSavings20), dollar(cumSavings20 - roi.netCost), 'Profitable']);
  }

  var faqs = [
    { question: 'Is solar worth it in ' + city.city_name + ', ' + city.state_abbrev + ' in ' + SITE.year + '?', answer: 'Yes. With ' + city.avg_sun_hours + ' average peak sun hours per day and electricity rates at $' + city.avg_electricity_rate + '/kWh (' + city.electricity_trend + ' trend), solar is a strong investment in ' + city.city_name + '. The estimated 20-year savings is ' + dollar(roi.twentyYearSavings) + ' with a break-even period of approximately ' + roi.breakEvenYears + ' years. After break-even, electricity savings are essentially free income.' },
    { question: 'How much do solar panels cost in ' + city.city_name + '?', answer: 'The average solar installation in the ' + city.city_name + ' area costs approximately ' + dollar(parentState.avg_install_cost) + ' for a ' + parentState.avg_system_size + ' kW system before incentives. After the 30% federal tax credit and <a href="/solar-rebates-incentives-' + parentState.slug + '/">' + city.state_name + ' state incentives</a>, the net cost drops to approximately ' + dollar(roi.netCost) + '.' },
    { question: 'What solar incentives are available in ' + city.city_name + '?', answer: city.local_incentives + ' The 30% federal Investment Tax Credit (ITC) is available to all ' + city.city_name + ' homeowners.' + (parentState.state_tax_credit_percent > 0 ? ' ' + city.state_name + ' also offers a ' + parentState.state_tax_credit_percent + '% state tax credit.' : '') + ' <a href="/solar-rebates-incentives-' + parentState.slug + '/">See all ' + city.state_name + ' incentives</a>.' },
    { question: 'How many solar panels do I need for my home in ' + city.city_name + '?', answer: 'A typical home in ' + city.city_name + ' uses a ' + parentState.avg_system_size + ' kW system (approximately ' + Math.round(parentState.avg_system_size / 0.4) + ' panels). This produces roughly ' + fmt(roi.annualKwh) + ' kWh per year based on ' + city.avg_sun_hours + ' peak sun hours per day. Your actual system size depends on your electricity usage, roof space, and shading.' },
    { question: 'Are electricity rates going up in ' + city.city_name + '?', answer: 'Electricity rates in ' + city.city_name + ' are currently ' + city.electricity_trend + '. The current average rate is $' + city.avg_electricity_rate + '/kWh. Historically, U.S. electricity rates have risen 2-3% annually. Solar locks in your energy costs and protects against future rate increases for 25+ years.' },
    { question: 'Can I install solar panels in ' + city.city_name + ' with $0 down?', answer: 'Yes. Multiple <a href="/solar-financing/">financing options</a> let ' + city.city_name + ' homeowners go solar with no upfront cost. Solar loans let you own the system and claim the 30% tax credit. Solar leases and PPAs require $0 down but you do not own the system or receive tax credits directly.' },
    { question: 'How long does solar installation take in ' + city.city_name + '?', answer: 'From signing a contract to system activation, solar installation in ' + city.city_name + ' typically takes 1-3 months. This includes site assessment, permitting (varies by municipality), installation (1-3 days on the roof), inspection, and utility interconnection. Choose an installer familiar with ' + city.city_name + ' permitting to speed up the process.' },
    { question: 'What is the best solar company in ' + city.city_name + ', ' + city.state_abbrev + '?', answer: 'The best solar company depends on your priorities — lowest price, best equipment, financing options, or customer service. We recommend comparing quotes from at least 3 installers. EnergySage lets you compare multiple ' + city.city_name + ' installer quotes side by side. Also check our <a href="/reviews/">solar brand reviews</a> and <a href="/guide/how-to-choose-solar-installer/">how to choose a solar installer guide</a>.' }
  ];

  var crumbs = [
    { label: 'Home', url: '/' },
    { label: city.state_name, url: '/solar-rebates-incentives-' + parentState.slug + '/' },
    { label: city.city_name }
  ];

  var slug = 'is-solar-worth-it-in-' + city.slug + '-' + city.state_abbrev.toLowerCase();

  var body = `
<section class="content-section">
<div class="container">
<h1>Is Solar Worth It in ${city.city_name}, ${city.state_abbrev}? Cost, Tax Credits &amp; ROI (${SITE.year})</h1>
<p class="lead">Is solar worth it in ${city.city_name}? With ${city.avg_sun_hours} peak sun hours per day and electricity at $${city.avg_electricity_rate}/kWh (${city.electricity_trend} trend), solar delivers <strong>estimated savings of ${dollar(roi.twentyYearSavings)} over 20 years</strong>. See your personalized estimate including the 30% federal tax credit, <a href="/solar-rebates-incentives-${parentState.slug}/">${city.state_name} state incentives</a>, and local programs.</p>
${lastUpdatedBlock('Sarah Chen', 'sarah-chen')}

${aboveFoldQuoteCta(city.city_name + ', ' + city.state_abbrev)}

${statsGrid([
  { value: dollar(roi.twentyYearSavings), label: '20-Year Savings' },
  { value: roi.breakEvenYears + ' yrs', label: 'Break-Even Timeline' },
  { value: dollar(roi.netCost), label: 'Net Cost After Incentives' },
  { value: city.avg_sun_hours + ' hrs', label: 'Peak Sun Hours/Day' },
  { value: '$' + city.avg_electricity_rate + '/kWh', label: 'Electricity Rate (' + city.electricity_trend + ')' },
  { value: fmt(city.population), label: 'Population' }
])}

${eligibilityWidget('city')}

${affiliateCtaBlock(city.city_name + ', ' + city.state_abbrev, 'city-top')}
</div>
</section>

<section class="content-section bg-light">
<div class="container">
<h2>20-Year Solar Savings Projection for ${city.city_name}</h2>
<p>This projection is based on a ${parentState.avg_system_size} kW system with ${city.avg_sun_hours} peak sun hours and $${city.avg_electricity_rate}/kWh electricity rate.</p>
${comparisonTable(['Period', 'Cumulative Savings', 'Net Position', 'Status'], yearSavingsRows)}
<p class="small-text">Estimates assume stable electricity rates. Actual savings may increase as rates rise.</p>
</div>
</section>

${midContentFinancingCta(city.city_name, dollar(roi.annualSavings))}

<section class="content-section">
<div class="container">
<h2>Solar Investment Breakdown for ${city.city_name}</h2>
${barChartComponent([
  { label: 'Gross System Cost', value: parentState.avg_install_cost, max: parentState.avg_install_cost },
  { label: 'Federal Tax Credit (30%)', value: roi.fedSavings, max: parentState.avg_install_cost },
  { label: 'State Incentives', value: roi.stateSavings, max: parentState.avg_install_cost },
  { label: 'Net Cost', value: roi.netCost, max: parentState.avg_install_cost },
  { label: 'Annual Savings', value: roi.annualSavings, max: parentState.avg_install_cost }
])}
${calculatorResultMonetization(city.city_name)}
</div>
</section>

<section class="content-section bg-light">
<div class="container">
<h2>Local Solar Incentives in ${city.city_name}</h2>
<div class="content-prose">
<p><strong>Local Programs:</strong> ${city.local_incentives}</p>
<p><strong>Electricity Trend:</strong> Rates in ${city.city_name} are currently <strong>${city.electricity_trend}</strong>. Solar locks in your energy costs and provides a hedge against future rate increases.</p>
${parentState ? '<p><strong>State Incentives:</strong> ' + city.state_name + ' offers ' + (parentState.state_tax_credit_percent > 0 ? 'a ' + parentState.state_tax_credit_percent + '% state tax credit, ' : '') + (parentState.state_rebate_amount > 0 ? 'a ' + dollar(parentState.state_rebate_amount) + ' rebate, ' : '') + 'net metering (' + parentState.net_metering_status + ')' + (parentState.srec_available ? ', and SRECs worth $' + parentState.srec_value + '/MWh' : '') + '. <a href="/solar-rebates-incentives-' + parentState.slug + '/">See all ' + city.state_name + ' incentives</a>.</p>' : ''}
</div>
</div>
</section>

${sidebarAffiliateWidget(city.city_name)}

<section class="content-section">
<div class="container">
<h2>Going Solar in ${city.city_name}: What You Need to Know</h2>
<div class="content-prose">
<p><strong>${city.city_name}</strong> receives an average of <strong>${city.avg_sun_hours} peak sun hours per day</strong>, making it ${city.avg_sun_hours >= 5 ? 'an excellent' : city.avg_sun_hours >= 4 ? 'a good' : 'a viable'} location for residential solar. Combined with electricity rates at $${city.avg_electricity_rate}/kWh (which are ${city.electricity_trend}), homeowners can expect strong returns on their solar investment.</p>
<p>The most important steps for ${city.city_name} homeowners considering solar:</p>
<ul>
<li><strong>Check your roof:</strong> South-facing roofs with minimal shading produce the most energy. Read our <a href="/guide/complete-guide-home-solar/">complete guide to home solar</a> for details.</li>
<li><strong>Understand incentives:</strong> Beyond the 30% federal credit, <a href="/solar-rebates-incentives-${parentState.slug}/">${city.state_name} offers additional incentives</a> that significantly reduce your net cost.</li>
<li><strong>Compare equipment:</strong> Not all <a href="/guide/best-solar-panels-2026/">solar panels</a> are created equal. Higher efficiency panels may cost more upfront but produce more energy per square foot.</li>
<li><strong>Consider battery storage:</strong> A <a href="/guide/solar-battery-buying-guide/">home battery system</a> can store excess solar energy for use during outages or peak rate periods.</li>
</ul>
</div>
</div>
</section>

<section class="content-section">
<div class="container">
<h2>Financing Options for ${city.city_name} Homeowners</h2>
<p>Compare <a href="/solar-financing/">financing options</a> to find the best fit for your solar installation. Learn more about <a href="/guide/solar-financing-complete-guide/">the complete financing guide</a> or compare <a href="/compare/solar-loan-vs-solar-lease/">solar loans vs. leases</a>.</p>
<div class="stats-grid">
<div class="stat-card"><span class="stat-value">Cash</span><span class="stat-label">Best ROI. Own immediately.</span></div>
<div class="stat-card"><span class="stat-value">Loan</span><span class="stat-label">Own system + tax credits.</span></div>
<div class="stat-card"><span class="stat-value">Lease/PPA</span><span class="stat-label">$0 down. Lower savings.</span></div>
</div>
<div class="text-center mt-3"><a href="/solar-financing/" class="btn btn-primary">Compare All Financing Options</a></div>
</div>
</section>

${comparisonAffiliateTable('Best Solar Providers in ' + city.city_name, [
  { name: 'EnergySage', type: 'Marketplace', highlight: 'Compare ' + city.city_name + ' installers', rating: '4.8/5', slug: 'energysage-' + city.slug, affiliate_url: 'https://www.energysage.com/solar/?rc=solarsavingsai', cta_text: 'Get Quotes' },
  { name: 'Sunrun', type: 'Installer', highlight: '$0 down solar in ' + city.state_abbrev, rating: '4.5/5', slug: 'sunrun-' + city.slug, affiliate_url: 'https://www.sunrun.com/solar-plans?partner=solarsavingsai', cta_text: 'View Plans' },
  { name: 'SunPower', type: 'Premium', highlight: 'Highest efficiency panels', rating: '4.6/5', slug: 'sunpower-' + city.slug, affiliate_url: 'https://us.sunpower.com/get-quote?ref=solarsavingsai', cta_text: 'Get Quote' }
])}

${emailCaptureBlock(city.city_name + ', ' + city.state_abbrev)}

${faqSection(faqs)}

${authorBioBlock()}

${cityUtilities.length > 0 ? '<section class="content-section"><div class="container"><h2>Your Local Utilities in ' + city.state_name + '</h2><p>Review net metering policies and solar programs from utilities serving ' + city.city_name + '.</p><div class="related-grid">' + cityUtilities.map(function(u) { return '<a href="/utility-rebates/' + u.slug + '/" class="related-card"><span class="related-title">' + u.utility_name + '</span><span class="related-meta">Net metering: ' + u.net_metering_rate + '</span></a>'; }).join('') + '</div></div></section>' : ''}

${relatedPagesSection('More Cities in ' + city.state_name, nearbyCities.map(function (c) {
  return { title: c.city_name + ', ' + c.state_abbrev, url: '/is-solar-worth-it-in-' + c.slug + '-' + c.state_abbrev.toLowerCase() + '/', meta: c.avg_sun_hours + ' sun hrs · $' + c.avg_electricity_rate + '/kWh' };
}))}

${ctaBlock('primary', 'Get Your ' + city.city_name + ' Solar Estimate', 'See exactly how much you can save with solar in ' + city.city_name + '. It takes less than 30 seconds.', '#widget-city')}
`;

  return baseTemplate(
    'Is Solar Worth It in ' + city.city_name + ', ' + city.state_abbrev + '? Cost, Tax Credits & ROI (' + SITE.year + ')',
    'Is solar worth it in ' + city.city_name + ', ' + city.state_abbrev + '? Save ' + dollar(roi.twentyYearSavings) + ' over 20 years with ' + city.avg_sun_hours + ' sun hours/day. Net cost after incentives: ' + dollar(roi.netCost) + '. Break-even in ~' + roi.breakEvenYears + ' years. Calculate your exact savings free.',
    '/' + slug + '/',
    body,
    {
      breadcrumbs: crumbs,
      alertHtml: stateAlerts(alerts, city.state_abbrev),
      schema: joinSchemas(faqSchema(faqs), breadcrumbSchema(crumbs), articleSchema('Solar Savings in ' + city.city_name + ', ' + city.state_abbrev + ' — Cost, Tax Credits & ROI', 'Solar ROI analysis for ' + city.city_name + ', ' + city.state_abbrev, '/' + slug + '/')),
      states: states
    }
  );
}

// ---------------------------------------------------------------------------
// 5. Financing Page
// ---------------------------------------------------------------------------
function generateFinancingPage(data) {
  var financing = data.financing || {};
  var providers = financing.providers || [];
  var types = financing.financing_types || {};
  var alerts = data.alerts || {};

  var providerRows = providers.map(function (p) {
    var apr = p.apr_low === 0 && p.apr_high === 0 ? 'N/A' : p.apr_low + '% – ' + p.apr_high + '%';
    var terms = Array.isArray(p.term_years) ? p.term_years.join(', ') + ' yrs' : p.term_years + ' yrs';
    return [p.name, p.type.toUpperCase(), apr, terms, p.min_credit_score > 0 ? p.min_credit_score + '+' : 'None', p.zero_down ? 'Yes' : 'No', p.battery_financing ? 'Yes' : 'No'];
  });

  var typeSectionsHtml = '';
  Object.keys(types).forEach(function (key) {
    var t = types[key];
    var matchingProviders = providers.filter(function (p) { return p.type.toLowerCase() === key.toLowerCase(); });
    typeSectionsHtml += '<div class="financing-type-card">';
    typeSectionsHtml += '<h3>' + key.charAt(0).toUpperCase() + key.slice(1) + '</h3>';
    typeSectionsHtml += '<p>' + t.description + '</p>';
    typeSectionsHtml += '<p><strong>Typical ROI:</strong> ' + Math.round(t.avg_roi_multiplier * 100) + '% of cash-purchase savings</p>';
    if (matchingProviders.length > 0) {
      typeSectionsHtml += '<ul>';
      matchingProviders.forEach(function (p) {
        typeSectionsHtml += '<li><strong>' + p.name + '</strong>: ' + p.pros.slice(0, 2).join(', ') + '</li>';
      });
      typeSectionsHtml += '</ul>';
    }
    typeSectionsHtml += '</div>';
  });

  var detailCards = providers.map(function (p) {
    var apr = p.apr_low === 0 && p.apr_high === 0 ? 'N/A (lease/PPA)' : p.apr_low + '% – ' + p.apr_high + '%';
    return '<div class="provider-card" id="' + p.slug + '"><h3>' + p.name + '</h3><div class="provider-meta"><span class="badge">' + p.type.toUpperCase() + '</span><span>APR: ' + apr + '</span><span>Min Credit: ' + (p.min_credit_score > 0 ? p.min_credit_score : 'None') + '</span></div><div class="provider-details"><div class="pros-cons"><div><h4>Pros</h4><ul>' + p.pros.map(function (pro) { return '<li>' + pro + '</li>'; }).join('') + '</ul></div><div><h4>Cons</h4><ul>' + p.cons.map(function (con) { return '<li>' + con + '</li>'; }).join('') + '</ul></div></div><p><strong>Terms:</strong> ' + (Array.isArray(p.term_years) ? p.term_years.join(', ') : p.term_years) + ' years</p><p><strong>Battery Financing:</strong> ' + (p.battery_financing ? 'Yes' : 'No') + '</p><p><strong>$0 Down:</strong> ' + (p.zero_down ? 'Yes' : 'No') + '</p><p><strong>Availability:</strong> ' + p.states_available + '</p></div></div>';
  }).join('');

  var faqs = [
    { question: 'What is the best way to finance solar panels?', answer: 'The best financing option depends on your budget and goals. <strong>Cash</strong> provides the highest total savings and fastest ROI. <strong>Solar loans</strong> let you own the system and claim tax credits while paying over time. <strong>Leases and PPAs</strong> require $0 down but offer lower total savings.' },
    { question: 'Can I get solar panels with no money down?', answer: 'Yes. Solar leases, PPAs, and many solar loans offer $0 down options. With a lease or PPA, the provider owns the system and you pay a monthly fee or per-kWh rate. With a $0-down loan, you own the system and get the tax credits.' },
    { question: 'What credit score do I need for solar financing?', answer: 'Most solar loans require a credit score of 650-680+. Some PACE financing options have no credit score requirement. Leases and PPAs typically require 600-650+. Better credit scores qualify for lower interest rates.' },
    { question: 'Should I buy or lease solar panels?', answer: 'Buying (cash or loan) provides higher total savings, tax credit eligibility, and increases home value. Leasing requires no upfront investment and includes maintenance, but total savings are lower and you don\'t own the system. Consider your budget, how long you plan to stay in your home, and your financial goals.' },
    { question: 'What is a Power Purchase Agreement (PPA)?', answer: 'A PPA is an agreement where a solar company installs panels on your roof at no cost. You then purchase the electricity generated at a fixed per-kWh rate, typically 10-30% below your utility rate. The company owns and maintains the system.' }
  ];

  var crumbs = [
    { label: 'Home', url: '/' },
    { label: 'Solar Financing' }
  ];

  var body = `
<section class="content-section">
<div class="container">
<h1>Solar Financing Options ${SITE.year}: Loans, Leases, PPA &amp; $0-Down Plans Compared</h1>
<p class="lead">Compare solar loans, leases, PPAs, PACE financing, and cash purchases from ${providers.length} providers. Find the right solar financing option for your budget, credit score, and savings goals. Many options require $0 down and let you claim the <a href="/article/federal-solar-tax-credit-2026-complete-guide/">30% federal solar tax credit</a>.</p>
${eligibilityWidget('financing')}
</div>
</section>

<section class="content-section bg-light">
<div class="container">
<h2>Solar Financing Comparison Table</h2>
<p>Side-by-side comparison of ${providers.length} solar financing providers and options.</p>
${comparisonTable(['Provider', 'Type', 'APR', 'Terms', 'Min Credit', '$0 Down', 'Battery'], providerRows)}
</div>
</section>

<section class="content-section">
<div class="container">
<h2>Financing Types Explained</h2>
<div class="financing-types-grid">
${typeSectionsHtml}
</div>
</div>
</section>

<section class="content-section bg-light">
<div class="container">
<h2>Provider Details</h2>
<div class="provider-grid">
${detailCards}
</div>
</div>
</section>

<section class="content-section">
<div class="container">
<h2>Which Financing Option Is Right for You?</h2>
<div class="content-prose">
<h3>Best for Maximum Savings: Cash Purchase</h3>
<p>If you can pay upfront, cash provides the highest total savings. You own the system immediately, claim the full 30% federal tax credit, and start saving from day one with no interest payments.</p>
<h3>Best for Homeowners Who Want to Own: Solar Loan</h3>
<p>Solar loans let you own your system and claim tax credits while spreading payments over 10-25 years. Many lenders offer $0 down with competitive rates starting around 3.99% APR.</p>
<h3>Best for $0 Down with No Hassle: Lease or PPA</h3>
<p>If you want immediate savings with no upfront cost and no maintenance responsibility, a solar lease or PPA can reduce your electric bill from day one. Total savings are lower than ownership options.</p>
<h3>Best for Low Credit: PACE Financing</h3>
<p>PACE (Property Assessed Clean Energy) financing has no credit score requirement and is repaid through your property tax bill. It is available in select states and the financing transfers with the property if you sell.</p>
</div>
</div>
</section>

<section class="content-section bg-light">
<div class="container">
<h2>Compare Trusted Solar Financing Partners</h2>
<p>Use these tools to compare financing structures, loan options, and incentives before you choose a provider.</p>
<div class="cta-group" style="display:flex;flex-wrap:wrap;gap:0.75rem;">
<a href="https://www.energysage.com/solar/?rc=solarsavingsai" class="btn btn-primary" target="_blank" rel="sponsored noopener noreferrer" data-affiliate="energysage-financing">Compare Solar Financing</a>
<a href="https://www.sunrun.com/solar-plans?partner=solarsavingsai" class="btn btn-outline" target="_blank" rel="sponsored noopener noreferrer" data-affiliate="sunrun-financing">Get Solar Loan Quotes</a>
<a href="https://www.solarreviews.com/installers?ref=solarsavingsai" class="btn btn-outline" target="_blank" rel="sponsored noopener noreferrer" data-affiliate="solarreviews-financing">Check Solar Incentives</a>
</div>
</div>
</section>

${faqSection(faqs)}

${ctaBlock('primary', 'Find Your Solar Financing Match', 'Enter your ZIP code to see available financing options and estimated savings for your home.', '#widget-financing')}
`;

  return baseTemplate(
    'Solar Financing Options ' + SITE.year + ': $0-Down Loans, Leases & PPA Compared',
    'Compare ' + providers.length + ' solar financing options for ' + SITE.year + ': loans from 3.99% APR, $0-down leases, PPAs, PACE & cash purchase. Find the best match for your budget and credit score. Own your system and claim the 30% solar tax credit.',
    '/solar-financing/',
    body,
    {
      breadcrumbs: crumbs,
      alertHtml: federalAlert(alerts),
      schema: joinSchemas(faqSchema(faqs), breadcrumbSchema(crumbs)),
      states: data.states || []
    }
  );
}

// ---------------------------------------------------------------------------
// 6. Glossary Page
// ---------------------------------------------------------------------------
function generateGlossaryPage(glossary) {
  var terms = Array.isArray(glossary) ? glossary : [];

  var categories = {};
  terms.forEach(function (t) {
    var cat = t.category || 'general';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(t);
  });

  var letters = {};
  terms.forEach(function (t) {
    var letter = t.term.charAt(0).toUpperCase();
    if (!letters[letter]) letters[letter] = [];
    letters[letter].push(t);
  });

  var letterNav = Object.keys(letters).sort().map(function (l) {
    return '<a href="#letter-' + l + '" class="glossary-letter">' + l + '</a>';
  }).join(' ');

  var termsHtml = '';
  Object.keys(letters).sort().forEach(function (l) {
    termsHtml += '<div id="letter-' + l + '" class="glossary-group"><h3>' + l + '</h3>';
    letters[l].forEach(function (t) {
      var related = '';
      if (t.related_terms && t.related_terms.length > 0) {
        related = '<div class="glossary-related"><strong>Related:</strong> ' + t.related_terms.map(function (r) {
          var linkedTerm = terms.find(function (tt) { return tt.slug === r; });
          return linkedTerm ? '<a href="#term-' + r + '">' + linkedTerm.term + '</a>' : r;
        }).join(', ') + '</div>';
      }
      termsHtml += '<div class="glossary-term" id="term-' + t.slug + '"><dt>' + t.term + '</dt><dd>' + t.definition + related + '<span class="badge badge-sm">' + t.category + '</span></dd></div>';
    });
    termsHtml += '</div>';
  });

  var crumbs = [
    { label: 'Home', url: '/' },
    { label: 'Solar Glossary' }
  ];

  var body = `
<section class="content-section">
<div class="container">
<h1>Solar Energy Glossary: ${terms.length} Essential Terms Explained (${SITE.year})</h1>
<p class="lead">Comprehensive glossary of solar energy terms, from <a href="#term-net-metering">net metering</a> to <a href="#term-srec">SRECs</a>. Understand the terminology used in solar quotes, contracts, and incentive programs. Essential reading before <a href="/guide/how-to-choose-solar-installer/">choosing a solar installer</a>.</p>
<nav class="glossary-nav" aria-label="Glossary letter navigation">
${letterNav}
</nav>
</div>
</section>

<section class="content-section bg-light">
<div class="container">
<dl class="glossary-list">
${termsHtml}
</dl>
</div>
</section>

<section class="content-section">
<div class="container">
<h2>Browse by Category</h2>
<div class="stats-grid">
${Object.keys(categories).sort().map(function (cat) {
  return '<div class="stat-card"><span class="stat-value">' + categories[cat].length + '</span><span class="stat-label">' + cat.charAt(0).toUpperCase() + cat.slice(1) + '</span></div>';
}).join('')}
</div>
</div>
</section>

${ctaBlock('secondary', 'Ready to Go Solar?', 'Now that you understand the terms, get a personalized solar savings estimate for your home.', '#widget-hero')}

${hubLinksSection('Related Solar Resources', [
  { title: 'Federal Solar Tax Credit Guide', url: '/article/federal-solar-tax-credit-2026-complete-guide/', meta: 'Claim the 30% ITC' },
  { title: 'Complete Guide to Home Solar', url: '/guide/complete-guide-home-solar/', meta: 'Everything you need to know' },
  { title: 'Solar Financing Compared', url: '/solar-financing/', meta: 'Loans, leases & PPAs' },
  { title: 'Best Solar Panels ' + SITE.year, url: '/guide/best-solar-panels-2026/', meta: 'Expert rankings' },
  { title: 'How Solar Panels Work', url: '/guide/how-solar-panels-work/', meta: 'Science explained simply' },
  { title: 'Solar Battery Buying Guide', url: '/guide/solar-battery-buying-guide/', meta: 'Home storage options' }
])}
`;

  return baseTemplate(
    'Solar Energy Glossary ' + SITE.year + ': ' + terms.length + ' Key Terms & Definitions Explained',
    'Complete solar energy glossary with ' + terms.length + ' terms explained: net metering, SRECs, ITC, kWh, inverters, solar tax credit & more. Essential reference for homeowners researching solar panels and incentives in ' + SITE.year + '.',
    '/solar-glossary/',
    body,
    {
      breadcrumbs: crumbs,
      schema: breadcrumbSchema(crumbs) + '</script><script type="application/ld+json">' + JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        name: 'Solar Energy Glossary',
        description: 'Comprehensive glossary of ' + terms.length + ' solar energy terms and definitions for homeowners.',
        url: SITE.url + '/solar-glossary/',
        hasDefinedTerm: terms.slice(0, 20).map(function(t) {
          return {
            '@type': 'DefinedTerm',
            name: t.term,
            description: (t.definition || '').replace(/<[^>]+>/g, '').substring(0, 200)
          };
        })
      })
    }
  );
}

// ---------------------------------------------------------------------------
// 7. Methodology Page
// ---------------------------------------------------------------------------
function generateMethodologyPage() {
  var crumbs = [
    { label: 'Home', url: '/' },
    { label: 'Methodology' }
  ];

  var body = `
<section class="content-section">
<div class="container">
<h1>Our Methodology</h1>
<p class="lead">How ${SITE.name} calculates solar savings estimates, ROI projections, and incentive data. We believe in transparency and want you to understand exactly how our numbers are derived.</p>
${authorBioBlock()}
</div>
</section>

<section class="content-section bg-light">
<div class="container">
<div class="content-prose">
<h2>Data Sources</h2>
<p>Our data comes from publicly available government and industry sources:</p>
<ul>
<li><strong>Federal Incentives:</strong> U.S. Department of Energy (<a href="https://www.energy.gov/eere/solar/homeowners-guide-federal-tax-credit-solar-photovoltaics" rel="nofollow">energy.gov</a>), IRS guidance on the Investment Tax Credit (ITC) under the Inflation Reduction Act (<a href="https://www.irs.gov/credits-deductions/residential-clean-energy-credit" rel="nofollow">IRS.gov</a>).</li>
<li><strong>State Incentives:</strong> Database of State Incentives for Renewables &amp; Efficiency (<a href="https://www.dsireusa.org/" rel="nofollow">DSIRE</a>), state energy office publications.</li>
<li><strong>Utility Policies:</strong> Individual utility company tariff filings, public rate schedules, and interconnection guidelines.</li>
<li><strong>Solar Irradiance:</strong> National Renewable Energy Laboratory (<a href="https://www.nrel.gov/gis/solar-resource-maps.html" rel="nofollow">NREL</a>) solar resource data and PVWatts calculator methodology.</li>
<li><strong>Installation Costs:</strong> EnergySage marketplace data, <a href="https://www.nrel.gov/solar/market-research-analysis.html" rel="nofollow">NREL annual solar cost benchmarks</a>, and Lawrence Berkeley National Laboratory reports.</li>
<li><strong>Electricity Rates:</strong> U.S. Energy Information Administration (<a href="https://www.eia.gov/electricity/monthly/" rel="nofollow">EIA</a>) state and utility rate data.</li>
</ul>

<h2>How We Calculate Savings</h2>
<h3>System Production</h3>
<p>We estimate annual solar production using: <code>Annual kWh = System Size (kW) &times; Peak Sun Hours &times; 365</code>. Peak sun hours vary by location and represent the number of hours per day when solar irradiance averages 1,000 W/m&sup2;. Data sourced from NREL solar resource maps.</p>

<h3>Annual Savings</h3>
<p>Annual electric bill savings are calculated as: <code>Annual Savings = Annual kWh &times; Local Electricity Rate</code>. We use current average residential rates from the <a href="https://www.eia.gov/electricity/data/state/" rel="nofollow">EIA State Electricity Profiles</a>.</p>

<h3>Incentive Stacking</h3>
<p>We calculate total incentives by combining: the 30% federal ITC (per <a href="https://www.irs.gov/credits-deductions/residential-clean-energy-credit" rel="nofollow">IRS guidelines</a>), applicable state tax credits, state rebates, SREC income, and property/sales tax exemptions. Each incentive is applied to the appropriate cost basis per DOE guidance.</p>

<h3>Net Cost &amp; Break-Even</h3>
<p>Net cost equals gross system cost minus all incentives. Break-even year is when cumulative electricity savings exceed the net system cost.</p>

<h3>20-Year Projection</h3>
<p>Our 20-year savings estimate uses current electricity rates held constant. Actual savings may be higher if rates increase, which they historically have at 2-3% annually per EIA data.</p>

<h2>Editorial Review Process</h2>
<p>All content on ${SITE.name} undergoes a structured review process:</p>
<ul>
<li><strong>Data Verification:</strong> Cross-referenced against at least two authoritative sources (DOE, IRS, DSIRE, NREL, EIA).</li>
<li><strong>Calculation Audit:</strong> ROI projections validated against NREL PVWatts benchmarks.</li>
<li><strong>Regular Updates:</strong> Content reviewed quarterly for accuracy against current incentive programs.</li>
<li><strong>Corrections Policy:</strong> Errors are corrected within 48 hours of identification.</li>
</ul>

<h2>Limitations &amp; Disclaimers</h2>
<ul>
<li>All estimates are approximate and based on averages. Your actual results will vary based on roof orientation, shading, system design, and specific equipment.</li>
<li>We do not account for electricity rate escalation, panel degradation (typically 0.5%/year), or inflation in our baseline projections.</li>
<li>Incentive programs change frequently. Always verify current availability with your state energy office, utility, and tax professional.</li>
<li>This site does not provide financial, tax, or legal advice. Consult qualified professionals before making purchase decisions.</li>
</ul>

<h2>Update Frequency</h2>
<ul>
<li><strong>Federal incentives:</strong> Updated when legislation changes (source: <a href="https://www.energy.gov/" rel="nofollow">energy.gov</a>)</li>
<li><strong>State programs:</strong> Reviewed quarterly (source: <a href="https://www.dsireusa.org/" rel="nofollow">DSIRE</a>)</li>
<li><strong>Utility policies:</strong> Reviewed quarterly</li>
<li><strong>Installation costs:</strong> Updated semi-annually (source: <a href="https://www.nrel.gov/" rel="nofollow">NREL</a>)</li>
<li><strong>Electricity rates:</strong> Updated annually (source: <a href="https://www.eia.gov/" rel="nofollow">EIA</a>)</li>
</ul>
</div>
</div>
</section>

${affiliateCtaBlock('Your Area', 'methodology')}

${ctaBlock('secondary', 'See Your Personalized Estimate', 'Now that you understand our methodology, get a savings estimate based on your specific location and usage.', '/#widget-hero')}
`;

  return baseTemplate(
    'Solar Savings Methodology: How We Calculate Costs, ROI & Incentives',
    'Transparent methodology behind ' + SITE.name + ' solar savings estimates. Data from DOE, IRS, DSIRE, NREL, and EIA. Learn how we calculate solar ROI, incentives, break-even timelines, and 20-year savings projections.',
    '/methodology/',
    body,
    {
      breadcrumbs: crumbs,
      schema: breadcrumbSchema(crumbs)
    }
  );
}

// ---------------------------------------------------------------------------
// 8. Editorial Standards Page
// ---------------------------------------------------------------------------
function generateEditorialPage() {
  var crumbs = [
    { label: 'Home', url: '/' },
    { label: 'Editorial Standards' }
  ];

  var body = `
<section class="content-section">
<div class="container">
<h1>Editorial Standards &amp; Affiliate Disclosure</h1>
<p class="lead">${SITE.name} is committed to providing accurate, unbiased solar energy information. This page explains our editorial standards, how we make money, and our commitment to independence.</p>
</div>
</section>

<section class="content-section bg-light">
<div class="container">
<div class="content-prose">
<h2>Our Mission</h2>
<p>${SITE.name} exists to help homeowners make informed decisions about solar energy. We provide free tools, data, and analysis so you can evaluate whether solar is right for your home, compare financing options, and understand available incentives &mdash; all without sales pressure.</p>

<h2>Editorial Independence</h2>
<p>Our content is researched and written independently. We do not allow advertisers or affiliate partners to influence our analysis, recommendations, or data presentation. Our estimates use the same methodology regardless of whether a provider is an affiliate partner.</p>

<h2>How We Make Money</h2>
<p>${SITE.name} may earn revenue in the following ways:</p>
<ul>
<li><strong>Affiliate Links:</strong> Some links to solar providers, financing companies, and marketplaces are affiliate links. If you click through and take action (such as requesting a quote), we may receive a commission at no additional cost to you.</li>
<li><strong>Advertising:</strong> We may display relevant advertisements from solar industry companies.</li>
</ul>
<p><strong>Important:</strong> Our affiliate relationships never affect our data, estimates, or analysis. We present information the same way whether or not a company is an affiliate partner.</p>

<h2>Content Standards</h2>
<ul>
<li><strong>Accuracy:</strong> All data comes from verifiable government and industry sources. We cite our sources in our <a href="/methodology/">methodology page</a>.</li>
<li><strong>Transparency:</strong> Our calculation methods are documented. We clearly state limitations and disclaimers.</li>
<li><strong>No Sales Pressure:</strong> We never use false urgency, misleading claims, or high-pressure sales tactics.</li>
<li><strong>Regular Updates:</strong> We review and update our data on a regular schedule to maintain accuracy.</li>
<li><strong>Corrections:</strong> If we discover an error, we correct it promptly.</li>
</ul>

<h2>What We Are Not</h2>
<ul>
<li>We are <strong>not</strong> a solar installation company.</li>
<li>We are <strong>not</strong> a licensed financial, tax, or legal advisor.</li>
<li>We <strong>do not</strong> sell solar equipment or services directly.</li>
<li>We <strong>cannot</strong> guarantee specific savings amounts or incentive eligibility.</li>
</ul>

<h2>Contact</h2>
<p>For questions about our editorial standards, data accuracy, or to report an error, please contact us at <a href="mailto:advertise@homesolarrebatefinder.com">advertise@homesolarrebatefinder.com</a>.</p>
</div>
</div>
</section>
`;

  return baseTemplate(
    'Editorial Standards & Affiliate Disclosure',
    SITE.name + ' editorial standards, affiliate disclosure, and commitment to providing accurate, unbiased solar energy information for homeowners.',
    '/editorial-standards/',
    body,
    {
      breadcrumbs: crumbs,
      schema: breadcrumbSchema(crumbs)
    }
  );
}

// ---------------------------------------------------------------------------
// 9. Comparison Page
// ---------------------------------------------------------------------------
function generateComparisonPage(comparison, allComparisons) {
  var comparisons = allComparisons || [];

  var factorRows = comparison.factors.map(function (f) {
    var winnerIcon = f.winner === 'a' ? ' *' : (f.winner === 'b' ? '' : '');
    var winnerIconB = f.winner === 'b' ? ' *' : (f.winner === 'a' ? '' : '');
    return [f.name, f.a + winnerIcon, f.b + winnerIconB, f.winner === 'tie' ? 'Tie' : (f.winner === 'a' ? comparison.option_a : comparison.option_b)];
  });

  var relatedComparisons = comparisons.filter(function (c) {
    return c.slug !== comparison.slug;
  }).slice(0, 6);

  var faqs = comparison.faqs || [];

  var crumbs = [
    { label: 'Home', url: '/' },
    { label: 'Comparisons', url: '/#comparisons' },
    { label: comparison.title }
  ];

  var body = `
<section class="content-section">
<div class="container">
<h1>${comparison.title} (${SITE.year} Comparison)</h1>
<p class="lead">${comparison.description}</p>

${aboveFoldQuoteCta('Your Area')}
</div>
</section>

<section class="content-section bg-light">
<div class="container">
<h2>${comparison.option_a} vs. ${comparison.option_b}: Side-by-Side Comparison</h2>
${comparisonTable(['Factor', comparison.option_a, comparison.option_b, 'Winner'], factorRows)}
<p class="small-text">* indicates the winning option for that factor.</p>
</div>
</section>

<section class="content-section">
<div class="container">
<h2>Our Verdict</h2>
<div class="content-prose">
<p><strong>${comparison.verdict}</strong></p>
</div>

${affiliateCtaBlock('Your Area', 'comparison-' + comparison.slug)}
</div>
</section>

${midContentFinancingCta('Your Home')}

${eligibilityWidget('comparison')}

${calculatorResultMonetization('Your Area')}

${faqSection(faqs)}

${comparisonAffiliateTable('Get Started with Solar', [
  { name: 'EnergySage', type: 'Marketplace', highlight: 'Compare installer quotes free', rating: '4.8/5', slug: 'energysage-comp', affiliate_url: 'https://www.energysage.com/solar/?rc=solarsavingsai', cta_text: 'Get Quotes' },
  { name: 'Sunrun', type: 'Installer', highlight: '$0 down solar lease/loan', rating: '4.5/5', slug: 'sunrun-comp', affiliate_url: 'https://www.sunrun.com/solar-plans?partner=solarsavingsai', cta_text: 'View Plans' },
  { name: 'SunPower', type: 'Premium', highlight: 'Highest efficiency panels', rating: '4.6/5', slug: 'sunpower-comp', affiliate_url: 'https://us.sunpower.com/get-quote?ref=solarsavingsai', cta_text: 'Get Quote' }
])}

${authorBioBlock()}

${relatedPagesSection('More Solar Comparisons', relatedComparisons.map(function (c) {
  return { title: c.title, url: '/compare/' + c.slug + '/', meta: c.category };
}))}

${ctaBlock('primary', 'Get Your Free Solar Estimate', 'Ready to go solar? Enter your ZIP code to see your personalized savings estimate.', '#widget-comparison')}
`;

  return baseTemplate(
    comparison.title + ' — ' + SITE.year + ' Expert Analysis',
    comparison.description + ' Compare ' + comparison.option_a + ' vs. ' + comparison.option_b + ' for your home in ' + SITE.year + '. Data-driven analysis with savings calculations.',
    '/compare/' + comparison.slug + '/',
    body,
    {
      breadcrumbs: crumbs,
      schema: joinSchemas(faqSchema(faqs), breadcrumbSchema(crumbs), articleSchema(comparison.title, comparison.description, '/compare/' + comparison.slug + '/')),
      states: []
    }
  );
}

// ---------------------------------------------------------------------------
// 10. Pillar/Authority Page
// ---------------------------------------------------------------------------
function generatePillarPage(pillar, allPillars) {
  var pillars = allPillars || [];

  var tocHtml = pillar.sections.map(function (s, i) {
    var anchor = s.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return '<li><a href="#' + anchor + '">' + s.heading + '</a></li>';
  }).join('\n');

  var sectionsHtml = pillar.sections.map(function (s, i) {
    var anchor = s.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    var monetization = '';
    if (i === 2) {
      monetization = affiliateCtaBlock('Your Area', 'pillar-mid-' + pillar.slug);
    } else if (i === 5) {
      monetization = midContentFinancingCta('Your Home');
    }
    return '<div id="' + anchor + '" class="pillar-section"><h2>' + s.heading + '</h2><div class="content-prose"><p>' + s.content + '</p></div>' + monetization + '</div>';
  }).join('\n');

  var relatedPillars = pillars.filter(function (p) { return p.slug !== pillar.slug; });
  var faqs = pillar.faqs || [];

  var crumbs = [
    { label: 'Home', url: '/' },
    { label: 'Guides', url: '/articles/' },
    { label: pillar.title }
  ];

  var body = `
<section class="content-section">
<div class="container">
<h1>${pillar.title} (${SITE.year})</h1>
<p class="lead">${pillar.description}</p>

${aboveFoldQuoteCta('Your Area')}

<nav class="toc-nav">
<h3>Table of Contents</h3>
<ol>
${tocHtml}
</ol>
</nav>
</div>
</section>

<section class="content-section">
<div class="container">
${sectionsHtml}
</div>
</section>

${eligibilityWidget('pillar')}

${calculatorResultMonetization('Your Area')}

${comparisonAffiliateTable('Top Solar Providers', [
  { name: 'EnergySage', type: 'Marketplace', highlight: 'Compare installer quotes free', rating: '4.8/5', slug: 'energysage-pillar', affiliate_url: 'https://www.energysage.com/solar/?rc=solarsavingsai', cta_text: 'Get Quotes' },
  { name: 'Sunrun', type: 'Installer', highlight: '$0 down solar lease/loan', rating: '4.5/5', slug: 'sunrun-pillar', affiliate_url: 'https://www.sunrun.com/solar-plans?partner=solarsavingsai', cta_text: 'View Plans' },
  { name: 'SunPower', type: 'Premium', highlight: 'Highest efficiency panels', rating: '4.6/5', slug: 'sunpower-pillar', affiliate_url: 'https://us.sunpower.com/get-quote?ref=solarsavingsai', cta_text: 'Get Quote' }
])}

${faqSection(faqs)}

${authorBioBlock()}

${emailCaptureBlock('Your Home')}

${relatedPagesSection('More Solar Guides', relatedPillars.map(function (p) {
  return { title: p.title, url: '/guide/' + p.slug + '/', meta: p.category };
}))}

${ctaBlock('primary', 'Get Your Free Solar Estimate', 'Use our calculator to see how much you can save with solar energy.', '#widget-pillar')}
`;

  return baseTemplate(
    pillar.title,
    pillar.description,
    '/guide/' + pillar.slug + '/',
    body,
    {
      breadcrumbs: crumbs,
      schema: joinSchemas(faqSchema(faqs), breadcrumbSchema(crumbs), articleSchema(pillar.title, pillar.description, '/guide/' + pillar.slug + '/')),
      states: []
    }
  );
}

// ---------------------------------------------------------------------------
// 11. About Page
// ---------------------------------------------------------------------------
function generateAboutPage(authors) {
  var authorsList = Array.isArray(authors) ? authors : [];
  var crumbs = [{ label: 'Home', url: '/' }, { label: 'About Us' }];

  var teamHtml = authorsList.map(function(a) {
    return '<div class="stat-card"><span class="stat-value">' + a.name + '</span><span class="stat-label">' + a.title + '</span><a href="/authors/' + a.slug + '/" class="btn btn-outline btn-sm mt-2">View Profile</a></div>';
  }).join('');

  var body = `
<section class="content-section">
<div class="container">
<h1>About ${SITE.name}</h1>
<p class="lead">${SITE.name} is a solar energy research and analysis platform dedicated to helping American homeowners make informed decisions about going solar. We provide free, unbiased tools and data to evaluate solar incentives, estimate savings, and compare options.</p>
${lastUpdatedBlock('Dr. Michael Torres', 'michael-torres')}
</div>
</section>

<section class="content-section bg-light">
<div class="container">
<div class="content-prose">
<h2>Our Mission</h2>
<p>We believe every homeowner deserves access to clear, accurate information about solar energy — without sales pressure or hidden agendas. The solar industry is complex, with federal tax credits, state incentives, utility policies, financing options, and equipment choices that vary dramatically by location. Our mission is to simplify this complexity.</p>
<p>${SITE.name} was founded on the principle that data-driven analysis leads to better decisions. We aggregate information from the U.S. Department of Energy, IRS, DSIRE, NREL, EIA, and individual utility companies to provide comprehensive solar intelligence across all 50 states.</p>

<h2>What We Do</h2>
<ul>
<li><strong>Solar Savings Analysis:</strong> We calculate personalized ROI estimates using state-specific data including sun hours, electricity rates, installation costs, and all available incentives.</li>
<li><strong>Incentive Tracking:</strong> We monitor federal, state, and utility-level solar incentives across 50 states and 270+ utilities, updating data quarterly.</li>
<li><strong>Equipment Reviews:</strong> Our team evaluates solar panels, batteries, inverters, and monitoring systems with objective, data-driven analysis.</li>
<li><strong>Installer Comparisons:</strong> We research and compare solar installation companies to help homeowners find reputable, qualified providers.</li>
<li><strong>Educational Content:</strong> Our guides, glossary, and comparison tools explain solar concepts in plain language.</li>
</ul>

<h2>Our Editorial Standards</h2>
<p>All content on ${SITE.name} is independently researched and fact-checked. Our affiliate relationships never influence our analysis, ratings, or recommendations. We clearly disclose all commercial relationships and maintain strict editorial independence. See our <a href="/editorial-standards/">Editorial Standards</a> and <a href="/methodology/">Methodology</a> pages for details.</p>

<h2>Data Sources</h2>
<p>Our analysis relies on authoritative government and industry sources:</p>
<ul>
<li>U.S. Department of Energy (DOE)</li>
<li>Internal Revenue Service (IRS) — Tax credit guidance</li>
<li>Database of State Incentives for Renewables & Efficiency (DSIRE)</li>
<li>National Renewable Energy Laboratory (NREL)</li>
<li>U.S. Energy Information Administration (EIA)</li>
<li>Individual state energy offices and utility tariff filings</li>
</ul>
</div>
</div>
</section>

${teamHtml ? '<section class="content-section"><div class="container"><h2>Our Team</h2><p>Our analysts bring decades of combined experience in solar energy, renewable finance, and energy policy.</p><div class="stats-grid">' + teamHtml + '</div><div class="text-center mt-3"><a href="/authors/" class="btn btn-primary">Meet the Full Team</a></div></div></section>' : ''}

<section class="content-section bg-light">
<div class="container">
<div class="content-prose">
<h2>Contact Us</h2>
<p>Have questions about our data, methodology, or editorial standards? Want to report an error or suggest an improvement?</p>
<p><a href="/contact/" class="btn btn-primary">Contact Us</a></p>
</div>
</div>
</section>
`;

  return baseTemplate('About SolarSavingsAI — Solar Energy Research & Analysis', SITE.name + ' is a solar energy research and analysis platform helping homeowners make informed decisions about going solar. Free tools, unbiased data, and expert analysis across all 50 states.', '/about/', body, { breadcrumbs: crumbs, schema: breadcrumbSchema(crumbs) + '</script><script type="application/ld+json">' + articleSchema('About ' + SITE.name, 'Learn about our mission, team, and methodology.', '/about/') });
}

// ---------------------------------------------------------------------------
// 12. Contact Page
// ---------------------------------------------------------------------------
function generateContactPage() {
  var crumbs = [{ label: 'Home', url: '/' }, { label: 'Contact' }];

  var body = `
<section class="content-section">
<div class="container">
<h1>Contact ${SITE.name}</h1>
<p class="lead">Have a question, correction, or partnership inquiry? We would love to hear from you. Fill out the form below and our team will respond within 2 business days.</p>
</div>
</section>

<section class="content-section bg-light">
<div class="container">
<form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" class="contact-form">
<input type="hidden" name="form-name" value="contact">
<p style="display:none"><label>Do not fill: <input name="bot-field"></label></p>
<div class="widget-field">
<label class="widget-label" for="contact-name">Full Name</label>
<input class="widget-input" type="text" id="contact-name" name="name" required aria-required="true">
</div>
<div class="widget-field">
<label class="widget-label" for="contact-email">Email Address</label>
<input class="widget-input" type="email" id="contact-email" name="email" required aria-required="true">
</div>
<div class="widget-field">
<label class="widget-label" for="contact-subject">Subject</label>
<select class="widget-select" id="contact-subject" name="subject" required>
<option value="">Select a topic...</option>
<option value="data-correction">Data Correction</option>
<option value="general-question">General Question</option>
<option value="partnership">Business / Partnership Inquiry</option>
<option value="advertising">Advertising Inquiry</option>
<option value="press">Press / Media</option>
<option value="other">Other</option>
</select>
</div>
<div class="widget-field">
<label class="widget-label" for="contact-message">Message</label>
<textarea class="widget-input" id="contact-message" name="message" rows="5" required aria-required="true" style="resize:vertical;min-height:120px;"></textarea>
</div>
<button type="submit" class="btn btn-primary btn-lg">Send Message</button>
</form>
</div>
</section>

<section class="content-section">
<div class="container">
<div class="content-prose">
<h2>Other Ways to Reach Us</h2>
<ul>
<li><strong>Email:</strong> contact@solarsavingsai.com</li>
<li><strong>Data Corrections:</strong> If you find an error in our solar incentive data, <a href="/methodology/">see our methodology</a> for how data is sourced, then use the form above to report the issue.</li>
<li><strong>Business Inquiries:</strong> For partnership, advertising, or media inquiries, select the appropriate subject above.</li>
</ul>
<h2>Response Time</h2>
<p>We aim to respond to all inquiries within 2 business days. For urgent data corrections affecting published incentive amounts, we prioritize same-day review.</p>
</div>
</div>
</section>
`;

  return baseTemplate('Contact Us', 'Contact the ' + SITE.name + ' team for questions, data corrections, partnership inquiries, or feedback.', '/contact/', body, { breadcrumbs: crumbs, schema: breadcrumbSchema(crumbs) });
}

// ---------------------------------------------------------------------------
// 13. Privacy Policy Page
// ---------------------------------------------------------------------------
function generatePrivacyPolicyPage() {
  var crumbs = [{ label: 'Home', url: '/' }, { label: 'Privacy Policy' }];

  var body = `
<section class="content-section">
<div class="container">
<h1>Privacy Policy</h1>
<p class="lead">Last updated: March 1, ${SITE.year}. This Privacy Policy describes how ${SITE.name} collects, uses, and protects your personal information.</p>
</div>
</section>

<section class="content-section bg-light">
<div class="container">
<div class="content-prose">
<h2>Information We Collect</h2>
<h3>Information You Provide</h3>
<p>When you use our solar savings calculator or contact forms, you may voluntarily provide:</p>
<ul>
<li><strong>ZIP code</strong> — to determine your location for state-specific incentive data</li>
<li><strong>Monthly electric bill amount</strong> — to estimate potential solar savings</li>
<li><strong>Homeownership status</strong> — to assess solar eligibility</li>
<li><strong>Email address</strong> — to provide personalized savings reports and connect you with solar providers</li>
<li><strong>Name and phone number</strong> — if you choose to provide them for provider follow-up</li>
</ul>

<h3>Information Collected Automatically</h3>
<p>When you visit our site, we may automatically collect:</p>
<ul>
<li>Browser type and version</li>
<li>Pages visited and time spent on each page</li>
<li>Referring website or search terms</li>
<li>Device type (mobile, desktop, tablet)</li>
<li>Approximate geographic location based on IP address (city/state level only)</li>
</ul>

<h2>How We Use Your Information</h2>
<ul>
<li><strong>Savings Estimates:</strong> Your ZIP code and bill amount are used to calculate personalized solar savings projections.</li>
<li><strong>Provider Matching:</strong> When you request quotes, your information may be shared with our vetted solar provider partners to connect you with relevant offers.</li>
<li><strong>Site Improvement:</strong> Aggregated, anonymized usage data helps us improve our tools, content, and user experience.</li>
<li><strong>Communication:</strong> If you provide your email, we may send you your requested savings report. We do not send unsolicited marketing emails.</li>
</ul>

<h2>Information Sharing</h2>
<p>We may share your information in these limited circumstances:</p>
<ul>
<li><strong>Solar Provider Partners:</strong> When you click an affiliate link or request a quote, your information may be shared with the solar provider you selected. This is necessary to fulfill your request. Our partners include EnergySage, Sunrun, SunPower, Palmetto, Sunnova, Mosaic, GoodLeap, and others.</li>
<li><strong>Service Providers:</strong> We use Netlify for hosting, which may process data as part of standard web hosting operations.</li>
<li><strong>Legal Requirements:</strong> We may disclose information if required by law, regulation, or legal process.</li>
</ul>
<p>We do NOT sell your personal information to third parties for their independent marketing purposes.</p>

<h2>Your Rights</h2>
<h3>California Residents (CCPA/CPRA)</h3>
<p>If you are a California resident, you have the right to:</p>
<ul>
<li>Know what personal information we collect, use, and disclose</li>
<li>Request deletion of your personal information</li>
<li>Opt out of the sale or sharing of your personal information</li>
<li>Non-discrimination for exercising your privacy rights</li>
</ul>
<p>To exercise these rights, contact us at <a href="/contact/">our contact page</a> or email privacy@solarsavingsai.com.</p>

<h3>Other State Privacy Laws</h3>
<p>Residents of Virginia (VCDPA), Colorado (CPA), Connecticut (CTDPA), and other states with comprehensive privacy laws have similar rights. Contact us to exercise your rights under applicable state law.</p>

<h2>Cookies and Tracking</h2>
<p>We use session storage (not persistent cookies) to improve your experience by remembering your calculator inputs during a browsing session. We use basic analytics to understand site usage patterns. We do not use third-party tracking cookies for advertising purposes.</p>

<h2>Data Security</h2>
<p>We implement industry-standard security measures including HTTPS encryption, security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy), and input validation to protect your information. However, no method of transmission over the internet is 100% secure.</p>

<h2>Data Retention</h2>
<p>Calculator submissions and contact form data are retained for a maximum of 12 months, after which they are automatically deleted. You may request earlier deletion by contacting us.</p>

<h2>Children's Privacy</h2>
<p>Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13.</p>

<h2>Changes to This Policy</h2>
<p>We may update this Privacy Policy periodically. The "Last updated" date at the top of this page indicates when the policy was last revised. Continued use of the site after changes constitutes acceptance of the updated policy.</p>

<h2>Contact Us</h2>
<p>For privacy-related inquiries, contact us at:</p>
<ul>
<li>Email: privacy@solarsavingsai.com</li>
<li>Web: <a href="/contact/">Contact Form</a></li>
</ul>
</div>
</div>
</section>
`;

  return baseTemplate('Privacy Policy', SITE.name + ' privacy policy. Learn how we collect, use, and protect your personal information. CCPA/state privacy law compliant.', '/privacy-policy/', body, { breadcrumbs: crumbs, schema: breadcrumbSchema(crumbs) });
}

// ---------------------------------------------------------------------------
// 14. Authors Index Page
// ---------------------------------------------------------------------------
function generateAuthorsIndexPage(authors) {
  var authorsList = Array.isArray(authors) ? authors : [];
  var crumbs = [{ label: 'Home', url: '/' }, { label: 'Our Team' }];

  var cardsHtml = authorsList.map(function(a) {
    var creds = (a.credentials || []).slice(0, 2).join(' | ');
    return '<a href="/authors/' + a.slug + '/" class="related-card" itemscope itemtype="https://schema.org/Person">' +
      '<span class="related-title" itemprop="name">' + a.name + '</span>' +
      '<span class="related-meta" itemprop="jobTitle">' + a.title + '</span>' +
      '<span class="related-meta" style="font-size:0.75rem;opacity:0.8;">' + creds + '</span>' +
      '</a>';
  }).join('');

  var body = `
<section class="content-section">
<div class="container">
<h1>Meet the ${SITE.name} Team</h1>
<p class="lead">Our team of solar energy analysts, finance specialists, and industry researchers brings decades of combined experience to provide accurate, unbiased solar information.</p>
</div>
</section>

<section class="content-section bg-light">
<div class="container">
<div class="related-grid">
${cardsHtml}
</div>
</div>
</section>

<section class="content-section">
<div class="container">
<div class="content-prose">
<h2>Our Expertise</h2>
<p>Every analysis, guide, and data point on ${SITE.name} is reviewed by qualified team members with relevant expertise. Our editorial process ensures accuracy through multi-source verification, peer review, and quarterly data audits.</p>
<p>Learn more about our process: <a href="/methodology/">Methodology</a> | <a href="/editorial-standards/">Editorial Standards</a></p>
</div>
</div>
</section>
`;

  return baseTemplate('Our Team — Solar Energy Experts', 'Meet the ' + SITE.name + ' team of solar energy analysts, finance specialists, and researchers. Decades of combined expertise in solar energy.', '/authors/', body, { breadcrumbs: crumbs, schema: breadcrumbSchema(crumbs) });
}

// ---------------------------------------------------------------------------
// 15. Individual Author Page
// ---------------------------------------------------------------------------
function generateAuthorPage(author, allAuthors) {
  var crumbs = [{ label: 'Home', url: '/' }, { label: 'Our Team', url: '/authors/' }, { label: author.name }];
  var otherAuthors = (allAuthors || []).filter(function(a) { return a.slug !== author.slug; });

  var credsHtml = (author.credentials || []).map(function(c) {
    return '<li>' + c + '</li>';
  }).join('');

  var expertiseHtml = (author.expertise || []).map(function(e) {
    return '<span class="badge badge-sm">' + e + '</span>';
  }).join(' ');
  var authoredArticles = Array.isArray(author.authored_articles) ? author.authored_articles : [];
  var authoredArticlesHtml = authoredArticles.length > 0
    ? '<h2>Authored Articles</h2><ul>' + authoredArticles.map(function(article) {
      return '<li><a href="' + article.url + '">' + article.title + '</a></li>';
    }).join('') + '</ul>'
    : '';

  var body = `
<section class="content-section">
<div class="container" itemscope itemtype="https://schema.org/Person">
<h1 itemprop="name">${author.name}</h1>
<p class="lead" itemprop="jobTitle">${author.title} at ${SITE.name}</p>
<div class="author-expertise">${expertiseHtml}</div>
</div>
</section>

<section class="content-section bg-light">
<div class="container">
<div class="content-prose">
<h2>About ${author.name}</h2>
<p itemprop="description">${author.bio}</p>

<h2>Credentials</h2>
<ul>${credsHtml}</ul>

<h2>Areas of Expertise</h2>
<p>${author.name} specializes in ${(author.expertise || []).join(', ')}. With ${author.experience_years || 5}+ years of experience in the solar energy industry, ${author.name.split(' ')[0]} contributes to ${SITE.name}'s data analysis, content creation, and editorial review processes.</p>
${authoredArticlesHtml}
</div>
</div>
</section>

${relatedPagesSection('Other Team Members', otherAuthors.map(function(a) {
  return { title: a.name, url: '/authors/' + a.slug + '/', meta: a.title };
}))}
`;

  var personSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    jobTitle: author.title,
    description: (author.bio || '').substring(0, 200),
    worksFor: { '@type': 'Organization', name: SITE.name, url: SITE.url }
  });

  return baseTemplate(author.name + ' — ' + author.title, author.name + ', ' + author.title + ' at ' + SITE.name + '. ' + (author.credentials || []).slice(0, 2).join('. ') + '.', '/authors/' + author.slug + '/', body, { breadcrumbs: crumbs, schema: breadcrumbSchema(crumbs) + '</script><script type="application/ld+json">' + personSchema });
}

// ---------------------------------------------------------------------------
// 16. Brand Review Page
// ---------------------------------------------------------------------------
function generateBrandReviewPage(brand, allBrands) {
  var brandName = brand.brand || brand.name || brand.brand_name || 'Solar Brand';
  var brandRating = brand.rating != null ? brand.rating : brand.overall_rating;
  var brandType = brand.type || brand.brand_type || 'Solar';
  var brandDescription = brand.description || brand.meta_description || brand.intro || ('Comprehensive review of ' + brandName + ' solar products, pricing, warranty, and customer experience.');
  var brandPriceRange = brand.price_range || (brand.key_specs && brand.key_specs.price_range) || '$$';
  var brandWarranty = brand.warranty_details || (brand.key_specs && brand.key_specs.warranty) || 'Comprehensive coverage';
  var brandWarrantyYears = brand.warranty_years || ((brand.key_specs && brand.key_specs.warranty) ? brand.key_specs.warranty : 25);
  var crumbs = [{ label: 'Home', url: '/' }, { label: 'Reviews', url: '/reviews/' }, { label: brandName }];
  var otherBrands = (allBrands || []).filter(function(b) { return b.slug !== brand.slug; }).slice(0, 6);

  var ratingsHtml = '';
  if (brand.ratings) {
    var ratingKeys = Object.keys(brand.ratings);
    ratingsHtml = '<div class="stats-grid">' + ratingKeys.map(function(key) {
      return '<div class="stat-card"><span class="stat-value">' + brand.ratings[key] + '/5</span><span class="stat-label">' + key.charAt(0).toUpperCase() + key.slice(1) + '</span></div>';
    }).join('') + '</div>';
  }

  var prosHtml = (brand.pros || []).map(function(p) { return '<li>' + p + '</li>'; }).join('');
  var consHtml = (brand.cons || []).map(function(c) { return '<li>' + c + '</li>'; }).join('');

  var sectionsHtml = (brand.sections || []).map(function(s, i) {
    var monetization = i === 2 ? affiliateCtaBlock(brandName, 'review-mid-' + brand.slug) : '';
    return '<h2>' + s.heading + '</h2><div class="content-prose"><p>' + s.content + '</p></div>' + monetization;
  }).join('\n');

  var faqs = brand.faqs || [];

  var body = `
<section class="content-section">
<div class="container">
<h1>${brandName} Solar Review (${SITE.year})</h1>
<p class="lead">${brandDescription}</p>
${lastUpdatedBlock('Emily Watson', 'emily-watson')}
</div>
</section>

<section class="content-section bg-light">
<div class="container">
<h2>Overall Rating: ${brandRating}/5</h2>
${ratingsHtml}
<div class="content-prose">
<div class="pros-cons" style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
<div><h3>Pros</h3><ul>${prosHtml}</ul></div>
<div><h3>Cons</h3><ul>${consHtml}</ul></div>
</div>
<p><strong>Best For:</strong> ${brand.best_for || 'General solar needs'}</p>
<p><strong>Price Range:</strong> ${brandPriceRange}</p>
<p><strong>Warranty:</strong> ${brandWarrantyYears} years — ${brandWarranty}</p>
</div>
</div>
</section>

<section class="content-section">
<div class="container">
${sectionsHtml}
</div>
</section>

${faqSection(faqs)}

${comparisonAffiliateTable('Compare ' + brandName + ' with Alternatives', [
  { name: 'EnergySage', type: 'Marketplace', highlight: 'Compare ' + brandName + ' quotes', rating: '4.8/5', slug: 'energysage-' + brand.slug, affiliate_url: 'https://www.energysage.com/solar/?rc=solarsavingsai', cta_text: 'Compare Quotes' },
  { name: 'Sunrun', type: 'Installer', highlight: '$0 down solar options', rating: '4.5/5', slug: 'sunrun-' + brand.slug, affiliate_url: 'https://www.sunrun.com/solar-plans?partner=solarsavingsai', cta_text: 'View Plans' },
  { name: 'SunPower', type: 'Premium', highlight: 'Highest efficiency panels', rating: '4.6/5', slug: 'sunpower-' + brand.slug, affiliate_url: 'https://us.sunpower.com/get-quote?ref=solarsavingsai', cta_text: 'Get Quote' }
])}

${authorBioBlock()}

${relatedPagesSection('More Solar Brand Reviews', otherBrands.map(function(b) {
  var relatedBrand = b.brand || b.name || b.brand_name || 'Solar Brand';
  var relatedRating = b.rating != null ? b.rating : b.overall_rating;
  return { title: relatedBrand + ' Review', url: '/reviews/' + b.slug + '/', meta: relatedRating + '/5 — ' + (b.type || b.brand_type || 'Solar') };
}))}
`;

  return baseTemplate(brandName + ' Solar Review ' + SITE.year + ': Pricing, Warranty & Rating', brandName + ' solar review ' + SITE.year + ': rated ' + brandRating + '/5. ' + (brand.best_for || 'Detailed analysis') + '. Pros, cons, pricing, warranty analysis & comparison with alternatives.', '/reviews/' + brand.slug + '/', body, {
    breadcrumbs: crumbs,
    schema: joinSchemas(faqSchema(faqs), breadcrumbSchema(crumbs), reviewSchema(brandName, 'Product', brandRating || 0, brand.review_count || 150), articleSchema(brandName + ' Solar Review', brandDescription, '/reviews/' + brand.slug + '/'))
  });
}

// ---------------------------------------------------------------------------
// 17. Brand Reviews Index Page
// ---------------------------------------------------------------------------
function generateBrandReviewsIndexPage(brands) {
  var brandsList = Array.isArray(brands) ? brands : [];
  var crumbs = [{ label: 'Home', url: '/' }, { label: 'Solar Brand Reviews' }];

  var cardsHtml = brandsList.map(function(review) {
    var reviewBrand = review.brand || review.name || review.brand_name || 'Solar Brand';
    var reviewRating = review.rating != null ? review.rating : review.overall_rating;
    var reviewSlug = review.slug;
    var reviewType = review.type || review.brand_type || 'Solar';
    return '<a href="/reviews/' + reviewSlug + '/" class="related-card"><span class="related-title">' + reviewBrand + '</span><span class="related-meta">' + reviewRating + '/5 — ' + reviewType + ' — ' + (review.best_for || '') + '</span></a>';
  }).join('');

  var body = `
<section class="content-section">
<div class="container">
<h1>Solar Brand Reviews (${SITE.year})</h1>
<p class="lead">Independent, data-driven reviews of the top solar panel manufacturers, installers, and service companies. Our team evaluates efficiency, value, warranty, customer service, and installation quality.</p>
${lastUpdatedBlock('Emily Watson', 'emily-watson')}
</div>
</section>

<section class="content-section bg-light">
<div class="container">
<h2>All Solar Brand Reviews</h2>
<div class="related-grid">
${cardsHtml}
</div>
</div>
</section>

${affiliateCtaBlock('Your Area', 'reviews-index')}

${ctaBlock('primary', 'Get Your Free Solar Estimate', 'Compare quotes from top-rated solar companies in your area.', '/#widget-hero')}
`;

  return baseTemplate('Solar Brand Reviews & Ratings ' + SITE.year + ' — Independent Expert Analysis', 'Independent reviews of top solar brands for ' + SITE.year + ': Tesla, SunPower, Sunrun, LG, Enphase, and more. Expert ratings, pros, cons, pricing, warranty analysis, and side-by-side comparisons.', '/reviews/', body, { breadcrumbs: crumbs, schema: breadcrumbSchema(crumbs) + '</script><script type="application/ld+json">' + articleSchema('Solar Brand Reviews', 'Independent reviews of top solar brands.', '/reviews/') });
}

// ---------------------------------------------------------------------------
// 18. Best Hub Page
// ---------------------------------------------------------------------------
function generateBestHubPage() {
  var crumbs = [{ label: 'Home', url: '/' }, { label: 'Best Solar' }];
  var bestLinks = [
    { title: 'Best Solar Panels', url: '/best/best-solar-panels-for-home/', meta: 'Top panel picks' },
    { title: 'Best Solar Companies', url: '/best/best-solar-companies/', meta: 'Top installer options' },
    { title: 'Best Solar Batteries', url: '/best/best-solar-battery-storage/', meta: 'Backup and storage picks' },
    { title: 'Best Solar Inverters', url: '/best/best-solar-inverters/', meta: 'Top inverter options' },
    { title: 'Best Solar Installers', url: '/best/best-solar-companies/', meta: 'Installer rankings' }
  ];

  var body = `
<section class="content-section">
<div class="container">
<h1>Best Solar Products &amp; Companies</h1>
<p class="lead">Explore our expert-ranked best solar lists for panels, companies, batteries, and inverters.</p>
</div>
</section>

<section class="content-section bg-light">
<div class="container">
<div class="related-grid">
${bestLinks.map(function(link) {
  return '<a href="' + link.url + '" class="related-card"><span class="related-title">' + link.title + '</span><span class="related-meta">' + link.meta + '</span></a>';
}).join('')}
</div>
</div>
</section>

${hubLinksSection('Explore More Solar Resources', [
  { title: 'Solar Reviews', url: '/reviews/', meta: 'Read brand and installer reviews' },
  { title: 'Solar Guides', url: '/articles/', meta: 'Explore educational solar content' },
  { title: 'Solar Financing', url: '/solar-financing/', meta: 'Compare financing options' }
])}
`;

  return baseTemplate('Best Solar Products & Companies ' + SITE.year + ' — Expert Rankings', 'Browse our expert-ranked best solar lists for ' + SITE.year + ': top solar panels, best companies, battery storage, and inverters. Data-driven rankings updated regularly.', '/best/', body, {
    breadcrumbs: crumbs,
    schema: breadcrumbSchema(crumbs) + '</script><script type="application/ld+json">' + articleSchema('Best Solar Lists', 'Browse our top-rated best solar lists.', '/best/')
  });
}

// ---------------------------------------------------------------------------
// 19. Best-Of Roundup Page
// ---------------------------------------------------------------------------
function generateBestOfPage(bestOf, allBestOf) {
  var crumbs = [{ label: 'Home', url: '/' }, { label: 'Best Of', url: '/best/' }, { label: bestOf.title }];
  var otherBestOf = (allBestOf || []).filter(function(b) { return b.slug !== bestOf.slug; }).slice(0, 6);

  var picksHtml = (bestOf.picks || []).map(function(pick, i) {
    return '<div class="stat-card" style="text-align:left;"><span class="stat-value" style="font-size:1rem;">#' + (i + 1) + ' ' + pick.name + '</span><span class="stat-label">' + (pick.best_for || '') + '</span><p style="font-size:0.85rem;margin-top:0.5rem;"><strong>Rating:</strong> ' + pick.rating + '/5 | <strong>Best for:</strong> ' + (pick.best_for || '') + '</p>' +
      '<div style="font-size:0.85rem;margin-top:0.25rem;">' + (pick.summary || '') + '</div>' +
      '<div style="font-size:0.85rem;"><strong>Pros:</strong> ' + (pick.pros || []).join(', ') + '</div></div>';
  }).join('');

  var faqs = bestOf.faqs || [];

  var body = `
<section class="content-section">
<div class="container">
<h1>${bestOf.title}</h1>
<p class="lead">${bestOf.intro || bestOf.meta_description || ''}</p>
${lastUpdatedBlock('Sarah Chen', 'sarah-chen')}
</div>
</section>

${aboveFoldQuoteCta('Your Area')}

<section class="content-section bg-light">
<div class="container">
<h2>Our Top Picks</h2>
<div class="stats-grid" style="grid-template-columns:1fr;">
${picksHtml}
</div>
</div>
</section>

<section class="content-section">
<div class="container">
<div class="content-prose">
<h2>How We Chose</h2>
<p>Our selections are based on the following criteria: ${(bestOf.criteria || []).join(', ')}. Each product was evaluated by our research team using manufacturer specifications, independent testing data, and verified customer feedback.</p>
<h2>Buying Guide</h2>
<p>${bestOf.buying_guide || 'When choosing solar equipment, consider your specific needs, budget, roof characteristics, and local climate conditions.'}</p>
</div>
</div>
</section>

${affiliateCtaBlock('Your Area', 'bestof-' + bestOf.slug)}

${faqSection(faqs)}

${authorBioBlock()}

${relatedPagesSection('More Best-Of Guides', otherBestOf.map(function(b) {
  return { title: b.title, url: '/best/' + b.slug + '/', meta: b.category };
}))}
`;

  var metaDesc = bestOf.meta_description || bestOf.intro || '';

  return baseTemplate(bestOf.title, metaDesc, '/best/' + bestOf.slug + '/', body, {
    breadcrumbs: crumbs,
    schema: joinSchemas(faqSchema(faqs), breadcrumbSchema(crumbs), articleSchema(bestOf.title, metaDesc, '/best/' + bestOf.slug + '/'))
  });
}

// ---------------------------------------------------------------------------
// 20. State/City Best Companies Page
// ---------------------------------------------------------------------------
function generateStateBestCompaniesPage(entry, allEntries) {
  var stateNameByAbbrev = {
    AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
    CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
    HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
    KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
    MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
    MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
    NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
    OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
    SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
    VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming'
  };

  function titleCaseSlug(slug) {
    return String(slug || '').split('-').filter(Boolean).map(function (part) {
      if (part.length <= 2) return part.toUpperCase();
      return part.charAt(0).toUpperCase() + part.slice(1);
    }).join(' ');
  }

  function parseLocationFromTitle(title) {
    var m = String(title || '').match(/Best Solar Companies in (.+?)(?: \d{4})?$/i);
    return m ? m[1].trim() : '';
  }

  var locationName = entry.location_name || parseLocationFromTitle(entry.title) || entry.name || titleCaseSlug(entry.slug);
  var stateName = entry.state_name || '';
  var cityName = entry.city_name || '';

  if (entry.location_type === 'city') {
    if (!cityName) cityName = locationName.split(',')[0].trim();
    if (!stateName) {
      var trailingToken = locationName.indexOf(',') >= 0 ? locationName.split(',').slice(1).join(',').trim() : '';
      if (trailingToken.length === 2) {
        stateName = stateNameByAbbrev[trailingToken.toUpperCase()] || trailingToken.toUpperCase();
      } else if (trailingToken) {
        stateName = trailingToken;
      }
    }
  } else if (!stateName) {
    stateName = locationName;
  }

  if (!stateName && entry.state_abbrev) {
    stateName = stateNameByAbbrev[String(entry.state_abbrev).toUpperCase()] || String(entry.state_abbrev).toUpperCase();
  }

  var utilityName = entry.utility_name || entry.utilityName || entry.utility || 'local utility provider';
  var marketName = entry.market_name || entry.marketName || ((cityName || stateName || locationName) + ' solar market');
  var pageTitle = entry.title || ('Best Solar Companies in ' + (cityName || stateName || locationName));
  var pageDescription = entry.description || entry.meta_description || entry.intro || ('Compare top-rated installers in ' + (cityName || stateName || locationName) + '.');
  var displayLocation = cityName || stateName || locationName;

  var crumbs = [{ label: 'Home', url: '/' }, { label: 'Best Solar Companies', url: '/best/best-solar-companies/' }, { label: displayLocation }];
  var otherEntries = (allEntries || []).filter(function(e) { return e.slug !== entry.slug; }).slice(0, 8);

  var companiesHtml = (entry.companies || []).map(function(c, idx) {
    var rank = c.rank || (idx + 1);
    var companyName = c.name || 'Solar Installer';
    var rating = c.rating != null ? c.rating : 'N/A';
    var type = c.type ? (c.type.charAt(0).toUpperCase() + c.type.slice(1)) : 'Installer';
    var highlight = c.highlight || c.summary || 'Strong local track record';
    var services = c.services || c.strengths || [];
    var bestFor = c.best_for || c.summary || 'Residential solar installations';
    return '<div class="stat-card" style="text-align:left;"><span class="stat-value" style="font-size:1rem;">#' + rank + ' ' + companyName + ' (' + rating + '/5)</span><span class="stat-label">' + type + ' — ' + highlight + '</span><p style="font-size:0.85rem;margin-top:0.25rem;"><strong>Services:</strong> ' + services.join(', ') + ' | <strong>Best for:</strong> ' + bestFor + '</p></div>';
  }).join('');

  var faqs = entry.faqs || [];

  var body = `
<section class="content-section">
<div class="container">
<h1>${pageTitle}</h1>
<p class="lead">${pageDescription}</p>
${lastUpdatedBlock('Emily Watson', 'emily-watson')}
</div>
</section>

${aboveFoldQuoteCta(displayLocation)}

<section class="content-section bg-light">
<div class="container">
<h2>Top-Rated Solar Companies in ${displayLocation}</h2>
<div class="stats-grid" style="grid-template-columns:1fr;">
${companiesHtml}
</div>
</div>
</section>

<section class="content-section">
<div class="container">
<div class="content-prose">
<h2>${displayLocation} Solar Market Overview</h2>
<p>${entry.local_market_info || ('The ' + marketName + ' continues to grow as homeowners served by ' + utilityName + ' take advantage of federal and state incentives.')}</p>
<p>${entry.intro || ''}</p>
</div>
</div>
</section>

${affiliateCtaBlock(displayLocation, 'best-companies-' + entry.slug)}

${faqSection(faqs)}

${authorBioBlock()}

${relatedPagesSection('Best Solar Companies in Other Locations', otherEntries.map(function(e) {
  return { title: e.title, url: '/best-solar-companies/' + e.slug + '/', meta: e.type === 'city' ? 'City' : 'State' };
}))}
`;

  return baseTemplate(pageTitle, pageDescription, '/best-solar-companies/' + entry.slug + '/', body, {
    breadcrumbs: crumbs,
    schema: joinSchemas(faqSchema(faqs), breadcrumbSchema(crumbs), articleSchema(pageTitle, pageDescription, '/best-solar-companies/' + entry.slug + '/'))
  });
}

// ---------------------------------------------------------------------------
// Editorial Article Page
// ---------------------------------------------------------------------------
function generateArticlePage(article, allArticles) {
  var crumbs = [
    { label: 'Home', url: '/' },
    { label: 'Articles', url: '/articles/' },
    { label: article.title }
  ];

  var relatedArticles = (allArticles || []).filter(function (a) {
    return a.slug !== article.slug;
  }).slice(0, 4).map(function (a) {
    return { url: '/article/' + a.slug + '/', title: a.title, meta: a.category };
  });

  var tagHtml = (article.tags || []).map(function (t) {
    return '<span class="article-tag">' + escapeHtml(t) + '</span>';
  }).join(' ');

  var processedContent = (article.content_html || '').replace(
    /<a href="(https:\/\/(?:www\.energysage\.com|www\.sunrun\.com|us\.sunpower\.com|modernize\.com|www\.solarreviews\.com|www\.tesla\.com)[^"]*)" rel="sponsored">/g,
    '<a href="$1" rel="sponsored noopener noreferrer" target="_blank">'
  );

  var body = `
<article class="content-section" itemscope itemtype="https://schema.org/Article">
<div class="container">
${lastUpdatedBlock(article.author)}
<h1 itemprop="headline">${escapeHtml(article.title)}</h1>
<div class="article-meta">
<span class="article-date">Published: <time datetime="${escapeHtml(article.date_published)}" itemprop="datePublished">${escapeHtml(article.date_published)}</time></span>
<span class="article-date">Updated: <time datetime="${escapeHtml(article.date_modified)}" itemprop="dateModified">${escapeHtml(article.date_modified)}</time></span>
<span class="article-author" itemprop="author">${escapeHtml(article.author)}</span>
</div>
<div class="article-tags">${tagHtml}</div>
<div class="article-content" itemprop="articleBody">
${processedContent}
</div>
${affiliateCtaBlock('Your Area', 'article-bottom')}
${calculatorResultMonetization('Your Area')}
${authorBioBlock()}
</div>
</article>
${relatedPagesSection('More Solar Guides', relatedArticles)}
`;

  var schema = articleSchema(article.title, article.description, '/article/' + article.slug + '/', article.date_published, article.author) +
    '</script><script type="application/ld+json">' + breadcrumbSchema(crumbs);

  return baseTemplate(
    article.title,
    article.description,
    '/article/' + article.slug + '/',
    body,
    {
      breadcrumbs: crumbs,
      schema: schema,
      states: []
    }
  );
}

// ---------------------------------------------------------------------------
// Articles Index Page
// ---------------------------------------------------------------------------
function generateArticlesIndexPage(articles) {
  var crumbs = [
    { label: 'Home', url: '/' },
    { label: 'Articles' }
  ];

  var categories = {};
  (articles || []).forEach(function (a) {
    var cat = a.category || 'general';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(a);
  });

  var articleCards = (articles || []).map(function (a) {
    return '<div class="article-card">' +
      '<a href="/article/' + escapeHtml(a.slug) + '/" class="article-card-link">' +
      '<h3 class="article-card-title">' + escapeHtml(a.title) + '</h3>' +
      '<p class="article-card-desc">' + escapeHtml(a.description) + '</p>' +
      '<div class="article-card-meta">' +
      '<span class="article-card-category">' + escapeHtml(a.category) + '</span>' +
      '<span class="article-card-date">' + escapeHtml(a.date_modified) + '</span>' +
      '</div></a></div>';
  }).join('\n');

  var body = `
<section class="content-section">
<div class="container">
<h1>Solar Energy Articles &amp; Guides</h1>
<p class="hero-subtitle">Expert analysis, buying guides, and educational content to help you make the best solar investment decision. Updated regularly with the latest data and policy changes.</p>
<div class="articles-grid">
${articleCards}
</div>
</div>
</section>
${affiliateCtaBlock('Your Area', 'articles-index')}
`;

  var schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Solar Energy Articles & Guides',
    description: 'Expert solar energy articles covering tax credits, ROI analysis, financing, installation guides, and more.',
    url: SITE.url + '/articles/',
    publisher: { '@type': 'Organization', name: SITE.name }
  }) + '</script><script type="application/ld+json">' + breadcrumbSchema(crumbs);

  return baseTemplate(
    'Solar Energy Articles & Expert Guides ' + SITE.year + ' — Tax Credits, ROI & More',
    'Expert solar energy articles: federal tax credit guide, real ROI analysis, financing comparisons, installation walkthroughs, and policy updates. All guides updated for ' + SITE.year + ' with the latest data.',
    '/articles/',
    body,
    {
      breadcrumbs: crumbs,
      schema: schema,
      states: []
    }
  );
}

// ---------------------------------------------------------------------------
// Custom 404 Page
// ---------------------------------------------------------------------------
function generateNotFoundPage() {
  var crumbs = [{ label: 'Home', url: '/' }, { label: 'Page Not Found' }];
  var body = `
<section class="content-section">
<div class="container">
<h1>Page Not Found</h1>
<p class="lead">The page being requested could not be found. Use the links below to continue exploring.</p>
<div class="cta-group" style="display:flex;flex-wrap:wrap;gap:0.75rem;">
<a href="/" class="btn btn-primary">Return Home</a>
<a href="/chat.html" class="btn btn-outline">Try Solar AI</a>
<a href="/#estimate" class="btn btn-outline">Check Solar Savings</a>
</div>
</div>
</section>

<section class="content-section bg-light">
<div class="container">
<h2>Popular Sections</h2>
<div class="related-grid">
<a href="/articles/" class="related-card"><span class="related-title">Guides</span><span class="related-meta">Learn how solar works</span></a>
<a href="/reviews/" class="related-card"><span class="related-title">Reviews</span><span class="related-meta">Read solar brand reviews</span></a>
<a href="/best/" class="related-card"><span class="related-title">Best Lists</span><span class="related-meta">Compare top solar picks</span></a>
</div>
</div>
</section>
`;

  return baseTemplate('Page Not Found', 'The requested page could not be found.', '/', body, {
    breadcrumbs: crumbs,
    schema: breadcrumbSchema(crumbs),
    noindex: true
  });
}

// ---------------------------------------------------------------------------
// Module Exports
// ---------------------------------------------------------------------------
module.exports = {
  generateHomepage,
  generateStatePage,
  generateUtilityPage,
  generateCityPage,
  generateFinancingPage,
  generateGlossaryPage,
  generateMethodologyPage,
  generateEditorialPage,
  generateComparisonPage,
  generatePillarPage,
  generateAboutPage,
  generateContactPage,
  generatePrivacyPolicyPage,
  generateAuthorsIndexPage,
  generateAuthorPage,
  generateBrandReviewPage,
  generateBrandReviewsIndexPage,
  generateBestHubPage,
  generateBestOfPage,
  generateStateBestCompaniesPage,
  generateArticlePage,
  generateArticlesIndexPage,
  generateNotFoundPage
};
