const fs = require('fs');
const path = require('path');
const DATA = path.join(__dirname, '..', 'data');
const states = JSON.parse(fs.readFileSync(path.join(DATA, 'states.json'), 'utf8'));

function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

// Cities data - 2 cities per state
const cityData = {
  'AL': [{ name: 'Birmingham', sun: 4.7, rate: 0.12, pop: 200733 }, { name: 'Huntsville', sun: 4.8, rate: 0.11, pop: 215006 }],
  'AK': [{ name: 'Anchorage', sun: 3.2, rate: 0.22, pop: 291247 }, { name: 'Fairbanks', sun: 2.8, rate: 0.23, pop: 32515 }],
  'AZ': [{ name: 'Phoenix', sun: 6.8, rate: 0.13, pop: 1608139 }, { name: 'Tucson', sun: 6.5, rate: 0.12, pop: 542629 }],
  'AR': [{ name: 'Little Rock', sun: 4.8, rate: 0.10, pop: 202591 }, { name: 'Fayetteville', sun: 4.6, rate: 0.10, pop: 93949 }],
  'CA': [{ name: 'Los Angeles', sun: 5.6, rate: 0.25, pop: 3898747 }, { name: 'San Francisco', sun: 5.0, rate: 0.28, pop: 873965 }],
  'CO': [{ name: 'Denver', sun: 5.5, rate: 0.13, pop: 715522 }, { name: 'Colorado Springs', sun: 5.6, rate: 0.12, pop: 478961 }],
  'CT': [{ name: 'Hartford', sun: 4.0, rate: 0.25, pop: 121054 }, { name: 'New Haven', sun: 4.1, rate: 0.24, pop: 134023 }],
  'DE': [{ name: 'Wilmington', sun: 4.3, rate: 0.14, pop: 70851 }, { name: 'Dover', sun: 4.4, rate: 0.13, pop: 39403 }],
  'FL': [{ name: 'Miami', sun: 5.3, rate: 0.14, pop: 442241 }, { name: 'Tampa', sun: 5.2, rate: 0.13, pop: 384959 }],
  'GA': [{ name: 'Atlanta', sun: 4.8, rate: 0.12, pop: 498715 }, { name: 'Savannah', sun: 5.0, rate: 0.12, pop: 147780 }],
  'HI': [{ name: 'Honolulu', sun: 5.7, rate: 0.35, pop: 350964 }, { name: 'Maui', sun: 5.5, rate: 0.36, pop: 164637 }],
  'ID': [{ name: 'Boise', sun: 4.7, rate: 0.09, pop: 228959 }, { name: 'Idaho Falls', sun: 4.5, rate: 0.08, pop: 64609 }],
  'IL': [{ name: 'Chicago', sun: 4.2, rate: 0.16, pop: 2693976 }, { name: 'Springfield', sun: 4.3, rate: 0.14, pop: 114394 }],
  'IN': [{ name: 'Indianapolis', sun: 4.2, rate: 0.13, pop: 887642 }, { name: 'Fort Wayne', sun: 4.1, rate: 0.13, pop: 263886 }],
  'IA': [{ name: 'Des Moines', sun: 4.4, rate: 0.12, pop: 214133 }, { name: 'Cedar Rapids', sun: 4.3, rate: 0.12, pop: 137710 }],
  'KS': [{ name: 'Wichita', sun: 5.1, rate: 0.12, pop: 397532 }, { name: 'Overland Park', sun: 4.9, rate: 0.12, pop: 197238 }],
  'KY': [{ name: 'Louisville', sun: 4.3, rate: 0.11, pop: 633045 }, { name: 'Lexington', sun: 4.2, rate: 0.11, pop: 322570 }],
  'LA': [{ name: 'New Orleans', sun: 4.9, rate: 0.10, pop: 383997 }, { name: 'Baton Rouge', sun: 4.8, rate: 0.10, pop: 227470 }],
  'ME': [{ name: 'Portland ME', sun: 4.1, rate: 0.19, pop: 68408 }, { name: 'Bangor', sun: 3.9, rate: 0.19, pop: 31753 }],
  'MD': [{ name: 'Baltimore', sun: 4.4, rate: 0.15, pop: 585708 }, { name: 'Annapolis', sun: 4.5, rate: 0.15, pop: 40812 }],
  'MA': [{ name: 'Boston', sun: 4.0, rate: 0.25, pop: 675647 }, { name: 'Worcester', sun: 4.0, rate: 0.24, pop: 206518 }],
  'MI': [{ name: 'Detroit', sun: 3.8, rate: 0.17, pop: 639111 }, { name: 'Grand Rapids', sun: 3.7, rate: 0.15, pop: 198917 }],
  'MN': [{ name: 'Minneapolis', sun: 4.3, rate: 0.13, pop: 429954 }, { name: 'St Paul', sun: 4.3, rate: 0.13, pop: 311527 }],
  'MS': [{ name: 'Jackson', sun: 4.8, rate: 0.11, pop: 153701 }, { name: 'Gulfport', sun: 4.9, rate: 0.11, pop: 72926 }],
  'MO': [{ name: 'Kansas City', sun: 4.6, rate: 0.12, pop: 508090 }, { name: 'St Louis', sun: 4.5, rate: 0.12, pop: 301578 }],
  'MT': [{ name: 'Billings', sun: 4.7, rate: 0.11, pop: 119116 }, { name: 'Missoula', sun: 4.3, rate: 0.11, pop: 75516 }],
  'NE': [{ name: 'Omaha', sun: 4.8, rate: 0.11, pop: 486051 }, { name: 'Lincoln', sun: 4.7, rate: 0.11, pop: 291082 }],
  'NV': [{ name: 'Las Vegas', sun: 6.4, rate: 0.12, pop: 641903 }, { name: 'Reno', sun: 5.8, rate: 0.11, pop: 264165 }],
  'NH': [{ name: 'Manchester', sun: 4.0, rate: 0.21, pop: 115644 }, { name: 'Concord', sun: 4.0, rate: 0.21, pop: 43976 }],
  'NJ': [{ name: 'Newark', sun: 4.2, rate: 0.17, pop: 311549 }, { name: 'Jersey City', sun: 4.2, rate: 0.17, pop: 292449 }],
  'NM': [{ name: 'Albuquerque', sun: 6.2, rate: 0.13, pop: 564559 }, { name: 'Santa Fe', sun: 6.0, rate: 0.13, pop: 89117 }],
  'NY': [{ name: 'New York City', sun: 3.9, rate: 0.22, pop: 8336817 }, { name: 'Buffalo', sun: 3.6, rate: 0.18, pop: 278349 }],
  'NC': [{ name: 'Charlotte', sun: 4.8, rate: 0.12, pop: 874579 }, { name: 'Raleigh', sun: 4.7, rate: 0.12, pop: 467665 }],
  'ND': [{ name: 'Fargo', sun: 4.5, rate: 0.10, pop: 125990 }, { name: 'Bismarck', sun: 4.6, rate: 0.10, pop: 73622 }],
  'OH': [{ name: 'Columbus', sun: 3.9, rate: 0.13, pop: 905748 }, { name: 'Cleveland', sun: 3.7, rate: 0.14, pop: 372624 }],
  'OK': [{ name: 'Oklahoma City', sun: 5.2, rate: 0.10, pop: 681054 }, { name: 'Tulsa', sun: 5.0, rate: 0.10, pop: 413066 }],
  'OR': [{ name: 'Portland OR', sun: 3.7, rate: 0.11, pop: 652503 }, { name: 'Salem', sun: 3.8, rate: 0.11, pop: 177723 }],
  'PA': [{ name: 'Philadelphia', sun: 4.0, rate: 0.15, pop: 1603797 }, { name: 'Pittsburgh', sun: 3.7, rate: 0.14, pop: 302971 }],
  'RI': [{ name: 'Providence', sun: 4.0, rate: 0.23, pop: 190934 }, { name: 'Warwick', sun: 4.0, rate: 0.23, pop: 82823 }],
  'SC': [{ name: 'Charleston', sun: 5.0, rate: 0.13, pop: 150227 }, { name: 'Columbia', sun: 4.9, rate: 0.13, pop: 131674 }],
  'SD': [{ name: 'Sioux Falls', sun: 4.8, rate: 0.12, pop: 192517 }, { name: 'Rapid City', sun: 5.0, rate: 0.11, pop: 77503 }],
  'TN': [{ name: 'Nashville', sun: 4.4, rate: 0.11, pop: 689447 }, { name: 'Memphis', sun: 4.7, rate: 0.11, pop: 633104 }],
  'TX': [{ name: 'Houston', sun: 5.1, rate: 0.12, pop: 2304580 }, { name: 'Austin', sun: 5.3, rate: 0.11, pop: 978908 }],
  'UT': [{ name: 'Salt Lake City', sun: 5.5, rate: 0.10, pop: 200133 }, { name: 'Provo', sun: 5.4, rate: 0.10, pop: 115162 }],
  'VT': [{ name: 'Burlington', sun: 3.8, rate: 0.20, pop: 44743 }, { name: 'Montpelier', sun: 3.7, rate: 0.20, pop: 8074 }],
  'VA': [{ name: 'Virginia Beach', sun: 4.5, rate: 0.12, pop: 459470 }, { name: 'Richmond', sun: 4.4, rate: 0.12, pop: 226610 }],
  'WA': [{ name: 'Seattle', sun: 3.5, rate: 0.10, pop: 737015 }, { name: 'Spokane', sun: 3.8, rate: 0.09, pop: 228989 }],
  'WV': [{ name: 'Charleston WV', sun: 4.0, rate: 0.10, pop: 47215 }, { name: 'Huntington', sun: 4.0, rate: 0.10, pop: 46048 }],
  'WI': [{ name: 'Milwaukee', sun: 4.0, rate: 0.14, pop: 577222 }, { name: 'Madison', sun: 4.1, rate: 0.14, pop: 269840 }],
  'WY': [{ name: 'Cheyenne', sun: 5.4, rate: 0.10, pop: 65132 }, { name: 'Casper', sun: 5.3, rate: 0.10, pop: 59324 }]
};

const cities = [];
for (const st of states) {
  const cs = cityData[st.state_abbrev];
  if (!cs) continue;
  for (const c of cs) {
    cities.push({
      city_name: c.name,
      slug: slugify(c.name),
      state_name: st.state_name,
      state_abbrev: st.state_abbrev,
      avg_electricity_rate: c.rate,
      avg_sun_hours: c.sun,
      population: c.pop,
      local_incentives: 'Federal ITC plus applicable state and local incentives',
      electricity_trend: 'increasing'
    });
  }
}

fs.writeFileSync(path.join(DATA, 'cities.json'), JSON.stringify(cities, null, 2));
console.log('Cities created:', cities.length);

// Financing data
const financing = {
  providers: [
    { name: 'Sunrun', slug: 'sunrun', type: 'lease', apr_low: 0, apr_high: 0, term_years: [20, 25], min_credit_score: 650, zero_down: true, battery_financing: true, states_available: 'Most states', pros: ['No upfront cost', 'Includes maintenance', 'Predictable payments'], cons: ['Lower total savings', 'Dont own system', 'Escalator clauses possible'] },
    { name: 'Tesla Solar', slug: 'tesla-solar', type: 'loan', apr_low: 4.49, apr_high: 6.99, term_years: [10, 20, 25], min_credit_score: 650, zero_down: true, battery_financing: true, states_available: 'Most states', pros: ['Own your system', 'Competitive rates', 'Includes Powerwall option'], cons: ['Limited customization', 'Longer wait times', 'Tesla panels only'] },
    { name: 'SunPower', slug: 'sunpower', type: 'loan', apr_low: 3.99, apr_high: 7.99, term_years: [10, 15, 20, 25], min_credit_score: 680, zero_down: true, battery_financing: true, states_available: 'Most states', pros: ['Highest efficiency panels', 'Strong warranty', 'Flexible terms'], cons: ['Premium pricing', 'Higher credit requirements', 'May require deposit'] },
    { name: 'Mosaic', slug: 'mosaic', type: 'loan', apr_low: 2.99, apr_high: 8.99, term_years: [5, 10, 15, 20, 25], min_credit_score: 640, zero_down: true, battery_financing: true, states_available: 'Most states', pros: ['Low starting APR', 'Multiple term options', 'Fast approval'], cons: ['Rate depends on credit', 'Dealer fees possible', 'Longer terms cost more'] },
    { name: 'GoodLeap', slug: 'goodleap', type: 'loan', apr_low: 3.99, apr_high: 8.99, term_years: [5, 7, 10, 12, 15, 20, 25], min_credit_score: 600, zero_down: true, battery_financing: true, states_available: 'Most states', pros: ['Low credit requirements', 'Many term options', 'Quick funding'], cons: ['Higher rates for lower credit', 'Dealer fees', 'Some prepayment terms'] },
    { name: 'Dividend Finance', slug: 'dividend-finance', type: 'loan', apr_low: 3.49, apr_high: 8.49, term_years: [5, 7, 10, 12, 15, 20, 25], min_credit_score: 640, zero_down: true, battery_financing: true, states_available: 'Most states', pros: ['Competitive rates', 'Flexible terms', 'No prepayment penalty'], cons: ['Credit score dependent', 'Not available everywhere', 'Some dealer fees'] },
    { name: 'Sunlight Financial', slug: 'sunlight-financial', type: 'loan', apr_low: 3.49, apr_high: 7.99, term_years: [7, 10, 12, 15, 20, 25], min_credit_score: 650, zero_down: true, battery_financing: true, states_available: 'Most states', pros: ['Good rates', 'Fast approval process', 'Includes storage'], cons: ['Limited direct access', 'Through dealers only', 'Variable availability'] },
    { name: 'Sunnova', slug: 'sunnova', type: 'lease', apr_low: 0, apr_high: 0, term_years: [25], min_credit_score: 600, zero_down: true, battery_financing: true, states_available: 'Most states', pros: ['Low credit requirement', 'No upfront cost', 'Includes monitoring'], cons: ['Lease only', 'Long term commitment', 'Escalator clauses'] },
    { name: 'PACE (Property Assessed Clean Energy)', slug: 'pace', type: 'PACE', apr_low: 5.0, apr_high: 9.0, term_years: [10, 15, 20, 25, 30], min_credit_score: 0, zero_down: true, battery_financing: true, states_available: 'Select states (CA, FL, MO)', pros: ['No credit score requirement', 'Tax-deductible interest', 'Transfers with property'], cons: ['Higher rates', 'Property lien', 'Limited availability'] },
    { name: 'Credit Union Solar Loans', slug: 'credit-union', type: 'loan', apr_low: 4.49, apr_high: 8.99, term_years: [5, 10, 15, 20], min_credit_score: 660, zero_down: false, battery_financing: true, states_available: 'Varies by credit union', pros: ['Member benefits', 'Personalized service', 'Competitive rates'], cons: ['Membership required', 'May require down payment', 'Slower process'] },
    { name: 'Home Equity Loan (HELOC)', slug: 'heloc', type: 'HELOC', apr_low: 6.5, apr_high: 10.0, term_years: [5, 10, 15, 20], min_credit_score: 680, zero_down: true, battery_financing: true, states_available: 'All states', pros: ['Tax-deductible interest', 'Lower rates possible', 'Flexible use'], cons: ['Home as collateral', 'Variable rates possible', 'Appraisal required'] },
    { name: 'Vivint Solar', slug: 'vivint-solar', type: 'PPA', apr_low: 0, apr_high: 0, term_years: [20, 25], min_credit_score: 650, zero_down: true, battery_financing: true, states_available: 'Select states', pros: ['Pay per kWh produced', 'No upfront cost', 'Maintenance included'], cons: ['Lower savings than ownership', 'Long contract', 'Rate escalators'] }
  ],
  financing_types: {
    cash: { description: 'Pay the full cost upfront and own your system immediately. Maximizes total savings and qualifies for all tax credits.', avg_roi_multiplier: 1.0 },
    loan: { description: 'Finance your solar purchase with a solar loan. You own the system, get tax credits, and pay over time.', avg_roi_multiplier: 0.85 },
    lease: { description: 'Lease solar panels with no money down. The leasing company owns the system and you pay a monthly fee.', avg_roi_multiplier: 0.50 },
    ppa: { description: 'Power Purchase Agreement where you pay for the electricity produced at a fixed rate, typically below utility rates.', avg_roi_multiplier: 0.45 },
    pace: { description: 'Property Assessed Clean Energy financing is repaid through your property tax bill over 10-30 years.', avg_roi_multiplier: 0.70 },
    heloc: { description: 'Use your home equity to finance solar. Interest may be tax-deductible and rates can be competitive.', avg_roi_multiplier: 0.80 }
  }
};

fs.writeFileSync(path.join(DATA, 'financing.json'), JSON.stringify(financing, null, 2));
console.log('Financing created');

// Glossary data
const glossary = [
  { term: 'Net Metering', slug: 'net-metering', definition: 'A billing mechanism that credits solar energy system owners for the electricity they add to the grid. When your solar panels produce more electricity than your home uses, the excess is sent to the grid and you receive a credit on your electric bill. Net metering policies vary significantly by state and utility.', category: 'Policy', related: ['net-billing', 'feed-in-tariff', 'grid-tied-system'] },
  { term: 'Solar Renewable Energy Certificate (SREC)', slug: 'srec', definition: 'A tradeable certificate that represents the environmental benefits of one megawatt-hour (MWh) of solar electricity generation. SRECs can be sold to utilities that need to meet renewable energy requirements, providing additional income for solar system owners. SREC values vary by state market.', category: 'Incentive', related: ['renewable-portfolio-standard', 'net-metering'] },
  { term: 'Federal Investment Tax Credit (ITC)', slug: 'federal-itc', definition: 'A federal tax credit that allows homeowners and businesses to deduct a percentage of the cost of installing a solar energy system from their federal taxes. The ITC is currently set at 30% through 2032, then steps down to 26% in 2033 and 22% in 2034. This is one of the most significant solar incentives available.', category: 'Incentive', related: ['tax-credit', 'solar-rebate'] },
  { term: 'Kilowatt-hour (kWh)', slug: 'kwh', definition: 'A unit of energy equal to one kilowatt of power used for one hour. Your electricity bill is measured in kWh, and this is the standard unit for comparing solar production to home energy consumption. The average American home uses about 900 kWh per month.', category: 'Energy', related: ['kilowatt', 'megawatt-hour'] },
  { term: 'Kilowatt (kW)', slug: 'kilowatt', definition: 'A unit of power equal to 1,000 watts. Solar system sizes are typically measured in kilowatts. A typical residential solar system is between 5-10 kW, depending on energy needs and available roof space. One kilowatt of solar panels produces approximately 1,200-1,800 kWh per year depending on location.', category: 'Energy', related: ['kwh', 'watt'] },
  { term: 'Photovoltaic (PV)', slug: 'photovoltaic', definition: 'The technology used to convert sunlight directly into electricity using semiconductor materials. Photovoltaic cells are the building blocks of solar panels. When sunlight hits a PV cell, it creates an electric field that causes electricity to flow. Modern PV cells can convert 18-22% of sunlight into electricity.', category: 'Technology', related: ['solar-panel', 'monocrystalline', 'polycrystalline'] },
  { term: 'Solar Panel', slug: 'solar-panel', definition: 'A device that converts sunlight into electricity, consisting of many photovoltaic cells connected together. Solar panels are typically warranted for 25-30 years and can produce electricity for even longer. Modern panels degrade at approximately 0.5% per year, meaning they still produce about 87.5% of their original output after 25 years.', category: 'Technology', related: ['photovoltaic', 'monocrystalline', 'polycrystalline'] },
  { term: 'Inverter', slug: 'inverter', definition: 'A device that converts the direct current (DC) electricity produced by solar panels into alternating current (AC) electricity used in homes and businesses. There are three main types: string inverters, microinverters, and power optimizers. Inverters typically last 10-15 years and may need replacement during the life of your solar system.', category: 'Technology', related: ['microinverter', 'string-inverter', 'power-optimizer'] },
  { term: 'Microinverter', slug: 'microinverter', definition: 'A small inverter installed on each individual solar panel that converts DC to AC electricity at the panel level. Microinverters optimize each panel independently, making them ideal for roofs with shading issues. They typically cost more than string inverters but offer better performance monitoring and longer warranties.', category: 'Technology', related: ['inverter', 'string-inverter', 'power-optimizer'] },
  { term: 'String Inverter', slug: 'string-inverter', definition: 'A central inverter that converts DC electricity from a series (string) of solar panels into AC electricity. String inverters are the most cost-effective option for unshaded roofs with a single orientation. However, if one panel in the string underperforms, it can affect the entire string output.', category: 'Technology', related: ['inverter', 'microinverter'] },
  { term: 'Power Optimizer', slug: 'power-optimizer', definition: 'A DC-to-DC converter installed on each solar panel that optimizes the power output before sending it to a central string inverter. Power optimizers offer panel-level optimization similar to microinverters but at a lower cost. SolarEdge is the most well-known manufacturer of power optimizer systems.', category: 'Technology', related: ['inverter', 'microinverter', 'string-inverter'] },
  { term: 'Net Billing', slug: 'net-billing', definition: 'A compensation structure where excess solar energy exported to the grid is credited at a rate different from (usually lower than) the retail electricity rate. Unlike traditional net metering which credits at full retail rate, net billing typically compensates at wholesale or avoided cost rates. California NEM 3.0 is a prominent example.', category: 'Policy', related: ['net-metering', 'feed-in-tariff'] },
  { term: 'Feed-in Tariff', slug: 'feed-in-tariff', definition: 'A policy mechanism that offers a guaranteed payment rate for renewable energy fed into the electricity grid. Feed-in tariffs provide long-term contracts (typically 15-20 years) at a fixed rate, providing revenue certainty for solar system owners. They are more common in Europe but some U.S. programs exist.', category: 'Policy', related: ['net-metering', 'net-billing'] },
  { term: 'Grid-Tied System', slug: 'grid-tied-system', definition: 'A solar energy system that is connected to the utility electrical grid. Grid-tied systems can send excess electricity to the grid and draw from it when solar production is insufficient. Most residential solar installations are grid-tied because they dont require battery storage and benefit from net metering.', category: 'System Type', related: ['off-grid-system', 'hybrid-system', 'net-metering'] },
  { term: 'Off-Grid System', slug: 'off-grid-system', definition: 'A solar energy system that operates independently of the utility grid, relying entirely on solar panels and battery storage for electricity. Off-grid systems require significantly more battery capacity and are typically more expensive than grid-tied systems. They are most common in remote locations without grid access.', category: 'System Type', related: ['grid-tied-system', 'battery-storage', 'hybrid-system'] },
  { term: 'Hybrid System', slug: 'hybrid-system', definition: 'A solar energy system that combines grid connection with battery storage. Hybrid systems can store excess solar energy in batteries for use during peak hours or outages while still maintaining grid connection as backup. They offer the benefits of both grid-tied and off-grid systems.', category: 'System Type', related: ['grid-tied-system', 'off-grid-system', 'battery-storage'] },
  { term: 'Battery Storage', slug: 'battery-storage', definition: 'A system that stores excess solar energy for later use, typically using lithium-ion batteries. Popular residential options include the Tesla Powerwall, Enphase IQ Battery, and LG RESU. Battery storage allows homeowners to use solar energy at night, during peak rate periods, or during power outages.', category: 'Technology', related: ['hybrid-system', 'tesla-powerwall', 'off-grid-system'] },
  { term: 'Tesla Powerwall', slug: 'tesla-powerwall', definition: 'A popular residential battery storage system manufactured by Tesla with 13.5 kWh of usable capacity. The Powerwall can provide backup power during outages and help optimize solar self-consumption. It integrates with the Tesla app for monitoring and can be paired with Tesla solar panels or third-party systems.', category: 'Product', related: ['battery-storage', 'hybrid-system'] },
  { term: 'Time of Use (TOU) Rates', slug: 'time-of-use-rates', definition: 'An electricity rate structure that charges different prices based on the time of day. Peak rates are highest during afternoon and evening hours when demand is greatest, while off-peak rates are lower during nighttime and weekends. TOU rates significantly affect solar savings calculations and make battery storage more valuable.', category: 'Billing', related: ['peak-rate', 'net-metering'] },
  { term: 'Peak Sun Hours', slug: 'peak-sun-hours', definition: 'The equivalent number of hours per day when solar irradiance averages 1,000 watts per square meter. Peak sun hours are used to estimate solar production and vary by location. For example, Phoenix averages about 6.5 peak sun hours per day while Seattle averages about 3.5. This metric is crucial for sizing solar systems.', category: 'Energy', related: ['solar-irradiance', 'kwh'] },
  { term: 'Solar Irradiance', slug: 'solar-irradiance', definition: 'The amount of solar radiation energy received per unit area, measured in watts per square meter (W/m2). Solar irradiance varies by location, season, time of day, and weather conditions. Higher irradiance means more electricity production from solar panels. The southwestern United States receives the highest irradiance in the country.', category: 'Energy', related: ['peak-sun-hours', 'photovoltaic'] },
  { term: 'Monocrystalline', slug: 'monocrystalline', definition: 'A type of solar cell made from a single crystal of silicon, offering the highest efficiency ratings (typically 19-22%) among mainstream panel technologies. Monocrystalline panels are recognizable by their uniform dark appearance and rounded cell corners. They perform better in low-light conditions and have a longer lifespan.', category: 'Technology', related: ['polycrystalline', 'solar-panel', 'photovoltaic'] },
  { term: 'Polycrystalline', slug: 'polycrystalline', definition: 'A type of solar cell made from multiple silicon crystals melted together, offering slightly lower efficiency (typically 15-17%) than monocrystalline but at a lower cost. Polycrystalline panels have a distinctive blue speckled appearance. They are a good budget-friendly option for installations with plenty of roof space.', category: 'Technology', related: ['monocrystalline', 'solar-panel', 'photovoltaic'] },
  { term: 'Solar Lease', slug: 'solar-lease', definition: 'A financing arrangement where a solar company installs panels on your roof and you pay a fixed monthly fee to use the electricity they produce. With a lease, the solar company owns the system and is responsible for maintenance. Leases typically last 20-25 years and may include annual escalator clauses of 1-3%.', category: 'Financing', related: ['power-purchase-agreement', 'solar-loan'] },
  { term: 'Power Purchase Agreement (PPA)', slug: 'power-purchase-agreement', definition: 'A financial arrangement where a solar developer installs, owns, and maintains a solar system on your property, and you agree to purchase the electricity at a predetermined rate, usually below the utility rate. PPAs are similar to leases but you pay per kWh produced rather than a fixed monthly amount.', category: 'Financing', related: ['solar-lease', 'solar-loan'] },
  { term: 'Solar Loan', slug: 'solar-loan', definition: 'A financing product specifically designed for purchasing a solar energy system. Solar loans allow homeowners to own their system, claim tax credits and incentives, and build equity. Terms typically range from 5-25 years with competitive interest rates. Many solar loans offer zero-down-payment options.', category: 'Financing', related: ['solar-lease', 'power-purchase-agreement'] },
  { term: 'PACE Financing', slug: 'pace-financing', definition: 'Property Assessed Clean Energy (PACE) financing allows homeowners to fund energy improvements through an assessment on their property tax bill. PACE loans are tied to the property rather than the homeowner, so they transfer with the property if sold. No credit score is required, but PACE creates a senior lien on the property.', category: 'Financing', related: ['solar-loan', 'solar-lease'] },
  { term: 'Solar Rebate', slug: 'solar-rebate', definition: 'A financial incentive offered by states, utilities, or local governments that provides a direct payment or credit for installing solar panels. Unlike tax credits, rebates provide immediate value and dont require tax liability. Rebate amounts vary widely and many programs have caps or are available on a first-come, first-served basis.', category: 'Incentive', related: ['federal-itc', 'srec', 'tax-credit'] },
  { term: 'Tax Credit', slug: 'tax-credit', definition: 'A dollar-for-dollar reduction in the amount of income tax you owe. Solar tax credits, like the Federal ITC, directly reduce your tax bill rather than your taxable income. A $5,000 tax credit saves you $5,000 in taxes, while a $5,000 tax deduction only saves you the taxes on that amount of income.', category: 'Incentive', related: ['federal-itc', 'solar-rebate'] },
  { term: 'Renewable Portfolio Standard (RPS)', slug: 'renewable-portfolio-standard', definition: 'A regulatory mandate requiring utilities to source a specified percentage of their electricity from renewable energy by a target date. RPS policies drive demand for SRECs and other renewable energy certificates. States with ambitious RPS targets tend to have stronger solar incentive programs and higher SREC values.', category: 'Policy', related: ['srec', 'net-metering'] },
  { term: 'Interconnection', slug: 'interconnection', definition: 'The process of connecting a solar energy system to the utility electrical grid. Interconnection requires an agreement with the utility, technical review, and possibly equipment upgrades. Interconnection fees vary by utility from $0 to over $200. The process can take 2-8 weeks depending on the utility.', category: 'Process', related: ['grid-tied-system', 'net-metering'] },
  { term: 'Payback Period', slug: 'payback-period', definition: 'The amount of time it takes for a solar investment to pay for itself through energy savings and incentives. The average solar payback period in the U.S. is 6-10 years, after which the system produces essentially free electricity for its remaining 15-20+ year lifespan. States with high electricity rates and strong incentives have shorter payback periods.', category: 'Financial', related: ['return-on-investment', 'levelized-cost-of-energy'] },
  { term: 'Return on Investment (ROI)', slug: 'return-on-investment', definition: 'A measure of the profitability of a solar investment, expressed as a percentage of the initial investment. Solar ROI accounts for total savings over the system lifetime minus the net cost of installation. Most residential solar systems deliver 100-300% ROI over their 25-year lifespan, making solar one of the best home improvements for financial return.', category: 'Financial', related: ['payback-period', 'levelized-cost-of-energy'] },
  { term: 'Levelized Cost of Energy (LCOE)', slug: 'levelized-cost-of-energy', definition: 'The average cost per unit of electricity generated over the lifetime of a solar system, accounting for all costs including installation, maintenance, and financing. LCOE allows direct comparison between solar and utility electricity costs. Residential solar LCOE in the U.S. ranges from $0.05-$0.10/kWh, often below utility rates.', category: 'Financial', related: ['payback-period', 'return-on-investment'] },
  { term: 'Watt', slug: 'watt', definition: 'The basic unit of electrical power, measuring the rate of energy generation or consumption. Solar panel output is rated in watts (W), with typical residential panels producing 300-400 watts each. A kilowatt (kW) equals 1,000 watts, and residential solar systems typically range from 5,000-10,000 watts (5-10 kW).', category: 'Energy', related: ['kilowatt', 'kwh'] },
  { term: 'Megawatt-hour (MWh)', slug: 'megawatt-hour', definition: 'A unit of energy equal to 1,000 kilowatt-hours, commonly used for measuring utility-scale solar production and SREC trading. One MWh is enough electricity to power approximately 330 average homes for one hour, or one average home for about 33 days.', category: 'Energy', related: ['kwh', 'kilowatt'] },
  { term: 'Solar Canopy', slug: 'solar-canopy', definition: 'An elevated structure that supports solar panels while providing shade below, commonly used in parking lots and outdoor areas. Solar canopies maximize usable space and can provide weather protection for vehicles or outdoor areas while generating clean electricity.', category: 'System Type', related: ['solar-panel', 'ground-mount'] },
  { term: 'Ground Mount', slug: 'ground-mount', definition: 'A solar panel installation system where panels are mounted on a frame attached to the ground rather than the roof. Ground mounts are ideal for properties with ample land, poor roof conditions, or shading issues. They can be fixed or use tracking systems to follow the sun for increased production.', category: 'System Type', related: ['roof-mount', 'solar-canopy'] },
  { term: 'Roof Mount', slug: 'roof-mount', definition: 'The most common residential solar installation method where panels are attached to the existing roof using racking systems. Roof mounts are cost-effective and dont require additional land. The roof should ideally face south with minimal shading and be in good condition with 15+ years of remaining life.', category: 'System Type', related: ['ground-mount', 'solar-panel'] },
  { term: 'Property Tax Exemption', slug: 'property-tax-exemption', definition: 'A state or local policy that exempts the added value of a solar installation from property tax assessments. While solar panels increase home value by an average of 4%, a property tax exemption ensures your property taxes dont increase as a result. This incentive is available in many states.', category: 'Incentive', related: ['sales-tax-exemption', 'solar-rebate'] },
  { term: 'Sales Tax Exemption', slug: 'sales-tax-exemption', definition: 'A state policy that exempts solar energy equipment from sales tax at the time of purchase. This can save homeowners 4-10% of the system cost depending on the state sales tax rate. Not all states offer this exemption, so its important to check your states specific policies.', category: 'Incentive', related: ['property-tax-exemption', 'solar-rebate'] },
  { term: 'Degradation Rate', slug: 'degradation-rate', definition: 'The rate at which solar panel output decreases over time, typically about 0.5% per year for quality panels. After 25 years, a panel with a 0.5% annual degradation rate will still produce about 87.5% of its original output. Premium panels may have degradation rates as low as 0.25% per year.', category: 'Technology', related: ['solar-panel', 'warranty'] },
  { term: 'Solar Monitoring', slug: 'solar-monitoring', definition: 'A system that tracks the real-time and historical performance of a solar installation, usually through a smartphone app or web portal. Monitoring systems show energy production, consumption, savings, and can alert homeowners to performance issues. Most modern inverters and microinverters include built-in monitoring.', category: 'Technology', related: ['inverter', 'microinverter'] },
  { term: 'Demand Charges', slug: 'demand-charges', definition: 'A fee charged by utilities based on the highest rate of electricity consumption (measured in kW) during a billing period, rather than total energy consumed. Demand charges are more common for commercial customers but some residential TOU rates include them. Solar plus battery storage can help reduce demand charges.', category: 'Billing', related: ['time-of-use-rates', 'peak-rate'] },
  { term: 'Peak Rate', slug: 'peak-rate', definition: 'The highest electricity rate charged during periods of peak demand, typically afternoon and early evening hours on weekdays. Peak rates under TOU billing can be 2-3 times higher than off-peak rates. Solar production often coincides with peak rate periods, maximizing savings for homeowners on TOU rate structures.', category: 'Billing', related: ['time-of-use-rates', 'demand-charges'] }
];

fs.writeFileSync(path.join(DATA, 'glossary.json'), JSON.stringify(glossary, null, 2));
console.log('Glossary created:', glossary.length, 'terms');

// Alerts data
const alerts = {
  global_alerts: [
    { id: 'federal-itc-2025', message: 'The 30% Federal Solar Tax Credit drops to 26% in 2033. Lock in maximum savings now.', type: 'warning', active: true }
  ],
  state_alerts: [
    { state_abbrev: 'CA', message: 'California NEM 3.0 has reduced solar export rates by 75%. Battery storage is now essential for maximum savings.', type: 'urgent', active: true },
    { state_abbrev: 'NY', message: 'New York VDER tariff is replacing net metering. Existing installations are grandfathered.', type: 'info', active: true },
    { state_abbrev: 'AZ', message: 'Arizona state solar tax credit of 25% is available through 2028. Act now to maximize incentives.', type: 'warning', active: true },
    { state_abbrev: 'NJ', message: 'New Jersey TREC values remain strong. One of the best SREC markets in the nation.', type: 'info', active: true },
    { state_abbrev: 'MA', message: 'Massachusetts SMART program incentives are declining. Earlier adopters receive higher rates.', type: 'warning', active: true },
    { state_abbrev: 'HI', message: 'Hawaii 35% state tax credit combined with high electricity rates makes solar a top investment.', type: 'info', active: true },
    { state_abbrev: 'SC', message: 'South Carolina 25% state tax credit has no cap, making it one of the best in the nation.', type: 'info', active: true },
    { state_abbrev: 'TX', message: 'Texas has no state net metering law. Check with your utility for local solar buyback programs.', type: 'info', active: true },
    { state_abbrev: 'IN', message: 'Indiana net metering is being phased down. Lock in current rates before further reductions.', type: 'urgent', active: true },
    { state_abbrev: 'MI', message: 'Michigan DTE Energy and Consumers Energy have reached net metering caps. New rates are lower.', type: 'urgent', active: true }
  ],
  utility_alerts: [
    { utility_slug: 'pacific-gas-electric', message: 'PG&E NEM 3.0 significantly reduces export compensation. Pair solar with battery for best results.', type: 'urgent', active: true },
    { utility_slug: 'southern-california-edison', message: 'SCE NEM 3.0 in effect. Time-of-use rate optimization and battery storage strongly recommended.', type: 'urgent', active: true },
    { utility_slug: 'san-diego-gas-electric', message: 'SDG&E has the highest peak rates in California. Solar plus storage maximizes savings.', type: 'warning', active: true },
    { utility_slug: 'dte-energy', message: 'DTE Energy net metering cap reached. New customers on distributed generation tariff.', type: 'urgent', active: true },
    { utility_slug: 'consumers-energy', message: 'Consumers Energy net metering cap reached. Reduced export rates for new solar customers.', type: 'urgent', active: true }
  ]
};

fs.writeFileSync(path.join(DATA, 'alerts.json'), JSON.stringify(alerts, null, 2));
console.log('Alerts created');

console.log('All data files created successfully');
