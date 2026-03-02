const affiliatePartners = {
  energysage: {
    name: 'EnergySage',
    baseUrl: 'https://www.energysage.com/solar/',
    params: 'rc=solarsavingsai',
    priority: 1,
    states: 'all'
  },
  sunrun: {
    name: 'Sunrun',
    baseUrl: 'https://www.sunrun.com/solar-plans',
    params: 'partner=solarsavingsai',
    priority: 2,
    states: 'all'
  },
  sunpower: {
    name: 'SunPower',
    baseUrl: 'https://us.sunpower.com/get-quote',
    params: 'ref=solarsavingsai',
    priority: 3,
    states: 'all'
  }
};

exports.handler = async function(event, context) {
  // Only accept POST
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
    const bill = parseFloat(data.bill) || 0;
    const ownership = (data.ownership || '').trim();
    const state = (data.state || '').trim();
    const pageUrl = (data.page_url || '').trim();
    const name = (data.name || '').trim();
    const email = (data.email || '').trim();
    const phone = (data.phone || '').trim();

    if (!zip || zip.length !== 5) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Valid ZIP code required' })
      };
    }

    // Calculate estimated savings for lead scoring
    const annualSavings = bill * 12 * 0.65;
    const twentyYearSavings = annualSavings * 20;

    // Lead scoring
    let leadScore = 0;
    if (ownership === 'own') leadScore += 30;
    if (bill >= 150) leadScore += 25;
    if (bill >= 250) leadScore += 15;
    if (email) leadScore += 15;
    if (phone) leadScore += 15;
    if (name) leadScore += 10;

    // Select affiliate partner based on lead score and rotation
    const timestamp = Date.now();
    const rotation = timestamp % 3;
    let selectedPartner;

    if (leadScore >= 60) {
      // High-value leads go to primary partner
      selectedPartner = affiliatePartners.energysage;
    } else if (rotation === 0) {
      selectedPartner = affiliatePartners.energysage;
    } else if (rotation === 1) {
      selectedPartner = affiliatePartners.sunrun;
    } else {
      selectedPartner = affiliatePartners.sunpower;
    }

    const redirectUrl = selectedPartner.baseUrl + '?' + selectedPartner.params +
      '&zip=' + encodeURIComponent(zip) +
      (state ? '&state=' + encodeURIComponent(state) : '');

    // Log lead data (would integrate with CRM/lead management in production)
    console.log(JSON.stringify({
      event: 'lead_routed',
      timestamp: new Date().toISOString(),
      zip,
      state,
      bill,
      ownership,
      lead_score: leadScore,
      partner: selectedPartner.name,
      annual_savings: Math.round(annualSavings),
      page_url: pageUrl,
      has_email: !!email,
      has_phone: !!phone,
      has_name: !!name
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
        partner: selectedPartner.name,
        estimated_annual_savings: Math.round(annualSavings),
        estimated_twenty_year_savings: Math.round(twentyYearSavings),
        lead_score: leadScore
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
