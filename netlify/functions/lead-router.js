const affiliatePartners = {
  // Tier 1 - Premium marketplace/installer networks
  energysage: {
    name: 'EnergySage',
    baseUrl: 'https://www.energysage.com/solar/',
    params: 'rc=solarsavingsai',
    priority: 1,
    category: 'marketplace',
    avg_cpa: 85,
    states: 'all',
    strengths: ['high-intent', 'comparison-shoppers']
  },
  sunrun: {
    name: 'Sunrun',
    baseUrl: 'https://www.sunrun.com/solar-plans',
    params: 'partner=solarsavingsai',
    priority: 2,
    category: 'installer',
    avg_cpa: 75,
    states: 'all',
    strengths: ['lease', 'ppa', 'zero-down']
  },
  sunpower: {
    name: 'SunPower',
    baseUrl: 'https://us.sunpower.com/get-quote',
    params: 'ref=solarsavingsai',
    priority: 3,
    category: 'installer',
    avg_cpa: 80,
    states: 'all',
    strengths: ['premium', 'high-efficiency', 'purchase']
  },
  // Regional installer networks
  palmetto: {
    name: 'Palmetto Solar',
    baseUrl: 'https://palmetto.com/solar',
    params: 'ref=solarsavingsai',
    priority: 4,
    category: 'installer',
    avg_cpa: 65,
    states: 'all',
    strengths: ['digital-first', 'monitoring']
  },
  sunnova: {
    name: 'Sunnova',
    baseUrl: 'https://www.sunnova.com/',
    params: 'partner=solarsavingsai',
    priority: 5,
    category: 'installer',
    avg_cpa: 60,
    states: 'all',
    strengths: ['lease', 'battery-bundle']
  },
  // Financing-focused partners
  mosaic: {
    name: 'Mosaic',
    baseUrl: 'https://www.joinmosaic.com/solar-loans',
    params: 'ref=solarsavingsai',
    priority: 6,
    category: 'financing',
    avg_cpa: 50,
    states: 'all',
    strengths: ['solar-loans', 'low-apr']
  },
  goodleap: {
    name: 'GoodLeap',
    baseUrl: 'https://www.goodleap.com/',
    params: 'partner=solarsavingsai',
    priority: 7,
    category: 'financing',
    avg_cpa: 45,
    states: 'all',
    strengths: ['home-improvement-loans', 'flexible-terms']
  },
  // Battery/storage partners
  tesla_energy: {
    name: 'Tesla Energy',
    baseUrl: 'https://www.tesla.com/powerwall',
    params: 'ref=solarsavingsai',
    priority: 8,
    category: 'storage',
    avg_cpa: 55,
    states: 'all',
    strengths: ['battery', 'powerwall', 'whole-home-backup']
  },
  generac: {
    name: 'Generac PWRcell',
    baseUrl: 'https://www.generac.com/solar',
    params: 'ref=solarsavingsai',
    priority: 9,
    category: 'storage',
    avg_cpa: 50,
    states: 'all',
    strengths: ['battery', 'backup-power', 'generators']
  },
  // Home energy audit partner
  sealed: {
    name: 'Sealed',
    baseUrl: 'https://sealed.com/',
    params: 'ref=solarsavingsai',
    priority: 10,
    category: 'energy-audit',
    avg_cpa: 35,
    states: 'all',
    strengths: ['energy-audit', 'weatherization', 'efficiency']
  },
  // Additional regional
  freedom_solar: {
    name: 'Freedom Solar Power',
    baseUrl: 'https://freedomsolarpower.com/',
    params: 'ref=solarsavingsai',
    priority: 11,
    category: 'installer',
    avg_cpa: 60,
    states: 'TX,FL,CO,NC,VA',
    strengths: ['regional-expertise', 'texas-market']
  },
  blue_raven: {
    name: 'Blue Raven Solar',
    baseUrl: 'https://blueravensolar.com/',
    params: 'ref=solarsavingsai',
    priority: 12,
    category: 'installer',
    avg_cpa: 55,
    states: 'all',
    strengths: ['zero-down', 'fast-install']
  },
  // HIGH-CPA LEAD AGGREGATORS (Added for maximum revenue)
  modernize: {
    name: 'Modernize',
    baseUrl: 'https://modernize.com/solar',
    params: 'aff=solarsavingsai',
    priority: 13,
    category: 'lead-aggregator',
    avg_cpa: 150,
    states: 'all',
    strengths: ['high-cpa', 'qualified-leads', 'homeowner-verified']
  },
  energybillcruncher: {
    name: 'EnergyBillCruncher',
    baseUrl: 'https://www.energybillcruncher.com/solar',
    params: 'aff=solarsavingsai',
    priority: 14,
    category: 'lead-aggregator',
    avg_cpa: 140,
    states: 'all',
    strengths: ['high-cpa', 'bill-reduction', 'solar-leads']
  },
  solar_reviews: {
    name: 'SolarReviews',
    baseUrl: 'https://www.solarreviews.com/installers',
    params: 'ref=solarsavingsai',
    priority: 15,
    category: 'lead-aggregator',
    avg_cpa: 120,
    states: 'all',
    strengths: ['installer-matching', 'reviews', 'high-intent']
  },
  clean_energy: {
    name: 'CleanEnergy.org',
    baseUrl: 'https://www.cleanenergy.org/solar-quote',
    params: 'partner=solarsavingsai',
    priority: 16,
    category: 'lead-aggregator',
    avg_cpa: 130,
    states: 'all',
    strengths: ['nonprofit-trust', 'high-cpa', 'verified-leads']
  },
  solar_estimate: {
    name: 'SolarEstimate',
    baseUrl: 'https://www.solar-estimate.org/',
    params: 'ref=solarsavingsai',
    priority: 17,
    category: 'lead-aggregator',
    avg_cpa: 110,
    states: 'all',
    strengths: ['calculator', 'cost-estimates', 'installer-matching']
  },
  momentum_solar: {
    name: 'Momentum Solar',
    baseUrl: 'https://momentumsolar.com/',
    params: 'partner=solarsavingsai',
    priority: 18,
    category: 'installer',
    avg_cpa: 70,
    states: 'NJ,NY,FL,TX,CA,PA,CT',
    strengths: ['regional-installer', 'fast-install', 'financing']
  },
  adt_solar: {
    name: 'ADT Solar',
    baseUrl: 'https://www.adtsolar.com/',
    params: 'ref=solarsavingsai',
    priority: 19,
    category: 'installer',
    avg_cpa: 75,
    states: 'all',
    strengths: ['nationwide', 'brand-trust', 'monitoring']
  },
  project_solar: {
    name: 'Project Solar',
    baseUrl: 'https://www.projectsolar.io/',
    params: 'ref=solarsavingsai',
    priority: 20,
    category: 'installer',
    avg_cpa: 65,
    states: 'all',
    strengths: ['diy-option', 'lowest-price', 'transparent-pricing']
  }
};

// State-level solar market value scores (higher = more valuable lead)
const stateValues = {
  CA: 95, TX: 85, FL: 80, NY: 90, AZ: 85, NJ: 88, MA: 87, NC: 75,
  CO: 78, NV: 82, GA: 72, MD: 80, IL: 75, VA: 78, CT: 85, PA: 76,
  OH: 68, MI: 65, SC: 70, OR: 72, WA: 70, MN: 68, HI: 92, UT: 75,
  NM: 72, NH: 74, RI: 78, VT: 70, DC: 85, DE: 76
};

// Page intent classification
function classifyPageIntent(pageUrl) {
  const url = (pageUrl || '').toLowerCase();
  if (url.includes('financing') || url.includes('loan') || url.includes('lease') || url.includes('ppa')) return 'financing';
  if (url.includes('battery') || url.includes('storage') || url.includes('powerwall')) return 'storage';
  if (url.includes('best-solar-compan') || url.includes('review') || url.includes('compare')) return 'comparison';
  if (url.includes('cost') || url.includes('price') || url.includes('worth-it')) return 'high-commercial';
  if (url.includes('guide') || url.includes('how-to') || url.includes('explained')) return 'informational';
  if (url.includes('solar-rebates') || url.includes('incentive')) return 'incentive-research';
  return 'general';
}

// Calculate lead score with 15+ signals
function calculateLeadScore(data) {
  let score = 0;
  const signals = {};

  // 1. Homeownership (+30)
  if (data.ownership === 'own') { score += 30; signals.ownership = 30; }

  // 2. Monthly bill tier (+10/+20/+25/+30)
  const bill = parseFloat(data.bill) || 0;
  if (bill >= 300) { score += 30; signals.bill = 30; }
  else if (bill >= 200) { score += 25; signals.bill = 25; }
  else if (bill >= 150) { score += 20; signals.bill = 20; }
  else if (bill >= 100) { score += 10; signals.bill = 10; }

  // 3. Email provided (+15)
  if (data.email && data.email.includes('@')) { score += 15; signals.email = 15; }

  // 4. Phone provided (+12)
  if (data.phone && data.phone.replace(/\D/g, '').length >= 10) { score += 12; signals.phone = 12; }

  // 5. Name provided (+8)
  if (data.name && data.name.trim().length > 1) { score += 8; signals.name = 8; }

  // 6. State value score (+0 to +15)
  const stateVal = stateValues[data.state] || 50;
  const stateBonus = Math.round(stateVal / 7);
  score += stateBonus;
  signals.state_value = stateBonus;

  // 7. Page intent signal (+5 to +15)
  const intent = classifyPageIntent(data.page_url);
  if (intent === 'high-commercial' || intent === 'comparison') { score += 15; signals.intent = 15; }
  else if (intent === 'financing') { score += 12; signals.intent = 12; }
  else if (intent === 'incentive-research') { score += 10; signals.intent = 10; }
  else if (intent === 'storage') { score += 10; signals.intent = 10; }
  else if (intent === 'informational') { score += 5; signals.intent = 5; }
  else { score += 7; signals.intent = 7; }

  // 8. System size interest (+5 to +10)
  const systemSize = parseFloat(data.system_size) || 0;
  if (systemSize >= 10) { score += 10; signals.system_size = 10; }
  else if (systemSize >= 5) { score += 5; signals.system_size = 5; }

  // 9. Timeline urgency (+5 to +10)
  const timeline = (data.timeline || '').toLowerCase();
  if (timeline.includes('asap') || timeline.includes('1-3 months') || timeline.includes('immediate')) { score += 10; signals.timeline = 10; }
  else if (timeline.includes('3-6') || timeline.includes('this year')) { score += 5; signals.timeline = 5; }

  // 10. Roof age (+3 to +5)
  const roofAge = parseInt(data.roof_age) || 0;
  if (roofAge > 0 && roofAge <= 10) { score += 5; signals.roof = 5; }
  else if (roofAge > 10 && roofAge <= 20) { score += 3; signals.roof = 3; }

  // 11. Credit score indicator (+3 to +8)
  const credit = (data.credit_range || '').toLowerCase();
  if (credit.includes('excellent') || credit.includes('750')) { score += 8; signals.credit = 8; }
  else if (credit.includes('good') || credit.includes('700')) { score += 5; signals.credit = 5; }
  else if (credit.includes('fair') || credit.includes('650')) { score += 3; signals.credit = 3; }

  // 12. Device type signal (+2 to +5) - desktop users convert higher
  const device = (data.device_type || '').toLowerCase();
  if (device === 'desktop') { score += 5; signals.device = 5; }
  else if (device === 'tablet') { score += 3; signals.device = 3; }
  else { score += 2; signals.device = 2; }

  // 13. Session depth (+2 to +5)
  const pageViews = parseInt(data.page_views) || 1;
  if (pageViews >= 5) { score += 5; signals.session = 5; }
  else if (pageViews >= 3) { score += 3; signals.session = 3; }
  else { score += 2; signals.session = 2; }

  // 14. Referral source (+3 to +8)
  const source = (data.referral_source || '').toLowerCase();
  if (source.includes('google') || source.includes('bing')) { score += 8; signals.source = 8; }
  else if (source.includes('social')) { score += 3; signals.source = 3; }
  else { score += 5; signals.source = 5; }

  // 15. Time of day (+2 to +5) - business hours convert better
  const hour = new Date().getHours();
  if (hour >= 8 && hour <= 18) { score += 5; signals.time = 5; }
  else { score += 2; signals.time = 2; }

  return { score: Math.min(score, 150), signals, intent };
}

// Determine tier from score
function getTier(score) {
  if (score >= 85) return 1;
  if (score >= 65) return 2;
  if (score >= 45) return 3;
  return 4;
}

// Route lead to best partner based on tier, intent, and state
function routeLead(tier, intent, state) {
  const stateStr = (state || '').toUpperCase();

  // Check regional partner availability
  function isAvailableInState(partner) {
    if (partner.states === 'all') return true;
    return partner.states.split(',').includes(stateStr);
  }

  // Tier 1 (>=85): Route to HIGHEST CPA partners first — lead aggregators pay $110-$150+
  if (tier === 1) {
    if (intent === 'storage') return affiliatePartners.tesla_energy;
    // Rotate premium leads across highest-CPA aggregators
    const premiumRotation = Date.now() % 5;
    if (premiumRotation === 0) return affiliatePartners.modernize;        // $150 CPA
    if (premiumRotation === 1) return affiliatePartners.energybillcruncher; // $140 CPA
    if (premiumRotation === 2) return affiliatePartners.clean_energy;      // $130 CPA
    if (premiumRotation === 3) return affiliatePartners.solar_reviews;     // $120 CPA
    return affiliatePartners.energysage;                                    // $85 CPA (trusted fallback)
  }

  // Tier 2 (65-84): Mix of aggregators and direct installers for strong leads
  if (tier === 2) {
    if (intent === 'storage') return affiliatePartners.generac;
    if (intent === 'comparison') return affiliatePartners.solar_reviews;
    if (intent === 'financing') return affiliatePartners.sunrun;
    // Check regional high-CPA partners
    if (isAvailableInState(affiliatePartners.momentum_solar) && affiliatePartners.momentum_solar.states !== 'all' && affiliatePartners.momentum_solar.states.split(',').includes(stateStr)) {
      return affiliatePartners.momentum_solar;
    }
    // Rotate between aggregators and top installers
    const rotation = Date.now() % 6;
    if (rotation === 0) return affiliatePartners.modernize;           // $150
    if (rotation === 1) return affiliatePartners.energybillcruncher;  // $140
    if (rotation === 2) return affiliatePartners.solar_estimate;      // $110
    if (rotation === 3) return affiliatePartners.sunpower;            // $80
    if (rotation === 4) return affiliatePartners.energysage;          // $85
    return affiliatePartners.adt_solar;                                // $75
  }

  // Tier 3 (45-64): Financing-focused with aggregator mix
  if (tier === 3) {
    if (intent === 'financing' || intent === 'high-commercial') {
      const rotation = Date.now() % 4;
      if (rotation === 0) return affiliatePartners.solar_estimate;  // $110
      if (rotation === 1) return affiliatePartners.mosaic;          // $50
      if (rotation === 2) return affiliatePartners.goodleap;        // $45
      return affiliatePartners.clean_energy;                         // $130
    }
    if (intent === 'storage') return affiliatePartners.generac;
    // Check regional partners
    if (isAvailableInState(affiliatePartners.freedom_solar) && affiliatePartners.freedom_solar.states !== 'all') {
      return affiliatePartners.freedom_solar;
    }
    const rotation = Date.now() % 4;
    if (rotation === 0) return affiliatePartners.energybillcruncher; // $140
    if (rotation === 1) return affiliatePartners.palmetto;           // $65
    if (rotation === 2) return affiliatePartners.sunnova;            // $60
    return affiliatePartners.project_solar;                           // $65
  }

  // Tier 4 (<45): Cast wide net, still include aggregators
  if (intent === 'storage') return affiliatePartners.generac;
  const rotation = Date.now() % 5;
  if (rotation === 0) return affiliatePartners.solar_estimate;   // $110
  if (rotation === 1) return affiliatePartners.blue_raven;       // $55
  if (rotation === 2) return affiliatePartners.sunnova;          // $60
  if (rotation === 3) return affiliatePartners.project_solar;    // $65
  return affiliatePartners.sealed;                                // $35
}

// Calculate state-aware savings estimate
function calculateSavings(bill, state) {
  // State-specific electricity reduction factors (vs flat 65%)
  const stateFactors = {
    CA: 0.75, AZ: 0.78, NV: 0.76, NM: 0.74, TX: 0.72, FL: 0.70,
    HI: 0.82, CO: 0.68, UT: 0.70, NC: 0.65, GA: 0.64, SC: 0.65,
    NY: 0.58, NJ: 0.62, MA: 0.60, CT: 0.60, PA: 0.56, MD: 0.62,
    VA: 0.63, OH: 0.52, MI: 0.50, IL: 0.55, MN: 0.48, WI: 0.50,
    OR: 0.60, WA: 0.55, IN: 0.54, MO: 0.55, TN: 0.58, AL: 0.60
  };
  const factor = stateFactors[state] || 0.65;
  const annualSavings = bill * 12 * factor;
  const twentyYearSavings = annualSavings * 20;
  return { annualSavings: Math.round(annualSavings), twentyYearSavings: Math.round(twentyYearSavings), factor };
}

exports.handler = async function(event) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);

    // Validate required fields
    const zip = (data.zip || '').trim();
    if (!zip || zip.length !== 5 || !/^\d{5}$/.test(zip)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Valid 5-digit ZIP code required' })
      };
    }

    const bill = parseFloat(data.bill) || 0;
    const state = (data.state || '').trim().toUpperCase();
    const ownership = (data.ownership || '').trim();

    // Calculate lead score
    const { score, signals, intent } = calculateLeadScore(data);
    const tier = getTier(score);

    // Route to partner
    const partner = routeLead(tier, intent, state);

    // Calculate state-aware savings
    const savings = calculateSavings(bill, state);

    // Build redirect URL
    const redirectUrl = partner.baseUrl +
      (partner.baseUrl.includes('?') ? '&' : '?') +
      partner.params +
      '&zip=' + encodeURIComponent(zip) +
      (state ? '&state=' + encodeURIComponent(state) : '');

    // Log detailed lead data
    console.log(JSON.stringify({
      event: 'lead_routed',
      timestamp: new Date().toISOString(),
      zip,
      state,
      bill,
      ownership,
      lead_score: score,
      lead_tier: tier,
      signals,
      intent,
      partner: partner.name,
      partner_category: partner.category,
      partner_avg_cpa: partner.avg_cpa,
      annual_savings: savings.annualSavings,
      twenty_year_savings: savings.twentyYearSavings,
      savings_factor: savings.factor,
      page_url: data.page_url || '',
      has_email: !!(data.email && data.email.includes('@')),
      has_phone: !!(data.phone && data.phone.replace(/\D/g, '').length >= 10),
      has_name: !!(data.name && data.name.trim().length > 1),
      device_type: data.device_type || 'unknown',
      referral_source: data.referral_source || 'direct',
      page_views: parseInt(data.page_views) || 1
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        success: true,
        redirect_url: redirectUrl,
        partner: partner.name,
        partner_category: partner.category,
        lead_tier: tier,
        lead_score: score,
        estimated_annual_savings: savings.annualSavings,
        estimated_twenty_year_savings: savings.twentyYearSavings,
        savings_factor: savings.factor
      })
    };
  } catch (err) {
    console.error('Lead router error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
