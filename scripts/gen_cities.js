#!/usr/bin/env node
/**
 * gen_cities.js
 * Reads the existing cities.json (100 cities), generates additional cities
 * to reach 500+ total, and writes the merged array back.
 */

const fs = require('fs');
const path = require('path');

const CITIES_PATH = path.join(__dirname, '..', 'data', 'cities.json');

// ---------------------------------------------------------------------------
// Hard-coded dictionary of NEW cities to add, keyed by state abbreviation.
// Large states (CA, TX, FL, NY, OH, PA, IL) get 12-15 extra cities.
// Small states (WY, VT, DE, ND, SD, MT, AK) get 3-5 extra cities.
// All other states get ~8 extra cities.
//
// Each entry: [city_name, avg_electricity_rate, avg_sun_hours, population]
// electricity_trend is always "increasing"
// local_incentives is always the standard string
// slug is derived from city_name
// ---------------------------------------------------------------------------

const STATE_META = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
  NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
  ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
  TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming"
};

const NEW_CITIES = {
  // --- LARGE STATES: 12-15 extra ---

  CA: [
    ["San Jose", 0.24, 5.7, 1013240],
    ["San Diego", 0.26, 5.8, 1386932],
    ["Sacramento", 0.22, 5.5, 524943],
    ["Fresno", 0.20, 5.9, 542107],
    ["Long Beach", 0.25, 5.5, 466742],
    ["Oakland", 0.26, 5.1, 433031],
    ["Bakersfield", 0.20, 6.1, 403455],
    ["Anaheim", 0.24, 5.6, 350365],
    ["Riverside", 0.22, 5.9, 314998],
    ["Santa Ana", 0.24, 5.6, 309441],
    ["Stockton", 0.21, 5.4, 320804],
    ["Irvine", 0.25, 5.6, 307670],
    ["Modesto", 0.21, 5.5, 218464],
    ["Santa Rosa", 0.27, 5.0, 178127],
    ["Pasadena", 0.25, 5.6, 138699]
  ],

  TX: [
    ["San Antonio", 0.11, 5.2, 1434625],
    ["Dallas", 0.12, 5.0, 1304379],
    ["Fort Worth", 0.11, 5.0, 918915],
    ["El Paso", 0.11, 6.3, 678815],
    ["Arlington", 0.12, 5.0, 394266],
    ["Corpus Christi", 0.11, 5.1, 317863],
    ["Plano", 0.12, 5.0, 285494],
    ["Lubbock", 0.10, 5.8, 263930],
    ["Laredo", 0.10, 5.5, 255205],
    ["Irving", 0.12, 5.0, 256684],
    ["Amarillo", 0.10, 5.7, 199371],
    ["Brownsville", 0.10, 5.2, 186738],
    ["McKinney", 0.12, 5.0, 199177],
    ["Frisco", 0.12, 5.0, 200509],
    ["Midland", 0.10, 6.0, 146038]
  ],

  FL: [
    ["Jacksonville", 0.13, 5.1, 949611],
    ["Orlando", 0.13, 5.3, 307573],
    ["St Petersburg", 0.13, 5.4, 258308],
    ["Hialeah", 0.14, 5.3, 223109],
    ["Fort Lauderdale", 0.14, 5.4, 182760],
    ["Tallahassee", 0.12, 5.0, 196169],
    ["Cape Coral", 0.13, 5.4, 194016],
    ["Port St Lucie", 0.13, 5.3, 204851],
    ["Pembroke Pines", 0.14, 5.3, 171178],
    ["Gainesville", 0.12, 5.0, 141085],
    ["Clearwater", 0.13, 5.4, 117250],
    ["Palm Bay", 0.13, 5.2, 119760],
    ["Lakeland", 0.13, 5.2, 112641],
    ["Pompano Beach", 0.14, 5.4, 112046]
  ],

  NY: [
    ["Rochester", 0.19, 3.6, 211328],
    ["Yonkers", 0.22, 3.9, 211569],
    ["Syracuse", 0.18, 3.5, 148620],
    ["Albany", 0.19, 3.7, 99224],
    ["White Plains", 0.22, 3.9, 58109],
    ["Schenectady", 0.18, 3.7, 67878],
    ["New Rochelle", 0.22, 3.9, 79726],
    ["Utica", 0.18, 3.5, 65284],
    ["Binghamton", 0.18, 3.5, 47969],
    ["Ithaca", 0.18, 3.6, 32108],
    ["Poughkeepsie", 0.20, 3.8, 30515],
    ["Mount Vernon", 0.22, 3.9, 73893],
    ["Long Island", 0.23, 4.0, 120000]
  ],

  OH: [
    ["Cincinnati", 0.13, 3.9, 309317],
    ["Toledo", 0.14, 3.8, 270871],
    ["Akron", 0.13, 3.7, 190469],
    ["Dayton", 0.13, 3.9, 137644],
    ["Youngstown", 0.14, 3.6, 66982],
    ["Canton", 0.13, 3.7, 70458],
    ["Parma", 0.14, 3.7, 81601],
    ["Lorain", 0.14, 3.7, 65211],
    ["Hamilton", 0.13, 3.9, 62477],
    ["Springfield OH", 0.13, 3.9, 58662],
    ["Lakewood", 0.14, 3.7, 50942],
    ["Elyria", 0.14, 3.7, 53757]
  ],

  PA: [
    ["Allentown", 0.15, 3.9, 125845],
    ["Erie", 0.14, 3.5, 94831],
    ["Reading", 0.15, 3.9, 95112],
    ["Scranton", 0.14, 3.6, 76997],
    ["Bethlehem", 0.15, 3.9, 75781],
    ["Lancaster", 0.15, 4.0, 63490],
    ["Harrisburg", 0.14, 3.9, 50099],
    ["York", 0.14, 4.0, 44747],
    ["Wilkes-Barre", 0.14, 3.6, 44328],
    ["State College", 0.14, 3.8, 42034],
    ["Chester", 0.15, 4.0, 35064],
    ["Easton", 0.15, 3.9, 28006]
  ],

  IL: [
    ["Aurora", 0.15, 4.2, 180542],
    ["Naperville", 0.15, 4.2, 149540],
    ["Rockford", 0.14, 4.1, 148655],
    ["Joliet", 0.15, 4.2, 150362],
    ["Peoria", 0.14, 4.3, 113150],
    ["Elgin", 0.15, 4.1, 114797],
    ["Waukegan", 0.15, 4.0, 89078],
    ["Champaign", 0.13, 4.3, 88302],
    ["Bloomington IL", 0.13, 4.3, 78902],
    ["Decatur", 0.13, 4.3, 70522],
    ["Evanston", 0.16, 4.0, 78110],
    ["Schaumburg", 0.15, 4.1, 78723],
    ["Arlington Heights", 0.15, 4.1, 75101]
  ],

  // --- SMALL STATES: 3-5 extra ---

  WY: [
    ["Laramie", 0.10, 5.3, 32158],
    ["Gillette", 0.09, 5.1, 33403],
    ["Rock Springs", 0.09, 5.5, 23820]
  ],

  VT: [
    ["Rutland", 0.19, 3.7, 15807],
    ["South Burlington", 0.20, 3.8, 20292],
    ["Barre", 0.19, 3.6, 8491]
  ],

  DE: [
    ["Newark DE", 0.14, 4.3, 33398],
    ["Middletown DE", 0.13, 4.4, 23664],
    ["Smyrna", 0.13, 4.4, 12883]
  ],

  ND: [
    ["Grand Forks", 0.10, 4.4, 56588],
    ["Minot", 0.10, 4.5, 48984],
    ["West Fargo", 0.10, 4.5, 38626]
  ],

  SD: [
    ["Aberdeen", 0.11, 4.7, 28324],
    ["Brookings", 0.11, 4.8, 24272],
    ["Watertown", 0.11, 4.7, 22655]
  ],

  MT: [
    ["Great Falls", 0.11, 4.5, 60442],
    ["Bozeman", 0.11, 4.6, 53293],
    ["Helena", 0.10, 4.4, 32315],
    ["Butte", 0.10, 4.3, 34751]
  ],

  AK: [
    ["Juneau", 0.23, 2.5, 32255],
    ["Sitka", 0.22, 2.3, 8493],
    ["Wasilla", 0.22, 3.0, 12256]
  ],

  // --- MEDIUM STATES: ~8 extra ---

  AL: [
    ["Montgomery", 0.12, 4.8, 200603],
    ["Mobile", 0.12, 4.9, 187041],
    ["Tuscaloosa", 0.12, 4.7, 101113],
    ["Hoover", 0.12, 4.7, 92606],
    ["Dothan", 0.11, 4.9, 71072],
    ["Auburn", 0.12, 4.8, 76143],
    ["Decatur AL", 0.11, 4.7, 57938],
    ["Florence", 0.11, 4.6, 40184]
  ],

  AZ: [
    ["Mesa", 0.13, 6.6, 504258],
    ["Chandler", 0.13, 6.5, 275987],
    ["Gilbert", 0.13, 6.5, 267918],
    ["Scottsdale", 0.14, 6.6, 241361],
    ["Glendale", 0.13, 6.5, 248325],
    ["Tempe", 0.13, 6.5, 180587],
    ["Peoria AZ", 0.13, 6.5, 190985],
    ["Surprise", 0.13, 6.6, 143148]
  ],

  AR: [
    ["Fort Smith", 0.10, 4.8, 89142],
    ["Springdale", 0.10, 4.7, 80433],
    ["Jonesboro", 0.10, 4.7, 78576],
    ["Rogers", 0.10, 4.6, 68669],
    ["Conway", 0.10, 4.7, 66426],
    ["North Little Rock", 0.10, 4.8, 64591],
    ["Bentonville", 0.10, 4.6, 54164],
    ["Pine Bluff", 0.10, 4.8, 41253]
  ],

  CO: [
    ["Aurora CO", 0.13, 5.4, 386261],
    ["Fort Collins", 0.12, 5.3, 169810],
    ["Lakewood CO", 0.13, 5.5, 155984],
    ["Thornton", 0.13, 5.4, 141867],
    ["Arvada", 0.13, 5.5, 124402],
    ["Pueblo", 0.12, 5.7, 112251],
    ["Westminster CO", 0.13, 5.4, 113166],
    ["Boulder", 0.13, 5.5, 105112]
  ],

  CT: [
    ["Bridgeport", 0.25, 4.1, 148529],
    ["Stamford", 0.26, 4.1, 135470],
    ["Waterbury", 0.24, 4.0, 114403],
    ["Norwalk", 0.25, 4.1, 91184],
    ["Danbury", 0.24, 4.0, 86518],
    ["New Britain", 0.24, 4.0, 73206],
    ["Bristol CT", 0.24, 4.0, 60477],
    ["Meriden", 0.24, 4.0, 60850]
  ],

  GA: [
    ["Augusta", 0.12, 4.9, 202081],
    ["Columbus GA", 0.12, 4.9, 206922],
    ["Macon", 0.12, 4.9, 157346],
    ["Roswell", 0.12, 4.8, 92833],
    ["Sandy Springs", 0.12, 4.8, 108080],
    ["Johns Creek", 0.12, 4.8, 82453],
    ["Albany GA", 0.12, 5.0, 72256],
    ["Warner Robins", 0.12, 4.9, 80308]
  ],

  HI: [
    ["Hilo", 0.36, 5.0, 47275],
    ["Kailua", 0.35, 5.5, 40514],
    ["Kapolei", 0.35, 5.7, 21576],
    ["Kaneohe", 0.35, 5.3, 34597],
    ["Pearl City", 0.35, 5.6, 47698],
    ["Waipahu", 0.35, 5.6, 38216],
    ["Mililani", 0.35, 5.5, 48106],
    ["Ewa Beach", 0.35, 5.7, 14955]
  ],

  ID: [
    ["Nampa", 0.09, 4.6, 100200],
    ["Meridian", 0.09, 4.7, 117635],
    ["Pocatello", 0.08, 4.5, 56820],
    ["Caldwell", 0.09, 4.6, 61308],
    ["Coeur d'Alene", 0.08, 3.9, 54628],
    ["Twin Falls", 0.08, 4.8, 51807],
    ["Lewiston", 0.08, 4.2, 33821],
    ["Rexburg", 0.08, 4.5, 35890]
  ],

  IN: [
    ["Evansville", 0.12, 4.2, 117298],
    ["South Bend", 0.14, 3.9, 103453],
    ["Carmel", 0.13, 4.2, 99757],
    ["Fishers", 0.13, 4.2, 98977],
    ["Bloomington IN", 0.13, 4.2, 79168],
    ["Hammond", 0.13, 4.0, 77879],
    ["Lafayette", 0.13, 4.1, 70373],
    ["Muncie", 0.13, 4.1, 65194]
  ],

  IA: [
    ["Davenport", 0.12, 4.3, 101724],
    ["Sioux City", 0.11, 4.6, 85797],
    ["Iowa City", 0.12, 4.3, 74828],
    ["Waterloo IA", 0.12, 4.3, 67314],
    ["Ames", 0.12, 4.4, 66427],
    ["Council Bluffs", 0.12, 4.6, 62230],
    ["Dubuque", 0.12, 4.2, 59667],
    ["West Des Moines", 0.12, 4.4, 68723]
  ],

  KS: [
    ["Kansas City KS", 0.12, 4.9, 156607],
    ["Topeka", 0.12, 4.9, 126587],
    ["Olathe", 0.12, 4.9, 141290],
    ["Lawrence", 0.12, 4.8, 94934],
    ["Shawnee KS", 0.12, 4.9, 67311],
    ["Manhattan KS", 0.12, 5.0, 54832],
    ["Lenexa", 0.12, 4.9, 57024],
    ["Salina", 0.11, 5.1, 46994]
  ],

  KY: [
    ["Bowling Green", 0.11, 4.3, 74735],
    ["Owensboro", 0.11, 4.3, 60183],
    ["Covington", 0.12, 4.1, 40640],
    ["Georgetown", 0.11, 4.2, 37406],
    ["Richmond KY", 0.11, 4.2, 36665],
    ["Florence KY", 0.12, 4.1, 32306],
    ["Elizabethtown", 0.11, 4.2, 30847],
    ["Hopkinsville", 0.11, 4.3, 29395]
  ],

  LA: [
    ["Shreveport", 0.10, 4.8, 187593],
    ["Lafayette LA", 0.10, 4.8, 126185],
    ["Lake Charles", 0.10, 4.9, 82149],
    ["Kenner", 0.10, 4.9, 66702],
    ["Bossier City", 0.10, 4.8, 68159],
    ["Monroe LA", 0.10, 4.7, 48371],
    ["Alexandria LA", 0.10, 4.8, 46426],
    ["Houma", 0.10, 4.9, 32693]
  ],

  ME: [
    ["Lewiston", 0.19, 4.0, 36592],
    ["Auburn ME", 0.19, 4.0, 23773],
    ["South Portland", 0.19, 4.1, 26498],
    ["Biddeford", 0.19, 4.1, 22668],
    ["Sanford", 0.19, 4.1, 21928],
    ["Saco", 0.19, 4.1, 20381],
    ["Augusta ME", 0.19, 3.9, 18899],
    ["Westbrook", 0.19, 4.0, 19452]
  ],

  MD: [
    ["Frederick", 0.15, 4.4, 78171],
    ["Rockville", 0.15, 4.4, 68155],
    ["Gaithersburg", 0.15, 4.4, 69657],
    ["Bowie", 0.15, 4.5, 58025],
    ["Hagerstown", 0.14, 4.3, 44553],
    ["College Park", 0.15, 4.4, 34168],
    ["Salisbury", 0.14, 4.5, 33124],
    ["Laurel", 0.15, 4.4, 30811]
  ],

  MA: [
    ["Springfield MA", 0.24, 4.0, 155929],
    ["Cambridge", 0.26, 4.0, 118403],
    ["Lowell", 0.24, 4.0, 115554],
    ["Brockton", 0.25, 4.0, 105643],
    ["New Bedford", 0.24, 4.1, 101079],
    ["Quincy", 0.25, 4.0, 101636],
    ["Lynn", 0.25, 4.0, 99890],
    ["Fall River", 0.24, 4.1, 93885]
  ],

  MI: [
    ["Warren", 0.16, 3.8, 139387],
    ["Sterling Heights", 0.16, 3.8, 134346],
    ["Ann Arbor", 0.16, 3.8, 123851],
    ["Lansing", 0.15, 3.8, 112644],
    ["Flint", 0.16, 3.7, 95943],
    ["Dearborn", 0.16, 3.8, 94154],
    ["Kalamazoo", 0.15, 3.8, 72786],
    ["Livonia", 0.16, 3.8, 94869]
  ],

  MN: [
    ["Rochester MN", 0.13, 4.3, 121395],
    ["Duluth", 0.12, 3.9, 90884],
    ["Bloomington MN", 0.13, 4.2, 89987],
    ["Brooklyn Park", 0.13, 4.2, 86478],
    ["Plymouth MN", 0.13, 4.2, 81026],
    ["Maple Grove", 0.13, 4.2, 72571],
    ["Woodbury MN", 0.13, 4.3, 75102],
    ["St Cloud", 0.12, 4.2, 68881]
  ],

  MS: [
    ["Hattiesburg", 0.11, 4.9, 48292],
    ["Meridian MS", 0.11, 4.8, 34392],
    ["Southaven", 0.11, 4.7, 55026],
    ["Tupelo", 0.11, 4.7, 38312],
    ["Olive Branch", 0.11, 4.7, 40305],
    ["Pearl", 0.11, 4.8, 27951],
    ["Biloxi", 0.11, 4.9, 46212],
    ["Oxford MS", 0.11, 4.7, 28122]
  ],

  MO: [
    ["Springfield MO", 0.11, 4.5, 169176],
    ["Columbia MO", 0.12, 4.5, 126254],
    ["Independence", 0.12, 4.6, 123011],
    ["Lee's Summit", 0.12, 4.6, 101108],
    ["O'Fallon MO", 0.12, 4.5, 90766],
    ["St Joseph", 0.11, 4.6, 72473],
    ["St Charles", 0.12, 4.5, 70650],
    ["Jefferson City", 0.11, 4.5, 43228]
  ],

  NE: [
    ["Bellevue NE", 0.11, 4.8, 64176],
    ["Grand Island", 0.11, 4.8, 53131],
    ["Kearney", 0.11, 4.9, 33464],
    ["Fremont NE", 0.11, 4.7, 26397],
    ["Hastings NE", 0.11, 4.9, 25268],
    ["Norfolk NE", 0.11, 4.7, 24471],
    ["North Platte", 0.10, 5.0, 23801],
    ["Columbus NE", 0.11, 4.7, 24336]
  ],

  NV: [
    ["Henderson", 0.12, 6.3, 320189],
    ["North Las Vegas", 0.12, 6.3, 262527],
    ["Sparks", 0.11, 5.7, 108445],
    ["Carson City", 0.11, 5.6, 58639],
    ["Elko", 0.10, 5.5, 20279],
    ["Mesquite", 0.11, 6.2, 19304],
    ["Boulder City", 0.11, 6.4, 15977],
    ["Fernley", 0.11, 5.6, 22912]
  ],

  NH: [
    ["Nashua", 0.21, 4.0, 90711],
    ["Dover NH", 0.21, 4.0, 32741],
    ["Rochester NH", 0.21, 4.0, 32492],
    ["Keene", 0.21, 3.9, 23409],
    ["Laconia", 0.21, 3.9, 16871],
    ["Lebanon NH", 0.21, 3.9, 14282],
    ["Claremont", 0.21, 3.8, 13004],
    ["Portsmouth NH", 0.21, 4.0, 22120]
  ],

  NJ: [
    ["Paterson", 0.17, 4.2, 159732],
    ["Elizabeth", 0.17, 4.2, 137298],
    ["Edison", 0.17, 4.2, 107588],
    ["Woodbridge", 0.17, 4.2, 103639],
    ["Trenton", 0.17, 4.2, 90871],
    ["Camden", 0.17, 4.2, 73562],
    ["Cherry Hill", 0.17, 4.3, 71045],
    ["Atlantic City", 0.17, 4.3, 38429]
  ],

  NM: [
    ["Las Cruces", 0.12, 6.3, 111385],
    ["Rio Rancho", 0.13, 6.1, 104046],
    ["Roswell NM", 0.12, 6.4, 48422],
    ["Farmington", 0.12, 6.0, 45426],
    ["Clovis NM", 0.12, 6.3, 39508],
    ["Hobbs", 0.11, 6.3, 40508],
    ["Alamogordo", 0.12, 6.5, 31384],
    ["Carlsbad NM", 0.11, 6.4, 32238]
  ],

  NC: [
    ["Greensboro", 0.12, 4.7, 299035],
    ["Durham", 0.12, 4.7, 283506],
    ["Winston-Salem", 0.12, 4.6, 249545],
    ["Fayetteville NC", 0.12, 4.8, 211657],
    ["Cary", 0.12, 4.7, 174721],
    ["Wilmington NC", 0.12, 4.9, 115451],
    ["High Point", 0.12, 4.6, 114059],
    ["Asheville", 0.12, 4.5, 94067]
  ],

  OK: [
    ["Norman", 0.10, 5.1, 128026],
    ["Broken Arrow", 0.10, 5.0, 113540],
    ["Edmond", 0.10, 5.1, 94054],
    ["Lawton", 0.10, 5.2, 93714],
    ["Moore", 0.10, 5.1, 62793],
    ["Midwest City", 0.10, 5.1, 57407],
    ["Enid", 0.10, 5.2, 49688],
    ["Stillwater", 0.10, 5.1, 50350]
  ],

  OR: [
    ["Eugene", 0.11, 3.7, 176654],
    ["Gresham", 0.11, 3.6, 114247],
    ["Hillsboro", 0.11, 3.6, 106447],
    ["Bend", 0.11, 4.3, 99178],
    ["Beaverton", 0.11, 3.6, 99312],
    ["Medford", 0.11, 4.2, 85395],
    ["Corvallis", 0.11, 3.7, 59922],
    ["Springfield OR", 0.11, 3.7, 62256]
  ],

  RI: [
    ["Cranston", 0.23, 4.0, 82934],
    ["Pawtucket", 0.23, 4.0, 75604],
    ["East Providence", 0.23, 4.0, 47618],
    ["Woonsocket", 0.23, 3.9, 44328],
    ["Newport", 0.23, 4.1, 25163],
    ["Central Falls", 0.23, 4.0, 22583],
    ["Cumberland", 0.23, 4.0, 36405],
    ["North Providence", 0.23, 4.0, 33835]
  ],

  SC: [
    ["Greenville SC", 0.13, 4.9, 72095],
    ["North Charleston", 0.13, 5.0, 115382],
    ["Rock Hill", 0.13, 4.9, 74372],
    ["Mount Pleasant", 0.13, 5.0, 94580],
    ["Spartanburg", 0.13, 4.8, 39912],
    ["Sumter", 0.13, 4.9, 40524],
    ["Hilton Head", 0.13, 5.1, 40512],
    ["Myrtle Beach", 0.13, 5.0, 35682]
  ],

  TN: [
    ["Knoxville", 0.11, 4.4, 190740],
    ["Chattanooga", 0.11, 4.4, 181099],
    ["Clarksville", 0.11, 4.4, 166722],
    ["Murfreesboro", 0.11, 4.4, 152769],
    ["Franklin TN", 0.11, 4.4, 83454],
    ["Jackson TN", 0.11, 4.5, 68205],
    ["Johnson City", 0.11, 4.2, 71046],
    ["Hendersonville TN", 0.11, 4.4, 61753]
  ],

  UT: [
    ["West Valley City", 0.10, 5.4, 140230],
    ["West Jordan", 0.10, 5.4, 116961],
    ["Orem", 0.10, 5.4, 97499],
    ["Sandy UT", 0.10, 5.4, 96904],
    ["Ogden", 0.10, 5.3, 87325],
    ["St George", 0.10, 6.1, 95342],
    ["Layton", 0.10, 5.3, 81041],
    ["Logan UT", 0.10, 5.1, 52778]
  ],

  VA: [
    ["Norfolk", 0.12, 4.5, 244703],
    ["Chesapeake", 0.12, 4.5, 249422],
    ["Arlington VA", 0.13, 4.4, 238643],
    ["Newport News", 0.12, 4.5, 186247],
    ["Alexandria VA", 0.13, 4.4, 159467],
    ["Hampton", 0.12, 4.5, 134510],
    ["Roanoke", 0.12, 4.3, 100011],
    ["Lynchburg", 0.12, 4.3, 82168]
  ],

  WA: [
    ["Tacoma", 0.10, 3.5, 219346],
    ["Vancouver WA", 0.09, 3.6, 190915],
    ["Bellevue WA", 0.10, 3.5, 151854],
    ["Kent WA", 0.10, 3.5, 136588],
    ["Everett", 0.10, 3.4, 112198],
    ["Renton", 0.10, 3.5, 106785],
    ["Olympia", 0.09, 3.5, 55605],
    ["Bellingham", 0.09, 3.3, 92314]
  ],

  WV: [
    ["Morgantown", 0.10, 3.9, 30855],
    ["Parkersburg", 0.10, 4.0, 29018],
    ["Wheeling", 0.10, 3.8, 26771],
    ["Weirton", 0.10, 3.8, 18797],
    ["Martinsburg", 0.10, 4.1, 17465],
    ["Fairmont", 0.10, 3.9, 18427],
    ["Beckley", 0.10, 4.0, 16918],
    ["Clarksburg", 0.10, 3.9, 15743]
  ],

  WI: [
    ["Green Bay", 0.14, 3.9, 107395],
    ["Kenosha", 0.14, 4.0, 99986],
    ["Racine", 0.14, 4.0, 77816],
    ["Appleton", 0.13, 3.9, 75644],
    ["Waukesha", 0.14, 4.0, 72489],
    ["Oshkosh", 0.13, 3.9, 66778],
    ["Eau Claire", 0.13, 4.0, 69421],
    ["Janesville", 0.14, 4.1, 65460]
  ]
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function main() {
  // 1. Read existing cities
  const raw = fs.readFileSync(CITIES_PATH, 'utf8');
  const existing = JSON.parse(raw);
  console.log(`Existing cities: ${existing.length}`);

  // Build a set of existing slugs to avoid duplicates
  const existingSlugs = new Set(existing.map(c => c.slug));

  // 2. Generate new city objects
  const newCities = [];
  let skipped = 0;

  for (const [abbrev, cities] of Object.entries(NEW_CITIES)) {
    const stateName = STATE_META[abbrev];
    if (!stateName) {
      console.error(`Unknown state abbreviation: ${abbrev}`);
      continue;
    }
    for (const [cityName, rate, sun, pop] of cities) {
      const slug = slugify(cityName);
      if (existingSlugs.has(slug)) {
        skipped++;
        continue; // skip duplicates
      }
      existingSlugs.add(slug);
      newCities.push({
        city_name: cityName,
        slug: slug,
        state_name: stateName,
        state_abbrev: abbrev,
        avg_electricity_rate: rate,
        avg_sun_hours: sun,
        population: pop,
        local_incentives: "Federal ITC plus applicable state and local incentives",
        electricity_trend: "increasing"
      });
    }
  }

  console.log(`New cities generated: ${newCities.length}`);
  console.log(`Duplicates skipped: ${skipped}`);

  // 3. Merge
  const merged = [...existing, ...newCities];

  // Sort by state name, then by population descending within each state
  merged.sort((a, b) => {
    if (a.state_name < b.state_name) return -1;
    if (a.state_name > b.state_name) return 1;
    return b.population - a.population;
  });

  console.log(`Total cities after merge: ${merged.length}`);

  // 4. Validate JSON round-trip
  const jsonStr = JSON.stringify(merged, null, 2);
  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) throw new Error('Not an array');
    if (parsed.length !== merged.length) throw new Error('Length mismatch');
    // Validate every entry has required fields
    const requiredFields = [
      'city_name', 'slug', 'state_name', 'state_abbrev',
      'avg_electricity_rate', 'avg_sun_hours', 'population',
      'local_incentives', 'electricity_trend'
    ];
    for (let i = 0; i < parsed.length; i++) {
      for (const field of requiredFields) {
        if (!(field in parsed[i])) {
          throw new Error(`Missing field "${field}" in entry ${i} (${parsed[i].city_name || 'unknown'})`);
        }
      }
    }
    console.log('JSON validation: PASSED');
  } catch (err) {
    console.error('JSON validation FAILED:', err.message);
    process.exit(1);
  }

  // 5. Write back
  fs.writeFileSync(CITIES_PATH, jsonStr + '\n', 'utf8');
  console.log(`Written to ${CITIES_PATH}`);
  console.log(`Final city count: ${merged.length}`);

  // 6. Print state breakdown
  const stateCount = {};
  for (const c of merged) {
    stateCount[c.state_abbrev] = (stateCount[c.state_abbrev] || 0) + 1;
  }
  const sortedStates = Object.entries(stateCount).sort((a, b) => a[0].localeCompare(b[0]));
  console.log('\nCities per state:');
  for (const [abbrev, count] of sortedStates) {
    console.log(`  ${abbrev}: ${count}`);
  }
}

main();
