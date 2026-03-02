'use strict';

const {
  baseTemplate, eligibilityWidget, alertBanner, statsGrid,
  faqSection, relatedPagesSection, comparisonTable, barChartComponent,
  ctaBlock, urgencyBlock, SITE
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
<h1>Find Solar Rebates, Tax Credits &amp; Incentives in Your State</h1>
<p class="hero-subtitle">Get an instant estimate of your solar savings. We analyze federal tax credits, state rebates, utility incentives, and local programs so you can make an informed decision about going solar.</p>
${eligibilityWidget('hero')}
</div>
</div>
</section>

<section class="content-section">
<div class="container">
${statsGrid([
  { value: '30%', label: 'Federal Tax Credit (ITC)' },
  { value: '50', label: 'State Programs Tracked' },
  { value: fmt(utilities.length) + '+', label: 'Utility Policies Analyzed' },
  { value: fmt(cities.length) + '+', label: 'City ROI Reports' }
])}
</div>
</section>

<section class="content-section bg-light" id="how-it-works">
<div class="container">
<h2 class="section-title text-center">How It Works</h2>
<div class="steps-grid">
<div class="step-card">
<div class="step-number">1</div>
<h3>Enter Your Details</h3>
<p>Enter your ZIP code, homeownership status, and average electric bill to get a personalized estimate.</p>
</div>
<div class="step-card">
<div class="step-number">2</div>
<h3>See Your Incentives</h3>
<p>We identify the federal tax credit, state rebates, utility programs, and local incentives available to you.</p>
</div>
<div class="step-card">
<div class="step-number">3</div>
<h3>Estimate Your Savings</h3>
<p>Get a 20-year savings projection including break-even timeline, ROI, and financing options.</p>
</div>
</div>
</div>
</section>

<section class="content-section" id="state-map">
<div class="container">
<h2 class="section-title text-center">Solar Rebates &amp; Incentives by State</h2>
<p class="text-center mb-4">Select your state to see detailed rebate information, utility policies, ROI projections, and local incentives.</p>
${stateLinksHtml}
</div>
</section>

<section class="content-section bg-light">
<div class="container">
<h2 class="section-title text-center">Top Cities for Solar</h2>
<div class="related-grid">
${cityLinksHtml}
</div>
</div>
</section>

<section class="content-section">
<div class="container">
<h2 class="section-title text-center">Solar Financing Options</h2>
<p class="text-center mb-4">Compare loans, leases, PPAs, and cash purchases to find the right option for your budget.</p>
<div class="financing-overview-grid">
<div class="stat-card"><span class="stat-value">Cash</span><span class="stat-label">Best total savings. Own your system day one.</span></div>
<div class="stat-card"><span class="stat-value">Loan</span><span class="stat-label">Own system &amp; get tax credits. Pay over time.</span></div>
<div class="stat-card"><span class="stat-value">Lease</span><span class="stat-label">$0 down. Lower savings but no maintenance.</span></div>
<div class="stat-card"><span class="stat-value">PPA</span><span class="stat-label">Pay per kWh. Often below utility rates.</span></div>
</div>
<div class="text-center mt-4"><a href="/solar-financing/" class="btn btn-primary btn-lg">Compare Financing Options</a></div>
</div>
</section>

${faqSection([
  { question: 'What is the federal solar tax credit?', answer: 'The federal Investment Tax Credit (ITC) allows you to deduct <strong>30%</strong> of the cost of installing a solar energy system from your federal taxes. This credit is available through 2032 and applies to both residential and commercial installations.' },
  { question: 'How much can I save with solar panels?', answer: 'Savings depend on your location, electricity rates, system size, and available incentives. On average, homeowners save between <strong>$20,000 and $60,000</strong> over 20 years. Use our calculator above for a personalized estimate.' },
  { question: 'Do I need to buy solar panels outright?', answer: 'No. You can finance solar through loans, leases, or power purchase agreements (PPAs). Many options require <strong>$0 down</strong>. Visit our <a href="/solar-financing/">financing page</a> to compare options.' },
  { question: 'How long does it take for solar to pay for itself?', answer: 'Most residential solar systems reach break-even in <strong>6-10 years</strong>, depending on your state incentives, electricity rates, and system cost. After that, electricity is essentially free.' },
  { question: 'Are there state-specific solar incentives?', answer: 'Yes. Many states offer additional tax credits, rebates, SRECs, property and sales tax exemptions, and performance-based incentives on top of the federal ITC. <a href="#state-map">Select your state</a> to see what is available.' }
])}

${ctaBlock('primary', 'Get Your Free Solar Estimate', 'Enter your ZIP code above to see available rebates and projected savings for your home.', '#widget-hero')}
`;

  var faqs = [
    { question: 'What is the federal solar tax credit?', answer: 'The federal Investment Tax Credit (ITC) allows you to deduct 30% of the cost of installing a solar energy system from your federal taxes.' },
    { question: 'How much can I save with solar panels?', answer: 'Savings depend on your location, electricity rates, system size, and available incentives. On average, homeowners save between $20,000 and $60,000 over 20 years.' },
    { question: 'Do I need to buy solar panels outright?', answer: 'No. You can finance solar through loans, leases, or power purchase agreements. Many options require $0 down.' },
    { question: 'How long does it take for solar to pay for itself?', answer: 'Most residential solar systems reach break-even in 6-10 years.' },
    { question: 'Are there state-specific solar incentives?', answer: 'Yes. Many states offer additional tax credits, rebates, SRECs, property and sales tax exemptions.' }
  ];

  return baseTemplate(
    'Find Solar Rebates & Tax Credits in Your State',
    'Discover solar rebates, tax credits, and incentives available in your state. Get personalized savings estimates and compare financing options for going solar.',
    '/',
    body,
    {
      alertHtml: federalAlert(alerts),
      schema: faqSchema(faqs)
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
    { question: 'What solar incentives are available in ' + state.state_name + '?', answer: 'Homeowners in ' + state.state_name + ' can claim the 30% federal ITC' + (state.state_tax_credit_percent > 0 ? ', a ' + state.state_tax_credit_percent + '% state tax credit' : '') + (state.state_rebate_amount > 0 ? ', a ' + dollar(state.state_rebate_amount) + ' state rebate' : '') + (state.srec_available ? ', and SRECs worth $' + state.srec_value + '/MWh' : '') + '. Net metering status: ' + state.net_metering_status + '.' },
    { question: 'How much do solar panels cost in ' + state.state_name + '?', answer: 'The average solar installation in ' + state.state_name + ' costs approximately ' + dollar(state.avg_install_cost) + ' for a ' + state.avg_system_size + ' kW system before incentives. After the federal tax credit and state incentives, the net cost is approximately ' + dollar(roi.netCost) + '.' },
    { question: 'How long does solar take to pay for itself in ' + state.state_name + '?', answer: 'Based on average electricity rates of $' + state.avg_kwh_rate + '/kWh and ' + state.sunlight_hours + ' peak sun hours per day, a solar system in ' + state.state_name + ' typically pays for itself in approximately ' + roi.breakEvenYears + ' years.' },
    { question: 'Is net metering available in ' + state.state_name + '?', answer: 'Net metering in ' + state.state_name + ' is currently classified as "' + state.net_metering_status + '". This affects how much credit you receive for excess solar energy exported to the grid. Check with your specific utility for current rates.' },
    { question: 'What is the 20-year savings estimate for solar in ' + state.state_name + '?', answer: 'Based on our calculations, a typical ' + state.avg_system_size + ' kW solar system in ' + state.state_name + ' can save approximately ' + dollar(roi.twentyYearSavings) + ' over 20 years, factoring in all available incentives.' }
  ];

  var crumbs = [
    { label: 'Home', url: '/' },
    { label: 'State Rebates', url: '/#state-map' },
    { label: state.state_name }
  ];

  var body = `
<section class="content-section">
<div class="container">
<h1>${state.state_name} Solar Rebates, Tax Credits &amp; Incentives (${SITE.year})</h1>
<p class="lead">Complete guide to solar incentives in ${state.state_name}. See how much you can save with the federal tax credit, state programs, utility rebates, and local incentives.</p>

${statsGrid([
  { value: dollar(state.avg_install_cost), label: 'Avg. System Cost (' + state.avg_system_size + ' kW)' },
  { value: dollar(roi.netCost), label: 'Net Cost After Incentives' },
  { value: roi.breakEvenYears + ' yrs', label: 'Break-Even Timeline' },
  { value: dollar(roi.twentyYearSavings), label: '20-Year Savings' },
  { value: state.sunlight_hours + ' hrs', label: 'Peak Sun Hours/Day' },
  { value: '$' + state.avg_kwh_rate + '/kWh', label: 'Avg. Electricity Rate' }
])}

${eligibilityWidget('state')}
</div>
</section>

<section class="content-section bg-light">
<div class="container">
<h2>Solar Incentives Available in ${state.state_name}</h2>
<p>Here is a breakdown of every solar incentive available to ${state.state_name} homeowners, from federal tax credits to state-specific programs.</p>
${comparisonTable(['Incentive', 'Value', 'Details'], incentiveRows)}
${state.additional_incentives ? '<div class="info-box"><strong>Additional Programs:</strong> ' + state.additional_incentives + '</div>' : ''}
</div>
</section>

<section class="content-section">
<div class="container">
<h2>ROI Analysis: Solar Investment in ${state.state_name}</h2>
<p>Based on a ${state.avg_system_size} kW system at ${dollar(state.avg_install_cost)} with ${state.sunlight_hours} peak sun hours per day and electricity at $${state.avg_kwh_rate}/kWh.</p>
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
</div>
</div>
</section>

${urgencyBlock('The 30% federal solar tax credit is available through 2032. It drops to 26% in 2033. Lock in maximum savings in ' + state.state_name + ' now.')}

${stateUtilities.length > 0 ? '<section class="content-section bg-light"><div class="container"><h2>Utility Companies in ' + state.state_name + '</h2><p>Review net metering policies, export compensation rates, and solar programs for each utility serving ' + state.state_name + '.</p><div class="related-grid">' + utilityLinksHtml + '</div></div></section>' : ''}

${stateCities.length > 0 ? '<section class="content-section"><div class="container"><h2>City Solar Reports in ' + state.state_name + '</h2><p>Get city-specific solar ROI projections, local incentives, and break-even analysis.</p><div class="related-grid">' + cityLinksHtml + '</div></div></section>' : ''}

${faqSection(faqs)}

${relatedPagesSection('Explore Nearby States', nearbyStates.map(function (s) {
  return { title: s.state_name + ' Solar Rebates', url: '/solar-rebates-incentives-' + s.slug + '/', meta: s.sunlight_hours + ' sun hrs · $' + s.avg_kwh_rate + '/kWh' };
}))}

${ctaBlock('primary', 'Get Your ' + state.state_name + ' Solar Estimate', 'See exactly how much you can save with solar in ' + state.state_name + '. Enter your ZIP code to get started.', '#widget-state')}
`;

  return baseTemplate(
    state.state_name + ' Solar Rebates & Incentives',
    'Find solar rebates, tax credits, and incentives in ' + state.state_name + '. ' + state.avg_system_size + ' kW average system at ' + dollar(state.avg_install_cost) + '. Break-even in ~' + roi.breakEvenYears + ' years.',
    '/solar-rebates-incentives-' + state.slug + '/',
    body,
    {
      breadcrumbs: crumbs,
      alertHtml: stateAlerts(alerts, state.state_abbrev),
      schema: faqSchema(faqs) + '</script><script type="application/ld+json">' + breadcrumbSchema(crumbs)
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
<h1>${utility.utility_name} Solar Policy &amp; Net Metering Guide (${SITE.year})</h1>
<p class="lead">Complete solar policy guide for ${utility.utility_name} customers in ${utility.state}. Review net metering rates, export compensation, interconnection fees, and available solar programs.</p>

${statsGrid([
  { value: utility.net_metering_rate, label: 'Net Metering Type' },
  { value: '$' + utility.export_compensation + '/kWh', label: 'Export Compensation' },
  { value: '$' + utility.interconnection_fee, label: 'Interconnection Fee' },
  { value: fmt(utility.customers_served), label: 'Customers Served' },
  { value: utility.time_of_use_rate ? '$' + utility.peak_rate + '/kWh' : 'N/A', label: 'Peak Rate (TOU)' },
  { value: utility.time_of_use_rate ? '$' + utility.off_peak_rate + '/kWh' : 'N/A', label: 'Off-Peak Rate (TOU)' }
])}

${utility.cap_reached ? urgencyBlock(utility.utility_name + ' has reached its net metering cap. New applicants may receive reduced export compensation. Act quickly to lock in the best available rates.') : ''}

${eligibilityWidget('utility')}
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

${faqSection(faqs)}

${relatedPagesSection('Other Utilities in ' + utility.state, sameStateUtils.map(function (u) {
  return { title: u.utility_name, url: '/utility-rebates/' + u.slug + '/', meta: 'Net metering: ' + u.net_metering_rate };
}))}

${ctaBlock('primary', 'Check Your Solar Savings', 'See how much you can save as a ' + utility.utility_name + ' customer. Enter your ZIP code to get started.', '#widget-utility')}
`;

  return baseTemplate(
    utility.utility_name + ' Solar & Net Metering Policy',
    utility.utility_name + ' solar policy guide: ' + utility.net_metering_rate + ' net metering, $' + utility.export_compensation + '/kWh export compensation. ' + fmt(utility.customers_served) + ' customers in ' + utility.state + '.',
    '/utility-rebates/' + utility.slug + '/',
    body,
    {
      breadcrumbs: crumbs,
      alertHtml: utilityAlerts(alerts, utility.slug),
      schema: faqSchema(faqs) + '</script><script type="application/ld+json">' + breadcrumbSchema(crumbs)
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
    { question: 'Is solar worth it in ' + city.city_name + ', ' + city.state_abbrev + '?', answer: 'Yes. With ' + city.avg_sun_hours + ' average peak sun hours per day and electricity rates at $' + city.avg_electricity_rate + '/kWh (' + city.electricity_trend + ' trend), solar is a strong investment in ' + city.city_name + '. The estimated 20-year savings is ' + dollar(roi.twentyYearSavings) + ' with a break-even period of approximately ' + roi.breakEvenYears + ' years.' },
    { question: 'How much do solar panels cost in ' + city.city_name + '?', answer: 'The average solar installation in the ' + city.city_name + ' area costs approximately ' + dollar(parentState.avg_install_cost) + ' for a ' + parentState.avg_system_size + ' kW system before incentives. After the 30% federal tax credit and state incentives, the net cost drops to approximately ' + dollar(roi.netCost) + '.' },
    { question: 'What solar incentives are available in ' + city.city_name + '?', answer: city.local_incentives + ' The 30% federal Investment Tax Credit (ITC) is available to all ' + city.city_name + ' homeowners. Check your specific state and utility for additional programs.' },
    { question: 'How many solar panels do I need for my home in ' + city.city_name + '?', answer: 'A typical home in ' + city.city_name + ' uses a ' + parentState.avg_system_size + ' kW system (approximately ' + Math.round(parentState.avg_system_size / 0.4) + ' panels). This produces roughly ' + fmt(roi.annualKwh) + ' kWh per year based on ' + city.avg_sun_hours + ' peak sun hours per day.' },
    { question: 'Are electricity rates going up in ' + city.city_name + '?', answer: 'Electricity rates in ' + city.city_name + ' are currently ' + city.electricity_trend + '. The current average rate is $' + city.avg_electricity_rate + '/kWh. Solar locks in your energy costs and protects against future rate increases.' }
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
<h1>Is Solar Worth It in ${city.city_name}, ${city.state_abbrev}? (${SITE.year} Analysis)</h1>
<p class="lead">Detailed solar ROI analysis for ${city.city_name}, ${city.state_name}. With ${city.avg_sun_hours} peak sun hours and electricity at $${city.avg_electricity_rate}/kWh, here is what you can expect from going solar.</p>

${statsGrid([
  { value: dollar(roi.twentyYearSavings), label: '20-Year Savings' },
  { value: roi.breakEvenYears + ' yrs', label: 'Break-Even Timeline' },
  { value: dollar(roi.netCost), label: 'Net Cost After Incentives' },
  { value: city.avg_sun_hours + ' hrs', label: 'Peak Sun Hours/Day' },
  { value: '$' + city.avg_electricity_rate + '/kWh', label: 'Electricity Rate (' + city.electricity_trend + ')' },
  { value: fmt(city.population), label: 'Population' }
])}

${eligibilityWidget('city')}
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

<section class="content-section">
<div class="container">
<h2>Financing Options for ${city.city_name} Homeowners</h2>
<p>Compare financing options to find the best fit for your solar installation.</p>
<div class="stats-grid">
<div class="stat-card"><span class="stat-value">Cash</span><span class="stat-label">Best ROI. Own immediately.</span></div>
<div class="stat-card"><span class="stat-value">Loan</span><span class="stat-label">Own system + tax credits.</span></div>
<div class="stat-card"><span class="stat-value">Lease/PPA</span><span class="stat-label">$0 down. Lower savings.</span></div>
</div>
<div class="text-center mt-3"><a href="/solar-financing/" class="btn btn-primary">Compare All Financing Options</a></div>
</div>
</section>

${faqSection(faqs)}

${relatedPagesSection('More Cities in ' + city.state_name, nearbyCities.map(function (c) {
  return { title: c.city_name + ', ' + c.state_abbrev, url: '/is-solar-worth-it-in-' + c.slug + '-' + c.state_abbrev.toLowerCase() + '/', meta: c.avg_sun_hours + ' sun hrs · $' + c.avg_electricity_rate + '/kWh' };
}))}

${ctaBlock('primary', 'Get Your ' + city.city_name + ' Solar Estimate', 'See exactly how much you can save with solar in ' + city.city_name + '. It takes less than 30 seconds.', '#widget-city')}
`;

  return baseTemplate(
    'Is Solar Worth It in ' + city.city_name + ', ' + city.state_abbrev + '?',
    'Solar ROI analysis for ' + city.city_name + ', ' + city.state_abbrev + ': ' + dollar(roi.twentyYearSavings) + ' estimated 20-year savings. Break-even in ~' + roi.breakEvenYears + ' years. ' + city.avg_sun_hours + ' sun hours/day.',
    '/' + slug + '/',
    body,
    {
      breadcrumbs: crumbs,
      alertHtml: stateAlerts(alerts, city.state_abbrev),
      schema: faqSchema(faqs) + '</script><script type="application/ld+json">' + breadcrumbSchema(crumbs)
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
<h1>Solar Financing Options Compared (${SITE.year})</h1>
<p class="lead">Compare solar loans, leases, PPAs, PACE financing, and cash purchases. Find the right financing option for your budget, credit score, and savings goals.</p>
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

${faqSection(faqs)}

${ctaBlock('primary', 'Find Your Solar Financing Match', 'Enter your ZIP code to see available financing options and estimated savings for your home.', '#widget-financing')}
`;

  return baseTemplate(
    'Solar Financing Options Compared',
    'Compare solar loans, leases, PPAs, and cash purchases from ' + providers.length + ' providers. Find the best financing option for your budget and credit score.',
    '/solar-financing/',
    body,
    {
      breadcrumbs: crumbs,
      alertHtml: federalAlert(alerts),
      schema: faqSchema(faqs) + '</script><script type="application/ld+json">' + breadcrumbSchema(crumbs)
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
<h1>Solar Energy Glossary: ${terms.length} Terms Explained (${SITE.year})</h1>
<p class="lead">Comprehensive glossary of solar energy terms, from net metering to SRECs. Understand the terminology used in solar quotes, contracts, and incentive programs.</p>
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
`;

  return baseTemplate(
    'Solar Energy Glossary – ' + terms.length + ' Terms',
    'Comprehensive solar energy glossary with ' + terms.length + ' terms explained. Learn about net metering, SRECs, ITC, solar financing, and more.',
    '/solar-glossary/',
    body,
    {
      breadcrumbs: crumbs,
      schema: breadcrumbSchema(crumbs)
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
</div>
</section>

<section class="content-section bg-light">
<div class="container">
<div class="content-prose">
<h2>Data Sources</h2>
<p>Our data comes from publicly available government and industry sources:</p>
<ul>
<li><strong>Federal Incentives:</strong> U.S. Department of Energy, IRS guidance on the Investment Tax Credit (ITC) under the Inflation Reduction Act.</li>
<li><strong>State Incentives:</strong> Database of State Incentives for Renewables &amp; Efficiency (DSIRE), state energy office publications.</li>
<li><strong>Utility Policies:</strong> Individual utility company tariff filings, public rate schedules, and interconnection guidelines.</li>
<li><strong>Solar Irradiance:</strong> National Renewable Energy Laboratory (NREL) solar resource data and PVWatts calculator methodology.</li>
<li><strong>Installation Costs:</strong> EnergySage marketplace data, NREL annual solar cost benchmarks, and Lawrence Berkeley National Laboratory reports.</li>
<li><strong>Electricity Rates:</strong> U.S. Energy Information Administration (EIA) state and utility rate data.</li>
</ul>

<h2>How We Calculate Savings</h2>
<h3>System Production</h3>
<p>We estimate annual solar production using: <code>Annual kWh = System Size (kW) &times; Peak Sun Hours &times; 365</code>. Peak sun hours vary by location and represent the number of hours per day when solar irradiance averages 1,000 W/m&sup2;.</p>

<h3>Annual Savings</h3>
<p>Annual electric bill savings are calculated as: <code>Annual Savings = Annual kWh &times; Local Electricity Rate</code>. We use current average residential rates from the EIA for each state.</p>

<h3>Incentive Stacking</h3>
<p>We calculate total incentives by combining: the 30% federal ITC, applicable state tax credits, state rebates, SREC income, and property/sales tax exemptions. Each incentive is applied to the appropriate cost basis.</p>

<h3>Net Cost &amp; Break-Even</h3>
<p>Net cost equals gross system cost minus all incentives. Break-even year is when cumulative electricity savings exceed the net system cost.</p>

<h3>20-Year Projection</h3>
<p>Our 20-year savings estimate uses current electricity rates held constant. Actual savings may be higher if rates increase, which they historically have at 2-3% annually.</p>

<h2>Limitations &amp; Disclaimers</h2>
<ul>
<li>All estimates are approximate and based on averages. Your actual results will vary based on roof orientation, shading, system design, and specific equipment.</li>
<li>We do not account for electricity rate escalation, panel degradation (typically 0.5%/year), or inflation in our baseline projections.</li>
<li>Incentive programs change frequently. Always verify current availability with your state energy office, utility, and tax professional.</li>
<li>This site does not provide financial, tax, or legal advice. Consult qualified professionals before making purchase decisions.</li>
</ul>

<h2>Update Frequency</h2>
<p>We review and update our data regularly:</p>
<ul>
<li><strong>Federal incentives:</strong> Updated when legislation changes</li>
<li><strong>State programs:</strong> Reviewed quarterly</li>
<li><strong>Utility policies:</strong> Reviewed quarterly</li>
<li><strong>Installation costs:</strong> Updated semi-annually</li>
<li><strong>Electricity rates:</strong> Updated annually from EIA data</li>
</ul>
</div>
</div>
</section>

${ctaBlock('secondary', 'See Your Personalized Estimate', 'Now that you understand our methodology, get a savings estimate based on your specific location and usage.', '/#widget-hero')}
`;

  return baseTemplate(
    'Methodology – How We Calculate Solar Savings',
    'Learn how ' + SITE.name + ' calculates solar savings estimates, ROI projections, and incentive data. Transparent methodology using government and industry data sources.',
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
  generateEditorialPage
};
